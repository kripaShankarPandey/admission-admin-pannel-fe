"use client";

import { useEffect, useState, useCallback } from "react";
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
import { Edit, Trash2, ChevronDown, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { PaginationMeta } from "@/services/types";
import { Pagination } from "@/components/pagination";
import { useForm } from "react-hook-form";
import { useDebounce } from "@/hooks/use-debounce";
import { ListingLayout } from "@/components/content-manager/listing-layout";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function CategoriesPage() {
    const [categories, setCategories] = useState<CourseCategory[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");
    const pageSize = 10;

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCat, setEditingCat] = useState<CourseCategory | null>(null);

    const debouncedSearch = useDebounce(search, 500);

    const form = useForm({
        defaultValues: {
            courses_category_name: "",
            icon: "",
        },
    });

    const fetchCategories = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await courseCategoryService.getAll({
                page: currentPage,
                pageSize,
                search: debouncedSearch || undefined
            });
            setCategories(response.data || []);
            setMeta(response?.meta?.pagination || null);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch categories.");
            setCategories([]);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, debouncedSearch]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleOpenDialog = (cat: CourseCategory | null = null) => {
        if (cat) {
            setEditingCat(cat);
            form.reset({
                courses_category_name: cat.courses_category_name || "",
                icon: cat.icon || ""
            });
        } else {
            setEditingCat(null);
            form.reset({
                courses_category_name: "",
                icon: ""
            });
        }
        setIsDialogOpen(true);
    };

    const onSubmit = async (data: any) => {
        try {
            if (editingCat) {
                await courseCategoryService.update(editingCat.id, data);
                toast.success("Category updated successfully");
            } else {
                await courseCategoryService.create(data);
                toast.success("Category created successfully");
            }
            setIsDialogOpen(false);
            fetchCategories();
        } catch (error) {
            console.error("Error saving category:", error);
            toast.error("Failed to save category");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this category?")) return;
        try {
            await courseCategoryService.delete(id);
            toast.success("Category deleted successfully.");
            fetchCategories();
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete category.");
        }
    };

    return (
        <>
            <ListingLayout
                title="Course category"
                count={meta?.total || 0}
                onCreateClick={() => handleOpenDialog()}
                onSearchChange={(val) => {
                    setSearch(val);
                    setCurrentPage(1);
                }}
            >
                <Table>
                    <TableHeader className="bg-muted/10">
                        <TableRow className="hover:bg-transparent border-b border-white/5">
                            <TableHead className="w-[80px] font-bold text-[11px] uppercase tracking-wider text-[#a5a5ba]">ID</TableHead>
                            <TableHead className="w-[100px] font-bold text-[11px] uppercase tracking-wider text-[#a5a5ba]">Icon</TableHead>
                            <TableHead className="font-bold text-[11px] uppercase tracking-wider text-[#a5a5ba]">Category Name</TableHead>
                            <TableHead className="font-bold text-[11px] uppercase tracking-wider text-[#a5a5ba]">Sub-categories</TableHead>
                            <TableHead className="font-bold text-[11px] uppercase tracking-wider text-[#a5a5ba]">Status</TableHead>
                            <TableHead className="text-right font-bold text-[11px] uppercase tracking-wider text-[#a5a5ba]">
                                <MoreHorizontal className="h-4 w-4 ml-auto" />
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10">
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                        <span className="text-[#a5a5ba]">Loading...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (categories?.length || 0) > 0 ? (
                            categories.map(cat => (
                                <TableRow key={cat.id} className="group hover:bg-white/5 border-b border-white/5">
                                    <TableCell className="text-[#a5a5ba] font-medium text-[13px]">#{cat.id}</TableCell>
                                    <TableCell>
                                        {cat.icon ? (
                                            <Avatar className="h-8 w-8 rounded bg-primary/10 border border-primary/20">
                                                <AvatarImage src={cat.icon} />
                                                <AvatarFallback className="text-[10px] text-primary font-bold">ICON</AvatarFallback>
                                            </Avatar>
                                        ) : (
                                            <span className="text-[#a5a5ba]">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-semibold text-white text-[13px]">{cat?.courses_category_name || "Unknown"}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5 text-[#a5a5ba] text-[13px]">
                                            {cat._count?.subCourseCategories || 0} items
                                            <ChevronDown className="h-3 w-3" />
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {cat.publishedAt ? (
                                            <Badge className="bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20 shadow-none text-[10px] font-bold uppercase py-0 px-2">
                                                Published
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500/20 shadow-none text-[10px] font-bold uppercase py-0 px-2">
                                                Draft
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleOpenDialog(cat)}
                                                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Edit className="h-4 w-4 text-[#a5a5ba]" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => handleDelete(cat.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10 text-[#a5a5ba] font-medium">
                                    No categories found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                {meta && (
                    <div className="p-4 border-t border-white/5 bg-white/5">
                        <Pagination
                            currentPage={currentPage}
                            pageCount={meta?.pageCount || 1}
                            total={meta?.total || 0}
                            pageSize={pageSize}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </ListingLayout>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-md bg-[#212134] border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-white">{editingCat ? "Edit Course Category" : "Add New Course Category"}</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="courses_category_name"
                                render={({ field }: { field: any }) => (
                                    <FormItem>
                                        <FormLabel>Category Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter category name" {...field} className="bg-muted/20 border-white/10 text-white" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="icon"
                                render={({ field }: { field: any }) => (
                                    <FormItem>
                                        <FormLabel>Icon URL</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://example.com/icon.png" {...field} className="bg-muted/20 border-white/10 text-white" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="bg-muted/20 border-white/10 text-white hover:bg-muted/40 hover:text-white">
                                    Cancel
                                </Button>
                                <Button type="submit" className="bg-primary hover:bg-primary/90 text-white">
                                    {editingCat ? "Save Changes" : "Create Category"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    );
}
