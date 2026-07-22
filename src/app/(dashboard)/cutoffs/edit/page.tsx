"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cutoffService } from "@/services/cutoff-service";
import {
  cutoffTypeService,
  type CutoffType,
  type CutoffColumn,
} from "@/services/cutoff-type-service";
import { collegeService, type College } from "@/services/college-service";
import {
  subCourseCategoryService,
  type SubCourseCategory,
} from "@/services/sub-course-category-service";
import { apiErrorMessage } from "@/lib/api-error";

const SELECT =
  "w-full h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40";

type BlockValues = Record<string, Record<string, string>>;

/**
 * Columns to show for one block: the type's own, plus any key already stored
 * that the type does not declare. Older rows hold round values under a
 * category-typed slug, and those must stay visible instead of riding along
 * invisibly in the JSON.
 */
function columnsFor(
  type: CutoffType,
  stored: Record<string, string> | undefined,
): CutoffColumn[] {
  const declared = new Set(type.columns.map((c) => c.key));
  const extra = Object.keys(stored ?? {})
    .filter((key) => !declared.has(key))
    .map((key) => ({
      key,
      label: key === "r_final" ? "Final" : key.toUpperCase(),
    }));
  return [...type.columns, ...extra];
}

// useSearchParams forces client-side rendering up to the nearest Suspense
// boundary, and a prerendered route without one fails the production build.
export default function CutoffEditPage() {
  return (
    <Suspense fallback={null}>
      <CutoffEditView />
    </Suspense>
  );
}

function CutoffEditView() {
  const searchParams = useSearchParams();

  const [colleges, setColleges] = useState<College[]>([]);
  const [courses, setCourses] = useState<SubCourseCategory[]>([]);
  const [types, setTypes] = useState<CutoffType[]>([]);

  const [collegeId, setCollegeId] = useState(searchParams.get("college") ?? "");
  const [courseId, setCourseId] = useState(searchParams.get("course") ?? "");
  const [year, setYear] = useState(
    searchParams.get("year") ?? String(new Date().getFullYear()),
  );

  const [values, setValues] = useState<BlockValues>({});
  const [savedYears, setSavedYears] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      collegeService.getAll({ page: 1, pageSize: 500 }),
      subCourseCategoryService.getAll({ page: 1, pageSize: 1000 }),
      cutoffTypeService.getAll(true),
    ])
      .then(([collegeRes, courseRes, typeRes]) => {
        setColleges(collegeRes.data ?? []);
        setCourses(courseRes.data ?? []);
        setTypes(typeRes ?? []);
      })
      .catch((error) => {
        console.error(error);
        toast.error("Failed to load colleges, courses or cutoff types.");
      });
  }, []);

  const loadScreen = useCallback(async () => {
    if (!collegeId || !courseId || !/^\d{4}$/.test(year)) {
      setValues({});
      return;
    }
    setIsLoading(true);
    try {
      const [rows, years] = await Promise.all([
        cutoffService.getScreen(Number(collegeId), Number(courseId), year),
        cutoffService.getYears(Number(collegeId), Number(courseId)),
      ]);
      const next: BlockValues = {};
      rows.forEach((row) => {
        next[String(row.cutoffTypeId)] = { ...row.values };
      });
      setValues(next);
      setSavedYears(years);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load cutoffs for this selection.");
    } finally {
      setIsLoading(false);
    }
  }, [collegeId, courseId, year]);

  useEffect(() => {
    loadScreen();
  }, [loadScreen]);

  function setCell(typeId: number, key: string, value: string) {
    setValues((prev) => ({
      ...prev,
      [typeId]: { ...(prev[typeId] ?? {}), [key]: value },
    }));
  }

  const filledCount = useMemo(
    () =>
      Object.values(values).filter((block) =>
        Object.values(block ?? {}).some((v) => v.trim() !== ""),
      ).length,
    [values],
  );

  async function handleSave() {
    if (!collegeId || !courseId) {
      toast.error("Pick a college and a course first.");
      return;
    }
    if (!/^\d{4}$/.test(year)) {
      toast.error("Enter a four-digit admission year.");
      return;
    }

    setIsSaving(true);
    try {
      // Every type is sent, including emptied ones — the API deletes those
      // rows, which is how a block gets removed.
      await cutoffService.saveScreen({
        collegeId: Number(collegeId),
        subCourseCategoryId: Number(courseId),
        year,
        blocks: types.map((type) => ({
          cutoffTypeId: type.id,
          values: values[type.id] ?? {},
        })),
      });
      toast.success(`Cutoffs saved for ${year}.`);
      loadScreen();
    } catch (error) {
      console.error(error);
      toast.error(apiErrorMessage(error, "Failed to save cutoffs."));
    } finally {
      setIsSaving(false);
    }
  }

  const ready = Boolean(collegeId && courseId && /^\d{4}$/.test(year));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/cutoffs"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <div>
            <h1 className="text-lg font-bold text-foreground">Edit Cutoffs</h1>
            <p className="text-xs text-muted-foreground">
              Pick a college, course and year, then fill the blocks. Clearing a
              block removes it.
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={!ready || isSaving} className="gap-1.5">
          <Save className="h-4 w-4" />
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field label="College *">
            <select
              value={collegeId}
              onChange={(e) => setCollegeId(e.target.value)}
              className={SELECT}
            >
              <option value="">Select a college…</option>
              {colleges.map((college) => (
                <option key={college.id} value={college.id}>
                  {college.college_name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Course *">
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className={SELECT}
            >
              <option value="">Select a course…</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.sub_course_category_name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Admission year *">
            <Input
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="2026"
              className="h-10"
            />
            {savedYears.length > 0 && (
              <div className="mt-1.5 flex flex-wrap items-center gap-1">
                <span className="text-[11px] text-muted-foreground">Saved:</span>
                {savedYears.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setYear(option)}
                    className={`rounded px-1.5 py-0.5 text-[11px] font-bold transition-colors ${
                      option === year
                        ? "bg-primary text-primary-foreground"
                        : "text-primary hover:bg-primary/10"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </Field>
        </div>
      </div>

      {!ready ? (
        <div className="rounded-xl border border-dashed border-border/60 bg-muted/10 p-10 text-center">
          <p className="text-sm text-muted-foreground">
            Select a college, course and year to start entering cutoffs.
          </p>
        </div>
      ) : types.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/60 bg-muted/10 p-10 text-center">
          <p className="text-sm text-muted-foreground">
            No cutoff types defined yet —{" "}
            <Link href="/cutoffs/types" className="font-semibold text-primary">
              add one first
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="space-y-3 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between border-b border-border/50 pb-3">
            <h2 className="text-sm font-bold text-foreground">
              Cutoff blocks — {year}
            </h2>
            <span className="text-[11px] text-muted-foreground">
              {isLoading ? "Loading…" : `${filledCount} of ${types.length} filled`}
            </span>
          </div>

          {types.map((type) => {
            const stored = values[type.id];
            const columns = columnsFor(type, stored);
            return (
              <div key={type.id} className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${type.color}`} />
                  <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                    {type.name}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {columns.map((column) => (
                    <Input
                      key={column.key}
                      value={stored?.[column.key] ?? ""}
                      onChange={(e) =>
                        setCell(type.id, column.key, e.target.value)
                      }
                      placeholder={column.label}
                      className="h-9 min-w-20 flex-1 text-center text-xs placeholder:text-[10px]"
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
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
