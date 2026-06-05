"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
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
import { Edit, Trash2, User, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { PaginationMeta } from "@/services/types";
import { Pagination } from "@/components/pagination";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useForm } from "react-hook-form";
import { useDebounce } from "@/hooks/use-debounce";
import { ListingLayout } from "@/components/content-manager/listing-layout";
import { TableStateRow } from "@/components/content-manager/table-state-row";

type CounselorFormValues = {
    name: string;
    designation: string;
    profile: string;
    description: string;
};

export default function CounselorsPage() {
    const [counselors, setCounselors] = useState<Counselor[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");
    const pageSize = 10;

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCounselor, setEditingCounselor] = useState<Counselor | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const debouncedSearch = useDebounce(search, 500);

    const form = useForm<CounselorFormValues>({
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
            setImagePreview(counselor.profile || "");
            form.reset({
                name: counselor.name || "",
                designation: counselor.designation || "",
                profile: counselor.profile || "",
                description: counselor.description || ""
            });
        } else {
            setEditingCounselor(null);
            setImagePreview("");
            form.reset({
                name: "",
                designation: "",
                profile: "",
                description: ""
            });
        }
        setIsDialogOpen(true);
    };

    const handleImageUrlChange = (url: string) => {
        setImagePreview(url);
        form.setValue("profile", url);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const dataUrl = reader.result as string;
                setImagePreview(dataUrl);
                form.setValue("profile", dataUrl);
            };
            reader.readAsDataURL(file);
        }
    };

    const onSubmit = async (data: CounselorFormValues) => {
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
                description="Manage counselor profiles shown across the platform, including role, avatar, and summary."
                count={meta?.total || 0}
                onCreateClick={() => handleOpenDialog()}
                createLabel="Add counselor"
                onSearchChange={(val) => {
                    setSearch(val);
                    setCurrentPage(1);
                }}
                searchPlaceholder="Search counselors..."
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
                            <TableStateRow colSpan={4} isLoading emptyLabel="" />
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
                            <TableStateRow colSpan={4} emptyLabel="No counselors found." />
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
                <DialogContent className="max-w-4xl! w-full bg-background border-border text-foreground max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-foreground">{editingCounselor ? "Edit Counselor" : "Add New Counselor"}</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="space-y-4 border-b border-border/50 pb-6">
                                <label className="text-sm font-semibold text-foreground block">Profile Picture</label>
                                <div className="flex gap-6">
                                    <div className="shrink-0">
                                        {imagePreview ? (
                                            <div className="relative w-40 h-40 rounded-lg overflow-hidden border border-border/50 bg-muted/50">
                                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" onError={() => setImagePreview("")} />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setImagePreview("");
                                                        form.setValue("profile", "");
                                                        if (fileInputRef.current) fileInputRef.current.value = "";
                                                    }}
                                                    className="absolute top-2 right-2 bg-destructive/80 hover:bg-destructive rounded-md p-1.5 transition-colors"
                                                >
                                                    <X className="h-4 w-4 text-white" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="w-40 h-40 rounded-lg border-2 border-dashed border-border/50 bg-muted/30 flex flex-col items-center justify-center hover:border-primary/50 hover:bg-muted/50 transition-colors cursor-pointer"
                                            >
                                                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                                <span className="text-xs text-muted-foreground font-medium">Click to upload</span>
                                            </button>
                                        )}
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileSelect}
                                            className="hidden"
                                        />
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <FormField
                                            control={form.control}
                                            name="profile"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-semibold uppercase text-muted-foreground">Image URL (or paste above)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="https://example.com/image.jpg"
                                                            {...field}
                                                            onChange={(e) => {
                                                                field.onChange(e);
                                                                handleImageUrlChange(e.target.value);
                                                            }}
                                                            className="bg-background border-border text-foreground text-sm"
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-xs" />
                                                </FormItem>
                                            )}
                                        />
                                        <div className="text-xs text-muted-foreground bg-muted/50 rounded-md p-2 border border-border/30">
                                            <span className="font-semibold">Supported formats:</span> JPG, PNG, WebP (max 5MB)
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-foreground">Basic Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-semibold uppercase text-muted-foreground">Full Name *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g. John Doe" {...field} className="bg-background border-border text-foreground" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="designation"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-semibold uppercase text-muted-foreground">Designation *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g. Senior Admissions Counselor" {...field} className="bg-background border-border text-foreground" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3 border-t border-border/50 pt-6">
                                <h3 className="text-sm font-semibold text-foreground">Details</h3>
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-semibold uppercase text-muted-foreground">Bio / Description</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Brief overview of expertise, experience, and specialization..." {...field} className="bg-background border-border text-foreground min-h-30 resize-none" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <DialogFooter className="border-t border-border/50 pt-6 gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsDialogOpen(false)}
                                    className="px-6 py-2.5 font-medium text-sm"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="px-6 py-2.5 font-medium text-sm bg-primary hover:bg-primary/90 text-white shadow-md hover:shadow-lg transition-all"
                                >
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
