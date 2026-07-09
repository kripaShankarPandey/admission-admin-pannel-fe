"use client";

import { useEffect, useState, useCallback } from "react";
import {
  faqService,
  type Faq,
  type FaqPayload,
} from "@/services/faq-service";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { ListingLayout } from "@/components/content-manager/listing-layout";
import { TableStateRow } from "@/components/content-manager/table-state-row";

const INPUT =
  "w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground/60";

const EMPTY: FaqPayload = { question: "", answer: "", priority: 0 };

export default function FaqsPage() {
  const [items, setItems] = useState<Faq[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Faq | null>(null);
  const [form, setForm] = useState<FaqPayload | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      setItems(await faqService.getAll());
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch FAQs.");
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

  function openEdit(item: Faq) {
    setEditing(item);
    setForm({ question: item.question, answer: item.answer, priority: item.priority ?? 0 });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    try {
      if (editing) {
        await faqService.update(editing.id, form);
        toast.success("FAQ updated.");
      } else {
        await faqService.create(form);
        toast.success("FAQ created.");
      }
      setForm(null);
      setEditing(null);
      fetchItems();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save FAQ.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this FAQ?")) return;
    try {
      await faqService.remove(id);
      toast.success("FAQ deleted.");
      fetchItems();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete FAQ.");
    }
  }

  const filtered = items.filter((f) => {
    const q = search.toLowerCase();
    return f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q);
  });

  return (
    <>
      {form && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">
                {editing ? "Edit FAQ" : "New FAQ"}
              </h2>
              <button
                onClick={() => setForm(null)}
                className="p-1 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
              <Field label="Question *">
                <input
                  required
                  value={form.question}
                  onChange={(e) => setForm({ ...form, question: e.target.value })}
                  placeholder="Is counselling completely free?"
                  className={INPUT}
                />
              </Field>
              <Field label="Answer *">
                <textarea
                  required
                  value={form.answer}
                  onChange={(e) => setForm({ ...form, answer: e.target.value })}
                  placeholder="Yes, the initial session is 100% free…"
                  rows={4}
                  className={INPUT}
                />
              </Field>
              <Field label="Priority (higher = shown first)">
                <input
                  type="number"
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })}
                  className={INPUT}
                />
              </Field>
              <div className="pt-4 border-t border-border flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setForm(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="flex-1">
                  {saving ? "Saving..." : editing ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ListingLayout
        title="FAQs"
        description="Manage the 'Frequently Asked Questions' section on the home page."
        count={filtered.length}
        onCreateClick={openCreate}
        createLabel="Add FAQ"
        onSearchChange={setSearch}
        searchPlaceholder="Search questions or answers..."
      >
        <Table>
          <TableHeader className="bg-card">
            <TableRow className="hover:bg-transparent border-b border-border/50">
              <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Question</TableHead>
              <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Answer</TableHead>
              <TableHead className="w-20 font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Priority</TableHead>
              <TableHead className="text-right font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableStateRow colSpan={4} isLoading emptyLabel="" />
            ) : filtered.length > 0 ? (
              filtered.map((item) => (
                <TableRow
                  key={item.id}
                  className="group hover:bg-muted/50 border-b border-border/50 cursor-pointer"
                  onClick={() => openEdit(item)}
                >
                  <TableCell className="font-semibold text-foreground text-[13px] max-w-xs">{item.question}</TableCell>
                  <TableCell className="text-muted-foreground text-[13px] max-w-md truncate">{item.answer}</TableCell>
                  <TableCell className="text-muted-foreground text-[13px]">{item.priority ?? 0}</TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
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
              <TableStateRow colSpan={4} emptyLabel="No FAQs yet. Add one to get started." />
            )}
          </TableBody>
        </Table>
      </ListingLayout>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
