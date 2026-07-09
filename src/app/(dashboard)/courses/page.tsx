"use client";

import { useEffect, useState, useCallback, useRef } from "react";
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
import { Edit, Eye, Trash2, MoreHorizontal, Upload, Download, Loader2 } from "lucide-react";
import { siteUrl } from "@/lib/site";
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
    const [selectedLevel, setSelectedLevel] = useState<string>("all");
    const pageSize = 20;

    const COURSE_LEVELS = ["UG", "PG", "Diploma", "Doctorate", "Cert", "Other"];

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [downloadingTpl, setDownloadingTpl] = useState(false);

    const handleDownloadTemplate = async () => {
        setDownloadingTpl(true);
        try {
            const blob = await subCourseCategoryService.downloadBulkUploadTemplate();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "course-bulk-upload-template.xlsx";
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error(error);
            toast.error("Failed to download template.");
        } finally {
            setDownloadingTpl(false);
        }
    };

    const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (e.target) e.target.value = "";
        if (!file) return;
        setUploading(true);
        try {
            const res = await subCourseCategoryService.bulkUpload(file);
            toast.success(
                `Import done — ${res.created} created, ${res.updated} updated${res.failed ? `, ${res.failed} failed` : ""}.`,
            );
            if (res.failed && res.errors?.length) {
                console.warn("Bulk upload errors:", res.errors);
                toast.error(`${res.failed} row(s) failed. See console for details.`);
            }
            setCurrentPage(1);
            fetchSubCategories();
        } catch (error) {
            console.error(error);
            toast.error("Bulk upload failed. Check the file format.");
        } finally {
            setUploading(false);
        }
    };

    const debouncedSearch = useDebounce(search, 500);


    const fetchSubCategories = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await subCourseCategoryService.getAll({
                page: currentPage,
                pageSize,
                search: debouncedSearch || undefined,
                courseCategoryId: selectedCategoryId !== "all" ? Number(selectedCategoryId) : undefined,
                courseLevel: selectedLevel !== "all" ? selectedLevel : undefined
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
    }, [currentPage, debouncedSearch, selectedCategoryId, selectedLevel]);

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

    const hasActiveFilters = selectedCategoryId !== "all" || selectedLevel !== "all";

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
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            className="hidden"
                            onChange={handleFileSelected}
                        />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDownloadTemplate}
                            disabled={downloadingTpl}
                            className="h-9 px-3 text-xs font-semibold rounded-lg gap-1.5"
                        >
                            {downloadingTpl ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                            Template
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="h-9 px-3 text-xs font-semibold rounded-lg gap-1.5"
                        >
                            {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                            {uploading ? "Uploading..." : "Bulk Upload"}
                        </Button>
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
                        <Select
                            value={selectedLevel}
                            onValueChange={(val) => {
                                setSelectedLevel(val);
                                setCurrentPage(1);
                            }}
                        >
                            <SelectTrigger className="h-9 w-[150px] bg-background border-border/50 text-xs font-semibold rounded-lg">
                                <SelectValue placeholder="All Levels" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Levels</SelectItem>
                                {COURSE_LEVELS.map((lvl) => (
                                    <SelectItem key={lvl} value={lvl}>
                                        {lvl}
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
                                    setSelectedLevel("all");
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
                                                {sub.slug && (
                                                    <a
                                                        href={siteUrl(`/courses/${sub.slug}`)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        title="View on website"
                                                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted"
                                                    >
                                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                                    </a>
                                                )}
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
