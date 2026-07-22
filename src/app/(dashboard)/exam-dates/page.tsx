"use client";

import { useEffect, useState, useCallback } from "react";
import {
  examDateService,
  EXAM_STATUSES,
  type ExamDate,
  type ExamStatus,
  type ExamDatePayload,
  formatRegistrationWindow,
} from "@/services/exam-date-service";
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

const STATUS_STYLES: Record<ExamStatus, string> = {
  upcoming: "bg-emerald-100 text-emerald-700 border-emerald-200",
  ongoing: "bg-amber-100 text-amber-700 border-amber-200",
  closed: "bg-slate-100 text-slate-600 border-slate-200",
};

const INPUT =
  "w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground/60";

const EMPTY: ExamDatePayload = {
  name: "",
  examDate: "",
  registrationOpen: "",
  registrationClose: "",
  stream: "",
  status: "upcoming",
  officialUrl: "",
  priority: 0,
};

export default function ExamDatesPage() {
  const [exams, setExams] = useState<ExamDate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<ExamDate | null>(null);
  const [form, setForm] = useState<ExamDatePayload | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchExams = useCallback(async () => {
    setIsLoading(true);
    try {
      setExams(await examDateService.getAll());
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch exam dates.");
      setExams([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY });
  }

  function openEdit(exam: ExamDate) {
    setEditing(exam);
    setForm({
      name: exam.name,
      examDate: exam.examDate,
      // The legacy single window is carried through untouched so editing a
      // pre-split row does not silently discard it.
      registration: exam.registration ?? "",
      registrationOpen: exam.registrationOpen ?? "",
      registrationClose: exam.registrationClose ?? "",
      stream: exam.stream,
      status: exam.status,
      officialUrl: exam.officialUrl ?? "",
      priority: exam.priority ?? 0,
    });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    try {
      if (editing) {
        await examDateService.update(editing.id, form);
        toast.success("Exam date updated.");
      } else {
        await examDateService.create(form);
        toast.success("Exam date created.");
      }
      setForm(null);
      setEditing(null);
      fetchExams();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save exam date.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this exam date?")) return;
    try {
      await examDateService.remove(id);
      toast.success("Exam date deleted.");
      fetchExams();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete exam date.");
    }
  }

  const filtered = exams.filter((e) => {
    const q = search.toLowerCase();
    return (
      e.name.toLowerCase().includes(q) ||
      e.stream.toLowerCase().includes(q) ||
      e.examDate.toLowerCase().includes(q)
    );
  });

  return (
    <>
      {form && (
        <Modal
          title={editing ? "Edit Exam Date" : "New Exam Date"}
          onClose={() => setForm(null)}
          size="md"
        >
          <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
            <Field label="Exam Name *">
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="NEET UG 2026"
                className={INPUT}
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Exam Date *">
                <input
                  required
                  value={form.examDate}
                  onChange={(e) =>
                    setForm({ ...form, examDate: e.target.value })
                  }
                  placeholder="4 May 2026"
                  className={INPUT}
                />
              </Field>
              <Field label="Stream *">
                <input
                  required
                  value={form.stream}
                  onChange={(e) => setForm({ ...form, stream: e.target.value })}
                  placeholder="Medical"
                  className={INPUT}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Registration Open">
                <input
                  value={form.registrationOpen}
                  onChange={(e) =>
                    setForm({ ...form, registrationOpen: e.target.value })
                  }
                  placeholder="1 Mar 2026"
                  className={INPUT}
                />
              </Field>
              <Field label="Registration Closed">
                <input
                  value={form.registrationClose}
                  onChange={(e) =>
                    setForm({ ...form, registrationClose: e.target.value })
                  }
                  placeholder="30 Apr 2026"
                  className={INPUT}
                />
              </Field>
            </div>
            {/* Pre-split rows keep their old single-field value. Surface it so
                it can be typed into the two fields above rather than sitting
                invisible in the database and still showing on the site. */}
            {form.registration &&
              !form.registrationOpen &&
              !form.registrationClose && (
                <p className="-mt-1 text-xs text-muted-foreground">
                  Saved earlier as one field:{" "}
                  <span className="font-semibold text-foreground">
                    {form.registration}
                  </span>{" "}
                  — split it into Open / Closed above.
                </p>
              )}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Status">
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm({ ...form, status: e.target.value as ExamStatus })
                  }
                  className={INPUT + " capitalize"}
                >
                  {EXAM_STATUSES.map((s) => (
                    <option key={s} value={s} className="bg-card">
                      {s}
                    </option>
                  ))}
                </select>
              </Field>
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
            </div>
            <Field label="Official URL">
              <input
                value={form.officialUrl}
                onChange={(e) =>
                  setForm({ ...form, officialUrl: e.target.value })
                }
                placeholder="https://neet.nta.nic.in"
                className={INPUT}
              />
            </Field>
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
        title="Exam Dates"
        description="Manage the Important Exam Dates shown on the home page and the /exam-dates page."
        count={filtered.length}
        onCreateClick={openCreate}
        createLabel="Add exam date"
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, stream or date..."
      >
        <Table>
          <TableHeader className="bg-card">
            <TableRow className="hover:bg-transparent border-b border-border/50">
              <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                Name
              </TableHead>
              <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                Date
              </TableHead>
              <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                Stream
              </TableHead>
              <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                Registration
              </TableHead>
              <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                Status
              </TableHead>
              <TableHead className="w-[80px] font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                Priority
              </TableHead>
              <TableHead className="text-right font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableStateRow colSpan={7} isLoading emptyLabel="" />
            ) : filtered.length > 0 ? (
              filtered.map((exam) => (
                <TableRow
                  key={exam.id}
                  className="group hover:bg-muted/50 border-b border-border/50 cursor-pointer"
                  onClick={() => openEdit(exam)}
                >
                  <TableCell className="font-semibold text-foreground text-[13px]">
                    {exam.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-[13px]">
                    {exam.examDate}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-[13px]">
                    {exam.stream}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-[13px]">
                    {formatRegistrationWindow(exam) || "—"}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wide rounded-full border px-2.5 py-1 ${STATUS_STYLES[exam.status]}`}
                    >
                      {exam.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-[13px]">
                    {exam.priority ?? 0}
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
                        onClick={() => openEdit(exam)}
                      >
                        <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDelete(exam.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableStateRow
                colSpan={7}
                emptyLabel="No exam dates yet. Add one to get started."
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
