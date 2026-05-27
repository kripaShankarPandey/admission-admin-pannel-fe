"use client";

import { useEffect, useMemo, useState } from "react";
import {
  type Control,
  useFieldArray,
  useForm,
  type UseFormRegister,
  useWatch,
  type FieldErrors,
} from "react-hook-form";
import { College } from "@/services/college-service";
import { ClinicalExcilenceLab } from "@/data/ClinicalExcilenceLab";
import { cityService, type City } from "@/services/city-service";
import { courseCategoryService, type CourseCategory } from "@/services/course-category-service";
import { subCourseCategoryService, type SubCourseCategory } from "@/services/sub-course-category-service";
import {
  reachUsService,
  type ReachUsLocation,
} from "@/services/reach-us-service";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";
import {
  BookOpen,
  Building2,
  ClipboardList,
  Clock,
  GraduationCap,
  Hospital,
  ImageIcon,
  MapPin,
  Microscope,
  Plus,
  Save,
  Search,
  Star,
  Trash2,
  Upload,
  Users,
  Volume2,
} from "lucide-react";
import { cn } from "@/lib/utils";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function readString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string") return value;
    if (typeof value === "number") return value.toString();
  }
  return "";
}

function readBoolean(...values: unknown[]): boolean {
  for (const value of values) {
    if (typeof value === "boolean") return value;
    if (value === "true") return true;
    if (value === "false") return false;
  }
  return false;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function isImageFile(file: File) {
  return file.type.startsWith("image/");
}

type CourseLevel =
  | "UG"
  | "PG"
  | "Diploma"
  | "Doctorate"
  | "Certificate"
  | "Other";

interface CourseRow {
  discipline?: string;
  course: string;
  duration: string;
  course_level: CourseLevel | "";
  eligibility: string;
  exam_accepted: string;
  total_intake: string;
  pg_seats: string;
  ss_seats: string;
  intake_total: CourseValueEntry[];
  fee: CourseValueEntry[];
  seats: CourseValueEntry[];
}

interface CourseValueEntry {
  value: string;
  currency?: string;
}

interface DisciplineSectionRow {
  discipline: string;
  courses: CourseRow[];
}

interface RoundCutoff {
  r1: string;
  r2: string;
  r3: string;
  r4: string;
  r5: string;
  r_final: string;
}

interface GovtStateCutoff {
  urop: string;
  ews: string;
  obc: string;
  sc: string;
  st: string;
  ur: string;
}

interface GovtAiqCutoff {
  ews: string;
  obc: string;
  sc: string;
  st: string;
  ur: string;
}

interface ClinicalExcilenceLabRow {
  course: string;
  department: string;
  labs: string[];
}

interface ClinicalExcilenceLabDepartment {
  department: string;
  labs: string[];
}

interface ClinicalExcilenceLabCourseOption {
  course: string;
  departments: ClinicalExcilenceLabDepartment[];
}

interface CollegeFormValues {
  college_name: string;
  university_name: string;
  slug: string;
  approval: string;
  status: string;
  state: string;
  city: string;
  mgmt_type: string;
  establish_year: string;
  campus_area: string;
  accreditation: string;
  nirf_rank: string;
  naac: string;
  nba: string;
  featured: boolean;
  priority: string;
  college_image: string;
  gallery: string[];
  campus_tour_icon: string;
  podcast: string;
  meta_title: string;
  meta_description: string;
  keywords: string;
  action_url: string;
  discipline: string;
  overview: string;
  facilities_enabled: boolean;
  hospital_overview_enabled: boolean;
  admission_counselling: string[];
  eligibility: string;
  internship: string;
  exchange_program: string;
  sponsorship: string;
  stipend_year_1: string;
  stipend_year_2: string;
  stipend_year_3: string;
  hospital_bed: string;
  airport: string;
  railway_station: string;
  bus_stand: string;
  no_of_ot: string;
  total_bed: string;
  ss_bed: string;
  ms_bed: string;
  opd_running: string;
  average_ot: string;
  clinical_rotation: string;
  medical_camping: string;
  clinical_excilence_lab: ClinicalExcilenceLabRow[];
  discipline_sections: DisciplineSectionRow[];
  courses: CourseRow[];
  cutoff_state_enabled: boolean;
  cutoff_all_india_enabled: boolean;
  cutoff_minority_enabled: boolean;
  govt_state_cutoff_enabled: boolean;
  government_college_aiq_cutoff_enabled: boolean;
  cutoff_state: RoundCutoff;
  cutoff_all_india: RoundCutoff;
  cutoff_minority: RoundCutoff;
  govt_state_cutoff: GovtStateCutoff;
  government_college_aiq_cutoff: GovtAiqCutoff;
}

interface CollegeFormProps {
  initialData?: College;
  onSave: (data: Partial<College> & Record<string, unknown>) => Promise<void>;
}

interface CityOption {
  id: number;
  city: string;
  state: string;
}

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  count,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  count?: number;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-background">
          <Icon className="h-4.5 w-4.5 text-primary" />
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-semibold tracking-tight text-foreground">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
      {count !== undefined && (
        <span className="w-fit rounded-md border border-border/60 bg-background px-2 py-1 text-[10px] font-bold uppercase text-muted-foreground">
          {count}
        </span>
      )}
    </div>
  );
}

function FL({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <Label className="text-xs font-semibold text-muted-foreground">
      {children}
      {required && <span className="text-destructive ml-0.5">*</span>}
    </Label>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return <p className="text-xs font-medium text-destructive">{message}</p>;
}

function AddRowButton({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border/70 bg-background text-sm font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
    >
      <Plus className="h-4 w-4" />
      {label}
    </button>
  );
}

function RepeatableRow({
  children,
  onRemove,
  index,
}: {
  children: React.ReactNode;
  onRemove: () => void;
  index: number;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-background p-4 shadow-xs transition-colors hover:border-border">
      <div className="mb-4 flex items-center justify-between gap-3 border-b border-border/40 pb-3">
        <span className="rounded-md bg-muted px-2 py-1 text-[10px] font-bold uppercase text-muted-foreground">
          Row {index + 1}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-destructive/60 hover:bg-destructive/10 hover:text-destructive"
          onClick={onRemove}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {children}
      </div>
    </div>
  );
}

function renderCourseLevelBadge(level: string) {
  switch (level) {
    case "UG":
      return (
        <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 border border-emerald-500/20 uppercase tracking-wider">
          UG
        </span>
      );
    case "PG":
      return (
        <span className="inline-flex items-center gap-1 rounded bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-600 border border-blue-500/20 uppercase tracking-wider">
          PG
        </span>
      );
    case "Diploma":
      return (
        <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 border border-amber-500/20 uppercase tracking-wider">
          Diploma
        </span>
      );
    case "Doctorate":
      return (
        <span className="inline-flex items-center gap-1 rounded bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold text-purple-600 border border-purple-500/20 uppercase tracking-wider">
          Doctorate
        </span>
      );
    case "Certificate":
      return (
        <span className="inline-flex items-center gap-1 rounded bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-600 border border-rose-500/20 uppercase tracking-wider">
          Cert
        </span>
      );
    case "Other":
      return (
        <span className="inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground border border-border/60 uppercase tracking-wider">
          Other
        </span>
      );
    default:
      return null;
  }
}

function mapCourseLevel(level: string): CourseLevel {
  const dbLevelLower = level.toLowerCase();

  if (
    dbLevelLower.includes("ug") ||
    dbLevelLower.includes("under graduate") ||
    dbLevelLower.includes("bachelor")
  ) {
    return "UG";
  }
  if (
    dbLevelLower.includes("pg") ||
    dbLevelLower.includes("post graduate") ||
    dbLevelLower.includes("master")
  ) {
    return "PG";
  }
  if (dbLevelLower.includes("diploma")) {
    return "Diploma";
  }
  if (dbLevelLower.includes("doctorate") || dbLevelLower.includes("phd")) {
    return "Doctorate";
  }
  if (dbLevelLower.includes("certificate")) {
    return "Certificate";
  }

  return "Other";
}

function readSingleSeatValue(value: unknown): string {
  if (Array.isArray(value)) {
    if (value.length > 0) {
      const first = value[0];
      if (first && typeof first === "object") {
        return readString((first as Record<string, unknown>).value);
      }
      return readString(first);
    }
    return "";
  }
  return readString(value);
}

function CourseSeatDetailsGroup({
  control,
  register,
  coursePath,
  rowKey,
}: {
  control: Control<CollegeFormValues>;
  register: UseFormRegister<CollegeFormValues>;
  coursePath: string;
  rowKey: string;
}) {
  const intakeFields = useFieldArray({
    control,
    name: `${coursePath}.intake_total` as never,
  });
  const feeFields = useFieldArray({
    control,
    name: `${coursePath}.fee` as never,
  });
  const seatsFields = useFieldArray({
    control,
    name: `${coursePath}.seats` as never,
  });

  const intakeValues = useWatch({
    control,
    name: `${coursePath}.intake_total` as never,
  }) as CourseValueEntry[] | undefined;
  const feeValues = useWatch({
    control,
    name: `${coursePath}.fee` as never,
  }) as CourseValueEntry[] | undefined;
  const rowCount = Math.max(
    intakeFields.fields.length,
    feeFields.fields.length,
    seatsFields.fields.length,
    1,
  );

  return (
    <div className="space-y-2 col-span-full mt-2 border-t border-border/20 pt-4">
      <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr_1fr_auto] gap-3 items-start px-1">
        <FL>Intake Type</FL>
        <FL>Fee Str</FL>
        <FL>Seats</FL>
        <span />
      </div>
      <div className="space-y-2">
        {Array.from({ length: rowCount }).map((_, nestedIndex) => (
          <div
            key={`${rowKey}-detail-${nestedIndex}`}
            className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr_1fr_auto] gap-3 items-center bg-muted/10 p-2 rounded-lg border border-border/30 hover:border-border/60 transition-colors"
          >
            <div>
              <Select
                value={intakeValues?.[nestedIndex]?.value ?? ""}
                onValueChange={(value) =>
                  intakeFields.update(
                    nestedIndex,
                    createCourseValueEntry(value),
                  )
                }
              >
                <SelectTrigger className="h-9 bg-card border-border/60 text-sm">
                  <SelectValue placeholder="Select intake type" />
                </SelectTrigger>
                <SelectContent>
                  {INTAKE_TOTAL_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="relative flex items-center">
              <div className="absolute left-1 z-10">
                <Select
                  value={feeValues?.[nestedIndex]?.currency ?? "INR"}
                  onValueChange={(val) =>
                    feeFields.update(
                      nestedIndex,
                      createCourseValueEntry(feeValues?.[nestedIndex]?.value ?? "", val),
                    )
                  }
                >
                  <SelectTrigger className="h-7 w-14 bg-transparent border-0 shadow-none text-xs font-bold text-muted-foreground hover:bg-muted/40 transition-colors focus:ring-0 focus-visible:ring-0 pl-2 pr-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="min-w-[80px]">
                    <SelectItem value="INR">INR</SelectItem>
                    <SelectItem value="USD">$</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Input
                {...register(`${coursePath}.fee.${nestedIndex}.value` as never)}
                placeholder="25000"
                className="h-9 bg-card border-border/60 text-sm pl-16 w-full"
              />
            </div>
            <div>
              <Input
                {...register(
                  `${coursePath}.seats.${nestedIndex}.value` as never,
                )}
                placeholder="150"
                className="h-9 bg-card border-border/60 text-sm"
              />
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0 text-destructive/60 hover:text-destructive hover:bg-destructive/10"
              onClick={() => {
                if (rowCount === 1) {
                  intakeFields.update(0, createCourseValueEntry());
                  feeFields.update(0, createCourseValueEntry());
                  seatsFields.update(0, createCourseValueEntry());
                  return;
                }

                intakeFields.remove(nestedIndex);
                feeFields.remove(nestedIndex);
                seatsFields.remove(nestedIndex);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <AddRowButton
          onClick={() => {
            intakeFields.append(createCourseValueEntry());
            feeFields.append(createCourseValueEntry());
            seatsFields.append(createCourseValueEntry());
          }}
          label="Add Intake Row"
        />
      </div>
    </div>
  );
}

function DisciplineCoursesGroup({
  control,
  register,
  setValue,
  getValues,
  sectionIndex,
  sectionId,
  onRemoveSection,
  canRemoveSection,
  dbCourses,
  parsedDetails,
  disciplineOptions,
  inputCls,
}: {
  control: Control<CollegeFormValues>;
  register: UseFormRegister<CollegeFormValues>;
  setValue: ReturnType<typeof useForm<CollegeFormValues>>["setValue"];
  getValues: ReturnType<typeof useForm<CollegeFormValues>>["getValues"];
  sectionIndex: number;
  sectionId: string;
  onRemoveSection: () => void;
  canRemoveSection: boolean;
  dbCourses: SubCourseCategory[];
  parsedDetails: Record<number, Record<string, unknown>>;
  disciplineOptions: Array<{ label: string; value: string }>;
  inputCls: string;
}) {
  const sectionCourses = useFieldArray({
    control,
    name: `discipline_sections.${sectionIndex}.courses`,
  });
  const selectedDiscipline = useWatch({
    control,
    name: `discipline_sections.${sectionIndex}.discipline`,
  });
  const watchedSectionCourses = useWatch({
    control,
    name: `discipline_sections.${sectionIndex}.courses`,
  }) as CourseRow[] | undefined;

  const filteredCourses = useMemo(() => {
    if (!selectedDiscipline) return [];
    return dbCourses.filter(
      (course) =>
        course.courseCategory?.courses_category_name?.toLowerCase() ===
        selectedDiscipline.toLowerCase(),
    );
  }, [dbCourses, selectedDiscipline]);

  const coursePath = (courseIndex: number) =>
    `discipline_sections.${sectionIndex}.courses.${courseIndex}` as const;

  const applySelectedCourseDetails = async (
    courseId: number,
    courseIndex: number,
  ) => {
    let details = parsedDetails[courseId] || {};

    try {
      const courseRecord = await subCourseCategoryService.getOne(courseId);
      details = JSON.parse(courseRecord.details || "{}") as Record<string, unknown>;
    } catch (error) {
      console.error("Failed to fetch selected course details:", error);
    }

    const duration = readString(details.duration);
    const level = readString(details.courseLevel);
    const eligibility = readString(details.eligibility);
    const mappedLevel = mapCourseLevel(level);

    setValue(`${coursePath(courseIndex)}.duration`, duration, {
      shouldDirty: true,
    });
    setValue(`${coursePath(courseIndex)}.course_level`, mappedLevel, {
      shouldDirty: true,
    });
    setValue(`${coursePath(courseIndex)}.eligibility`, eligibility, {
      shouldDirty: true,
    });
  };

  return (
    <div className="rounded-xl border border-border/60 bg-card p-5 shadow-xs">
      <div className="mb-5 flex flex-col gap-4 border-b border-border/40 pb-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="w-full space-y-1.5 lg:max-w-xl">
          <FL>Discipline Section</FL>
          <div className="relative">
            <BookOpen className="pointer-events-none absolute left-3 top-1/2 z-10 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground/60" />
            <Select
              value={selectedDiscipline}
              onValueChange={(value) => {
                setValue(`discipline_sections.${sectionIndex}.discipline`, value, {
                  shouldDirty: true,
                });
                const currentCourses =
                  getValues(`discipline_sections.${sectionIndex}.courses`) || [];
                currentCourses.forEach((_, courseIndex) => {
                  setValue(`${coursePath(courseIndex)}.discipline`, value, {
                    shouldDirty: true,
                  });
                  setValue(`${coursePath(courseIndex)}.course`, "", {
                    shouldDirty: true,
                  });
                  setValue(`${coursePath(courseIndex)}.duration`, "", {
                    shouldDirty: true,
                  });
                  setValue(`${coursePath(courseIndex)}.course_level`, "", {
                    shouldDirty: true,
                  });
                  setValue(`${coursePath(courseIndex)}.eligibility`, "", {
                    shouldDirty: true,
                  });
                  setValue(`${coursePath(courseIndex)}.exam_accepted`, "", {
                    shouldDirty: true,
                  });
                  setValue(`${coursePath(courseIndex)}.total_intake`, "", {
                    shouldDirty: true,
                  });
                  setValue(`${coursePath(courseIndex)}.pg_seats`, "", {
                    shouldDirty: true,
                  });
                  setValue(`${coursePath(courseIndex)}.ss_seats`, "", {
                    shouldDirty: true,
                  });
                });
              }}
            >
              <SelectTrigger className={cn(inputCls, "relative flex items-center gap-2 pl-10")}>
                <SelectValue placeholder="Select discipline" />
              </SelectTrigger>
              <SelectContent className="max-h-[260px]">
                {disciplineOptions.map((discipline) => (
                  <SelectItem key={discipline.value} value={discipline.value}>
                    {discipline.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {canRemoveSection && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 w-fit text-destructive/70 hover:bg-destructive/10 hover:text-destructive"
            onClick={onRemoveSection}
          >
            <Trash2 className="mr-1.5 h-4 w-4" />
            Remove Discipline
          </Button>
        )}
      </div>

      {!selectedDiscipline ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/5 px-4 py-10 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <BookOpen className="h-6 w-6" />
          </div>
          <h4 className="text-sm font-semibold text-foreground">
            No Discipline Selected
          </h4>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            Select a discipline for this section, then add courses under it.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {sectionCourses.fields.map((field, courseIndex) => (
            <div
              key={field.id}
              className="relative rounded-xl border border-border/60 bg-background p-5 shadow-xs transition-all duration-200 hover:border-border hover:shadow-md"
            >
              <div className="mb-5 flex items-center justify-between gap-3 border-b border-border/40 pb-4">
                <div className="flex min-w-0 items-center gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <GraduationCap className="h-4 w-4" />
                  </div>
                  <span className="truncate text-sm font-bold text-foreground">
                    {watchedSectionCourses?.[courseIndex]?.course ||
                      `Course #${courseIndex + 1}`}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg text-destructive/60 transition-colors hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => sectionCourses.remove(courseIndex)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="mb-4 grid w-full grid-cols-1 items-end gap-4 md:grid-cols-4">
                <div className="space-y-1.5 md:col-span-2">
                  <FL>Course</FL>
                  <Select
                    value={watchedSectionCourses?.[courseIndex]?.course ?? ""}
                    onValueChange={(value) => {
                      setValue(`${coursePath(courseIndex)}.course`, value, {
                        shouldDirty: true,
                      });
                      setValue(`${coursePath(courseIndex)}.discipline`, selectedDiscipline, {
                        shouldDirty: true,
                      });
                      const selectedDbCourse = dbCourses.find(
                        (course) => course.sub_course_category_name === value,
                      );
                      setValue(`${coursePath(courseIndex)}.eligibility`, "", {
                        shouldDirty: true,
                      });
                      setValue(`${coursePath(courseIndex)}.exam_accepted`, "", {
                        shouldDirty: true,
                      });

                      if (selectedDbCourse) {
                        void applySelectedCourseDetails(
                          selectedDbCourse.id,
                          courseIndex,
                        );
                      }
                    }}
                  >
                    <SelectTrigger className="flex h-9 w-full items-center gap-2 border-border/60 bg-card pl-3 text-sm transition-colors hover:border-border">
                      <GraduationCap className="h-4.5 w-4.5 shrink-0 text-muted-foreground" />
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[220px]">
                      {filteredCourses.map((course) => {
                        const details = parsedDetails[course.id] || {};
                        const duration = readString(details.duration);
                        const level = readString(details.courseLevel);

                        return (
                          <SelectItem
                            key={course.id}
                            value={course.sub_course_category_name}
                          >
                            <div className="flex w-full items-center justify-between gap-4 text-xs">
                              <span className="font-medium text-foreground">
                                {course.sub_course_category_name}
                              </span>
                              {(duration || level) && (
                                <span className="inline-flex items-center gap-1 rounded border border-border/40 bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                                  {level ? `${level} / ` : ""}
                                  {duration}
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        );
                      })}
                      {watchedSectionCourses?.[courseIndex]?.course &&
                        !filteredCourses.some(
                          (course) =>
                            course.sub_course_category_name ===
                            watchedSectionCourses[courseIndex].course,
                        ) && (
                          <SelectItem value={watchedSectionCourses[courseIndex].course}>
                            {watchedSectionCourses[courseIndex].course}
                          </SelectItem>
                        )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <FL>Duration</FL>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                    </span>
                    <Input
                      {...register(`${coursePath(courseIndex)}.duration`)}
                      placeholder="5.5 Years"
                      className="h-9 w-full border-border/60 bg-card pl-9 text-sm transition-colors hover:border-border"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <FL>Course Level</FL>
                  <Select
                    value={watchedSectionCourses?.[courseIndex]?.course_level ?? ""}
                    onValueChange={(value) =>
                      setValue(`${coursePath(courseIndex)}.course_level`, value as CourseLevel, {
                        shouldDirty: true,
                      })
                    }
                  >
                    <SelectTrigger className="h-9 w-full border-border/60 bg-card text-sm transition-colors hover:border-border">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UG">{renderCourseLevelBadge("UG")}</SelectItem>
                      <SelectItem value="PG">{renderCourseLevelBadge("PG")}</SelectItem>
                      <SelectItem value="Diploma">
                        {renderCourseLevelBadge("Diploma")}
                      </SelectItem>
                      <SelectItem value="Doctorate">
                        {renderCourseLevelBadge("Doctorate")}
                      </SelectItem>
                      <SelectItem value="Certificate">
                        {renderCourseLevelBadge("Certificate")}
                      </SelectItem>
                      <SelectItem value="Other">
                        {renderCourseLevelBadge("Other")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mb-4 grid w-full grid-cols-1 gap-4 md:grid-cols-10">
                <div className="space-y-1.5 md:col-span-7">
                  <FL>Eligibility</FL>
                  <Input
                    {...register(`${coursePath(courseIndex)}.eligibility`)}
                    readOnly
                    className="h-10 border-border/60 bg-muted/30 text-sm text-foreground transition-colors read-only:cursor-default"
                  />
                  <p className="text-xs text-muted-foreground">
                    Auto-filled from the selected course.
                  </p>
                </div>
                <div className="space-y-1.5 md:col-span-3">
                  <FL>Exam Accepted</FL>
                  <Select
                    value={watchedSectionCourses?.[courseIndex]?.exam_accepted ?? ""}
                    onValueChange={(value) =>
                      setValue(`${coursePath(courseIndex)}.exam_accepted`, value, {
                        shouldDirty: true,
                      })
                    }
                  >
                    <SelectTrigger className="h-10 w-full border-border/60 bg-card text-sm transition-colors hover:border-border">
                      <SelectValue placeholder="Select exam" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[260px]">
                      {EXAM_ACCEPTED_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mb-4 grid w-full grid-cols-1 items-end gap-4 md:grid-cols-3">
                <div className="space-y-1.5">
                  <FL>Total Intake</FL>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                    </span>
                    <Input
                      {...register(`${coursePath(courseIndex)}.total_intake`)}
                      placeholder="150"
                      className="h-9 w-full border-border/60 bg-card pl-9 text-sm transition-colors hover:border-border"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <FL>Total PG Seat</FL>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                    </span>
                    <Input
                      {...register(`${coursePath(courseIndex)}.pg_seats`)}
                      placeholder="45"
                      className="h-9 w-full border-border/60 bg-card pl-9 text-sm transition-colors hover:border-border"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <FL>Total SS Seat</FL>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                    </span>
                    <Input
                      {...register(`${coursePath(courseIndex)}.ss_seats`)}
                      placeholder="12"
                      className="h-9 w-full border-border/60 bg-card pl-9 text-sm transition-colors hover:border-border"
                    />
                  </div>
                </div>
              </div>

              <CourseSeatDetailsGroup
                control={control}
                register={register}
                coursePath={coursePath(courseIndex)}
                rowKey={`${sectionId}-${courseIndex}`}
              />
            </div>
          ))}

          {sectionCourses.fields.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-background px-4 py-10 text-center">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Plus className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-semibold text-foreground">No Courses Added</h4>
              <p className="mt-1 text-xs text-muted-foreground">
                Add your first program under this discipline.
              </p>
            </div>
          )}

          <AddRowButton
            onClick={() => sectionCourses.append(defaultCourseRow(selectedDiscipline))}
            label="Add Course"
          />
        </div>
      )}
    </div>
  );
}

function defaultRoundCutoff(value?: Partial<RoundCutoff>): RoundCutoff {
  return {
    r1: readString(value?.r1),
    r2: readString(value?.r2),
    r3: readString(value?.r3),
    r4: readString(value?.r4),
    r5: readString(value?.r5),
    r_final: readString(value?.r_final),
  };
}

function defaultGovtStateCutoff(
  value?: Partial<GovtStateCutoff>,
): GovtStateCutoff {
  return {
    urop: readString(value?.urop),
    ews: readString(value?.ews),
    obc: readString(value?.obc),
    sc: readString(value?.sc),
    st: readString(value?.st),
    ur: readString(value?.ur),
  };
}

function defaultGovtAiqCutoff(value?: Partial<GovtAiqCutoff>): GovtAiqCutoff {
  return {
    ews: readString(value?.ews),
    obc: readString(value?.obc),
    sc: readString(value?.sc),
    st: readString(value?.st),
    ur: readString(value?.ur),
  };
}

function createCourseValueEntry(value = "", currency = "INR"): CourseValueEntry {
  return { value, currency };
}

function defaultCourseRow(discipline = ""): CourseRow {
  return {
    discipline,
    course: "",
    duration: "",
    course_level: "",
    eligibility: "",
    exam_accepted: "",
    total_intake: "",
    pg_seats: "",
    ss_seats: "",
    intake_total: [createCourseValueEntry()],
    fee: [createCourseValueEntry()],
    seats: [createCourseValueEntry()],
  };
}

function defaultDisciplineSectionRow(): DisciplineSectionRow {
  return {
    discipline: "",
    courses: [defaultCourseRow()],
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function normalizeRows<T extends object>(
  value: unknown,
  emptyRow: T,
  mapper: (record: Record<string, unknown>) => T,
): T[] {
  if (!Array.isArray(value) || value.length === 0) {
    return [emptyRow];
  }

  const rows = value.map((row) => mapper(asRecord(row)));
  return rows.length > 0 ? rows : [emptyRow];
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => readString(item).trim())
    .filter((item) => item.length > 0);
}

function readSelectionList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return readStringArray(value);
  }

  const text = readString(value).trim();
  if (!text) return [];

  if (text.startsWith("[") && text.endsWith("]")) {
    try {
      const parsed = JSON.parse(text);
      return readStringArray(parsed);
    } catch {
      return [text];
    }
  }

  if (text.includes(";")) {
    return text
      .split(";")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  return [text];
}

function defaultClinicalExcilenceLabRow(): ClinicalExcilenceLabRow {
  return { course: "", department: "", labs: [] };
}

function normalizeClinicalExcilenceLabRows(
  value: unknown,
): ClinicalExcilenceLabRow[] {
  return normalizeRows(value, defaultClinicalExcilenceLabRow(), (row) => ({
    course: readString(row.course),
    department: readString(row.department, row.dipartment),
    labs: readStringArray(row.labs),
  }));
}

function pruneClinicalExcilenceLabRows(
  rows: ClinicalExcilenceLabRow[],
): ClinicalExcilenceLabRow[] {
  return rows.filter(
    (row) =>
      row.course.trim().length > 0 ||
      row.department.trim().length > 0 ||
      row.labs.length > 0,
  );
}

function normalizeCourseValueEntries(value: unknown): CourseValueEntry[] {
  if (Array.isArray(value)) {
    const normalizedEntries = value
      .map((entry) => {
        if (typeof entry === "string" || typeof entry === "number") {
          return createCourseValueEntry(readString(entry));
        }

        if (entry && typeof entry === "object") {
          return createCourseValueEntry(
            readString((entry as { value?: unknown }).value),
            readString((entry as { currency?: unknown }).currency) || "INR",
          );
        }

        return null;
      })
      .filter((entry): entry is CourseValueEntry => entry !== null);

    if (normalizedEntries.length > 0) {
      return normalizedEntries;
    }
  }

  return [createCourseValueEntry(readString(value))];
}

function normalizeCourseRows(
  value: unknown,
  fallbackEligibility = "",
  fallbackExamAccepted = "",
): CourseRow[] {
  if (!Array.isArray(value) || value.length === 0) {
    return [defaultCourseRow()];
  }

  return value.map((row) => {
    const record = row && typeof row === "object" ? row : {};
    const intakeEntries = normalizeCourseValueEntries(
      (record as { intake_total?: unknown }).intake_total,
    );
    const feeEntries = normalizeCourseValueEntries(
      (record as { fee?: unknown }).fee,
    );
    
    const rawSeats = (record as { seats?: unknown }).seats;
    const rawTotalIntake = (record as { total_intake?: unknown }).total_intake;
    const seatsEntries = normalizeCourseValueEntries(
      rawSeats !== undefined ? rawSeats : (Array.isArray(rawTotalIntake) ? rawTotalIntake : undefined)
    );

    const entryCount = Math.max(
      intakeEntries.length,
      feeEntries.length,
      seatsEntries.length,
      1,
    );

    return {
      discipline: readString((record as { discipline?: unknown }).discipline),
      course: readString((record as { course?: unknown }).course),
      duration: readString((record as { duration?: unknown }).duration),
      course_level: readString(
        (record as { course_level?: unknown }).course_level,
      ) as CourseLevel | "",
      eligibility: readString(
        (record as { eligibility?: unknown }).eligibility,
        fallbackEligibility,
      ),
      exam_accepted: readString(
        (record as { exam_accepted?: unknown }).exam_accepted,
        fallbackExamAccepted,
      ),
      total_intake: readSingleSeatValue((record as { total_intake?: unknown }).total_intake),
      pg_seats: readSingleSeatValue((record as { pg_seats?: unknown }).pg_seats),
      ss_seats: readSingleSeatValue((record as { ss_seats?: unknown }).ss_seats),
      intake_total: Array.from({ length: entryCount }, (_, index) => {
        return intakeEntries[index] ?? createCourseValueEntry();
      }),
      fee: Array.from({ length: entryCount }, (_, index) => {
        return feeEntries[index] ?? createCourseValueEntry();
      }),
      seats: Array.from({ length: entryCount }, (_, index) => {
        return seatsEntries[index] ?? createCourseValueEntry();
      }),
    };
  });
}

function normalizeDisciplineSections(
  discipline: unknown,
  courses: unknown,
  fallbackEligibility = "",
  fallbackExamAccepted = "",
): DisciplineSectionRow[] {
  const normalizedCourses = normalizeCourseRows(
    courses,
    fallbackEligibility,
    fallbackExamAccepted,
  );
  const sections = new Map<string, CourseRow[]>();
  const fallbackDiscipline = readString(discipline);

  normalizedCourses.forEach((course) => {
    const sectionName = course.discipline || fallbackDiscipline;
    if (!sections.has(sectionName)) {
      sections.set(sectionName, []);
    }
    sections.get(sectionName)?.push({ ...course, discipline: sectionName });
  });

  if (sections.size === 0) return [defaultDisciplineSectionRow()];

  return Array.from(sections.entries()).map(([sectionName, sectionCourses]) => ({
    discipline: sectionName,
    courses: sectionCourses.length > 0 ? sectionCourses : [defaultCourseRow(sectionName)],
  }));
}

function flattenDisciplineSections(
  sections: DisciplineSectionRow[] = [],
): CourseRow[] {
  return sections.flatMap((section) =>
    (section.courses || []).map((course) => ({
      ...course,
      discipline: section.discipline,
    })),
  );
}

function roundCutoffFields(
  prefix: "cutoff_state" | "cutoff_all_india" | "cutoff_minority",
) {
  return [
    { label: "R-1", name: `${prefix}.r1` as const },
    { label: "R-2", name: `${prefix}.r2` as const },
    { label: "R-3", name: `${prefix}.r3` as const },
    { label: "R-4", name: `${prefix}.r4` as const },
    { label: "R-5", name: `${prefix}.r5` as const },
    { label: "R-Final", name: `${prefix}.r_final` as const },
  ];
}

const NAAC_OPTIONS = [
  "NAAC A++",
  "NAAC A+",
  "NAAC A",
  "NAAC B++",
  "NAAC B+",
  "NAAC B",
] as const;

const NBA_OPTIONS = ["Yes", "No"] as const;

const ADMISSION_COUNSELLING_OPTIONS = [
  "BY Medical Counselling Committee (MCC)",
  "BY The Joint Seat Allocation Authority (JoSAA)",
  "BY Central Seat Allocation Board (CSAB)",
  "BY Bihar Combined Entrance Competitive Examination Board (BCECEB)",
  "BY Director General Medical Education and Training, UP",
  "BY Karnataka Examinations Authority, BANGLORE",
  "BY Jharkhand Combined Entrance Competitive Examination Board, RANCHI",
  "BY West Bengal Joint Entrance Examinations Board (WBJEEB), KOLKATA",
  "BY West Bengal Medical Counselling Committee (WBMCC), KOLKATA",
  "BY West Bengal Medical Counselling Committee (WBMCC)",
  "BY Direct Admission of Students Abroad (DASA)",
  "BY Veterinary Council of India (VCI)",
  "BY Ayush Admissions Central Counseling Committee (AACCC)",
  "BY UP AYUSH COUNCIL",
  "By University/institute",
] as const;

const EXAM_ACCEPTED_OPTIONS = [
  "NEET UG",
  "NEET PG",
  "ICAR",
  
] as const;

const INTAKE_TOTAL_OPTIONS = [
  "TOTAL",
  "NRI",
  "MERIT",
  "MAGEMENT",
  "Semi govt",
  "Goverment",
  "AIQ",
  "Minority",
] as const;

const YES_NO_OPTIONS = ["Yes", "No"] as const;

const clinicalExcilenceLabOptions =
  ClinicalExcilenceLab as ClinicalExcilenceLabCourseOption[];

export function CollegeForm({ initialData, onSave }: CollegeFormProps) {
  const [availableCities, setAvailableCities] = useState<CityOption[]>([]);
  const [airportOptions, setAirportOptions] = useState<ReachUsLocation[]>([]);
  const [railwayOptions, setRailwayOptions] = useState<ReachUsLocation[]>([]);
  const [busStationOptions, setBusStationOptions] = useState<ReachUsLocation[]>([]);
  const [isLoadingAirports, setIsLoadingAirports] = useState(false);
  const [isLoadingRailway, setIsLoadingRailway] = useState(false);
  const [isLoadingBusStation, setIsLoadingBusStation] = useState(false);

  const [dbDisciplines, setDbDisciplines] = useState<CourseCategory[]>([]);
  const [dbCourses, setDbCourses] = useState<SubCourseCategory[]>([]);

  useEffect(() => {
    const fetchDisciplinesAndCourses = async () => {
      try {
        const [catsRes, coursesRes] = await Promise.all([
          courseCategoryService.getAll({ page: 1, pageSize: 100 }),
          subCourseCategoryService.getAll({ page: 1, pageSize: 1000 }),
        ]);
        setDbDisciplines(catsRes.data || []);
        setDbCourses(coursesRes.data || []);
      } catch (error) {
        console.error("Error fetching disciplines and courses:", error);
      }
    };
    fetchDisciplinesAndCourses();
  }, []);

  const disciplineOptions = useMemo(
    () =>
      dbDisciplines.map((cat) => ({
        label: cat.courses_category_name,
        value: cat.courses_category_name,
      })),
    [dbDisciplines],
  );
  const parsedDefaultValues = useMemo<CollegeFormValues>(() => ({
    college_name: readString(initialData?.college_name),
    university_name: readString(
      (initialData as Partial<College> & Record<string, unknown>)
        ?.university_name,
      initialData?.affiliated_with,
    ),
    slug: readString(initialData?.slug),
    approval: readString(
      (initialData as Partial<College> & Record<string, unknown>)?.approval,
    ),
    status: readString(
      (initialData as Partial<College> & Record<string, unknown>)?.status,
    ),
    state: readString(
      (initialData as Partial<College> & Record<string, unknown>)?.state,
      initialData?.city?.state,
    ),
    city: readString(
      initialData?.city?.id,
      initialData?.cityId,
      (initialData as Partial<College> & Record<string, unknown>)?.city_name,
      initialData?.city?.city,
    ),
    mgmt_type: readString(
      (initialData as Partial<College> & Record<string, unknown>)?.mgmt_type,
      initialData?.college_type,
    ),
    establish_year: readString(
      (initialData as Partial<College> & Record<string, unknown>)
        ?.establish_year,
      initialData?.established_year,
    ),
    campus_area: readString(
      (initialData as Partial<College> & Record<string, unknown>)?.campus_area,
    ),
    accreditation: readString(
      (initialData as Partial<College> & Record<string, unknown>)
        ?.accreditation,
    ),
    nirf_rank: readString(
      (initialData as Partial<College> & Record<string, unknown>)?.nirf_rank,
      initialData?.NIRF_rank,
    ),
    naac: readString(
      (initialData as Partial<College> & Record<string, unknown>)?.naac,
    ),
    nba: readString(
      (initialData as Partial<College> & Record<string, unknown>)?.nba,
    ),
    featured: readBoolean(
      (initialData as Partial<College> & Record<string, unknown>)?.featured,
      initialData?.isFeatured,
    ),
    priority: readString(
      (initialData as Partial<College> & Record<string, unknown>)?.priority,
      1,
    ),
    college_image: readString(initialData?.college_image),
    gallery: readStringArray(initialData?.gallery),
    campus_tour_icon: readString(
      (initialData as Partial<College> & Record<string, unknown>)
        ?.campus_tour_icon,
    ),
    podcast: readString(
      (initialData as Partial<College> & Record<string, unknown>)?.podcast,
    ),
    meta_title: readString(
      (initialData as Partial<College> & Record<string, unknown>)?.meta_title,
    ),
    meta_description: readString(
      (initialData as Partial<College> & Record<string, unknown>)
        ?.meta_description,
    ),
    keywords: readString(
      (initialData as Partial<College> & Record<string, unknown>)?.keywords,
    ),
    action_url: readString(
      (initialData as Partial<College> & Record<string, unknown>)?.action_url,
      (initialData as Partial<College> & Record<string, unknown>)
        ?.apply_now_url,
    ),
    discipline: readString(
      (initialData as Partial<College> & Record<string, unknown>)?.discipline,
    ),
    overview: readString(
      (initialData as Partial<College> & Record<string, unknown>)?.overview,
      initialData?.college_description,
    ),
    facilities_enabled: readBoolean(
      (initialData as Partial<College> & Record<string, unknown>)
        ?.facilities_enabled,
      true,
    ),
    hospital_overview_enabled: readBoolean(
      (initialData as Partial<College> & Record<string, unknown>)
        ?.hospital_overview_enabled,
      true,
    ),
    admission_counselling: readSelectionList(
      (initialData as Partial<College> & Record<string, unknown>)
        ?.admission_counselling,
    ),
    eligibility: readString(
      (initialData as Partial<College> & Record<string, unknown>)?.eligibility,
    ),
    internship: readString(
      (initialData as Partial<College> & Record<string, unknown>)?.internship,
    ),
    exchange_program: readString(
      (initialData as Partial<College> & Record<string, unknown>)
        ?.exchange_program,
    ),
    sponsorship: readString(
      (initialData as Partial<College> & Record<string, unknown>)?.sponsorship,
    ),
    stipend_year_1: readString(
      (initialData as Partial<College> & Record<string, unknown>)
        ?.stipend_year_1,
    ),
    stipend_year_2: readString(
      (initialData as Partial<College> & Record<string, unknown>)
        ?.stipend_year_2,
    ),
    stipend_year_3: readString(
      (initialData as Partial<College> & Record<string, unknown>)
        ?.stipend_year_3,
    ),
    hospital_bed: readString(
      (initialData as Partial<College> & Record<string, unknown>)?.hospital_bed,
    ),
    airport: readString(
      (initialData as Partial<College> & Record<string, unknown>)?.airport,
    ),
    railway_station: readString(
      (initialData as Partial<College> & Record<string, unknown>)
        ?.railway_station,
    ),
    bus_stand: readString(
      (initialData as Partial<College> & Record<string, unknown>)?.bus_stand,
    ),
    no_of_ot: readString(
      (initialData as Partial<College> & Record<string, unknown>)?.no_of_ot,
    ),
    total_bed: readString(
      (initialData as Partial<College> & Record<string, unknown>)?.total_bed,
    ),
    ss_bed: readString(
      (initialData as Partial<College> & Record<string, unknown>)?.ss_bed,
    ),
    ms_bed: readString(
      (initialData as Partial<College> & Record<string, unknown>)?.ms_bed,
    ),
    opd_running: readString(
      (initialData as Partial<College> & Record<string, unknown>)?.opd_running,
    ),
    average_ot: readString(
      (initialData as Partial<College> & Record<string, unknown>)?.average_ot,
    ),
    clinical_rotation: readString(
      (initialData as Partial<College> & Record<string, unknown>)
        ?.clinical_rotation,
    ),
    medical_camping: readString(
      (initialData as Partial<College> & Record<string, unknown>)
        ?.medical_camping,
    ),
    clinical_excilence_lab: normalizeClinicalExcilenceLabRows(
      (initialData as Partial<College> & Record<string, unknown>)
        ?.clinical_excilence_lab,
    ),
    discipline_sections: normalizeDisciplineSections(
      (initialData as Partial<College> & Record<string, unknown>)?.discipline,
      (initialData as Partial<College> & Record<string, unknown>)?.courses,
      readString(
        (initialData as Partial<College> & Record<string, unknown>)?.eligibility,
      ),
      readString(
        (initialData as Partial<College> & Record<string, unknown>)?.exam_accepted,
      ),
    ),
    courses: normalizeCourseRows(
      (initialData as Partial<College> & Record<string, unknown>)?.courses,
      readString(
        (initialData as Partial<College> & Record<string, unknown>)?.eligibility,
      ),
      readString(
        (initialData as Partial<College> & Record<string, unknown>)?.exam_accepted,
      ),
    ),
    cutoff_state_enabled: readBoolean(
      (initialData as Partial<College> & Record<string, unknown>)
        ?.cutoff_state_enabled,
      true,
    ),
    cutoff_all_india_enabled: readBoolean(
      (initialData as Partial<College> & Record<string, unknown>)
        ?.cutoff_all_india_enabled,
      true,
    ),
    cutoff_minority_enabled: readBoolean(
      (initialData as Partial<College> & Record<string, unknown>)
        ?.cutoff_minority_enabled,
      true,
    ),
    govt_state_cutoff_enabled: readBoolean(
      (initialData as Partial<College> & Record<string, unknown>)
        ?.govt_state_cutoff_enabled,
      true,
    ),
    government_college_aiq_cutoff_enabled: readBoolean(
      (initialData as Partial<College> & Record<string, unknown>)
        ?.government_college_aiq_cutoff_enabled,
      true,
    ),
    cutoff_state: defaultRoundCutoff(
      (initialData as Partial<College> & Record<string, unknown>)
        ?.cutoff_state as Partial<RoundCutoff>,
    ),
    cutoff_all_india: defaultRoundCutoff(
      (initialData as Partial<College> & Record<string, unknown>)
        ?.cutoff_all_india as Partial<RoundCutoff>,
    ),
    cutoff_minority: defaultRoundCutoff(
      (initialData as Partial<College> & Record<string, unknown>)
        ?.cutoff_minority as Partial<RoundCutoff>,
    ),
    govt_state_cutoff: defaultGovtStateCutoff(
      (initialData as Partial<College> & Record<string, unknown>)
        ?.govt_state_cutoff as Partial<GovtStateCutoff>,
    ),
    government_college_aiq_cutoff: defaultGovtAiqCutoff(
      (initialData as Partial<College> & Record<string, unknown>)
        ?.government_college_aiq_cutoff as Partial<GovtAiqCutoff>,
    ),
  }), [initialData]);

  const form = useForm<CollegeFormValues>({ defaultValues: parsedDefaultValues });

  useEffect(() => {
    if (initialData) {
      form.reset(parsedDefaultValues);
    }
  }, [initialData, form, parsedDefaultValues]);
  const watchedDisciplineSections = useWatch({
    control: form.control,
    name: "discipline_sections",
  });
  const collegeName = useWatch({ control: form.control, name: "college_name" });
  const featuredImageValue = useWatch({
    control: form.control,
    name: "college_image",
  });
  const galleryValue = useWatch({
    control: form.control,
    name: "gallery",
  });
  const approvalValue = useWatch({ control: form.control, name: "approval" });
  const statusValue = useWatch({ control: form.control, name: "status" });
  const managementTypeValue = useWatch({
    control: form.control,
    name: "mgmt_type",
  });
  const naacValue = useWatch({ control: form.control, name: "naac" });
  const nbaValue = useWatch({ control: form.control, name: "nba" });
  const isFeaturedValue = useWatch({ control: form.control, name: "featured" });
  const admissionCounsellingValue = useWatch({
    control: form.control,
    name: "admission_counselling",
  });
  const parsedDetails = useMemo(() => {
    return dbCourses.reduce((acc, c) => {
      try {
        acc[c.id] = JSON.parse(c.details || "{}");
      } catch {
        acc[c.id] = {};
      }
      return acc;
    }, {} as Record<number, Record<string, unknown>>);
  }, [dbCourses]);

  const internshipValue = useWatch({
    control: form.control,
    name: "internship",
  });
  const exchangeProgramValue = useWatch({
    control: form.control,
    name: "exchange_program",
  });
  const sponsorshipValue = useWatch({
    control: form.control,
    name: "sponsorship",
  });
  const clinicalRotationValue = useWatch({
    control: form.control,
    name: "clinical_rotation",
  });
  const medicalCampingValue = useWatch({
    control: form.control,
    name: "medical_camping",
  });
  const cutoffStateEnabledValue = useWatch({
    control: form.control,
    name: "cutoff_state_enabled",
  });
  const cutoffAllIndiaEnabledValue = useWatch({
    control: form.control,
    name: "cutoff_all_india_enabled",
  });
  const cutoffMinorityEnabledValue = useWatch({
    control: form.control,
    name: "cutoff_minority_enabled",
  });
  const govtStateCutoffEnabledValue = useWatch({
    control: form.control,
    name: "govt_state_cutoff_enabled",
  });
  const governmentCollegeAiqCutoffEnabledValue = useWatch({
    control: form.control,
    name: "government_college_aiq_cutoff_enabled",
  });
  const selectedStateValue = useWatch({ control: form.control, name: "state" });
  const selectedCityValue = useWatch({ control: form.control, name: "city" });
  const selectedAirportValue = useWatch({
    control: form.control,
    name: "airport",
  });
  const selectedRailwayValue = useWatch({
    control: form.control,
    name: "railway_station",
  });
  const selectedBusStandValue = useWatch({
    control: form.control,
    name: "bus_stand",
  });
  const watchedClinicalExcilenceLabs = useWatch({
    control: form.control,
    name: "clinical_excilence_lab",
  });

  const disciplineSections = useFieldArray({
    control: form.control,
    name: "discipline_sections",
  });
  const clinicalExcilenceLabFields = useFieldArray({
    control: form.control,
    name: "clinical_excilence_lab",
  });

  const handleFeaturedImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!isImageFile(file)) {
      toast.error("Please select an image file only.");
      return;
    }

    const image = await fileToDataUrl(file);
    form.setValue("college_image", image, { shouldDirty: true });
  };

  const handleGalleryImagesChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";

    if (files.length === 0) return;

    const invalidFile = files.find((file) => !isImageFile(file));
    if (invalidFile) {
      toast.error("Gallery allows image files only.");
      return;
    }

    const images = await Promise.all(files.map((file) => fileToDataUrl(file)));
    form.setValue("gallery", [...(galleryValue || []), ...images], {
      shouldDirty: true,
    });
  };

  const removeGalleryImage = (indexToRemove: number) => {
    form.setValue(
      "gallery",
      (galleryValue || []).filter((_, index) => index !== indexToRemove),
      { shouldDirty: true },
    );
  };

  useEffect(() => {
    if (!initialData) {
      form.setValue("slug", slugify(collegeName));
    }
  }, [collegeName, form, initialData]);

  useEffect(() => {
    form.register("mgmt_type", {
      required: "Management type is required",
    });
  }, [form]);

  useEffect(() => {
    if (dbCourses.length === 0) return;

    const sections = form.getValues("discipline_sections") || [];

    sections.forEach((section, sectionIndex) => {
      section.courses.forEach((course, courseIndex) => {
        if (!course.course) return;

        const matchedCourse = dbCourses.find(
          (dbCourse) => dbCourse.sub_course_category_name === course.course,
        );

        if (!matchedCourse) return;

        const details = parsedDetails[matchedCourse.id] || {};
        const duration = readString(details.duration);
        const courseLevel = readString(details.courseLevel);
        const eligibility = readString(details.eligibility);

        if (course.duration !== duration) {
          form.setValue(
            `discipline_sections.${sectionIndex}.courses.${courseIndex}.duration`,
            duration,
          );
        }

        const mappedLevel = mapCourseLevel(courseLevel);
        if (course.course_level !== mappedLevel) {
          form.setValue(
            `discipline_sections.${sectionIndex}.courses.${courseIndex}.course_level`,
            mappedLevel,
          );
        }

        if (course.eligibility !== eligibility) {
          form.setValue(
            `discipline_sections.${sectionIndex}.courses.${courseIndex}.eligibility`,
            eligibility,
          );
        }
      });
    });
  }, [dbCourses, form, parsedDetails]);

  useEffect(() => {
    const fetchReachUsOptions = async () => {
      if (!selectedStateValue) {
        setAirportOptions([]);
        setRailwayOptions([]);
        setBusStationOptions([]);
        form.setValue("airport", "");
        form.setValue("railway_station", "");
        form.setValue("bus_stand", "");
        return;
      }

      const baseParams = { state: selectedStateValue, page: 1, pageSize: 500 };

      try {
        setIsLoadingAirports(true);
        setIsLoadingRailway(true);
        setIsLoadingBusStation(true);

        const [airportRes, railwayRes, busRes] = await Promise.all([
          reachUsService.getAll({ ...baseParams, category: "airport" }),
          reachUsService.getAll({ ...baseParams, category: "railway-station" }),
          reachUsService.getAll({ ...baseParams, category: "bus-station" }),
        ]);

        const airports = airportRes.data || [];
        const railways = railwayRes.data || [];
        const buses = busRes.data || [];

        setAirportOptions(airports);
        setRailwayOptions(railways);
        setBusStationOptions(buses);

        // Clear stale values if they no longer exist in new state
        const currentAirport = form.getValues("airport");
        if (currentAirport && !airports.some((a) => a.name === currentAirport)) {
          form.setValue("airport", "");
        }
        const currentRailway = form.getValues("railway_station");
        if (currentRailway && !railways.some((r) => r.name === currentRailway)) {
          form.setValue("railway_station", "");
        }
        const currentBus = form.getValues("bus_stand");
        if (currentBus && !buses.some((b) => b.name === currentBus)) {
          form.setValue("bus_stand", "");
        }
      } catch (error) {
        console.error("Error fetching reach-us options:", error);
        setAirportOptions([]);
        setRailwayOptions([]);
        setBusStationOptions([]);
      } finally {
        setIsLoadingAirports(false);
        setIsLoadingRailway(false);
        setIsLoadingBusStation(false);
      }
    };

    fetchReachUsOptions();
  }, [form, selectedStateValue]);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await cityService.getAll({
          page: 1,
          pageSize: 9999,
        });

        const apiCities = (response.data || []).filter(
          (city): city is City & { state: string } =>
            Boolean(city.city) && Boolean(city.state),
        );

        setAvailableCities([
          ...apiCities.map((city) => ({
            id: city.id,
            city: city.city,
            state: city.state,
          })),
        ]);
      } catch (error) {
        console.error("Error fetching city options:", error);
        setAvailableCities([]);
      }
    };

    fetchCities();
  }, []);

  const stateOptions = useMemo(() => {
    return Array.from(new Set(availableCities.map((city) => city.state))).sort(
      (a, b) => a.localeCompare(b),
    );
  }, [availableCities]);

  const citiesForSelectedState = useMemo(() => {
    if (!selectedStateValue) return [];

    return availableCities
      .filter((city) => city.state === selectedStateValue)
      .sort((a, b) => a.city.localeCompare(b.city));
  }, [availableCities, selectedStateValue]);

  useEffect(() => {
    if (!selectedStateValue || !selectedCityValue || availableCities.length === 0) return;

    const hasSelectedCity = citiesForSelectedState.some(
      (city) =>
        city.id.toString() === selectedCityValue ||
        city.city === selectedCityValue,
    );

    if (!hasSelectedCity) {
      form.setValue("city", "");
    }
  }, [citiesForSelectedState, availableCities, form, selectedCityValue, selectedStateValue]);

  useEffect(() => {
    if (
      !selectedStateValue ||
      !selectedCityValue ||
      availableCities.length === 0
    ) {
      return;
    }

    const alreadyMapped = availableCities.some(
      (city) => city.id.toString() === selectedCityValue,
    );

    if (alreadyMapped) return;

    const matchingCity = availableCities.find(
      (city) =>
        city.city === selectedCityValue && city.state === selectedStateValue,
    );

    if (matchingCity) {
      form.setValue("city", matchingCity.id.toString());
    }
  }, [availableCities, form, selectedCityValue, selectedStateValue]);

  const onSubmit = async (data: CollegeFormValues) => {
    const selectedCity = availableCities.find(
      (city) =>
        city.id.toString() === data.city ||
        (city.city === data.city && city.state === data.state),
    );
    const flattenedCourses = flattenDisciplineSections(data.discipline_sections);
    const selectedDisciplines = data.discipline_sections
      .map((section) => section.discipline.trim())
      .filter(Boolean);
    const examAcceptedSummary = Array.from(
      new Set(
        flattenedCourses
          .map((course) => course.exam_accepted.trim())
          .filter(Boolean),
      ),
    ).join("; ");
    const submitData = Object.fromEntries(
      Object.entries(data).filter(
        ([key]) => key !== "discipline_sections" && key !== "eligibility",
      ),
    ) as Omit<CollegeFormValues, "discipline_sections" | "eligibility">;

    const payload = {
      ...submitData,
      discipline: selectedDisciplines.join(", "),
      courses: flattenedCourses,
      featured: data.featured,
      isFeatured: data.featured,
      priority: Number(data.priority) || 1,
      college_type: data.mgmt_type,
      established_year: data.establish_year,
      affiliated_with: data.university_name,
      NIRF_rank: data.nirf_rank,
      college_description: data.overview,
      apply_now_url: data.action_url,
      gallery: data.gallery,
      exam_accepted: examAcceptedSummary,
      admission_counselling: data.admission_counselling.join("; "),
      cityId: selectedCity && selectedCity.id > 0 ? selectedCity.id : undefined,
      city_name: selectedCity?.city || data.city,
      state: selectedCity?.state || data.state,
      clinical_excilence_lab: pruneClinicalExcilenceLabRows(
        data.clinical_excilence_lab,
      ),
    };

    await onSave(
      payload as unknown as Partial<College> & Record<string, unknown>,
    );
  };

  const onInvalid = (errors: FieldErrors<CollegeFormValues>) => {
    const firstError = Object.keys(errors)[0] as keyof CollegeFormValues;
    toast.error("Please complete the required college fields before saving.");

    if (firstError) {
      form.setFocus(firstError);
    }
  };

  const inputCls =
    "h-10 rounded-lg border-border/60 bg-background text-sm shadow-xs";
  const cardCls =
    "overflow-hidden rounded-lg border-border/60 bg-card shadow-xs";
  const cardHeaderCls = "border-b border-border/50 bg-muted/20 px-6 py-5";
  const cardContentCls = "p-6 space-y-5";

  return (
    <form
      id="college-form"
      onSubmit={form.handleSubmit(onSubmit, onInvalid)}
      className="space-y-6 pb-6"
    >
      <Card className={cardCls}>
        <CardHeader className={cardHeaderCls}>
          <SectionHeader
            icon={Building2}
            title="Basic Information"
            subtitle="Primary college details"
          />
        </CardHeader>
        <CardContent className={cardContentCls}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <FL required>College Name</FL>
              <Input
                {...form.register("college_name", {
                  required: "College name is required",
                })}
                placeholder="Enter college name"
                className={cn(
                  inputCls,
                  form.formState.errors.college_name &&
                    "border-destructive focus-visible:ring-destructive/20",
                )}
                aria-invalid={Boolean(form.formState.errors.college_name)}
              />
              <FieldError
                message={form.formState.errors.college_name?.message}
              />
            </div>
            <div className="space-y-1.5">
              <FL>Slug</FL>
              <Input
                {...form.register("slug")}
                placeholder="college-url-slug"
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <FL>University Name</FL>
              <Input
                {...form.register("university_name")}
                placeholder="Enter university name"
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <FL>Approval</FL>
              <Select
                value={approvalValue}
                onValueChange={(value) => form.setValue("approval", value)}
              >
                <SelectTrigger className={inputCls}>
                  <SelectValue placeholder="Select approval" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Approved by NMC">
                    Approved by NMC
                  </SelectItem>
                  <SelectItem value="Approved by DCI">
                    Approved by DCI
                  </SelectItem>
                  <SelectItem value="Approved by VCI">
                    Approved by VCI
                  </SelectItem>
                  <SelectItem value="Approved by NCISM">
                    Approved by NCISM
                  </SelectItem>
                  <SelectItem value="Approved by NCH">
                    Approved by NCH
                  </SelectItem>
                  <SelectItem value="Approved by CCIM">
                    Approved by CCIM
                  </SelectItem>
                  <SelectItem value="Approved by PCI">
                    Approved by PCI
                  </SelectItem>
                  <SelectItem value="Approved by INC">
                    Approved by INC
                  </SelectItem>
                  <SelectItem value="Approved by ICAR">
                    Approved by ICAR
                  </SelectItem>
                  <SelectItem value="Approved by AICTE">
                    Approved by AICTE
                  </SelectItem>
                  <SelectItem value="Approved by DGCA">
                    Approved by DGCA
                  </SelectItem>
                  <SelectItem value="Approved by BCI">
                    Approved by BCI
                  </SelectItem>
                  <SelectItem value="Approved by SBTE">
                    Approved by SBTE
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <FL>Status</FL>
              <Select
                value={statusValue}
                onValueChange={(value) => form.setValue("status", value)}
              >
                <SelectTrigger className={inputCls}>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Recognized">Recognized</SelectItem>
                  <SelectItem value="AUTONOMUS">AUTONOMUS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <FL>Mgmt Type</FL>
              <Select
                value={managementTypeValue}
                onValueChange={(value) =>
                  form.setValue("mgmt_type", value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger
                  className={cn(
                    inputCls,
                    form.formState.errors.mgmt_type &&
                      "border-destructive focus-visible:ring-destructive/20",
                  )}
                  aria-invalid={Boolean(form.formState.errors.mgmt_type)}
                >
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRIVATE">PRIVATE</SelectItem>
                  <SelectItem value="GOVERMENT">GOVERMENT</SelectItem>
                  <SelectItem value="SEMI GOVERMENT">SEMI GOVERMENT</SelectItem>
                  <SelectItem value="TRUST">TRUST</SelectItem>
                  <SelectItem value="DEEMED UNIVERSITY">
                    DEEMED UNIVERSITY
                  </SelectItem>
                  <SelectItem value="ESIC">ESIC</SelectItem>
                  <SelectItem value="AFMC">AFMC</SelectItem>
                  <SelectItem value="AIIMS">AIIMS</SelectItem>
                  <SelectItem value="GMER">GMER</SelectItem>
                </SelectContent>
              </Select>
              <FieldError message={form.formState.errors.mgmt_type?.message} />
            </div>
            <div className="space-y-1.5">
              <FL required>Establish Year</FL>
              <Input
                {...form.register("establish_year", {
                  required: "Establish year is required",
                })}
                placeholder="1995"
                className={cn(
                  inputCls,
                  form.formState.errors.establish_year &&
                    "border-destructive focus-visible:ring-destructive/20",
                )}
                aria-invalid={Boolean(form.formState.errors.establish_year)}
              />
              <FieldError
                message={form.formState.errors.establish_year?.message}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <FL>State</FL>
              <Select
                value={selectedStateValue}
                onValueChange={(value) => {
                  form.setValue("state", value);
                  form.setValue("city", "");
                }}
              >
                <SelectTrigger className={inputCls}>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent className="max-h-[260px]">
                  {stateOptions.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <FL>City</FL>
              <Select
                value={selectedCityValue}
                onValueChange={(value) => form.setValue("city", value)}
                disabled={!selectedStateValue}
              >
                <SelectTrigger className={cn(inputCls, "disabled:opacity-50")}>
                  <SelectValue
                    placeholder={
                      selectedStateValue ? "Select city" : "Select state first"
                    }
                  />
                </SelectTrigger>
                <SelectContent className="max-h-[260px]">
                  {citiesForSelectedState.map((city) => (
                    <SelectItem
                      key={`${city.id}-${city.city}`}
                      value={city.id.toString()}
                    >
                      {city.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <FL>Campus Area</FL>
              <Input
                {...form.register("campus_area")}
                placeholder="e.g. 45 Acres"
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <FL>Is Featured</FL>
              <Select
                value={isFeaturedValue ? "yes" : "no"}
                onValueChange={(value) =>
                  form.setValue("featured", value === "yes", { shouldDirty: true })
                }
              >
                <SelectTrigger className={inputCls}>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">⭐ Yes — Featured</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={cardCls}>
        <CardHeader className={cardHeaderCls}>
          <SectionHeader
            icon={GraduationCap}
            title="Discipline & Courses"
            subtitle="Program structure and seat details"
            count={flattenDisciplineSections(watchedDisciplineSections).length}
          />
        </CardHeader>
        <CardContent className={cardContentCls}>
          <div className="space-y-6">
            {disciplineSections.fields.map((section, sectionIndex) => (
              <DisciplineCoursesGroup
                key={section.id}
                control={form.control}
                register={form.register}
                setValue={form.setValue}
                getValues={form.getValues}
                sectionIndex={sectionIndex}
                sectionId={section.id}
                onRemoveSection={() => disciplineSections.remove(sectionIndex)}
                canRemoveSection={disciplineSections.fields.length > 1}
                dbCourses={dbCourses}
                parsedDetails={parsedDetails}
                disciplineOptions={disciplineOptions}
                inputCls={inputCls}
              />
            ))}

            <AddRowButton
              onClick={() => disciplineSections.append(defaultDisciplineSectionRow())}
              label="Add Discipline"
            />
          </div>
        </CardContent>
      </Card>

      <Card className={cardCls}>
        <CardHeader className={cardHeaderCls}>
          <SectionHeader
            icon={Star}
            title="Accreditation & Admission"
            subtitle="Academic standing and counselling data"
          />
        </CardHeader>
        <CardContent className={cardContentCls}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="space-y-1.5">
              <FL required>NIRF Rank</FL>
              <Input
                {...form.register("nirf_rank", {
                  required: "NIRF rank is required",
                })}
                placeholder="12"
                className={cn(
                  inputCls,
                  form.formState.errors.nirf_rank &&
                    "border-destructive focus-visible:ring-destructive/20",
                )}
                aria-invalid={Boolean(form.formState.errors.nirf_rank)}
              />
              <FieldError message={form.formState.errors.nirf_rank?.message} />
            </div>
            <div className="space-y-1.5">
              <FL>NAAC</FL>
              <Select
                value={naacValue}
                onValueChange={(value) => form.setValue("naac", value)}
              >
                <SelectTrigger className={inputCls}>
                  <SelectValue placeholder="Select NAAC" />
                </SelectTrigger>
                <SelectContent>
                  {NAAC_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <FL>NBA</FL>
              <Select
                value={nbaValue}
                onValueChange={(value) => form.setValue("nba", value)}
              >
                <SelectTrigger className={inputCls}>
                  <SelectValue placeholder="Select NBA" />
                </SelectTrigger>
                <SelectContent>
                  {NBA_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5 md:col-span-3">
              <FL>Admission Counselling</FL>
              <div className="space-y-2">
                <div className="min-h-9 rounded-md border border-border/50 bg-background px-3 py-2">
                  {admissionCounsellingValue.length === 0 ? (
                    <span className="text-sm text-muted-foreground">
                      Select counselling
                    </span>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {admissionCounsellingValue.map((option) => (
                        <span
                          key={option}
                          className="rounded-md border border-primary/20 bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary"
                        >
                          {option}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="max-h-[260px] overflow-y-auto rounded-lg border border-border/40 bg-card/70 p-3">
                  <div className="grid grid-cols-1 gap-2">
                    {ADMISSION_COUNSELLING_OPTIONS.map((option) => {
                      const isChecked =
                        admissionCounsellingValue.includes(option);

                      return (
                        <label
                          key={option}
                          className="flex items-start gap-2 rounded-md border border-border/30 bg-background/70 p-2 text-xs leading-5 text-foreground hover:border-primary/30 hover:bg-primary/5 transition-colors"
                        >
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={(checked) => {
                              const nextValues = checked
                                ? [...admissionCounsellingValue, option]
                                : admissionCounsellingValue.filter(
                                    (selectedOption) =>
                                      selectedOption !== option,
                                  );

                              form.setValue(
                                "admission_counselling",
                                nextValues,
                                { shouldDirty: true },
                              );
                            }}
                            className="mt-0.5"
                          />
                          <span>{option}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <FL required>College Description</FL>
            <Textarea
              {...form.register("overview", {
                required: "College description is required",
              })}
              placeholder="Write a college description..."
              className={cn(
                "min-h-[140px] bg-background border-border/50 text-sm",
                form.formState.errors.overview &&
                  "border-destructive focus-visible:ring-destructive/20",
              )}
              aria-invalid={Boolean(form.formState.errors.overview)}
            />
            <FieldError message={form.formState.errors.overview?.message} />
          </div>
        </CardContent>
      </Card>

      <Card className={cardCls}>
        <CardHeader className={cardHeaderCls}>
          <SectionHeader
            icon={BookOpen}
            title="Monthly Stipend / Scholarship"
            subtitle="Internship, exchange program, sponsorship, and year-wise stipend"
          />
        </CardHeader>
        <CardContent className={cardContentCls}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="space-y-1.5">
              <FL>Internship</FL>
              <Select
                value={internshipValue}
                onValueChange={(value) => form.setValue("internship", value)}
              >
                <SelectTrigger className={inputCls}>
                  <SelectValue placeholder="Select internship" />
                </SelectTrigger>
                <SelectContent>
                  {YES_NO_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <FL>Exchange Program</FL>
              <Select
                value={exchangeProgramValue}
                onValueChange={(value) => form.setValue("exchange_program", value)}
              >
                <SelectTrigger className={inputCls}>
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  {YES_NO_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <FL>Sponsorship</FL>
              <Select
                value={sponsorshipValue}
                onValueChange={(value) => form.setValue("sponsorship", value)}
              >
                <SelectTrigger className={inputCls}>
                  <SelectValue placeholder="Select sponsorship" />
                </SelectTrigger>
                <SelectContent>
                  {YES_NO_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="space-y-1.5">
              <FL>1st Year</FL>
              <Input
                {...form.register("stipend_year_1")}
                placeholder="e.g. 12,000 / month"
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <FL>2nd Year</FL>
              <Input
                {...form.register("stipend_year_2")}
                placeholder="e.g. 14,000 / month"
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <FL>3rd Year</FL>
              <Input
                {...form.register("stipend_year_3")}
                placeholder="e.g. 16,000 / month"
                className={inputCls}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={cardCls}>
        <CardHeader className={cardHeaderCls}>
          <SectionHeader
            icon={MapPin}
            title="Reach Us"
            subtitle="Travel connectivity information"
          />
        </CardHeader>
        <CardContent className={cardContentCls}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <FL>Airport</FL>
              <Select
                value={selectedAirportValue}
                onValueChange={(value) => form.setValue("airport", value)}
                disabled={
                  !selectedStateValue ||
                  isLoadingAirports ||
                  airportOptions.length === 0
                }
              >
                <SelectTrigger className={cn(inputCls, "disabled:opacity-50")}>
                  <SelectValue
                    placeholder={
                      !selectedStateValue
                        ? "Select state first"
                        : isLoadingAirports
                          ? "Loading airports..."
                          : airportOptions.length > 0
                            ? "Select airport"
                            : "No airports found"
                    }
                  />
                </SelectTrigger>
                <SelectContent className="max-h-[260px]">
                  {airportOptions.map((airport) => (
                    <SelectItem key={airport.id} value={airport.name}>
                      {airport.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <FL>Railway Station</FL>
              <Select
                value={selectedRailwayValue}
                onValueChange={(value) => form.setValue("railway_station", value)}
                disabled={
                  !selectedStateValue ||
                  isLoadingRailway ||
                  railwayOptions.length === 0
                }
              >
                <SelectTrigger className={cn(inputCls, "disabled:opacity-50")}>
                  <SelectValue
                    placeholder={
                      !selectedStateValue
                        ? "Select state first"
                        : isLoadingRailway
                          ? "Loading stations..."
                          : railwayOptions.length > 0
                            ? "Select railway station"
                            : "No stations found"
                    }
                  />
                </SelectTrigger>
                <SelectContent className="max-h-[260px]">
                  {railwayOptions.map((station) => (
                    <SelectItem key={station.id} value={station.name}>
                      {station.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <FL>Bus Station</FL>
              <Select
                value={selectedBusStandValue}
                onValueChange={(value) => form.setValue("bus_stand", value)}
                disabled={
                  !selectedStateValue ||
                  isLoadingBusStation ||
                  busStationOptions.length === 0
                }
              >
                <SelectTrigger className={cn(inputCls, "disabled:opacity-50")}>
                  <SelectValue
                    placeholder={
                      !selectedStateValue
                        ? "Select state first"
                        : isLoadingBusStation
                          ? "Loading stations..."
                          : busStationOptions.length > 0
                            ? "Select bus station"
                            : "No stations found"
                    }
                  />
                </SelectTrigger>
                <SelectContent className="max-h-[260px]">
                  {busStationOptions.map((station) => (
                    <SelectItem key={station.id} value={station.name}>
                      {station.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={cardCls}>
        <CardHeader className={cardHeaderCls}>
          <SectionHeader
            icon={Hospital}
            title="Hospital Bed & Overview"
            subtitle="Hospital bed, OT, OPD, and clinical exposure metrics"
          />
        </CardHeader>
        <CardContent className={cardContentCls}>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
            <div className="space-y-1.5">
              <FL>Hospital Bed</FL>
              <Input
                {...form.register("hospital_bed")}
                placeholder="500+"
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <FL>No. of OT</FL>
              <Input
                {...form.register("no_of_ot")}
                placeholder="10"
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <FL>Total Bed</FL>
              <Input
                {...form.register("total_bed")}
                placeholder="700"
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <FL>SS Bed</FL>
              <Input
                {...form.register("ss_bed")}
                placeholder="120"
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <FL>MS Bed</FL>
              <Input
                {...form.register("ms_bed")}
                placeholder="80"
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <FL>OPD Running</FL>
              <Input
                {...form.register("opd_running")}
                placeholder="Daily OPD count"
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <FL>Average OT</FL>
              <Input
                {...form.register("average_ot")}
                placeholder="Average OT per day"
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <FL>Clinical Rotation</FL>
              <Select
                value={clinicalRotationValue}
                onValueChange={(value) =>
                  form.setValue("clinical_rotation", value)
                }
              >
                <SelectTrigger className={inputCls}>
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  {YES_NO_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <FL>Medical Camping</FL>
              <Select
                value={medicalCampingValue}
                onValueChange={(value) =>
                  form.setValue("medical_camping", value)
                }
              >
                <SelectTrigger className={inputCls}>
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  {YES_NO_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={cardCls}>
        <CardHeader className={cardHeaderCls}>
          <SectionHeader
            icon={ClipboardList}
            title="Cutoff Details"
            subtitle="State, all India, minority, and government quota cutoffs"
          />
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                <span className="text-[11px] font-bold uppercase text-foreground">
                  Cutoff State
                </span>
              </div>
              <div className="flex border border-border/50 rounded-md overflow-hidden h-7">
                <button
                  type="button"
                  onClick={() => form.setValue("cutoff_state_enabled", false)}
                  className={cn(
                    "px-3 text-[10px] font-bold uppercase transition-all",
                    !cutoffStateEnabledValue
                      ? "bg-red-500/10 text-red-500"
                      : "bg-background text-muted-foreground hover:bg-muted/30",
                  )}
                >
                  Off
                </button>
                <button
                  type="button"
                  onClick={() => form.setValue("cutoff_state_enabled", true)}
                  className={cn(
                    "px-3 text-[10px] font-bold uppercase transition-all",
                    cutoffStateEnabledValue
                      ? "bg-emerald-500/10 text-emerald-500"
                      : "bg-background text-muted-foreground hover:bg-muted/30",
                  )}
                >
                  On
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
              {roundCutoffFields("cutoff_state").map((field) => (
                <div key={field.name} className="space-y-1.5">
                  <FL>{field.label}</FL>
                  <Input
                    {...form.register(field.name)}
                    placeholder={field.label}
                    className={inputCls}
                    disabled={!cutoffStateEnabledValue}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span className="text-[11px] font-bold uppercase text-foreground">
                  Cutoff All India
                </span>
              </div>
              <div className="flex border border-border/50 rounded-md overflow-hidden h-7">
                <button
                  type="button"
                  onClick={() =>
                    form.setValue("cutoff_all_india_enabled", false)
                  }
                  className={cn(
                    "px-3 text-[10px] font-bold uppercase transition-all",
                    !cutoffAllIndiaEnabledValue
                      ? "bg-red-500/10 text-red-500"
                      : "bg-background text-muted-foreground hover:bg-muted/30",
                  )}
                >
                  Off
                </button>
                <button
                  type="button"
                  onClick={() =>
                    form.setValue("cutoff_all_india_enabled", true)
                  }
                  className={cn(
                    "px-3 text-[10px] font-bold uppercase transition-all",
                    cutoffAllIndiaEnabledValue
                      ? "bg-emerald-500/10 text-emerald-500"
                      : "bg-background text-muted-foreground hover:bg-muted/30",
                  )}
                >
                  On
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
              {roundCutoffFields("cutoff_all_india").map((field) => (
                <div key={field.name} className="space-y-1.5">
                  <FL>{field.label}</FL>
                  <Input
                    {...form.register(field.name)}
                    placeholder={field.label}
                    className={inputCls}
                    disabled={!cutoffAllIndiaEnabledValue}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                <span className="text-[11px] font-bold uppercase text-foreground">
                  Cutoff Minority
                </span>
              </div>
              <div className="flex border border-border/50 rounded-md overflow-hidden h-7">
                <button
                  type="button"
                  onClick={() =>
                    form.setValue("cutoff_minority_enabled", false)
                  }
                  className={cn(
                    "px-3 text-[10px] font-bold uppercase transition-all",
                    !cutoffMinorityEnabledValue
                      ? "bg-red-500/10 text-red-500"
                      : "bg-background text-muted-foreground hover:bg-muted/30",
                  )}
                >
                  Off
                </button>
                <button
                  type="button"
                  onClick={() => form.setValue("cutoff_minority_enabled", true)}
                  className={cn(
                    "px-3 text-[10px] font-bold uppercase transition-all",
                    cutoffMinorityEnabledValue
                      ? "bg-emerald-500/10 text-emerald-500"
                      : "bg-background text-muted-foreground hover:bg-muted/30",
                  )}
                >
                  On
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
              {roundCutoffFields("cutoff_minority").map((field) => (
                <div key={field.name} className="space-y-1.5">
                  <FL>{field.label}</FL>
                  <Input
                    {...form.register(field.name)}
                    placeholder={field.label}
                    className={inputCls}
                    disabled={!cutoffMinorityEnabledValue}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-fuchsia-500" />
                <span className="text-[11px] font-bold uppercase text-foreground">
                  Govt State Cutoff
                </span>
              </div>
              <div className="flex border border-border/50 rounded-md overflow-hidden h-7">
                <button
                  type="button"
                  onClick={() =>
                    form.setValue("govt_state_cutoff_enabled", false)
                  }
                  className={cn(
                    "px-3 text-[10px] font-bold uppercase transition-all",
                    !govtStateCutoffEnabledValue
                      ? "bg-red-500/10 text-red-500"
                      : "bg-background text-muted-foreground hover:bg-muted/30",
                  )}
                >
                  Off
                </button>
                <button
                  type="button"
                  onClick={() =>
                    form.setValue("govt_state_cutoff_enabled", true)
                  }
                  className={cn(
                    "px-3 text-[10px] font-bold uppercase transition-all",
                    govtStateCutoffEnabledValue
                      ? "bg-emerald-500/10 text-emerald-500"
                      : "bg-background text-muted-foreground hover:bg-muted/30",
                  )}
                >
                  On
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
              {[
                { label: "UROP", name: "govt_state_cutoff.urop" as const },
                { label: "EWS", name: "govt_state_cutoff.ews" as const },
                { label: "OBC", name: "govt_state_cutoff.obc" as const },
                { label: "SC", name: "govt_state_cutoff.sc" as const },
                { label: "ST", name: "govt_state_cutoff.st" as const },
                { label: "UR", name: "govt_state_cutoff.ur" as const },
              ].map((field) => (
                <div key={field.name} className="space-y-1.5">
                  <FL>{field.label}</FL>
                  <Input
                    {...form.register(field.name)}
                    placeholder={field.label}
                    className={inputCls}
                    disabled={!govtStateCutoffEnabledValue}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                <span className="text-[11px] font-bold uppercase text-foreground">
                  Government College AIQ Cutoff
                </span>
              </div>
              <div className="flex border border-border/50 rounded-md overflow-hidden h-7">
                <button
                  type="button"
                  onClick={() =>
                    form.setValue(
                      "government_college_aiq_cutoff_enabled",
                      false,
                    )
                  }
                  className={cn(
                    "px-3 text-[10px] font-bold uppercase transition-all",
                    !governmentCollegeAiqCutoffEnabledValue
                      ? "bg-red-500/10 text-red-500"
                      : "bg-background text-muted-foreground hover:bg-muted/30",
                  )}
                >
                  Off
                </button>
                <button
                  type="button"
                  onClick={() =>
                    form.setValue("government_college_aiq_cutoff_enabled", true)
                  }
                  className={cn(
                    "px-3 text-[10px] font-bold uppercase transition-all",
                    governmentCollegeAiqCutoffEnabledValue
                      ? "bg-emerald-500/10 text-emerald-500"
                      : "bg-background text-muted-foreground hover:bg-muted/30",
                  )}
                >
                  On
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
              {[
                {
                  label: "EWS",
                  name: "government_college_aiq_cutoff.ews" as const,
                },
                {
                  label: "OBC",
                  name: "government_college_aiq_cutoff.obc" as const,
                },
                {
                  label: "SC",
                  name: "government_college_aiq_cutoff.sc" as const,
                },
                {
                  label: "ST",
                  name: "government_college_aiq_cutoff.st" as const,
                },
                {
                  label: "UR",
                  name: "government_college_aiq_cutoff.ur" as const,
                },
              ].map((field) => (
                <div key={field.name} className="space-y-1.5">
                  <FL>{field.label}</FL>
                  <Input
                    {...form.register(field.name)}
                    placeholder={field.label}
                    className={inputCls}
                    disabled={!governmentCollegeAiqCutoffEnabledValue}
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={cardCls}>
        <CardHeader className={cardHeaderCls}>
          <SectionHeader
            icon={Microscope}
            title="Clinical Excilence Lab"
            subtitle="Course-wise department and lab selections"
            count={clinicalExcilenceLabFields.fields.length}
          />
        </CardHeader>
        <CardContent className={cardContentCls}>
          {clinicalExcilenceLabFields.fields.map((field, index) => {
            const selectedRow =
              watchedClinicalExcilenceLabs?.[index] ??
              defaultClinicalExcilenceLabRow();
            const selectedCourse = clinicalExcilenceLabOptions.find(
              (course) => course.course === selectedRow.course,
            );
            const departmentOptions = selectedCourse?.departments ?? [];
            const selectedDepartment = departmentOptions.find(
              (department) => department.department === selectedRow.department,
            );
            const labOptions = selectedDepartment?.labs ?? [];
            const selectedLabs = selectedRow.labs ?? [];

            return (
              <RepeatableRow
                key={field.id}
                index={index}
                onRemove={() => clinicalExcilenceLabFields.remove(index)}
              >
                <div className="space-y-1">
                  <FL>Course</FL>
                  <Select
                    value={selectedRow.course}
                    onValueChange={(value) => {
                      form.setValue(
                        `clinical_excilence_lab.${index}.course`,
                        value,
                        { shouldDirty: true },
                      );
                      form.setValue(
                        `clinical_excilence_lab.${index}.department`,
                        "",
                        { shouldDirty: true },
                      );
                      form.setValue(
                        `clinical_excilence_lab.${index}.labs`,
                        [],
                        { shouldDirty: true },
                      );
                    }}
                  >
                    <SelectTrigger className="h-8 bg-card border-border/40 text-sm">
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[260px]">
                      {clinicalExcilenceLabOptions.map((course) => (
                        <SelectItem key={course.course} value={course.course}>
                          {course.course}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1 md:col-span-1 xl:col-span-2">
                  <FL>Department</FL>
                  <Select
                    value={selectedRow.department}
                    onValueChange={(value) => {
                      form.setValue(
                        `clinical_excilence_lab.${index}.department`,
                        value,
                        { shouldDirty: true },
                      );
                      form.setValue(
                        `clinical_excilence_lab.${index}.labs`,
                        [],
                        { shouldDirty: true },
                      );
                    }}
                    disabled={!selectedRow.course}
                  >
                    <SelectTrigger className="h-8 bg-card border-border/40 text-sm disabled:opacity-50">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[260px]">
                      {departmentOptions.map((department) => (
                        <SelectItem
                          key={department.department}
                          value={department.department}
                        >
                          {department.department}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2 xl:col-span-3">
                  <div className="flex items-center justify-between gap-3">
                    <FL>Labs</FL>
                    <span className="text-[10px] font-bold text-muted-foreground bg-background border border-border/40 rounded-md px-1.5 py-0.5">
                      {selectedLabs.length} selected
                    </span>
                  </div>

                  {labOptions.length === 0 ? (
                    <div className="min-h-20 rounded-lg border border-dashed border-border/50 bg-card/60 px-3 py-6 text-center text-xs text-muted-foreground">
                      Select a course and department to view labs.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 max-h-[260px] overflow-y-auto rounded-lg border border-border/40 bg-card/70 p-3">
                      {labOptions.map((lab) => {
                        const isChecked = selectedLabs.includes(lab);

                        return (
                          <label
                            key={lab}
                            className="flex items-start gap-2 rounded-md border border-border/30 bg-background/70 p-2 text-xs leading-5 text-foreground hover:border-primary/30 hover:bg-primary/5 transition-colors"
                          >
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={(checked) => {
                                const nextLabs = checked
                                  ? [...selectedLabs, lab]
                                  : selectedLabs.filter(
                                      (selectedLab) => selectedLab !== lab,
                                    );

                                form.setValue(
                                  `clinical_excilence_lab.${index}.labs`,
                                  nextLabs,
                                  { shouldDirty: true },
                                );
                              }}
                              className="mt-0.5"
                            />
                            <span>{lab}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              </RepeatableRow>
            );
          })}

          <AddRowButton
            onClick={() =>
              clinicalExcilenceLabFields.append(
                defaultClinicalExcilenceLabRow(),
              )
            }
            label="Add Clinical Excilence Lab"
          />
        </CardContent>
      </Card>
      <Card className={cardCls}>
        <CardHeader className={cardHeaderCls}>
          <SectionHeader
            icon={ImageIcon}
            title="Media & SEO"
            subtitle="Featured image, gallery, campus tour, podcast, and search metadata"
          />
        </CardHeader>
        <CardContent className={cardContentCls}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <FL>Featured Image</FL>
              <div className="rounded-lg border border-border/60 bg-background p-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex h-28 w-full items-center justify-center overflow-hidden rounded-md border border-dashed border-border/70 bg-muted/20 sm:w-36">
                    {featuredImageValue ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={featuredImageValue}
                        alt="Featured college preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <ImageIcon className="h-6 w-6" />
                        <span className="text-[10px] font-bold uppercase">
                          No Image
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-2">
                    <label className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border/70 bg-card px-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-primary">
                      <Upload className="h-4 w-4" />
                      Choose image
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFeaturedImageChange}
                      />
                    </label>
                    {featuredImageValue && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="justify-start text-destructive hover:text-destructive"
                        onClick={() =>
                          form.setValue("college_image", "", {
                            shouldDirty: true,
                          })
                        }
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove image
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <FL>Virtual Campus Tour</FL>
              <Input
                {...form.register("campus_tour_icon")}
                placeholder="virtual campus URL"
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <FL>Podcast</FL>
              <div className="relative">
                <Volume2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                <Input
                  {...form.register("podcast")}
                  placeholder="Podcast URL"
                  className={cn(inputCls, "pl-9")}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <FL>Meta Title</FL>
              <Input
                {...form.register("meta_title")}
                placeholder="SEO title"
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <FL>Gallery</FL>
              <div className="space-y-3 rounded-lg border border-border/60 bg-background p-3">
                <label className="flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border/70 bg-card px-4 text-center text-sm font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-primary">
                  <Upload className="h-5 w-5" />
                  Select multiple gallery images
                  <span className="text-[10px] font-normal text-muted-foreground/70">
                    PNG, JPG, WEBP, GIF
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleGalleryImagesChange}
                  />
                </label>

                {galleryValue?.length > 0 && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {galleryValue.map((image, index) => (
                      <div
                        key={`${image.slice(0, 24)}-${index}`}
                        className="group relative aspect-square overflow-hidden rounded-md border border-border/60 bg-muted/20"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={image}
                          alt={`Gallery ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute right-2 top-2 h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                          onClick={() => removeGalleryImage(index)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-1.5">
              <FL>Meta Description</FL>
              <Textarea
                {...form.register("meta_description")}
                placeholder="Short SEO description"
                className="min-h-[110px] bg-background border-border/50 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <FL>Keywords</FL>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground/60" />
              <Textarea
                {...form.register("keywords")}
                placeholder="medical college, mbbs, admissions"
                className="min-h-[90px] bg-background border-border/50 pl-9 text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="sticky bottom-4 z-20 flex justify-end">
        <div className="flex w-full items-center justify-end gap-2 rounded-lg border border-border/60 bg-background/95 p-3 shadow-lg backdrop-blur sm:w-auto">
          <Button type="submit" className="h-10 px-4 text-sm">
            <Save className="mr-2 h-4 w-4" />
            Save College
          </Button>
        </div>
      </div>
    </form>
  );
}
