"use client";

import { useEffect, useState, useCallback } from "react";
import { counselorService, type Counselor } from "@/services/counselor-service";
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
import { Textarea } from "@/components/ui/textarea";
import { Edit, Trash2, User } from "lucide-react";
import { toast } from "sonner";
import { PaginationMeta } from "@/services/types";
import { Pagination } from "@/components/pagination";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useForm } from "react-hook-form";
import { useDebounce } from "@/hooks/use-debounce";
import { ListingLayout } from "@/components/content-manager/listing-layout";

export default function CounselorsPage() {
    const [counselors, setCounselors] = useState<Counselor[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");
    const pageSize = 10;

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCounselor, setEditingCounselor] = useState<Counselor | null>(null);

    const debouncedSearch = useDebounce(search, 500);

    const form = useForm({
        defaultValues: {
            name: "",
            designation: "",
            profile: "",
            description: "",
        },
    });

    const fetchCounselors = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await counselorService.getAll({
                page: currentPage,
                pageSize,
                search: debouncedSearch || undefined
            });
            setCounselors(response.data || []);
            setMeta(response?.meta?.pagination || null);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch counselors.");
            setCounselors([]);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, debouncedSearch]);

    useEffect(() => {
        fetchCounselors();
    }, [fetchCounselors]);

    const handleOpenDialog = (counselor: Counselor | null = null) => {
        if (counselor) {
            setEditingCounselor(counselor);
            form.reset({
                name: counselor.name || "",
                designation: counselor.designation || "",
                profile: counselor.profile || "",
                description: counselor.description || ""
            });
        } else {
            setEditingCounselor(null);
            form.reset({
                name: "",
                designation: "",
                profile: "",
                description: ""
            });
        }
        setIsDialogOpen(true);
    };

    const onSubmit = async (data: any) => {
        try {
            if (editingCounselor) {
                await counselorService.update(editingCounselor.id, data);
                toast.success("Counselor updated successfully");
            } else {
                await counselorService.create(data);
                toast.success("Counselor created successfully");
            }
            setIsDialogOpen(false);
            fetchCounselors();
        } catch (error) {
            console.error("Error saving counselor:", error);
            toast.error("Failed to save counselor");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this counselor?")) return;
        try {
            await counselorService.delete(id);
            toast.success("Counselor deleted successfully.");
            fetchCounselors();
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete counselor.");
        }
    };

    return (
        <>
            <ListingLayout
                title="Counselor"
                count={meta?.total || 0}
                onCreateClick={() => handleOpenDialog()}
                onSearchChange={(val) => {
                    setSearch(val);
                    setCurrentPage(1);
                }}
            >
                <Table>
                    <TableHeader className="bg-card">
                        <TableRow className="hover:bg-transparent border-b border-border/50">
                            <TableHead className="w-[80px] font-bold text-[11px] uppercase tracking-wider text-muted-foreground">ID</TableHead>
                            <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Counselor</TableHead>
                            <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Designation</TableHead>
                            <TableHead className="text-right font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-10">
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                        <span className="text-muted-foreground">Loading...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (counselors?.length || 0) > 0 ? (
                            counselors.map(c => (
                                <TableRow key={c.id} className="group hover:bg-muted/50 border-b border-border/50">
                                    <TableCell className="text-muted-foreground font-medium text-[13px]">#{c.id}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8 border border-border">
                                                <AvatarImage src={c?.profile} />
                                                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                                    {c?.name?.[0]?.toUpperCase() || <User className="h-3 w-3" />}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="font-semibold text-foreground text-[13px]">{c?.name || "Unknown"}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-[13px]">{c?.designation || "N/A"}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleOpenDialog(c)}
                                                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Edit className="h-4 w-4 text-muted-foreground" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => handleDelete(c.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-10 text-muted-foreground font-medium">
                                    No counselors found.
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

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-md bg-background border-border text-foreground">
                    <DialogHeader>
                        <DialogTitle className="text-foreground">{editingCounselor ? "Edit Counselor" : "Add New Counselor"}</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }: { field: any }) => (
                                    <FormItem>
                                        <FormLabel className="text-foreground">Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter counselor name" {...field} className="bg-background border-border text-foreground" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="designation"
                                render={({ field }: { field: any }) => (
                                    <FormItem>
                                        <FormLabel className="text-foreground">Designation</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter designation (e.g. Senior Consultant)" {...field} className="bg-background border-border text-foreground" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="profile"
                                render={({ field }: { field: any }) => (
                                    <FormItem>
                                        <FormLabel className="text-foreground">Profile Image URL</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://..." {...field} className="bg-background border-border text-foreground" />
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
                                        <FormLabel className="text-foreground">Description</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Enter counselor description" {...field} className="bg-background border-border text-foreground min-h-[100px]" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="bg-background border-border text-foreground hover:bg-muted/40 hover:text-foreground">
                                    Cancel
                                </Button>
                                <Button type="submit" className="bg-primary hover:bg-primary/90 text-foreground">
                                    {editingCounselor ? "Save Changes" : "Create Counselor"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    );
}
