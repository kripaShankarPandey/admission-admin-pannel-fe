"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { courseCategoryService, type CourseCategory } from "@/services/course-category-service";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Trash2, Upload, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { PaginationMeta } from "@/services/types";
import { Pagination } from "@/components/pagination";
import { useForm } from "react-hook-form";
import { useDebounce } from "@/hooks/use-debounce";
import { ListingLayout } from "@/components/content-manager/listing-layout";
import { Badge } from "@/components/ui/badge";
import { disciplines } from "@/data/disciplineData";

// Build merged type
interface DisciplineRow {
    id: number;
    courses_category_name: string;
    icon?: string;
    priority: number;
    publishedAt?: string;
    isStatic: boolean;
    _count?: { subCourseCategories: number };
}

export default function CategoriesPage() {
    const [apiCategories, setApiCategories] = useState<CourseCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");
    const pageSize = 20;

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCat, setEditingCat] = useState<DisciplineRow | null>(null);
    const [iconPreview, setIconPreview] = useState("");
    const iconInputRef = useRef<HTMLInputElement>(null);

    const debouncedSearch = useDebounce(search, 500);

    const form = useForm({
        defaultValues: {
            courses_category_name: "",
            icon: "",
            priority: 1,
        },
    });

    const fetchCategories = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await courseCategoryService.getAll({
                page: 1,
                pageSize: 9999,
            });
            setApiCategories(response.data || []);
        } catch (error) {
            console.error(error);
            setApiCategories([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    // Merge API + static disciplines
    const { paginatedRows, totalCount, pageCount } = useMemo(() => {
        const apiKeys = new Set(apiCategories.map(c => c.courses_category_name?.toLowerCase()));

        // Map API categories to rows
        const apiRows: DisciplineRow[] = apiCategories.map(cat => {
            const staticMatch = disciplines.find(
                (d: any) => d.name.toLowerCase() === cat.courses_category_name?.toLowerCase()
            );
            return {
                id: cat.id,
                courses_category_name: cat.courses_category_name,
                icon: cat.icon,
                priority: staticMatch ? staticMatch.priority : 99,
                publishedAt: cat.publishedAt,
                isStatic: false,
                _count: cat._count,
            };
        });

        // Add static disciplines not in API
        const staticRows: DisciplineRow[] = disciplines
            .filter((d: any) => !apiKeys.has(d.name.toLowerCase()))
            .map((d: any, i: number) => ({
                id: -(i + 1),
                courses_category_name: d.name,
                icon: undefined,
                priority: d.priority,
                publishedAt: undefined,
                isStatic: true,
            }));

        let allRows = [...apiRows, ...staticRows];

        // Sort by priority
        allRows.sort((a, b) => a.priority - b.priority);

        // Apply search
        if (debouncedSearch) {
            const q = debouncedSearch.toLowerCase();
            allRows = allRows.filter(r =>
                r.courses_category_name.toLowerCase().includes(q)
            );
        }

        const total = allRows.length;
        const pages = Math.ceil(total / pageSize);
        const start = (currentPage - 1) * pageSize;
        const paginated = allRows.slice(start, start + pageSize);

        return { paginatedRows: paginated, totalCount: total, pageCount: pages };
    }, [apiCategories, debouncedSearch, currentPage]);

    const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const base64 = ev.target?.result as string;
            setIconPreview(base64);
            form.setValue("icon", base64);
        };
        reader.readAsDataURL(file);
        e.target.value = "";
    };

    const removeIcon = () => {
        setIconPreview("");
        form.setValue("icon", "");
    };

    const handleOpenDialog = (row: DisciplineRow | null = null) => {
        if (row && !row.isStatic) {
            setEditingCat(row);
            form.reset({
                courses_category_name: row.courses_category_name || "",
                icon: row.icon || "",
                priority: row.priority || 1,
            });
            setIconPreview(row.icon || "");
        } else {
            setEditingCat(null);
            form.reset({
                courses_category_name: row?.courses_category_name || "",
                icon: "",
                priority: row?.priority || 1,
            });
            setIconPreview("");
        }
        setIsDialogOpen(true);
    };

    const onSubmit = async (data: any) => {
        try {
            const payload = {
                courses_category_name: data.courses_category_name,
                icon: data.icon,
                priority: Number(data.priority),
            };
            if (editingCat && editingCat.id > 0) {
                await courseCategoryService.update(editingCat.id, payload);
                toast.success("Discipline updated successfully");
            } else {
                await courseCategoryService.create(payload);
                toast.success("Discipline created successfully");
            }
            setIsDialogOpen(false);
            fetchCategories();
        } catch (error: any) {
            console.error("Error saving discipline:", error);
            if (error?.response?.status === 409) {
                toast.error("This discipline already exists.");
            } else {
                toast.error("Failed to save discipline");
            }
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this discipline?")) return;
        try {
            await courseCategoryService.delete(id);
            toast.success("Discipline deleted successfully.");
            fetchCategories();
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete discipline.");
        }
    };

    return (
        <>
            <ListingLayout
                title="Discipline"
                count={totalCount}
                onCreateClick={() => handleOpenDialog()}
                onSearchChange={(val) => {
                    setSearch(val);
                    setCurrentPage(1);
                }}
            >
                <Table>
                    <TableHeader className="bg-card">
                        <TableRow className="hover:bg-transparent border-b border-border/50">
                            <TableHead className="w-[60px] font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Priority</TableHead>
                            <TableHead className="w-[60px] font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Image</TableHead>
                            <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Discipline Name</TableHead>
                            <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Sub-categories</TableHead>
                            <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Status</TableHead>
                            <TableHead className="text-right font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10">
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                        <span className="text-muted-foreground">Loading...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : paginatedRows.length > 0 ? (
                            paginatedRows.map((row, idx) => (
                                <TableRow key={`${row.id}-${idx}`} className="group hover:bg-muted/50 border-b border-border/50">
                                    <TableCell>
                                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-primary/10 text-primary text-[11px] font-bold">
                                            {row.priority}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {row.icon ? (
                                            <div className="h-9 w-9 rounded-lg overflow-hidden bg-muted/50 border border-border/40">
                                                <img src={row.icon} alt={row.courses_category_name} className="h-full w-full object-cover" />
                                            </div>
                                        ) : (
                                            <div className="h-9 w-9 rounded-lg bg-muted/30 border border-border/30 flex items-center justify-center">
                                                <ImageIcon className="h-4 w-4 text-muted-foreground/30" />
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-semibold text-foreground text-[13px]">{row.courses_category_name}</TableCell>
                                    <TableCell className="text-muted-foreground text-[13px]">
                                        {row._count?.subCourseCategories !== undefined
                                            ? `${row._count.subCourseCategories} items`
                                            : "—"
                                        }
                                    </TableCell>
                                    <TableCell>
                                        {row.isStatic ? (
                                            <Badge className="bg-muted/50 text-muted-foreground border-border/30 hover:bg-muted shadow-none text-[10px] font-bold uppercase py-0 px-2">
                                                Static
                                            </Badge>
                                        ) : row.publishedAt ? (
                                            <Badge className="bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20 shadow-none text-[10px] font-bold uppercase py-0 px-2">
                                                Published
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20 hover:bg-orange-500/20 shadow-none text-[10px] font-bold uppercase py-0 px-2">
                                                Draft
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleOpenDialog(row)}
                                                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Edit className="h-4 w-4 text-muted-foreground" />
                                            </Button>
                                            {row.id > 0 && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => handleDelete(row.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground font-medium">
                                    No disciplines found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                {totalCount > pageSize && (
                    <div className="p-4 border-t border-border/50 bg-muted/20">
                        <Pagination
                            currentPage={currentPage}
                            pageCount={pageCount}
                            total={totalCount}
                            pageSize={pageSize}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </ListingLayout>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-md bg-background border-border text-foreground">
                    <DialogHeader>
                        <DialogTitle className="text-foreground">{editingCat ? "Edit Discipline" : "Add New Discipline"}</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            {/* Discipline Name */}
                            <FormField
                                control={form.control}
                                name="courses_category_name"
                                render={({ field }: { field: any }) => (
                                    <FormItem>
                                        <FormLabel className="text-foreground">Discipline Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Engineering" {...field} className="bg-background border-border text-foreground" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Priority Order */}
                            <FormField
                                control={form.control}
                                name="priority"
                                render={({ field }: { field: any }) => (
                                    <FormItem>
                                        <FormLabel className="text-foreground">Priority Order</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={1}
                                                max={100}
                                                placeholder="1"
                                                {...field}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                                className="bg-background border-border text-foreground"
                                            />
                                        </FormControl>
                                        <p className="text-[11px] text-muted-foreground">Lower number = higher priority</p>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Image Upload */}
                            <FormField
                                control={form.control}
                                name="icon"
                                render={() => (
                                    <FormItem>
                                        <FormLabel className="text-foreground">Image</FormLabel>
                                        <FormControl>
                                            <div className="space-y-2">
                                                <div
                                                    onClick={() => iconInputRef.current?.click()}
                                                    className="w-full h-28 bg-muted/30 rounded-xl border-2 border-dashed border-border/50 overflow-hidden flex items-center justify-center relative cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all group"
                                                >
                                                    {iconPreview ? (
                                                        <>
                                                            <img src={iconPreview} alt="Preview" className="h-full w-full object-contain p-2" />
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                <span className="text-white text-xs font-semibold">Change Image</span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    removeIcon();
                                                                }}
                                                                className="absolute top-1.5 right-1.5 h-5 w-5 bg-background/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-background transition-colors shadow-sm"
                                                            >
                                                                <X className="h-3 w-3 text-foreground" />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <div className="flex flex-col items-center justify-center gap-1.5 text-muted-foreground/40">
                                                            <Upload className="h-5 w-5 group-hover:text-primary transition-colors" />
                                                            <span className="text-[11px] font-semibold">Click to upload image</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <input
                                                    ref={iconInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={handleIconUpload}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="bg-background border-border text-foreground hover:bg-muted/40 hover:text-foreground">
                                    Cancel
                                </Button>
                                <Button type="submit" className="bg-foreground text-background hover:bg-foreground/90">
                                    {editingCat ? "Save Changes" : "Create Discipline"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    );
}
