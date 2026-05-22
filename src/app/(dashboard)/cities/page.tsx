"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Building2, Edit, MapPin, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pagination } from "@/components/pagination";
import { cityService, type City } from "@/services/city-service";
import { useDebounce } from "@/hooks/use-debounce";

type CityFormState = {
  state: string;
  city: string;
};

const PAGE_SIZE = 20;

const getApiErrorMessage = (error: unknown) => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const message = (
      error as { response?: { data?: { message?: unknown } } }
    ).response?.data?.message;
    if (Array.isArray(message)) return message.join(", ");
    if (typeof message === "string") return message;
  }
  return "Something went wrong. Please try again.";
};

export default function CitiesPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [stateOptions, setStateOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedState, setSelectedState] = useState("all");
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [total, setTotal] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [formState, setFormState] = useState<CityFormState>({
    state: "",
    city: "",
  });

  const debouncedSearch = useDebounce(search, 400);

  const fetchCities = useCallback(async () => {
    try {
      setLoading(true);
      const response = await cityService.getAll({
        page,
        pageSize: PAGE_SIZE,
        search: debouncedSearch,
        state: selectedState === "all" ? undefined : selectedState,
      });
      setCities(response.data || []);
      setTotal(response.meta.pagination.total || 0);
      setPageCount(response.meta.pagination.pageCount || 1);
    } catch (error) {
      console.error("Error fetching cities:", error);
      toast.error("Failed to load cities");
      setCities([]);
      setTotal(0);
      setPageCount(1);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page, selectedState]);

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  useEffect(() => {
    const fetchStateOptions = async () => {
      try {
        const response = await cityService.getAll({
          page: 1,
          pageSize: 9999,
        });
        const states = Array.from(
          new Set(
            (response.data || [])
              .map((city) => city.state)
              .filter(Boolean) as string[],
          ),
        ).sort((a, b) => a.localeCompare(b));
        setStateOptions(states);
      } catch (error) {
        console.error("Error fetching states:", error);
        setStateOptions([]);
      }
    };

    void fetchStateOptions();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedState]);

  const openCreateDialog = () => {
    setEditingCity(null);
    setFormState({ state: "", city: "" });
    setIsDialogOpen(true);
  };

  const openEditDialog = (city: City) => {
    setEditingCity(city);
    setFormState({
      state: city.state || "",
      city: city.city || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formState.state.trim() || !formState.city.trim()) {
      toast.error("Please select both state and city.");
      return;
    }

    try {
      setSaving(true);
      if (editingCity) {
        await cityService.update(editingCity.id, formState);
        toast.success("City updated successfully");
      } else {
        await cityService.create(formState);
        toast.success("City saved to database");
      }
      setIsDialogOpen(false);
      fetchCities();
    } catch (error) {
      console.error("Error saving city:", error);
      toast.error(getApiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (city: City) => {
    if (!confirm(`Delete ${city.city}?`)) return;

    try {
      await cityService.delete(city.id);
      toast.success("City deleted successfully");
      fetchCities();
    } catch (error) {
      console.error("Error deleting city:", error);
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border/60 bg-card text-primary">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Cities
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage saved city and state records used throughout colleges.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className="h-9 rounded-lg border-border/60 bg-card px-3 text-sm"
          >
            {total} saved
          </Badge>
          <Button onClick={openCreateDialog} className="h-9 gap-2">
            <Plus className="h-4 w-4" />
            Add City
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/50 bg-card shadow-xs">
        <div className="flex flex-col gap-3 border-b border-border/50 bg-muted/30 p-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search cities..."
              className="h-10 pl-9"
            />
          </div>

              <Select value={selectedState} onValueChange={setSelectedState}>
            <SelectTrigger className="h-10 w-full md:w-[240px]">
              <SelectValue placeholder="All states" />
            </SelectTrigger>
            <SelectContent className="max-h-[280px]">
              <SelectItem value="all">All States</SelectItem>
              {stateOptions.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-muted/20 hover:bg-muted/20">
              <TableHead className="w-[90px]">ID</TableHead>
              <TableHead>City</TableHead>
              <TableHead>State</TableHead>
              <TableHead className="w-[130px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    Loading cities...
                  </div>
                </TableCell>
              </TableRow>
            ) : cities.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-32 text-center text-muted-foreground"
                >
                  No cities found.
                </TableCell>
              </TableRow>
            ) : (
              cities.map((city) => (
                <TableRow key={city.id} className="group">
                  <TableCell className="font-medium text-muted-foreground">
                    #{city.id}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <span className="font-semibold text-foreground">
                        {city.city}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-border/60">
                      {city.state || "N/A"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(city)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(city)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <Pagination
          currentPage={page}
          pageCount={pageCount}
          total={total}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingCity ? "Edit City" : "Add City"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  State
                </label>
                <Select
                  value={formState.state}
                  onValueChange={(state) =>
                    setFormState((current) => ({ ...current, state }))
                  }
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[280px]">
                    {stateOptions.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  City
                </label>
                <Input
                  value={formState.city}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      city: event.target.value,
                    }))
                  }
                  placeholder="Enter city name"
                  className="h-10"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : editingCity ? "Save Changes" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
