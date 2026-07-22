"use client";

import { useEffect, useState, useCallback } from "react";
import {
  cutoffTypeService,
  type CutoffType,
  type CutoffTypePayload,
  type CutoffColumn,
} from "@/services/cutoff-type-service";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ListingLayout } from "@/components/content-manager/listing-layout";
import { TableStateRow } from "@/components/content-manager/table-state-row";
import { apiErrorMessage } from "@/lib/api-error";
import { Modal } from "@/components/ui/modal";

const INPUT =
  "w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground/60";

const COLORS = [
  "bg-blue-500",
  "bg-sky-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-violet-500",
  "bg-fuchsia-500",
  "bg-rose-500",
  "bg-slate-500",
];

const EMPTY: CutoffTypePayload = {
  name: "",
  slug: "",
  columns: [{ key: "", label: "" }],
  color: "bg-blue-500",
  priority: 0,
  isActive: true,
};

/** Mirrors the backend's slug rule so bad input is caught before the request. */
function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export default function CutoffTypesPage() {
  const [items, setItems] = useState<CutoffType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<CutoffType | null>(null);
  const [form, setForm] = useState<CutoffTypePayload | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      setItems(await cutoffTypeService.getAll());
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch cutoff types.");
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY, columns: [{ key: "", label: "" }] });
  }

  function openEdit(item: CutoffType) {
    setEditing(item);
    setForm({
      name: item.name,
      slug: item.slug,
      columns: item.columns?.length
        ? [...item.columns]
        : [{ key: "", label: "" }],
      color: item.color,
      priority: item.priority,
      isActive: item.isActive,
    });
  }

  function setColumn(index: number, patch: Partial<CutoffColumn>) {
    if (!form) return;
    const columns = form.columns.map((c, i) =>
      i === index ? { ...c, ...patch } : c,
    );
    setForm({ ...form, columns });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;

    const columns = form.columns
      .map((c) => ({ key: slugify(c.key || c.label), label: c.label.trim() }))
      .filter((c) => c.key && c.label);

    if (columns.length === 0) {
      toast.error("Add at least one column.");
      return;
    }

    setSaving(true);
    try {
      const payload = { ...form, slug: slugify(form.slug), columns };
      if (editing) {
        await cutoffTypeService.update(editing.id, payload);
        toast.success("Cutoff type updated.");
      } else {
        await cutoffTypeService.create(payload);
        toast.success("Cutoff type created.");
      }
      setForm(null);
      setEditing(null);
      fetchItems();
    } catch (error) {
      console.error(error);
      toast.error(apiErrorMessage(error, "Failed to save cutoff type."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item: CutoffType) {
    if (
      !confirm(
        `Delete "${item.name}"?\n\nValues already saved on college courses under "${item.slug}" stay in the database but stop being shown. Set the type inactive instead if you only want to hide it.`,
      )
    ) {
      return;
    }
    try {
      await cutoffTypeService.remove(item.id);
      toast.success("Cutoff type deleted.");
      fetchItems();
    } catch (error) {
      console.error(error);
      toast.error(apiErrorMessage(error, "Failed to delete cutoff type."));
    }
  }

  const filtered = items.filter((t) => {
    const q = search.toLowerCase();
    return t.name.toLowerCase().includes(q) || t.slug.toLowerCase().includes(q);
  });

  return (
    <>
      {form && (
        <Modal
          title={editing ? "Edit Cutoff Type" : "New Cutoff Type"}
          onClose={() => setForm(null)}
          size="md"
        >
          <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
            <Field label="Name *">
              <input
                required
                value={form.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setForm({
                    ...form,
                    name,
                    // Only auto-fill the slug for new types; changing an
                    // existing slug orphans saved values.
                    slug: editing ? form.slug : slugify(name),
                  });
                }}
                placeholder="NRI Girls Quota"
                className={INPUT}
              />
            </Field>

            <Field label="Slug *">
              <input
                required
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="nri_girls_quota"
                className={INPUT}
              />
              <p className="text-[11px] text-muted-foreground mt-1.5">
                {editing
                  ? "Changing this orphans every cutoff already saved under the old slug."
                  : "Storage key on the college course. Lowercase letters, digits and underscores."}
              </p>
            </Field>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                Columns *
              </label>
              <p className="text-[11px] text-muted-foreground mb-2">
                One input per column, in this order — categories (Open, EWS,
                OBC…) or rounds (R-1, R-2, R-Final).
              </p>
              <div className="space-y-2">
                {form.columns.map((column, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      value={column.label}
                      onChange={(e) =>
                        setColumn(index, {
                          label: e.target.value,
                          key:
                            column.key && column.key !== slugify(column.label)
                              ? column.key
                              : slugify(e.target.value),
                        })
                      }
                      placeholder="Label — Open"
                      className={INPUT}
                    />
                    <input
                      value={column.key}
                      onChange={(e) =>
                        setColumn(index, { key: e.target.value })
                      }
                      placeholder="key — open"
                      className={`${INPUT} font-mono text-xs`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0 shrink-0 text-destructive"
                      onClick={() =>
                        setForm({
                          ...form,
                          columns: form.columns.filter((_, i) => i !== index),
                        })
                      }
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2 gap-1.5"
                onClick={() =>
                  setForm({
                    ...form,
                    columns: [...form.columns, { key: "", label: "" }],
                  })
                }
              >
                <Plus className="h-3.5 w-3.5" />
                Add column
              </Button>
            </div>

            <Field label="Colour">
              <div className="flex flex-wrap gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setForm({ ...form, color })}
                    className={`h-7 w-7 rounded-full ${color} transition-transform ${
                      form.color === color
                        ? "ring-2 ring-offset-2 ring-foreground scale-110"
                        : "opacity-60 hover:opacity-100"
                    }`}
                    aria-label={color}
                  />
                ))}
              </div>
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Priority (lower = first)">
                <input
                  type="number"
                  value={form.priority}
                  onChange={(e) =>
                    setForm({ ...form, priority: Number(e.target.value) })
                  }
                  className={INPUT}
                />
              </Field>
              <Field label="Status">
                <label className="flex items-center gap-2 h-[38px] text-sm">
                  <input
                    type="checkbox"
                    checked={form.isActive ?? true}
                    onChange={(e) =>
                      setForm({ ...form, isActive: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-border"
                  />
                  Active
                </label>
              </Field>
            </div>

            <div className="pt-4 border-t border-border flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setForm(null)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="flex-1">
                {saving ? "Saving..." : editing ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      <ListingLayout
        title="Cutoff Types"
        description="Each type is one cutoff block on every college course. Add a type here and it appears in the college form automatically."
        count={filtered.length}
        onCreateClick={openCreate}
        createLabel="Add Cutoff Type"
        onSearchChange={setSearch}
        searchPlaceholder="Search by name or slug..."
      >
        <Table>
          <TableHeader className="bg-card">
            <TableRow className="hover:bg-transparent border-b border-border/50">
              <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                Name
              </TableHead>
              <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                Slug
              </TableHead>
              <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                Columns
              </TableHead>
              <TableHead className="w-20 font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                Priority
              </TableHead>
              <TableHead className="w-20 font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                Status
              </TableHead>
              <TableHead className="text-right font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableStateRow colSpan={6} isLoading emptyLabel="" />
            ) : filtered.length > 0 ? (
              filtered.map((item) => (
                <TableRow
                  key={item.id}
                  className="group hover:bg-muted/50 border-b border-border/50 cursor-pointer"
                  onClick={() => openEdit(item)}
                >
                  <TableCell className="font-semibold text-foreground text-[13px]">
                    <span className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full shrink-0 ${item.color}`}
                      />
                      {item.name}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-[12px] font-mono">
                    {item.slug}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-[12px]">
                    {item.columns?.map((c) => c.label).join(" · ")}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-[13px]">
                    {item.priority}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        item.isActive
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {item.isActive ? "Active" : "Off"}
                    </span>
                  </TableCell>
                  <TableCell
                    className="text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => openEdit(item)}
                      >
                        <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDelete(item)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableStateRow
                colSpan={6}
                emptyLabel="No cutoff types yet. Add one to get started."
              />
            )}
          </TableBody>
        </Table>
      </ListingLayout>
    </>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
