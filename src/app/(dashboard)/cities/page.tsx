"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
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
import { Edit, Trash2, ChevronDown, Search, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Pagination } from "@/components/pagination";
import { useForm } from "react-hook-form";
import { useDebounce } from "@/hooks/use-debounce";
import { ListingLayout } from "@/components/content-manager/listing-layout";
import { getAllStates, getCitiesByState, getAllCitiesWithState } from "@/data/cityData";
import { cn } from "@/lib/utils";

// Build full static city list once
const ALL_STATIC_CITIES = getAllCitiesWithState();
const ALL_STATES = getAllStates();

// Build filter options from state list
const STATE_FILTER_OPTIONS = [
    { label: "All States", value: "" },
    ...ALL_STATES.map((s: string) => ({ label: s, value: s })),
];

export default function CitiesPage() {
    const [apiCities, setApiCities] = useState<City[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");
    const [stateFilter, setStateFilter] = useState("");
    const pageSize = 20;

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCity, setEditingCity] = useState<City | null>(null);

    // Dropdown states for dialog
    const [isStateDropdownOpen, setIsStateDropdownOpen] = useState(false);
    const [stateSearch, setStateSearch] = useState("");
    const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
    const [citySearch, setCitySearch] = useState("");

    const debouncedSearch = useDebounce(search, 500);

    const form = useForm({
        defaultValues: {
            city: "",
            state: "",
        },
    });

    const selectedState = form.watch("state");

    // Get cities for the selected state (dialog dropdown)
    const citiesForState = useMemo(() => {
        if (!selectedState) return [];
        return getCitiesByState(selectedState);
    }, [selectedState]);

    // Filtered states for dialog search
    const filteredDialogStates = useMemo(() => {
        if (!stateSearch) return ALL_STATES;
        return ALL_STATES.filter((s: string) =>
            s.toLowerCase().includes(stateSearch.toLowerCase())
        );
    }, [stateSearch]);

    // Filtered cities for dialog search
    const filteredDialogCities = useMemo(() => {
        if (!citySearch) return citiesForState;
        return citiesForState.filter((c: string) =>
            c.toLowerCase().includes(citySearch.toLowerCase())
        );
    }, [citiesForState, citySearch]);

    // Fetch API cities
    const fetchCities = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await cityService.getAll({
                page: 1,
                pageSize: 9999, // Get all from API so we can merge with static
            });
            setApiCities(response.data || []);
        } catch (error) {
            console.error(error);
            setApiCities([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCities();
    }, [fetchCities]);

    // Merge API + static cities, then apply search & state filter, then paginate
    const { paginatedCities, totalCount, pageCount } = useMemo(() => {
        // 1. Merge: API cities first, then static (deduplicated)
        const apiCityKeys = new Set(apiCities.map(c => `${c.city?.toLowerCase()}-${c.state?.toLowerCase()}`));
        const staticExtras = ALL_STATIC_CITIES
            .filter(sc => !apiCityKeys.has(`${sc.city.toLowerCase()}-${sc.state.toLowerCase()}`))
            .map((sc, i) => ({
                id: -(i + 1),
                city: sc.city,
                state: sc.state,
                createdAt: "",
                updatedAt: "",
            } as City));

        let allCities = [...apiCities, ...staticExtras];

        // 2. Apply state filter
        if (stateFilter) {
            allCities = allCities.filter(c =>
                (c.state || "").toLowerCase() === stateFilter.toLowerCase()
            );
        }

        // 3. Apply search filter
        if (debouncedSearch) {
            const q = debouncedSearch.toLowerCase();
            allCities = allCities.filter(c =>
                c.city.toLowerCase().includes(q) ||
                (c.state || "").toLowerCase().includes(q)
            );
        }

        // 4. Paginate
        const total = allCities.length;
        const pages = Math.ceil(total / pageSize);
        const start = (currentPage - 1) * pageSize;
        const paginated = allCities.slice(start, start + pageSize);

        return { paginatedCities: paginated, totalCount: total, pageCount: pages };
    }, [apiCities, stateFilter, debouncedSearch, currentPage]);

    const handleOpenDialog = (city: City | null = null) => {
        setStateSearch("");
        setCitySearch("");
        setIsStateDropdownOpen(false);
        setIsCityDropdownOpen(false);
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

    const handleSelectState = (state: string) => {
        form.setValue("state", state);
        form.setValue("city", "");
        setIsStateDropdownOpen(false);
        setStateSearch("");
    };

    const handleSelectCity = (city: string) => {
        form.setValue("city", city);
        setIsCityDropdownOpen(false);
        setCitySearch("");
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
        } catch (error: any) {
            console.error("Error saving city:", error);
            if (error?.response?.status === 409) {
                toast.error("This city already exists. Please choose a different one.");
            } else {
                toast.error("Failed to save city");
            }
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
                count={totalCount}
                onCreateClick={() => handleOpenDialog()}
                onSearchChange={(val) => {
                    setSearch(val);
                    setCurrentPage(1);
                }}
                filterOptions={STATE_FILTER_OPTIONS}
                filterLabel="Filter by State"
                onFilterChange={(filter) => {
                    setStateFilter(filter.status || "");
                    setCurrentPage(1);
                }}
            >
                <Table>
                    <TableHeader className="bg-card">
                        <TableRow className="hover:bg-transparent border-b border-border/50">
                            <TableHead className="w-[60px] font-bold text-[11px] uppercase tracking-wider text-muted-foreground">ID</TableHead>
                            <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">City Name</TableHead>
                            <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">State</TableHead>
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
                        ) : paginatedCities.length > 0 ? (
                            paginatedCities.map((city, idx) => (
                                <TableRow key={`${city.id}-${idx}`} className="group hover:bg-muted/50 border-b border-border/50">
                                    <TableCell className="text-muted-foreground font-medium text-[13px]">
                                        {city.id > 0 ? `#${city.id}` : "—"}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-3.5 w-3.5 text-primary/50" />
                                            <span className="font-semibold text-foreground text-[13px]">{city?.city || "Unknown"}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-[13px] font-medium">{city?.state || "N/A"}</TableCell>
                                    <TableCell className="text-right">
                                        {city.id > 0 && (
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleOpenDialog(city)}
                                                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Edit className="h-4 w-4 text-muted-foreground" />
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
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-10 text-muted-foreground font-medium">
                                    No cities found.
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
                        <DialogTitle className="text-foreground">{editingCity ? "Edit City" : "Add New City"}</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            {/* State Dropdown */}
                            <FormField
                                control={form.control}
                                name="state"
                                render={({ field }: { field: any }) => (
                                    <FormItem>
                                        <FormLabel className="text-foreground">State</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setIsStateDropdownOpen(!isStateDropdownOpen);
                                                        setIsCityDropdownOpen(false);
                                                    }}
                                                    className={cn(
                                                        "w-full h-10 px-3 flex items-center justify-between text-sm rounded-lg border transition-colors cursor-pointer",
                                                        isStateDropdownOpen
                                                            ? "border-primary/50 ring-1 ring-primary/20"
                                                            : "border-border",
                                                        field.value ? "text-foreground" : "text-muted-foreground"
                                                    )}
                                                >
                                                    <span className="truncate">{field.value || "Select a state"}</span>
                                                    <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", isStateDropdownOpen && "rotate-180")} />
                                                </button>

                                                {isStateDropdownOpen && (
                                                    <>
                                                        <div className="fixed inset-0 z-40" onClick={() => setIsStateDropdownOpen(false)} />
                                                        <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-background border border-border/60 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                                            <div className="p-2 border-b border-border/30">
                                                                <div className="relative">
                                                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
                                                                    <Input
                                                                        placeholder="Search states..."
                                                                        value={stateSearch}
                                                                        onChange={(e) => setStateSearch(e.target.value)}
                                                                        className="h-8 pl-8 text-sm border-border/40 rounded-lg"
                                                                        autoFocus
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="max-h-52 overflow-y-auto p-1">
                                                                {filteredDialogStates.length > 0 ? (
                                                                    filteredDialogStates.map((state: string) => (
                                                                        <button
                                                                            key={state}
                                                                            type="button"
                                                                            onClick={() => handleSelectState(state)}
                                                                            className={cn(
                                                                                "w-full text-left px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer",
                                                                                field.value === state
                                                                                    ? "bg-primary/10 text-primary font-semibold"
                                                                                    : "text-foreground hover:bg-muted/50 font-medium"
                                                                            )}
                                                                        >
                                                                            {state}
                                                                        </button>
                                                                    ))
                                                                ) : (
                                                                    <div className="px-3 py-4 text-center text-xs text-muted-foreground">
                                                                        No states found
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* City Dropdown */}
                            <FormField
                                control={form.control}
                                name="city"
                                render={({ field }: { field: any }) => (
                                    <FormItem>
                                        <FormLabel className="text-foreground">City</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (!selectedState) {
                                                            toast.info("Please select a state first");
                                                            return;
                                                        }
                                                        setIsCityDropdownOpen(!isCityDropdownOpen);
                                                        setIsStateDropdownOpen(false);
                                                    }}
                                                    className={cn(
                                                        "w-full h-10 px-3 flex items-center justify-between text-sm rounded-lg border transition-colors cursor-pointer",
                                                        isCityDropdownOpen
                                                            ? "border-primary/50 ring-1 ring-primary/20"
                                                            : "border-border",
                                                        !selectedState && "opacity-50 cursor-not-allowed",
                                                        field.value ? "text-foreground" : "text-muted-foreground"
                                                    )}
                                                >
                                                    <span className="truncate">
                                                        {field.value || (selectedState ? "Select a city" : "Select state first")}
                                                    </span>
                                                    <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", isCityDropdownOpen && "rotate-180")} />
                                                </button>

                                                {isCityDropdownOpen && selectedState && (
                                                    <>
                                                        <div className="fixed inset-0 z-40" onClick={() => setIsCityDropdownOpen(false)} />
                                                        <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-background border border-border/60 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                                            <div className="p-2 border-b border-border/30">
                                                                <div className="relative">
                                                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
                                                                    <Input
                                                                        placeholder="Search cities..."
                                                                        value={citySearch}
                                                                        onChange={(e) => setCitySearch(e.target.value)}
                                                                        className="h-8 pl-8 text-sm border-border/40 rounded-lg"
                                                                        autoFocus
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="max-h-52 overflow-y-auto p-1">
                                                                {filteredDialogCities.length > 0 ? (
                                                                    filteredDialogCities.map((city: string) => (
                                                                        <button
                                                                            key={city}
                                                                            type="button"
                                                                            onClick={() => handleSelectCity(city)}
                                                                            className={cn(
                                                                                "w-full text-left px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer",
                                                                                field.value === city
                                                                                    ? "bg-primary/10 text-primary font-semibold"
                                                                                    : "text-foreground hover:bg-muted/50 font-medium"
                                                                            )}
                                                                        >
                                                                            {city}
                                                                        </button>
                                                                    ))
                                                                ) : (
                                                                    <div className="px-3 py-4 text-center text-xs text-muted-foreground">
                                                                        No cities found for {selectedState}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
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
