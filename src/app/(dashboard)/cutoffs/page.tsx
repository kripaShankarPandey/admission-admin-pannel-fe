"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, Edit, FileUp, Sliders, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { ListingLayout } from "@/components/content-manager/listing-layout";
import { TableStateRow } from "@/components/content-manager/table-state-row";
import { cutoffService, type Cutoff } from "@/services/cutoff-service";
import { collegeService, type College } from "@/services/college-service";
import { apiErrorMessage } from "@/lib/api-error";

const SELECT =
  "h-9 rounded-lg border border-border bg-background px-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

// useSearchParams forces client-side rendering up to the nearest Suspense
// boundary, and a prerendered route without one fails the production build.
export default function CutoffsPage() {
  return (
    <Suspense fallback={null}>
      <CutoffsView />
    </Suspense>
  );
}

function CutoffsView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [rows, setRows] = useState<Cutoff[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [collegeId, setCollegeId] = useState(searchParams.get("college") ?? "");
  const [year, setYear] = useState("");
  const [busy, setBusy] = useState<"import" | "template" | "export" | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const fetchRows = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await cutoffService.getAll({
        pageSize: 500,
        collegeId: collegeId ? Number(collegeId) : undefined,
        year: year || undefined,
        search: search || undefined,
      });
      setRows(res.data ?? []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch cutoffs.");
      setRows([]);
    } finally {
      setIsLoading(false);
    }
  }, [collegeId, year, search]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  useEffect(() => {
    collegeService
      .getAll({ page: 1, pageSize: 500 })
      .then((res) => setColleges(res.data ?? []))
      .catch((error) => console.error(error));
  }, []);

  // Years actually present in the data, so the filter never offers empty ones.
  const years = useMemo(
    () => Array.from(new Set(rows.map((r) => r.year))).sort((a, b) => Number(b) - Number(a)),
    [rows],
  );

  async function handleDelete(row: Cutoff) {
    if (
      !confirm(
        `Delete the ${row.cutoffType.name} cutoff for ${row.subCourseCategory.sub_course_category_name} at ${row.college.college_name} (${row.year})?`,
      )
    ) {
      return;
    }
    try {
      await cutoffService.remove(row.id);
      toast.success("Cutoff deleted.");
      fetchRows();
    } catch (error) {
      console.error(error);
      toast.error(apiErrorMessage(error, "Failed to delete cutoff."));
    }
  }

  async function handleTemplate() {
    setBusy("template");
    try {
      downloadBlob(await cutoffService.downloadTemplate(), "cutoffs-template.xlsx");
    } catch (error) {
      console.error(error);
      toast.error("Failed to download the template.");
    } finally {
      setBusy(null);
    }
  }

  async function handleExport() {
    setBusy("export");
    try {
      downloadBlob(await cutoffService.exportAll(), "cutoffs.xlsx");
    } catch (error) {
      console.error(error);
      toast.error("Failed to export cutoffs.");
    } finally {
      setBusy(null);
    }
  }

  async function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setBusy("import");
    try {
      const result = await cutoffService.bulkUpload(file);
      const saved = result.created + result.updated;
      if (result.failed > 0) {
        toast.warning(
          `${saved} row${saved === 1 ? "" : "s"} saved, ${result.failed} failed. First error: ${result.errors[0]?.message ?? "unknown"}`,
        );
      } else {
        toast.success(`Imported ${saved} cutoff row${saved === 1 ? "" : "s"}.`);
      }
      fetchRows();
    } catch (error) {
      console.error(error);
      toast.error(apiErrorMessage(error, "Import failed."));
    } finally {
      setBusy(null);
    }
  }

  function editHref(row: Cutoff) {
    return `/cutoffs/edit?college=${row.collegeId}&course=${row.subCourseCategoryId}&year=${row.year}`;
  }

  return (
    <>
      <input
        ref={fileInput}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={handleImport}
      />

      <ListingLayout
        title="Cutoffs"
        description="Every college, course and year in one place. Cutoffs are no longer edited inside the college form."
        count={rows.length}
        onCreateClick={() => router.push("/cutoffs/edit")}
        createLabel="Add Cutoff"
        onSearchChange={setSearch}
        searchPlaceholder="Search by college or course..."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={collegeId}
              onChange={(e) => setCollegeId(e.target.value)}
              className={SELECT}
            >
              <option value="">All colleges</option>
              {colleges.map((college) => (
                <option key={college.id} value={college.id}>
                  {college.college_name}
                </option>
              ))}
            </select>

            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className={SELECT}
            >
              <option value="">All years</option>
              {years.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={handleTemplate}
              disabled={busy !== null}
            >
              <Download className="h-3.5 w-3.5" />
              Template
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => fileInput.current?.click()}
              disabled={busy !== null}
            >
              <Upload className="h-3.5 w-3.5" />
              {busy === "import" ? "Importing..." : "Import"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={handleExport}
              disabled={busy !== null}
            >
              <FileUp className="h-3.5 w-3.5" />
              Export
            </Button>
            <Link
              href="/cutoffs/types"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <Sliders className="h-3.5 w-3.5" />
              Types
            </Link>
          </div>
        }
      >
        <Table>
          <TableHeader className="bg-card">
            <TableRow className="hover:bg-transparent border-b border-border/50">
              <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                College
              </TableHead>
              <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                Course
              </TableHead>
              <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                Cutoff Type
              </TableHead>
              <TableHead className="w-16 font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                Year
              </TableHead>
              <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                Values
              </TableHead>
              <TableHead className="text-right font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableStateRow colSpan={6} isLoading emptyLabel="" />
            ) : rows.length > 0 ? (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="group hover:bg-muted/50 border-b border-border/50 cursor-pointer"
                  onClick={() => router.push(editHref(row))}
                >
                  <TableCell className="font-semibold text-foreground text-[13px]">
                    {row.college.college_name}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-[13px]">
                    {row.subCourseCategory.sub_course_category_name}
                  </TableCell>
                  <TableCell className="text-[13px]">
                    <span className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full shrink-0 ${row.cutoffType.color}`}
                      />
                      {row.cutoffType.name}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-[13px] font-semibold">
                    {row.year}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-[12px] font-mono max-w-md truncate">
                    {Object.entries(row.values ?? {})
                      .map(([key, value]) => `${key}:${value}`)
                      .join("  ")}
                  </TableCell>
                  <TableCell
                    className="text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-end gap-1">
                      <Link
                        href={editHref(row)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100"
                      >
                        <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDelete(row)}
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
                emptyLabel="No cutoffs yet. Use Add Cutoff, or import a spreadsheet."
              />
            )}
          </TableBody>
        </Table>
      </ListingLayout>
    </>
  );
}
