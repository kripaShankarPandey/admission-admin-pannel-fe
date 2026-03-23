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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PaginationMeta } from "@/services/types";
import { Pagination } from "@/components/pagination";
import { useForm } from "react-hook-form";
import { useDebounce } from "@/hooks/use-debounce";
import { ListingLayout } from "@/components/content-manager/listing-layout";

export default function BlogsPage() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingBlog, setEditingBlog] = useState<Blog | null>(null);

    // Filter states
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    const debouncedSearch = useDebounce(search, 500);

    const form = useForm({
        defaultValues: {
            title: "",
            slug: "",
            banner: "",
            description: "",
        },
    });

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

    const handleOpenDialog = (blog?: Blog) => {
        if (blog) {
            setEditingBlog(blog);
            form.reset({
                title: blog.title || "",
                slug: blog.slug || "",
                banner: blog.banner || "",
                description: blog.description || "",
            });
        } else {
            setEditingBlog(null);
            form.reset({
                title: "",
                slug: "",
                banner: "",
                description: "",
            });
        }
        setIsDialogOpen(true);
    };

    const onSubmit = async (data: any) => {
        try {
            if (editingBlog) {
                await blogService.update(editingBlog.id, data);
                toast.success("Blog updated successfully");
            } else {
                await blogService.create(data);
                toast.success("Blog created successfully");
            }
            setIsDialogOpen(false);
            fetchBlogs();
        } catch (error) {
            console.error("Error saving blog:", error);
            toast.error("Failed to save blog");
        }
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
        <>
            <ListingLayout
                title="Blog"
                count={meta?.total}
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
                            <TableHead className="font-bold text-[11px] uppercase tracking-wider text-[#a5a5ba]">Title</TableHead>
                            <TableHead className="font-bold text-[11px] uppercase tracking-wider text-[#a5a5ba]">Slug</TableHead>
                            <TableHead className="font-bold text-[11px] uppercase tracking-wider text-[#a5a5ba]">Status</TableHead>
                            <TableHead className="font-bold text-[11px] uppercase tracking-wider text-[#a5a5ba]">Created At</TableHead>
                            <TableHead className="text-right font-bold text-[11px] uppercase tracking-wider text-[#a5a5ba]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                        Loading...
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (blogs?.length || 0) > 0 ? (
                            blogs.map((blog) => (
                                <TableRow key={blog.id} className="group hover:bg-white/5 border-b border-white/5">
                                    <TableCell className="text-[#a5a5ba] font-medium text-[13px]">#{blog.id}</TableCell>
                                    <TableCell className="font-semibold text-white max-w-[300px] truncate text-[13px]">
                                        {blog?.title || "Untitled"}
                                    </TableCell>
                                    <TableCell className="text-[#a5a5ba] text-[13px]">{blog?.slug || "N/A"}</TableCell>
                                    <TableCell>
                                        {blog?.publishedAt ? (
                                            <Badge className="bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20 shadow-none text-[10px] font-bold uppercase py-0 px-2">
                                                Published
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500/20 shadow-none text-[10px] font-bold uppercase py-0 px-2">
                                                Draft
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-sm text-[#a5a5ba] whitespace-nowrap text-[12px]">
                                        {blog?.createdAt ? new Date(blog.createdAt).toLocaleDateString() : "N/A"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleOpenDialog(blog)}
                                                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Edit className="h-4 w-4 text-muted-foreground" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
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
                                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                    No blogs found.
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
                <DialogContent className="max-w-2xl bg-[#212134] border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-white">{editingBlog ? "Edit Blog" : "Add New Blog"}</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }: { field: any }) => (
                                    <FormItem>
                                        <FormLabel>Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter blog title" {...field} className="bg-white" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="slug"
                                render={({ field }: { field: any }) => (
                                    <FormItem>
                                        <FormLabel>Slug</FormLabel>
                                        <FormControl>
                                            <Input placeholder="enter-blog-slug" {...field} className="bg-white" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="banner"
                                render={({ field }: { field: any }) => (
                                    <FormItem>
                                        <FormLabel>Banner Image URL</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://example.com/image.jpg" {...field} className="bg-white" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }: { field: any }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Enter blog description"
                                                className="min-h-[200px] bg-white"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="bg-muted/20 border-white/10 text-white hover:bg-muted/40 hover:text-white">
                                    Cancel
                                </Button>
                                <Button type="submit" className="bg-primary text-white hover:bg-primary/90">
                                    {editingBlog ? "Save Changes" : "Create Blog"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    );
}
