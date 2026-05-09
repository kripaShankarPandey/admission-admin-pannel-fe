"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { College } from "@/services/college-service";
import { allCoursesData } from "@/data/allCoursesData";
import { cityService, type City } from "@/services/city-service";
import { getAllCitiesWithState, getAllStates } from "@/data/cityData";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpRight,
  BookOpen,
  Building2,
  ClipboardList,
  GraduationCap,
  Hospital,
  ImageIcon,
  MapPin,
  Plus,
  Star,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
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

type CourseLevel =
  | "UG"
  | "PG"
  | "Diploma"
  | "Doctorate"
  | "Certificate"
  | "Other";

interface CourseRow {
  course: string;
  duration: string;
  course_level: CourseLevel | "";
  intake_total: string;
  fee: string;
  pg_seats: string;
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
  action_url: string;
  discipline: string;
  overview: string;
  facilities_enabled: boolean;
  hospital_overview_enabled: boolean;
  admission_counselling: string;
  eligibility: string;
  exam_accepted: string;
  internship: string;
  exchange_program: string;
  sponsorship: string;
  hospital_bed: string;
  airport: string;
  railway_station: string;
  bus_stand: string;
  total_bed: string;
  ss_bed: string;
  ms_bed: string;
  opd_running: string;
  average_ot: string;
  clinical_rotation: string;
  medical_camping: string;
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
    <div className="flex items-center gap-3 pb-4 border-b border-border/40">
      <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center shrink-0">
        <Icon className="h-4.5 w-4.5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-foreground tracking-tight flex items-center gap-2">
          {title}
          {count !== undefined && (
            <span className="text-[10px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md">
              {count}
            </span>
          )}
        </h3>
        {subtitle && (
          <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>
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
    <Label className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
      {children}
      {required && <span className="text-destructive ml-0.5">*</span>}
    </Label>
  );
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
      className="w-full h-9 border border-dashed border-border/50 rounded-lg text-xs text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all flex items-center justify-center gap-1.5"
    >
      <Plus className="h-3.5 w-3.5" />
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
    <div className="group relative flex items-start gap-2 p-3 rounded-lg border border-border/40 bg-muted/20 hover:border-border/60 transition-all">
      <span className="text-[10px] font-bold text-muted-foreground/40 pt-3 w-5 text-center shrink-0">
        {index + 1}
      </span>
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {children}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0 text-destructive/50 hover:text-destructive hover:bg-destructive/10 mt-1"
        onClick={onRemove}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
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
] as const;

const EXAM_ACCEPTED_OPTIONS = [
  "JEE Mains",
  "Jee Advanced",
  "WBJEE",
  "COMDEK",
  "MHTCET",
  "OJEE",
  "ICAR",
  "IMU",
  "NCHMCT",
  "CLAT",
  "CAT",
  "MAT",
  "XAT",
  "GMAT",
  "CMAT",
  "NEET UG",
  "NEET PG",
  "NIFT",
  "CUET",
  "VITJEE",
  "BITSAT",
] as const;

const STUDENT_SUPPORT_OPTIONS = [
  "Diploma",
  "Under Graduate (UG)",
  "Post Graduate (PG)",
  "Research",
  "Certificate",
  "Licence",
] as const;

const INTAKE_TOTAL_OPTIONS = [
  "NRI",
  "MERIT",
  "MAGEMENT",
  "Semi govt",
  "Goverment",
  "AIQ",
] as const;

const YES_NO_OPTIONS = ["Yes", "No"] as const;

export function CollegeForm({ initialData, onSave }: CollegeFormProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string>(
    readString(initialData?.college_image),
  );
  const [availableCities, setAvailableCities] = useState<CityOption[]>([]);

  const disciplineOptions = useMemo(
    () =>
      allCoursesData.map((item: { discipline: string }) => ({
        label: item.discipline,
        value: item.discipline,
      })),
    [],
  );
  const allStaticCities = useMemo(() => getAllCitiesWithState(), []);
  const allStates = useMemo(() => getAllStates(), []);

  const defaultValues: CollegeFormValues = {
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
    admission_counselling: readString(
      (initialData as Partial<College> & Record<string, unknown>)
        ?.admission_counselling,
    ),
    eligibility: readString(
      (initialData as Partial<College> & Record<string, unknown>)?.eligibility,
    ),
    exam_accepted: readString(
      (initialData as Partial<College> & Record<string, unknown>)
        ?.exam_accepted,
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
    courses: Array.isArray(
      (initialData as Partial<College> & Record<string, unknown>)?.courses,
    )
      ? ((initialData as Partial<College> & Record<string, unknown>)
          .courses as CourseRow[])
      : [
          {
            course: "",
            duration: "",
            course_level: "",
            intake_total: "",
            fee: "",
            pg_seats: "",
          },
        ],
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
  };

  const form = useForm<CollegeFormValues>({ defaultValues });
  const watchedCourses = useWatch({ control: form.control, name: "courses" });
  const collegeName = useWatch({ control: form.control, name: "college_name" });
  const approvalValue = useWatch({ control: form.control, name: "approval" });
  const statusValue = useWatch({ control: form.control, name: "status" });
  const managementTypeValue = useWatch({
    control: form.control,
    name: "mgmt_type",
  });
  const naacValue = useWatch({ control: form.control, name: "naac" });
  const nbaValue = useWatch({ control: form.control, name: "nba" });
  const admissionCounsellingValue = useWatch({
    control: form.control,
    name: "admission_counselling",
  });
  const examAcceptedValue = useWatch({
    control: form.control,
    name: "exam_accepted",
  });
  const hospitalOverviewEnabledValue = useWatch({
    control: form.control,
    name: "hospital_overview_enabled",
  });
  const featuredValue = useWatch({ control: form.control, name: "featured" });
  const disciplineValue = useWatch({
    control: form.control,
    name: "discipline",
  });
  const facilitiesEnabledValue = useWatch({
    control: form.control,
    name: "facilities_enabled",
  });
  const internshipValue = useWatch({ control: form.control, name: "internship" });
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

  const courses = useFieldArray({
    control: form.control,
    name: "courses",
  });

  useEffect(() => {
    if (!initialData) {
      form.setValue("slug", slugify(collegeName));
    }
  }, [collegeName, form, initialData]);

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

        const apiCityKeys = new Set(
          apiCities.map(
            (city) => `${city.city.toLowerCase()}-${city.state.toLowerCase()}`,
          ),
        );

        const staticExtras = allStaticCities
          .filter(
            (city) =>
              !apiCityKeys.has(
                `${city.city.toLowerCase()}-${city.state.toLowerCase()}`,
              ),
          )
          .map((city, index) => ({
            id: -(index + 1),
            city: city.city,
            state: city.state,
          }));

        setAvailableCities([
          ...apiCities.map((city) => ({
            id: city.id,
            city: city.city,
            state: city.state,
          })),
          ...staticExtras,
        ]);
      } catch (error) {
        console.error("Error fetching city options:", error);
        setAvailableCities(
          allStaticCities.map((city, index) => ({
            id: -(index + 1),
            city: city.city,
            state: city.state,
          })),
        );
      }
    };

    fetchCities();
  }, [allStaticCities]);

  const stateOptions = useMemo(() => {
    const apiStates = availableCities.map((city) => city.state);
    return Array.from(new Set([...allStates, ...apiStates])).sort((a, b) =>
      a.localeCompare(b),
    );
  }, [allStates, availableCities]);

  const citiesForSelectedState = useMemo(() => {
    if (!selectedStateValue) return [];

    return availableCities
      .filter((city) => city.state === selectedStateValue)
      .sort((a, b) => a.city.localeCompare(b.city));
  }, [availableCities, selectedStateValue]);

  useEffect(() => {
    if (!selectedStateValue || !selectedCityValue) return;

    const hasSelectedCity = citiesForSelectedState.some(
      (city) =>
        city.id.toString() === selectedCityValue ||
        city.city === selectedCityValue,
    );

    if (!hasSelectedCity) {
      form.setValue("city", "");
    }
  }, [citiesForSelectedState, form, selectedCityValue, selectedStateValue]);

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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      form.setValue("college_image", base64);
      setImagePreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data: CollegeFormValues) => {
    const selectedCity = availableCities.find(
      (city) =>
        city.id.toString() === data.city ||
        (city.city === data.city && city.state === data.state),
    );

    const payload: Partial<College> & Record<string, unknown> = {
      ...data,
      featured: data.featured,
      isFeatured: data.featured,
      priority: Number(data.priority) || 1,
      college_type: data.mgmt_type,
      established_year: data.establish_year,
      affiliated_with: data.university_name,
      NIRF_rank: data.nirf_rank,
      college_description: data.overview,
      apply_now_url: data.action_url,
      cityId: selectedCity && selectedCity.id > 0 ? selectedCity.id : undefined,
      city_name: selectedCity?.city || data.city,
      state: selectedCity?.state || data.state,
      add_on_facilities: [],
    };

    await onSave(payload);
  };

  const inputCls = "h-9 bg-background border-border/50 text-sm";
  const cardCls = "border-border/40 shadow-none";

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <Card className={cardCls}>
        <CardHeader className="pb-0 pt-5 px-5">
          <SectionHeader
            icon={Building2}
            title="Basic Information"
            subtitle="Primary college details"
          />
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <FL required>College Name</FL>
              <Input
                {...form.register("college_name")}
                placeholder="Enter college name"
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
            <div className="space-y-1.5">
              <FL>Slug</FL>
              <Input
                {...form.register("slug")}
                placeholder="auto-generated"
                className={cn(inputCls, "bg-muted/30 text-muted-foreground")}
                readOnly
              />
            </div>
            <div className="space-y-1.5">
              <FL>Priority</FL>
              <Input
                type="number"
                min="1"
                {...form.register("priority")}
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
                onValueChange={(value) => form.setValue("mgmt_type", value)}
              >
                <SelectTrigger className={inputCls}>
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
                  <SelectItem value="STATE TECHANICAL UNIVERSITY">
                    STATE TECHANICAL UNIVERSITY
                  </SelectItem>
                  <SelectItem value="STATE PRIVATE UNIVERSITY">
                    STATE PRIVATE UNIVERSITY
                  </SelectItem>
                  <SelectItem value="IITS">IITS</SelectItem>
                  <SelectItem value="NITS">NITS</SelectItem>
                  <SelectItem value="GFTI/CFTI">GFTI/CFTI</SelectItem>
                  <SelectItem value="IIITS">IIITS</SelectItem>
                  <SelectItem value="STATE GOV UNIVERSITY">
                    STATE GOV UNIVERSITY
                  </SelectItem>
                  <SelectItem value="CENTRAL UNIVERSITY">
                    CENTRAL UNIVERSITY
                  </SelectItem>
                  <SelectItem value="IIM">IIM</SelectItem>
                  <SelectItem value="NLU">NLU</SelectItem>
                  <SelectItem value="AIIMS">AIIMS</SelectItem>
                  <SelectItem value="ICAR">ICAR</SelectItem>
                  <SelectItem value="IMU Campus">IMU Campus</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <FL>Establish Year</FL>
              <Input
                {...form.register("establish_year")}
                placeholder="1995"
                className={inputCls}
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
              <FL>Featured</FL>
              <div className="flex border border-border/50 rounded-md overflow-hidden h-9">
                <button
                  type="button"
                  onClick={() => form.setValue("featured", false)}
                  className={cn(
                    "flex-1 text-[10px] font-bold uppercase transition-all",
                    !featuredValue
                      ? "bg-red-500/10 text-red-500"
                      : "bg-background text-muted-foreground hover:bg-muted/30",
                  )}
                >
                  False
                </button>
                <button
                  type="button"
                  onClick={() => form.setValue("featured", true)}
                  className={cn(
                    "flex-1 text-[10px] font-bold uppercase transition-all",
                    featuredValue
                      ? "bg-emerald-500/10 text-emerald-500"
                      : "bg-background text-muted-foreground hover:bg-muted/30",
                  )}
                >
                  True
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={cardCls}>
        <CardHeader className="pb-0 pt-5 px-5">
          <SectionHeader
            icon={ImageIcon}
            title="Media & Action"
            subtitle="Image upload and CTA link"
          />
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
          <div
            onClick={() => imageInputRef.current?.click()}
            className="relative h-44 border-2 border-dashed border-border/40 rounded-lg flex flex-col items-center justify-center bg-muted/20 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer group overflow-hidden"
          >
            {imagePreview ? (
              <>
                <Image
                  src={imagePreview}
                  alt="College preview"
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">
                    Click to change image
                  </span>
                </div>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground/30 group-hover:text-primary/50 transition-colors" />
                <span className="mt-2 text-xs text-muted-foreground">
                  Click to upload college image
                </span>
                <span className="text-[10px] text-muted-foreground/50 mt-0.5">
                  PNG, JPG, WEBP up to 5MB
                </span>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <FL>Action URL</FL>
              <div className="relative">
                <Input
                  {...form.register("action_url")}
                  placeholder="https://example.com/apply"
                  className={cn(inputCls, "pr-9")}
                />
                <ArrowUpRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <div className="space-y-1.5">
              <FL>Overview</FL>
              <Badge
                variant="outline"
                className="h-9 w-full justify-start px-3 text-muted-foreground border-border/50"
              >
                Rich college content now starts below in the overview section.
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={cardCls}>
        <CardHeader className="pb-0 pt-5 px-5">
          <SectionHeader
            icon={GraduationCap}
            title="Discipline & Courses"
            subtitle="Program structure and seat details"
            count={courses.fields.length}
          />
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <div className="space-y-1.5">
            <FL>Discipline Section</FL>
            <Select
              value={disciplineValue}
              onValueChange={(value) => form.setValue("discipline", value)}
            >
              <SelectTrigger className={inputCls}>
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

          {courses.fields.map((field, index) => (
            <RepeatableRow
              key={field.id}
              index={index}
              onRemove={() => courses.remove(index)}
            >
              <div className="space-y-1">
                <FL>Course</FL>
                <Input
                  {...form.register(`courses.${index}.course`)}
                  placeholder="MBBS"
                  className="h-8 bg-card border-border/40 text-sm"
                />
              </div>
              <div className="space-y-1">
                <FL>Duration</FL>
                <Input
                  {...form.register(`courses.${index}.duration`)}
                  placeholder="5.5 Years"
                  className="h-8 bg-card border-border/40 text-sm"
                />
              </div>
              <div className="space-y-1">
                <FL>Course Level</FL>
                <Select
                  value={watchedCourses?.[index]?.course_level ?? ""}
                  onValueChange={(value) =>
                    form.setValue(
                      `courses.${index}.course_level`,
                      value as CourseLevel,
                    )
                  }
                >
                  <SelectTrigger className="h-8 bg-card border-border/40 text-sm">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UG">UG</SelectItem>
                    <SelectItem value="PG">PG</SelectItem>
                    <SelectItem value="Diploma">Diploma</SelectItem>
                    <SelectItem value="Doctorate">Doctorate</SelectItem>
                    <SelectItem value="Certificate">Certificate</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <FL>Intake (Total)</FL>
                <Select
                  value={watchedCourses?.[index]?.intake_total ?? ""}
                  onValueChange={(value) =>
                    form.setValue(`courses.${index}.intake_total`, value)
                  }
                >
                  <SelectTrigger className="h-8 bg-card border-border/40 text-sm">
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
              <div className="space-y-1">
                <FL>Fee</FL>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    Rs
                  </span>
                  <Input
                    {...form.register(`courses.${index}.fee`)}
                    placeholder="25000"
                    className="h-8 bg-card border-border/40 text-sm pl-10"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <FL>No of PG Seat</FL>
                <Input
                  {...form.register(`courses.${index}.pg_seats`)}
                  placeholder="45"
                  className="h-8 bg-card border-border/40 text-sm"
                />
              </div>
            </RepeatableRow>
          ))}
          <AddRowButton
            onClick={() =>
              courses.append({
                course: "",
                duration: "",
                course_level: "",
                intake_total: "",
                fee: "",
                pg_seats: "",
              })
            }
            label="Add Course"
          />
        </CardContent>
      </Card>

      <Card className={cardCls}>
        <CardHeader className="pb-0 pt-5 px-5">
          <SectionHeader
            icon={Star}
            title="Accreditation & Admission"
            subtitle="Academic standing and counselling data"
          />
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <FL>NIRF Rank</FL>
              <Input
                {...form.register("nirf_rank")}
                placeholder="12"
                className={inputCls}
              />
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
            <div className="space-y-1.5">
              <FL>Admission Counselling</FL>
              <Select
                value={admissionCounsellingValue}
                onValueChange={(value) =>
                  form.setValue("admission_counselling", value)
                }
              >
                <SelectTrigger className={inputCls}>
                  <SelectValue placeholder="Select counselling" />
                </SelectTrigger>
                <SelectContent className="max-h-[260px]">
                  {ADMISSION_COUNSELLING_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <FL>Eligibility</FL>
              <Input
                {...form.register("eligibility")}
                placeholder="12th PCB / Graduation"
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <FL>Exam Accepted</FL>
              <Select
                value={examAcceptedValue}
                onValueChange={(value) => form.setValue("exam_accepted", value)}
              >
                <SelectTrigger className={inputCls}>
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

          <div className="space-y-1.5">
            <FL>Overview</FL>
            <Textarea
              {...form.register("overview")}
              placeholder="Write a college overview..."
              className="min-h-[140px] bg-background border-border/50 text-sm"
            />
          </div>
        </CardContent>
      </Card>

      <Card className={cardCls}>
        <CardHeader className="pb-0 pt-5 px-5">
          <div className="flex items-start justify-between gap-4">
            <SectionHeader
              icon={BookOpen}
              title="Facilities & Student Support"
              subtitle="Campus facilities and academic support"
            />
            <div className="space-y-1.5 w-40 shrink-0">
              <FL>Section Status</FL>
              <div className="flex border border-border/50 rounded-md overflow-hidden h-9">
                <button
                  type="button"
                  onClick={() => form.setValue("facilities_enabled", false)}
                  className={cn(
                    "flex-1 text-[10px] font-bold uppercase transition-all",
                    !facilitiesEnabledValue
                      ? "bg-red-500/10 text-red-500"
                      : "bg-background text-muted-foreground hover:bg-muted/30",
                  )}
                >
                  Off
                </button>
                <button
                  type="button"
                  onClick={() => form.setValue("facilities_enabled", true)}
                  className={cn(
                    "flex-1 text-[10px] font-bold uppercase transition-all",
                    facilitiesEnabledValue
                      ? "bg-emerald-500/10 text-emerald-500"
                      : "bg-background text-muted-foreground hover:bg-muted/30",
                  )}
                >
                  On
                </button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="space-y-1.5">
              <FL>Internship</FL>
              <Select
                value={internshipValue}
                onValueChange={(value) => form.setValue("internship", value)}
                disabled={!facilitiesEnabledValue}
              >
                <SelectTrigger className={cn(inputCls, "disabled:opacity-50")}>
                  <SelectValue placeholder="Select internship" />
                </SelectTrigger>
                <SelectContent>
                  {STUDENT_SUPPORT_OPTIONS.map((option) => (
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
                onValueChange={(value) =>
                  form.setValue("exchange_program", value)
                }
                disabled={!facilitiesEnabledValue}
              >
                <SelectTrigger className={cn(inputCls, "disabled:opacity-50")}>
                  <SelectValue placeholder="Select exchange program" />
                </SelectTrigger>
                <SelectContent>
                  {STUDENT_SUPPORT_OPTIONS.map((option) => (
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
                disabled={!facilitiesEnabledValue}
              >
                <SelectTrigger className={cn(inputCls, "disabled:opacity-50")}>
                  <SelectValue placeholder="Select sponsorship" />
                </SelectTrigger>
                <SelectContent>
                  {STUDENT_SUPPORT_OPTIONS.map((option) => (
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
        <CardHeader className="pb-0 pt-5 px-5">
          <SectionHeader
            icon={MapPin}
            title="Reach Us"
            subtitle="Travel connectivity information"
          />
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <FL>Airport</FL>
              <Input
                {...form.register("airport")}
                placeholder="Nearest airport"
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <FL>Railway Station</FL>
              <Input
                {...form.register("railway_station")}
                placeholder="Nearest railway station"
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <FL>Bus Stand</FL>
              <Input
                {...form.register("bus_stand")}
                placeholder="Nearest bus stand"
                className={inputCls}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={cardCls}>
        <CardHeader className="pb-0 pt-5 px-5">
          <div className="flex items-start justify-between gap-4">
            <SectionHeader
              icon={Hospital}
              title="Hospital Overview"
              subtitle="Hospital capacity and exposure metrics"
            />
            <div className="space-y-1.5 w-40 shrink-0">
              <FL>Section Status</FL>
              <div className="flex border border-border/50 rounded-md overflow-hidden h-9">
                <button
                  type="button"
                  onClick={() => form.setValue("hospital_overview_enabled", false)}
                  className={cn(
                    "flex-1 text-[10px] font-bold uppercase transition-all",
                    !hospitalOverviewEnabledValue
                      ? "bg-red-500/10 text-red-500"
                      : "bg-background text-muted-foreground hover:bg-muted/30",
                  )}
                >
                  Off
                </button>
                <button
                  type="button"
                  onClick={() => form.setValue("hospital_overview_enabled", true)}
                  className={cn(
                    "flex-1 text-[10px] font-bold uppercase transition-all",
                    hospitalOverviewEnabledValue
                      ? "bg-emerald-500/10 text-emerald-500"
                      : "bg-background text-muted-foreground hover:bg-muted/30",
                  )}
                >
                  On
                </button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <FL>Hospital Bed</FL>
              <Input
                {...form.register("hospital_bed")}
                placeholder="500+"
                className={inputCls}
                disabled={!hospitalOverviewEnabledValue}
              />
            </div>
            <div className="space-y-1.5">
              <FL>Total Bed</FL>
              <Input
                {...form.register("total_bed")}
                placeholder="700"
                className={inputCls}
                disabled={!hospitalOverviewEnabledValue}
              />
            </div>
            <div className="space-y-1.5">
              <FL>SS Bed</FL>
              <Input
                {...form.register("ss_bed")}
                placeholder="120"
                className={inputCls}
                disabled={!hospitalOverviewEnabledValue}
              />
            </div>
            <div className="space-y-1.5">
              <FL>MS Bed</FL>
              <Input
                {...form.register("ms_bed")}
                placeholder="80"
                className={inputCls}
                disabled={!hospitalOverviewEnabledValue}
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
                disabled={!hospitalOverviewEnabledValue}
              />
            </div>
            <div className="space-y-1.5">
              <FL>Average OT</FL>
              <Input
                {...form.register("average_ot")}
                placeholder="Average OT per day"
                className={inputCls}
                disabled={!hospitalOverviewEnabledValue}
              />
            </div>
            <div className="space-y-1.5">
              <FL>Clinical Rotation</FL>
              <Select
                value={clinicalRotationValue}
                onValueChange={(value) => form.setValue("clinical_rotation", value)}
                disabled={!hospitalOverviewEnabledValue}
              >
                <SelectTrigger className={cn(inputCls, "disabled:opacity-50")}>
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
                onValueChange={(value) => form.setValue("medical_camping", value)}
                disabled={!hospitalOverviewEnabledValue}
              >
                <SelectTrigger className={cn(inputCls, "disabled:opacity-50")}>
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
        <CardHeader className="pb-0 pt-5 px-5">
          <SectionHeader
            icon={ClipboardList}
            title="Cutoff Details"
            subtitle="State, all India, minority, and government quota cutoffs"
          />
        </CardHeader>
        <CardContent className="p-5 space-y-6">
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
                  onClick={() => form.setValue("cutoff_all_india_enabled", false)}
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
                  onClick={() => form.setValue("cutoff_all_india_enabled", true)}
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
                  onClick={() => form.setValue("cutoff_minority_enabled", false)}
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
                  onClick={() => form.setValue("govt_state_cutoff_enabled", false)}
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
                  onClick={() => form.setValue("govt_state_cutoff_enabled", true)}
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
                    form.setValue("government_college_aiq_cutoff_enabled", false)
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

      <Button type="submit" className="hidden">
        Submit
      </Button>
    </form>
  );
}
