"use client";

import { useEffect, useState, useCallback } from "react";
import {
  scholarshipService,
  type Scholarship,
  type ScholarshipPayload,
} from "@/services/scholarship-service";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ListingLayout } from "@/components/content-manager/listing-layout";
import { TableStateRow } from "@/components/content-manager/table-state-row";
import { Modal } from "@/components/ui/modal";

const INPUT =
  "w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground/60";

const TYPE_SUGGESTIONS = ["Merit", "Government", "Category", "College"];

const EMPTY: ScholarshipPayload = {
  name: "",
  value: "",
  eligibility: "",
  type: "Merit",
  officialUrl: "",
  priority: 0,
};

export default function ScholarshipsPage() {
  const [items, setItems] = useState<Scholarship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Scholarship | null>(null);
  const [form, setForm] = useState<ScholarshipPayload | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      setItems(await scholarshipService.getAll());
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch scholarships.");
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
    setForm({ ...EMPTY });
  }

  function openEdit(item: Scholarship) {
    setEditing(item);
    setForm({
      name: item.name,
      value: item.value,
      eligibility: item.eligibility,
      type: item.type,
      officialUrl: item.officialUrl ?? "",
      priority: item.priority ?? 0,
    });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    try {
      if (editing) {
        await scholarshipService.update(editing.id, form);
        toast.success("Scholarship updated.");
      } else {
        await scholarshipService.create(form);
        toast.success("Scholarship created.");
      }
      setForm(null);
      setEditing(null);
      fetchItems();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save scholarship.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this scholarship?")) return;
    try {
      await scholarshipService.remove(id);
      toast.success("Scholarship deleted.");
      fetchItems();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete scholarship.");
    }
  }

  const filtered = items.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.type.toLowerCase().includes(q) ||
      s.value.toLowerCase().includes(q)
    );
  });

  return (
    <>
      {form && (
        <Modal
          title={editing ? "Edit Scholarship" : "New Scholarship"}
          onClose={() => setForm(null)}
          size="md"
        >
          <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
            <Field label="Scholarship Name *">
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="NEET Merit Scholarship"
                className={INPUT}
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Value *">
                <input
                  required
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                  placeholder="₹50,000 / year"
                  className={INPUT}
                />
              </Field>
              <Field label="Type *">
                <input
                  required
                  list="scholarship-types"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  placeholder="Merit"
                  className={INPUT}
                />
                <datalist id="scholarship-types">
                  {TYPE_SUGGESTIONS.map((t) => (
                    <option key={t} value={t} />
                  ))}
                </datalist>
              </Field>
            </div>
            <Field label="Eligibility *">
              <textarea
                required
                value={form.eligibility}
                onChange={(e) =>
                  setForm({ ...form, eligibility: e.target.value })
                }
                placeholder="NEET rank under 1,000"
                rows={2}
                className={INPUT}
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Priority (higher = first)">
                <input
                  type="number"
                  value={form.priority}
                  onChange={(e) =>
                    setForm({ ...form, priority: Number(e.target.value) })
                  }
                  className={INPUT}
                />
              </Field>
              <Field label="Official URL">
                <input
                  value={form.officialUrl}
                  onChange={(e) =>
                    setForm({ ...form, officialUrl: e.target.value })
                  }
                  placeholder="https://…"
                  className={INPUT}
                />
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
        title="Scholarships"
        description="Manage the 'Scholarships You Can Avail' section on the home page."
        count={filtered.length}
        onCreateClick={openCreate}
        createLabel="Add scholarship"
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, type or value..."
      >
        <Table>
          <TableHeader className="bg-card">
            <TableRow className="hover:bg-transparent border-b border-border/50">
              <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                Name
              </TableHead>
              <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                Value
              </TableHead>
              <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                Type
              </TableHead>
              <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                Eligibility
              </TableHead>
              <TableHead className="w-20 font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                Priority
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
                    {item.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-[13px]">
                    {item.value}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-[13px]">
                    {item.type}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-[13px] max-w-xs truncate">
                    {item.eligibility}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-[13px]">
                    {item.priority ?? 0}
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
                        onClick={() => handleDelete(item.id)}
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
                emptyLabel="No scholarships yet. Add one to get started."
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
