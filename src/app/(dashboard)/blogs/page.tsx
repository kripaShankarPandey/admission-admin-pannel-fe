"use client";

import { useEffect, useState, useCallback } from "react";
import { blogService, type Blog, type BlogQueryParams } from "@/services/blog-service";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Image as ImageIcon, FileText } from "lucide-react";
import { toast } from "sonner";
import { PaginationMeta } from "@/services/types";
import { Pagination } from "@/components/pagination";
import { useDebounce } from "@/hooks/use-debounce";
import { ListingLayout } from "@/components/content-manager/listing-layout";
import { useRouter } from "next/navigation";

export default function BlogsPage() {
    const router = useRouter();
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Filter states
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    const debouncedSearch = useDebounce(search, 500);

    const fetchBlogs = useCallback(async () => {
        setIsLoading(true);
        try {
            const params: BlogQueryParams = {
                page: currentPage,
                pageSize,
                search: debouncedSearch || undefined,
            };
            const response = await blogService.getAll(params);
            setBlogs(response.data || []);
            setMeta(response?.meta?.pagination || null);
        } catch (error: any) {
            console.error(error);
            toast.error("Failed to fetch blogs.");
            setBlogs([]);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, debouncedSearch]);

    useEffect(() => {
        fetchBlogs();
    }, [fetchBlogs]);

    const handleCreateNew = () => {
        router.push("/blogs/new");
    };

    const handleEdit = (id: number) => {
        router.push(`/blogs/edit/${id}`);
    };

    async function handleDelete(id: number) {
        if (!confirm("Are you sure you want to delete this blog?")) return;

        try {
            await blogService.delete(id);
            toast.success("Blog deleted successfully.");
            fetchBlogs();
        } catch (error: any) {
            console.error(error);
            toast.error("Failed to delete blog.");
        }
    }

    return (
        <ListingLayout
            title="Blog"
            count={meta?.total}
            onCreateClick={handleCreateNew}
            onSearchChange={(val) => {
                setSearch(val);
                setCurrentPage(1);
            }}
            onFilterChange={(filter) => {
                setStatusFilter(filter.status || "");
                setCurrentPage(1);
            }}
        >
            <Table>
                <TableHeader className="bg-card">
                    <TableRow className="hover:bg-transparent border-b border-border/50">
                        <TableHead className="w-[60px]"></TableHead>
                        <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground w-1/3">Title</TableHead>
                        <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Slug</TableHead>
                        <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Status</TableHead>
                        <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Created At</TableHead>
                        <TableHead className="text-right font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow>
                            <TableCell colSpan={6} className="h-48 text-center">
                                <div className="flex flex-col items-center justify-center gap-3">
                                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                    <span className="text-sm font-medium text-muted-foreground">Loading blogs...</span>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (blogs?.length || 0) > 0 ? (
                        blogs
                            .filter((blog) => {
                                if (!statusFilter) return true;
                                if (statusFilter === "published") return !!blog.publishedAt;
                                if (statusFilter === "draft") return !blog.publishedAt;
                                return true;
                            })
                            .map((blog) => (
                            <TableRow key={blog.id} className="group hover:bg-muted/30 border-b border-border/50 transition-colors">
                                <TableCell>
                                    <div className="w-12 h-10 rounded-lg overflow-hidden bg-muted/50 border border-border/40 flex items-center justify-center relative shrink-0">
                                        {blog.banner ? (
                                            <img 
                                                src={blog.banner} 
                                                alt={blog.title || "Blog banner"} 
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <ImageIcon className="h-4 w-4 text-muted-foreground/40" />
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-foreground max-w-[400px] truncate text-[14px]">
                                            {blog?.title || "Untitled Blog Post"}
                                        </span>
                                        <span className="text-[12px] font-medium text-muted-foreground tracking-tight mt-0.5 max-w-[400px] truncate">
                                            #{blog.id} — {blog.description ? blog.description.substring(0, 60) + '...' : 'No description'}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground text-[13px] font-medium">{blog?.slug || "N/A"}</TableCell>
                                <TableCell>
                                    {blog?.publishedAt ? (
                                        <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20 shadow-none text-[10px] font-bold uppercase py-0.5 px-2.5">
                                            Published
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20 hover:bg-orange-500/20 shadow-none text-[10px] font-bold uppercase py-0.5 px-2.5">
                                            Draft
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground whitespace-nowrap text-[12px] font-medium">
                                    {blog?.createdAt ? new Date(blog.createdAt).toLocaleDateString(undefined, {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    }) : "N/A"}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleEdit(blog.id)}
                                            className="h-8 w-8 p-0 bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary rounded-md"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive rounded-md"
                                            onClick={() => handleDelete(blog.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={6} className="h-48 text-center">
                                <div className="flex flex-col items-center justify-center text-muted-foreground gap-1">
                                    <FileText className="h-8 w-8 text-muted-foreground/30 mb-2" />
                                    <p className="font-semibold text-foreground">No blogs found</p>
                                    <p className="text-sm">Get started by creating a new blog post.</p>
                                    <Button onClick={handleCreateNew} variant="outline" size="sm" className="mt-4 border-dashed bg-transparent border-sidebar-border hover:bg-muted/50">
                                        Create New Blog
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {meta && (
                <div className="p-4 border-t border-border/50 bg-muted/20">
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
    );
}
