"use client";

import { useEffect, useState, useCallback } from "react";
import { cityService, type City } from "@/services/city-service";
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
import { Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PaginationMeta } from "@/services/types";
import { Pagination } from "@/components/pagination";
import { useForm } from "react-hook-form";
import { useDebounce } from "@/hooks/use-debounce";
import { ListingLayout } from "@/components/content-manager/listing-layout";

export default function CitiesPage() {
    const [cities, setCities] = useState<City[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");
    const pageSize = 10;

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCity, setEditingCity] = useState<City | null>(null);

    const debouncedSearch = useDebounce(search, 500);

    const form = useForm({
        defaultValues: {
            city: "",
            state: "",
        },
    });

    const fetchCities = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await cityService.getAll({
                page: currentPage,
                pageSize,
                search: debouncedSearch || undefined
            });
            setCities(response.data || []);
            setMeta(response?.meta?.pagination || null);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch cities.");
            setCities([]);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, debouncedSearch]);

    useEffect(() => {
        fetchCities();
    }, [fetchCities]);

    const handleOpenDialog = (city: City | null = null) => {
        if (city) {
            setEditingCity(city);
            form.reset({
                city: city.city || "",
                state: city.state || ""
            });
        } else {
            setEditingCity(null);
            form.reset({
                city: "",
                state: ""
            });
        }
        setIsDialogOpen(true);
    };

    const onSubmit = async (data: any) => {
        try {
            if (editingCity) {
                await cityService.update(editingCity.id, data);
                toast.success("City updated successfully");
            } else {
                await cityService.create(data);
                toast.success("City created successfully");
            }
            setIsDialogOpen(false);
            fetchCities();
        } catch (error) {
            console.error("Error saving city:", error);
            toast.error("Failed to save city");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this city?")) return;
        try {
            await cityService.delete(id);
            toast.success("City deleted successfully.");
            fetchCities();
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete city.");
        }
    };

    return (
        <>
            <ListingLayout
                title="City"
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
                            <TableHead className="font-bold text-[11px] uppercase tracking-wider text-[#a5a5ba]">City Name</TableHead>
                            <TableHead className="font-bold text-[11px] uppercase tracking-wider text-[#a5a5ba]">State</TableHead>
                            <TableHead className="text-right font-bold text-[11px] uppercase tracking-wider text-[#a5a5ba]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-10">
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                        <span className="text-[#a5a5ba]">Loading...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (cities?.length || 0) > 0 ? (
                            cities.map(city => (
                                <TableRow key={city.id} className="group hover:bg-white/5 border-b border-white/5">
                                    <TableCell className="text-[#a5a5ba] font-medium text-[13px]">#{city.id}</TableCell>
                                    <TableCell className="font-semibold text-white text-[13px]">{city?.city || "Unknown"}</TableCell>
                                    <TableCell className="text-[#a5a5ba] text-[13px]">{city?.state || "N/A"}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleOpenDialog(city)}
                                                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Edit className="h-4 w-4 text-[#a5a5ba]" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => handleDelete(city.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-10 text-[#a5a5ba] font-medium">
                                    No cities found.
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
                        <DialogTitle className="text-white">{editingCity ? "Edit City" : "Add New City"}</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="city"
                                render={({ field }: { field: any }) => (
                                    <FormItem>
                                        <FormLabel className="text-white">City Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter city name" {...field} className="bg-muted/20 border-white/10 text-white" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="state"
                                render={({ field }: { field: any }) => (
                                    <FormItem>
                                        <FormLabel className="text-white">State</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter state name" {...field} className="bg-muted/20 border-white/10 text-white" />
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
                                    {editingCity ? "Save Changes" : "Create City"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    );
}
