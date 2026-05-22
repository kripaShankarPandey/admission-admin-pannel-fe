"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Bus, Edit, MapPin, Plane, Plus, Search, TrainFront, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import {
  ReachUsCategory,
  ReachUsLocation,
  reachUsService,
} from "@/services/reach-us-service";

const categoryMeta = {
  airport: {
    title: "Airport",
    plural: "Airports",
    itemLabel: "Airport name",
    placeholder: "Indira Gandhi International Airport",
    icon: Plane,
  },
  "bus-station": {
    title: "Bus Station",
    plural: "Bus Stations",
    itemLabel: "Bus station name",
    placeholder: "Central Bus Station",
    icon: Bus,
  },
  "railway-station": {
    title: "Railway Station",
    plural: "Railway Stations",
    itemLabel: "Railway station name",
    placeholder: "New Delhi Railway Station",
    icon: TrainFront,
  },
} satisfies Record<
  ReachUsCategory,
  {
    title: string;
    plural: string;
    itemLabel: string;
    placeholder: string;
    icon: typeof MapPin;
  }
>;

const isReachUsCategory = (value: string): value is ReachUsCategory =>
  value === "airport" ||
  value === "bus-station" ||
  value === "railway-station";

export default function ReachUsCategoryPage() {
  const params = useParams<{ category: string }>();
  const category = isReachUsCategory(params.category)
    ? params.category
    : "airport";
  const meta = categoryMeta[category];
  const Icon = meta.icon;

  const [items, setItems] = useState<ReachUsLocation[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [selectedState, setSelectedState] = useState("all");
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<ReachUsLocation | null>(null);
  const [formState, setFormState] = useState({ state: "", name: "" });

  const pageSize = 25;

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const response = await reachUsService.getAll({
        category,
        page,
        pageSize,
        search,
        state: selectedState === "all" ? undefined : selectedState,
      });
      setItems(response.data || []);
      setStates(response.meta.states || []);
      setPageCount(response.meta.pagination.pageCount || 1);
      setTotal(response.meta.pagination.total || 0);
    } catch (error) {
      console.error("Error fetching Reach Us data:", error);
      toast.error(`Failed to load ${meta.plural.toLowerCase()}`);
    } finally {
      setLoading(false);
    }
  }, [category, meta.plural, page, search, selectedState]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    setPage(1);
    setEditingItem(null);
    setFormState({ state: "", name: "" });
  }, [category, search, selectedState]);

  const heading = useMemo(
    () => `${meta.plural} Directory`,
    [meta.plural],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formState.state.trim() || !formState.name.trim()) {
      toast.error("State and name are required.");
      return;
    }

    try {
      setSaving(true);
      if (editingItem) {
        await reachUsService.update(editingItem.id, formState);
        toast.success(`${meta.title} updated`);
      } else {
        await reachUsService.create({ category, ...formState });
        toast.success(`${meta.title} added`);
      }
      setEditingItem(null);
      setFormState({ state: "", name: "" });
      fetchItems();
    } catch (error) {
      console.error("Error saving Reach Us item:", error);
      toast.error(`Failed to save ${meta.title.toLowerCase()}`);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: ReachUsLocation) => {
    setEditingItem(item);
    setFormState({ state: item.state, name: item.name });
  };

  const handleDelete = async (item: ReachUsLocation) => {
    if (!confirm(`Delete ${item.name}?`)) return;
    try {
      await reachUsService.delete(item.id);
      toast.success(`${meta.title} deleted`);
      fetchItems();
    } catch (error) {
      console.error("Error deleting Reach Us item:", error);
      toast.error(`Failed to delete ${meta.title.toLowerCase()}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border/60 bg-card text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {heading}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Filter, add, edit, and delete {meta.plural.toLowerCase()} by
              state.
            </p>
          </div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card px-4 py-3 text-sm font-semibold text-foreground">
          {total} total
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[360px_1fr]">
        <form
          onSubmit={handleSubmit}
          className="h-fit rounded-xl border border-border/50 bg-card p-5 shadow-xs"
        >
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                {editingItem ? `Edit ${meta.title}` : `Add ${meta.title}`}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Create entries for the selected Reach Us category.
              </p>
            </div>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                State
              </label>
              <Input
                value={formState.state}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    state: event.target.value,
                  }))
                }
                placeholder="State or union territory"
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                {meta.itemLabel}
              </label>
              <Input
                value={formState.name}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder={meta.placeholder}
                className="h-10"
              />
            </div>
          </div>

          <div className="mt-5 flex gap-2">
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? "Saving..." : editingItem ? "Update" : "Add"}
            </Button>
            {editingItem && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditingItem(null);
                  setFormState({ state: "", name: "" });
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>

        <div className="overflow-hidden rounded-xl border border-border/50 bg-card shadow-xs">
          <div className="flex flex-col gap-3 border-b border-border/50 bg-muted/30 p-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={`Search ${meta.plural.toLowerCase()} or state`}
                className="h-10 pl-9"
              />
            </div>
            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger className="h-10 w-full md:w-[220px]">
                <SelectValue placeholder="All states" />
              </SelectTrigger>
              <SelectContent className="max-h-[260px]">
                <SelectItem value="all">All states</SelectItem>
                {states.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[220px]">State</TableHead>
                <TableHead>{meta.itemLabel}</TableHead>
                <TableHead className="w-[120px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-28 text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="h-28 text-center text-muted-foreground"
                  >
                    No records found.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.state}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(item)}
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
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </div>
      </div>
    </div>
  );
}
