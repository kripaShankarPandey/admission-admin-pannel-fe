"use client";

import { useEffect, useState, useCallback } from "react";
import { subCourseCategoryService, type SubCourseCategory } from "@/services/sub-course-category-service";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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

export default function SubCategoriesPage() {
    const [subCategories, setSubCategories] = useState<SubCourseCategory[]>([]);
    const [allCategories, setAllCategories] = useState<CourseCategory[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");
    const pageSize = 10;

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSub, setEditingSub] = useState<SubCourseCategory | null>(null);

    const debouncedSearch = useDebounce(search, 500);

    const form = useForm({
        defaultValues: {
            sub_course_category_name: "",
            courseCategoryId: ""
        },
    });

    const fetchSubCategories = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await subCourseCategoryService.getAll({
                page: currentPage,
                pageSize,
                search: debouncedSearch || undefined
            });
            setSubCategories(response.data || []);
            setMeta(response?.meta?.pagination || null);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch sub-categories.");
            setSubCategories([]);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, debouncedSearch]);

    const fetchAllCategories = async () => {
        try {
            const response = await courseCategoryService.getAll({
                page: 1,
                pageSize: 100
            });
            setAllCategories(response.data || []);
        } catch (error) {
            console.error("Failed to fetch all categories:", error);
        }
    };

    useEffect(() => {
        fetchSubCategories();
    }, [fetchSubCategories]);

    useEffect(() => {
        fetchAllCategories();
    }, []);

    const handleOpenDialog = (sub: SubCourseCategory | null = null) => {
        if (sub) {
            setEditingSub(sub);
            form.reset({
                sub_course_category_name: sub.sub_course_category_name || "",
                courseCategoryId: sub.courseCategoryId?.toString() || ""
            });
        } else {
            setEditingSub(null);
            form.reset({
                sub_course_category_name: "",
                courseCategoryId: ""
            });
        }
        setIsDialogOpen(true);
    };

    const onSubmit = async (data: any) => {
        try {
            const payload = { ...data, courseCategoryId: parseInt(data.courseCategoryId) };
            if (editingSub) {
                await subCourseCategoryService.update(editingSub.id, payload);
                toast.success("Sub-category updated successfully");
            } else {
                await subCourseCategoryService.create(payload);
                toast.success("Sub-category created successfully");
            }
            setIsDialogOpen(false);
            fetchSubCategories();
        } catch (error) {
            console.error("Error saving sub-category:", error);
            toast.error("Failed to save sub-category");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this sub-category?")) return;
        try {
            await subCourseCategoryService.delete(id);
            toast.success("Sub-category deleted successfully.");
            fetchSubCategories();
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete sub-category.");
        }
    };

    return (
        <>
            <ListingLayout
                title="Sub course category"
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
                            <TableHead className="font-bold text-[11px] uppercase tracking-wider text-[#a5a5ba]">Sub-Category Name</TableHead>
                            <TableHead className="font-bold text-[11px] uppercase tracking-wider text-[#a5a5ba]">Parent Category</TableHead>
                            <TableHead className="font-bold text-[11px] uppercase tracking-wider text-[#a5a5ba]">Specializations</TableHead>
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
                        ) : (subCategories?.length || 0) > 0 ? (
                            subCategories.map((sub) => (
                                <TableRow key={sub.id} className="group hover:bg-white/5 border-b border-white/5">
                                    <TableCell className="text-[#a5a5ba] font-medium text-[13px]">#{sub.id}</TableCell>
                                    <TableCell className="font-semibold text-white text-[13px]">
                                        {sub?.sub_course_category_name || "Unknown"}
                                    </TableCell>
                                    <TableCell className="text-[#a5a5ba] text-[13px]">
                                        {sub?.courseCategory?.courses_category_name || "N/A"}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5 text-[#a5a5ba] text-[13px]">
                                            {sub._count?.courseCategorySpecializations || 0} items
                                            <ChevronDown className="h-3 w-3" />
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {sub?.publishedAt ? (
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
                                                onClick={() => handleOpenDialog(sub)}
                                                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Edit className="h-4 w-4 text-[#a5a5ba]" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => handleDelete(sub.id)}
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
                                    No sub-categories found.
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
                        <DialogTitle className="text-white">{editingSub ? "Edit Sub Course Category" : "Add New Sub Course Category"}</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="sub_course_category_name"
                                render={({ field }: { field: any }) => (
                                    <FormItem>
                                        <FormLabel>Sub-Category Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter sub-category name" {...field} className="border-white/10" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="courseCategoryId"
                                render={({ field }: { field: any }) => (
                                    <FormItem>
                                        <FormLabel>Parent Category</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="border-white/10">
                                                    <SelectValue placeholder="Select parent category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-[#212134] border-white/10 text-white">
                                                {allCategories.map(cat => (
                                                    <SelectItem key={cat.id} value={cat.id.toString()}>
                                                        {cat.courses_category_name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="bg-muted/20 border-white/10 text-white hover:bg-muted/40 hover:text-white">
                                    Cancel
                                </Button>
                                <Button type="submit" className="bg-primary hover:bg-primary/90 text-white font-semibold">
                                    {editingSub ? "Save Changes" : "Create Sub-Category"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    );
}
