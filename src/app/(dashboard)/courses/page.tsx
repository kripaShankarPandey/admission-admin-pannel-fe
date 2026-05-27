"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { PaginationMeta } from "@/services/types";
import { Pagination } from "@/components/pagination";
import { useDebounce } from "@/hooks/use-debounce";
import { ListingLayout } from "@/components/content-manager/listing-layout";
import { Badge } from "@/components/ui/badge";

export default function SubCategoriesPage() {
    const router = useRouter();
    const [subCategories, setSubCategories] = useState<SubCourseCategory[]>([]);
    const [allCategories, setAllCategories] = useState<CourseCategory[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
    const pageSize = 20;

    const debouncedSearch = useDebounce(search, 500);


    const fetchSubCategories = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await subCourseCategoryService.getAll({
                page: currentPage,
                pageSize,
                search: debouncedSearch || undefined,
                courseCategoryId: selectedCategoryId !== "all" ? Number(selectedCategoryId) : undefined
            });
            setSubCategories(response.data || []);
            setMeta(response?.meta?.pagination || null);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch courses.");
            setSubCategories([]);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, debouncedSearch, selectedCategoryId]);

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


    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this course?")) return;
        try {
            await subCourseCategoryService.delete(id);
            toast.success("Course deleted successfully.");
            fetchSubCategories();
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete course.");
        }
    };

    const hasActiveFilters = selectedCategoryId !== "all";

    return (
        <>
            <ListingLayout
                title="Courses"
                count={meta?.total || 0}
                onCreateClick={() => router.push("/courses/new")}
                onSearchChange={(val) => {
                    setSearch(val);
                    setCurrentPage(1);
                }}
                actions={
                    <div className="flex items-center gap-2">
                        <Select
                            value={selectedCategoryId}
                            onValueChange={(val) => {
                                setSelectedCategoryId(val);
                                setCurrentPage(1);
                            }}
                        >
                            <SelectTrigger className="h-9 w-[190px] bg-background border-border/50 text-xs font-semibold rounded-lg">
                                <SelectValue placeholder="All Disciplines" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Disciplines</SelectItem>
                                {allCategories.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.id.toString()}>
                                        {cat.courses_category_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {hasActiveFilters && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setSelectedCategoryId("all");
                                    setCurrentPage(1);
                                }}
                                className="h-9 px-3 text-xs font-semibold text-destructive hover:bg-destructive/10 rounded-lg"
                            >
                                Reset
                            </Button>
                        )}
                    </div>
                }
            >
                <Table>
                    <TableHeader className="bg-card">
                        <TableRow className="hover:bg-transparent border-b border-border/50">
                            <TableHead className="w-[80px] font-bold text-[11px] uppercase tracking-wider text-muted-foreground">ID</TableHead>
                            <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Course Name</TableHead>
                            <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Parent Discipline</TableHead>
                            <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Level</TableHead>
                            <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Duration</TableHead>
                            <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Status</TableHead>
                            <TableHead className="text-right font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                                <MoreHorizontal className="h-4 w-4 ml-auto" />
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-10">
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                        <span className="text-muted-foreground">Loading...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (subCategories?.length || 0) > 0 ? (
                            subCategories.map((sub) => {
                                const details = (() => {
                                    try {
                                        return sub.details ? JSON.parse(sub.details) : {};
                                    } catch {
                                        return {};
                                    }
                                })();
                                return (
                                    <TableRow key={sub.id} className="group hover:bg-muted/50 border-b border-border/50">
                                        <TableCell className="text-muted-foreground font-medium text-[13px]">#{sub.id}</TableCell>
                                        <TableCell className="font-semibold text-foreground text-[13px]">
                                            {sub?.sub_course_category_name || "Unknown"}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-[13px]">
                                            {sub?.courseCategory?.courses_category_name || "N/A"}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-[13px]">
                                            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 shadow-none text-[10px] font-bold uppercase py-0.5 px-2">
                                                {details.courseLevel || "N/A"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-[13px] font-medium">
                                            {details.duration || "N/A"}
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
                                                    onClick={() => router.push(`/courses/${sub.slug}`)}
                                                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Edit className="h-4 w-4 text-muted-foreground" />
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
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground font-medium">
                                    No courses found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                {meta && (
                    <div className="p-4 border-t border-border/50 bg-muted/50">
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


        </>
    );
}
