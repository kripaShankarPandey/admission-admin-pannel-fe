"use client";

import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Download,
  Edit,
  Trash2,
  Upload,
  GraduationCap,
  BookOpen,
  Star,
  FileText,
  AlertTriangle,
  X,
  CheckSquare,
  Loader2,
  Trophy,
  MapPin,
  Info,
  FileSpreadsheet,
} from "lucide-react";
import type {
  College,
  CollegeBulkUploadResult,
  CollegeQueryParams,
} from "@/services/college-service";
import { collegeService } from "@/services/college-service";
import { cityService } from "@/services/city-service";
import { courseCategoryService } from "@/services/course-category-service";
import { Pagination } from "@/components/pagination";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";
import { ListingLayout } from "@/components/content-manager/listing-layout";
import { TableStateRow } from "@/components/content-manager/table-state-row";
import { cn } from "@/lib/utils";

/* ─── Constants ─────────────────────────────────────────────────────────── */

const IMPORT_FIELD_GROUPS = [
  {
    title: "Required columns",
    items: [
      "college_name",
      "overview",
      "nirf_rank",
      "establish_year",
      "mgmt_type",
    ],
  },
  {
    title: "Simple text columns",
    items: [
      "university_name",
      "approval",
      "status",
      "state",
      "city",
      "campus_area",
      "accreditation",
      "naac",
      "nba",
      "facilities_enabled",
      "hospital_overview_enabled",
    ],
  },
  {
    title: "Cutoff columns",
    items: [
      "cutoff_state_enabled",
      "cutoff_state",
      "cutoff_all_india_enabled",
      "cutoff_all_india",
      "cutoff_minority_enabled",
      "cutoff_minority",
      "cutoff_nri_enabled",
      "cutoff_nri",
      "govt_state_cutoff_enabled",
      "govt_state_cutoff",
      "government_college_aiq_cutoff_enabled",
      "government_college_aiq_cutoff",
    ],
  },
  {
    title: "Complex JSON columns",
    items: [
      "clinical_excilence_lab",
    ],
  },
];

const IMPORT_TIPS = [
  "Download the Excel template first. The first sheet is for data, the second sheet explains every column.",
  "For multiple simple values, use semicolon-separated text like `MCC; State Counselling`.",
  "Cutoff fields use JSON objects e.g. `{\"r1\":\"1200\",\"r2\":\"1400\"}`. Toggle fields accept `yes` or `no`.",
  "If the slug already exists, the row updates that college instead of creating a duplicate.",
];

const getApiErrorMessage = (error: unknown) => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { message?: unknown } } })
      .response;
    const message = response?.data?.message;
    if (Array.isArray(message)) return message.join(", ");
    if (typeof message === "string") return message;
  }
  return "An unexpected error occurred";
};

/* ─── Types ─────────────────────────────────────────────────────────────── */

type PaginationMeta = {
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
};

type CourseCategoryFilter = { id: number; courses_category_name: string };

/* ─── NAAC Badge ─────────────────────────────────────────────────────────── */

function NaacBadge({ grade }: { grade?: string }) {
  if (!grade)
    return <span className="text-muted-foreground/40 text-[11px]">—</span>;
  const colorMap: Record<string, string> = {
    "A++": "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
    "A+": "bg-green-500/15 text-green-400 border-green-500/25",
    A: "bg-teal-500/15 text-teal-400 border-teal-500/25",
    "B++": "bg-blue-500/15 text-blue-400 border-blue-500/25",
    "B+": "bg-sky-500/15 text-sky-400 border-sky-500/25",
    B: "bg-indigo-500/15 text-indigo-400 border-indigo-500/25",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border",
        colorMap[grade] ?? "bg-muted text-muted-foreground border-border/40",
      )}
    >
      {grade}
    </span>
  );
}

/* ─── Stat Card ──────────────────────────────────────────────────────────── */

function StatCard({
  label,
  value,
  icon: Icon,
  colorCls,
  bgCls,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  colorCls: string;
  bgCls: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border px-4 py-3 shadow-xs transition-all duration-200 hover:shadow-md hover:-translate-y-0.5",
        bgCls,
      )}
    >
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          colorCls,
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <div className="text-xl font-bold tracking-tight text-foreground leading-none">
          {value.toLocaleString()}
        </div>
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mt-0.5">
          {label}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */

export default function CollegesPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Data
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [bulkUploadResult, setBulkUploadResult] =
    useState<CollegeBulkUploadResult | null>(null);

  // Filters
  const [states, setStates] = useState<string[]>([]);
  const [categories, setCategories] = useState<CourseCategoryFilter[]>([]);
  const [selectedState, setSelectedState] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedFeatured, setSelectedFeatured] = useState<
    "all" | "featured" | "regular"
  >("all");

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const debouncedSearch = useDebounce(searchTerm, 500);

  /* ── Fetch colleges ───────────────────────────────────────────────────── */
  const fetchColleges = useCallback(async () => {
    try {
      setLoading(true);
      setSelectedIds(new Set()); // Clear selection on refetch
      const params: CollegeQueryParams = {
        page,
        pageSize,
        search: debouncedSearch,
      };
      if (selectedState !== "all") params.state = selectedState;
      if (selectedCategory !== "all")
        params.courseCategoryId = parseInt(selectedCategory);
      if (selectedFeatured === "featured") params.isFeatured = true;
      if (selectedFeatured === "regular") params.isFeatured = false;

      const response = await collegeService.getAll(params);
      setColleges(response.data || []);
      setMeta(response.meta || null);
    } catch (error) {
      console.error("Error fetching colleges:", error);
      setColleges([]);
    } finally {
      setLoading(false);
    }
  }, [
    page,
    pageSize,
    debouncedSearch,
    selectedState,
    selectedCategory,
    selectedFeatured,
  ]);

  /* ── Fetch filters ────────────────────────────────────────────────────── */
  const fetchFilters = async () => {
    try {
      const [citiesRes, catsRes] = await Promise.all([
        cityService.getAll({ pageSize: 1000 }),
        courseCategoryService.getAll({ pageSize: 100 }),
      ]);
      const uniqueStates = Array.from(
        new Set(
          (citiesRes.data || [])
            .map((c) => c.state?.trim())
            .filter((s): s is string => !!s),
        ),
      ).sort();
      setStates(uniqueStates);
      setCategories(catsRes.data || []);
    } catch (error) {
      console.error("Error fetching filters:", error);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);
  useEffect(() => {
    fetchColleges();
  }, [fetchColleges]);

  /* ── Handlers ─────────────────────────────────────────────────────────── */

  const handleDownloadTemplate = async () => {
    try {
      setIsDownloadingTemplate(true);
      const blob = await collegeService.downloadBulkUploadTemplate();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "college-bulk-upload-template.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success("Excel template downloaded");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  const handleBulkUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setIsUploading(true);
      setBulkUploadResult(null);
      const result = await collegeService.bulkUpload(file);
      setBulkUploadResult(result);
      if (result.failed > 0) {
        toast.warning(
          `Import completed with ${result.failed} failed row${result.failed === 1 ? "" : "s"}`,
        );
      } else {
        toast.success(
          `Imported ${result.created + result.updated} college${result.created + result.updated === 1 ? "" : "s"}`,
        );
      }
      setPage(1);
      fetchColleges();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this college?")) return;
    try {
      await collegeService.delete(id);
      toast.success("College deleted");
      fetchColleges();
    } catch {
      toast.error("Failed to delete college");
    }
  };

  const handleBulkDelete = async () => {
    const count = selectedIds.size;
    if (
      !confirm(
        `Delete ${count} selected college${count === 1 ? "" : "s"}? This cannot be undone.`,
      )
    )
      return;
    try {
      setIsBulkDeleting(true);
      let done = 0;
      for (const id of selectedIds) {
        await collegeService.delete(id);
        done++;
      }
      toast.success(`Deleted ${done} college${done === 1 ? "" : "s"}`);
      setSelectedIds(new Set());
      fetchColleges();
    } catch {
      toast.error("Some deletions failed — please refresh and try again");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  /* ── Selection helpers ───────────────────────────────────────────────── */

  const allOnPageSelected =
    colleges.length > 0 && colleges.every((c) => selectedIds.has(c.id));
  const someOnPageSelected = colleges.some((c) => selectedIds.has(c.id));

  const toggleSelectAll = () => {
    if (allOnPageSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        colleges.forEach((c) => next.delete(c.id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        colleges.forEach((c) => next.add(c.id));
        return next;
      });
    }
  };

  const toggleRow = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  /* ── Filter UI ───────────────────────────────────────────────────────── */

  const filters = (
    <div className="flex flex-wrap items-center gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={handleBulkUpload}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => void handleDownloadTemplate()}
        disabled={isDownloadingTemplate}
        className="h-9 gap-1.5 bg-background border-border/50 text-xs font-semibold"
      >
        {isDownloadingTemplate ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Download className="h-3.5 w-3.5" />
        )}
        Excel Template
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isUploading}
        onClick={() => fileInputRef.current?.click()}
        className="h-9 gap-1.5 bg-background border-border/50 text-xs font-semibold"
      >
        {isUploading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Upload className="h-3.5 w-3.5" />
        )}
        {isUploading ? "Uploading..." : "Import Excel"}
      </Button>
      <Dialog>
        <DialogTrigger
          render={
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 bg-background border-border/50 text-xs font-semibold"
            />
          }
        >
          <Info className="h-3.5 w-3.5" />
          Import Guide
        </DialogTrigger>
        <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-[1100px]">
          <DialogHeader>
            <DialogTitle>College Excel Import Guide</DialogTitle>
            <DialogDescription>
              Use the Excel template to match the college create form fields and
              avoid failed rows.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
            <Card size="sm" className="ring-1 ring-border/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-primary" />
                  Best way to fill the sheet
                </CardTitle>
                <CardDescription>
                  Keep plain text columns simple and use JSON only for
                  repeatable sections.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {IMPORT_TIPS.map((tip) => (
                  <div
                    key={tip}
                    className="rounded-lg border border-border/50 bg-muted/30 px-3 py-2 text-xs text-muted-foreground"
                  >
                    {tip}
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card size="sm" className="ring-1 ring-border/60">
              <CardHeader>
                <CardTitle>Column groups</CardTitle>
                <CardDescription>
                  These groups now match the actual create-college form instead
                  of older legacy import fields.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {IMPORT_FIELD_GROUPS.map((group) => (
                  <div key={group.title} className="space-y-1.5">
                    <div className="text-xs font-semibold text-foreground">
                      {group.title}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {group.items.map((item) => (
                        <Badge
                          key={item}
                          variant="outline"
                          className="text-[11px] font-mono"
                        >
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          <DialogFooter showCloseButton />
        </DialogContent>
      </Dialog>

      {/* Featured quick filter */}
      <div className="flex items-center gap-1 rounded-lg border border-border/50 bg-background p-1">
        {(["all", "featured", "regular"] as const).map((v) => (
          <button
            key={v}
            onClick={() => {
              setSelectedFeatured(v);
              setPage(1);
            }}
            className={cn(
              "px-3 py-1 rounded-md text-xs font-semibold transition-all duration-150",
              selectedFeatured === v
                ? "bg-foreground text-background shadow-xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {v === "all" ? "All" : v === "featured" ? "⭐ Featured" : "Regular"}
          </button>
        ))}
      </div>

      {/* State filter */}
      <Select
        value={selectedState}
        onValueChange={(v) => {
          setSelectedState(v);
          setPage(1);
        }}
      >
        <SelectTrigger className="w-[140px] h-9 bg-background border-border text-foreground text-xs">
          <SelectValue placeholder="All States" />
        </SelectTrigger>
        <SelectContent className="bg-background border-border text-foreground max-h-[220px]">
          <SelectItem value="all">All States</SelectItem>
          {states.map((state) => (
            <SelectItem key={state} value={state}>
              {state}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Category filter */}
      <Select
        value={selectedCategory}
        onValueChange={(v) => {
          setSelectedCategory(v);
          setPage(1);
        }}
      >
        <SelectTrigger className="w-[150px] h-9 bg-background border-border text-foreground text-xs">
          <SelectValue placeholder="All Disciplines" />
        </SelectTrigger>
        <SelectContent className="bg-background border-border text-foreground max-h-[220px]">
          <SelectItem value="all">All Disciplines</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat.id} value={cat.id.toString()}>
              {cat.courses_category_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Page size */}
      <Select
        value={String(pageSize)}
        onValueChange={(v) => {
          setPageSize(Number(v));
          setPage(1);
        }}
      >
        <SelectTrigger className="w-[80px] h-9 bg-background border-border text-foreground text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-background border-border text-foreground">
          <SelectItem value="10">10</SelectItem>
          <SelectItem value="25">25</SelectItem>
          <SelectItem value="50">50</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  /* ── Render ──────────────────────────────────────────────────────────── */

  return (
    <ListingLayout
      title="Colleges"
      description="Manage the college directory — create, filter, and import bulk data."
      count={meta?.pagination?.total || 0}
      onCreateClick={() => router.push("/colleges/create")}
      createLabel="Add College"
      onSearchChange={(val) => {
        setSearchTerm(val);
        setPage(1);
      }}
      searchPlaceholder="Search colleges..."
      actions={filters}
    >
      {/* ── Stats Bar ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 border-b border-border/50 bg-muted/20">
        <StatCard
          label="Total"
          value={meta?.pagination?.total ?? 0}
          icon={GraduationCap}
          colorCls="bg-blue-500/15 text-blue-400"
          bgCls="bg-card border-blue-500/20"
        />
        <StatCard
          label="Published"
          value={colleges.filter((c) => c.publishedAt).length}
          icon={BookOpen}
          colorCls="bg-emerald-500/15 text-emerald-400"
          bgCls="bg-card border-emerald-500/20"
        />
        <StatCard
          label="Draft"
          value={colleges.filter((c) => !c.publishedAt).length}
          icon={FileText}
          colorCls="bg-orange-500/15 text-orange-400"
          bgCls="bg-card border-orange-500/20"
        />
        <StatCard
          label="Featured"
          value={colleges.filter((c) => c.isFeatured).length}
          icon={Star}
          colorCls="bg-purple-500/15 text-purple-400"
          bgCls="bg-card border-purple-500/20"
        />
      </div>

      {/* ── Bulk Upload Result ────────────────────────────────────────── */}
      {bulkUploadResult && (
        <div className="border-b border-border/50 bg-muted/30 p-4">
          <div className="flex flex-col gap-3 rounded-xl border border-border/50 bg-background p-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-foreground flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                Excel import completed
              </div>
              <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {bulkUploadResult.totalRows} rows
                </span>
                <span className="text-emerald-400">
                  ✓ {bulkUploadResult.created} created
                </span>
                <span className="text-blue-400">
                  ↑ {bulkUploadResult.updated} updated
                </span>
                {bulkUploadResult.failed > 0 && (
                  <span className="text-destructive">
                    ✗ {bulkUploadResult.failed} failed
                  </span>
                )}
              </div>
            </div>
            {bulkUploadResult.errors.length > 0 && (
              <div className="max-h-28 w-full overflow-auto rounded-lg border border-destructive/20 bg-destructive/5 p-2 text-xs text-destructive sm:max-w-xl">
                {bulkUploadResult.errors.slice(0, 8).map((e) => (
                  <div
                    key={`${e.row}-${e.message}`}
                    className="flex items-start gap-1 py-0.5"
                  >
                    <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
                    Row {e.row}
                    {e.college_name ? ` (${e.college_name})` : ""}: {e.message}
                  </div>
                ))}
                {bulkUploadResult.errors.length > 8 && (
                  <div className="mt-1 font-semibold">
                    +{bulkUploadResult.errors.length - 8} more errors
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Floating Bulk Selection Toolbar ──────────────────────────── */}
      {selectedIds.size > 0 && (
        <div className="border-b border-border/50 bg-primary/5 px-4 py-2.5 flex items-center justify-between gap-3 animate-in slide-in-from-top-1 duration-200">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <CheckSquare className="h-4 w-4 text-primary" />
            {selectedIds.size} row{selectedIds.size === 1 ? "" : "s"} selected
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-3 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setSelectedIds(new Set())}
            >
              <X className="h-3 w-3 mr-1" />
              Deselect all
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="h-7 px-3 text-xs font-semibold"
              onClick={handleBulkDelete}
              disabled={isBulkDeleting}
            >
              {isBulkDeleting ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete {selectedIds.size} selected
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* ── Table ────────────────────────────────────────────────────── */}
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow className="hover:bg-transparent border-b border-border/50">
            {/* Select all checkbox */}
            <TableHead className="w-10 pr-0">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
                checked={allOnPageSelected}
                ref={(el) => {
                  if (el)
                    el.indeterminate = someOnPageSelected && !allOnPageSelected;
                }}
                onChange={toggleSelectAll}
              />
            </TableHead>
            <TableHead className="w-[60px] font-bold text-[10px] uppercase tracking-wider text-muted-foreground">
              ID
            </TableHead>
            <TableHead className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground">
              College Name
            </TableHead>
            <TableHead className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground">
              State
            </TableHead>
            <TableHead className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground">
              Type
            </TableHead>
            <TableHead className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground">
              NAAC
            </TableHead>
            <TableHead className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground">
              NIRF
            </TableHead>
            <TableHead className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground">
              Featured
            </TableHead>
            <TableHead className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground">
              Status
            </TableHead>
            <TableHead className="text-right font-bold text-[10px] uppercase tracking-wider text-muted-foreground">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableStateRow colSpan={10} isLoading emptyLabel="" />
          ) : colleges.length === 0 ? (
            <TableStateRow
              colSpan={10}
              emptyLabel="No colleges found. Try adjusting your filters."
            />
          ) : (
            colleges.map((college) => {
              const isSelected = selectedIds.has(college.id);
              return (
                <TableRow
                  key={college.id}
                  className={cn(
                    "group border-b border-border/40 transition-colors",
                    isSelected
                      ? "bg-primary/5 hover:bg-primary/8"
                      : "hover:bg-muted/40",
                  )}
                >
                  {/* Checkbox */}
                  <TableCell className="pr-0 w-10">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
                      checked={isSelected}
                      onChange={() => toggleRow(college.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableCell>

                  {/* ID */}
                  <TableCell className="text-muted-foreground font-mono text-[12px]">
                    #{college.id}
                  </TableCell>

                  {/* College name */}
                  <TableCell>
                    <div
                      className="font-semibold text-foreground text-[13px] cursor-pointer hover:text-primary transition-colors max-w-[220px] truncate"
                      onClick={() => router.push(`/colleges/${college.id}`)}
                      title={college.college_name}
                    >
                      {college.college_name || "Unknown"}
                    </div>
                    {college.city?.city && (
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                        <MapPin className="h-2.5 w-2.5" />
                        {college.city.city}
                      </div>
                    )}
                  </TableCell>

                  {/* State */}
                  <TableCell className="text-muted-foreground text-[12px]">
                    {college.city?.state || "—"}
                  </TableCell>

                  {/* Type */}
                  <TableCell>
                    {college.college_type ? (
                      <span className="text-[11px] font-medium text-foreground/80 bg-muted px-2 py-0.5 rounded border border-border/40">
                        {college.college_type}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/40 text-[11px]">
                        —
                      </span>
                    )}
                  </TableCell>

                  {/* NAAC */}
                  <TableCell>
                    <NaacBadge grade={college.naac} />
                  </TableCell>

                  {/* NIRF rank */}
                  <TableCell>
                    {college.NIRF_rank ? (
                      <div className="flex items-center gap-1">
                        <Trophy className="h-3 w-3 text-amber-400" />
                        <span className="text-[12px] font-bold text-amber-400">
                          {college.NIRF_rank}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground/40 text-[11px]">
                        —
                      </span>
                    )}
                  </TableCell>

                  {/* Featured */}
                  <TableCell>
                    {college.isFeatured ? (
                      <Badge className="bg-purple-500/12 text-purple-400 border-purple-500/25 shadow-none text-[10px] font-bold uppercase py-0 px-2">
                        ⭐ Featured
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground/40 text-[11px]">
                        —
                      </span>
                    )}
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    {college.publishedAt ? (
                      <Badge className="bg-emerald-500/12 text-emerald-400 border-emerald-500/25 shadow-none text-[10px] font-bold uppercase py-0 px-2">
                        Published
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-orange-500/10 text-orange-400 border-orange-500/25 shadow-none text-[10px] font-bold uppercase py-0 px-2"
                      >
                        Draft
                      </Badge>
                    )}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/colleges/${college.id}`)}
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Edit"
                      >
                        <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive/50 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDelete(college.id)}
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {/* ── Footer / Pagination ───────────────────────────────────────── */}
      {meta?.pagination && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border/50 bg-muted/20">
          <div className="text-xs text-muted-foreground font-medium">
            Showing{" "}
            <span className="font-bold text-foreground">
              {Math.min((page - 1) * pageSize + 1, meta.pagination.total)}–
              {Math.min(page * pageSize, meta.pagination.total)}
            </span>{" "}
            of{" "}
            <span className="font-bold text-foreground">
              {meta.pagination.total.toLocaleString()}
            </span>{" "}
            colleges
            {selectedIds.size > 0 && (
              <span className="ml-3 text-primary font-semibold">
                · {selectedIds.size} selected
              </span>
            )}
          </div>
          <Pagination
            currentPage={page}
            pageCount={meta.pagination.pageCount}
            total={meta.pagination.total}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </div>
      )}
    </ListingLayout>
  );
}
