"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { College } from "@/services/college-service";
import { getAllCitiesWithState } from "@/data/cityData";
import { allCoursesData } from "@/data/allCoursesData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
    Plus,
    Trash2,
    GripVertical,
    Upload,
    ImageIcon,
    Star,
    Building2,
    GraduationCap,
    FileText,
    Globe,
    Award,
    Users,
    ClipboardList,
    History,
    DollarSign,
    BarChart3,
    BookOpen,
    X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ─── Helpers ────────────────────────────────────────────
function slugify(text: string) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

interface CollegeFormProps {
    initialData?: College;
    onSave: (data: any) => Promise<void>;
}

// ─── Section Header ─────────────────────────────────────
function SectionHeader({ icon: Icon, title, subtitle, count }: {
    icon: any; title: string; subtitle?: string; count?: number;
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
                        <span className="text-[10px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md">{count}</span>
                    )}
                </h3>
                {subtitle && <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>}
            </div>
        </div>
    );
}

// ─── Repeatable Row ─────────────────────────────────────
function RepeatableRow({ children, onRemove, index }: { children: React.ReactNode; onRemove: () => void; index: number }) {
    return (
        <div className="group relative flex items-start gap-2 p-3 rounded-lg border border-border/40 bg-muted/20 hover:border-border/60 transition-all">
            <span className="text-[10px] font-bold text-muted-foreground/40 pt-3 w-5 text-center shrink-0">{index + 1}</span>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
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

// ─── Add Row Button ─────────────────────────────────────
function AddRowButton({ onClick, label = "Add Entry" }: { onClick: () => void; label?: string }) {
    return (
        <button
            type="button"
            className="w-full h-9 border border-dashed border-border/50 rounded-lg text-xs text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all flex items-center justify-center gap-1.5"
            onClick={onClick}
        >
            <Plus className="h-3.5 w-3.5" /> {label}
        </button>
    );
}

// ─── Field Label ────────────────────────────────────────
function FL({ children, required }: { children: React.ReactNode; required?: boolean }) {
    return (
        <Label className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
            {children}{required && <span className="text-destructive ml-0.5">*</span>}
        </Label>
    );
}

// ═══════════════════════════════════════════════════════
// MAIN FORM
// ═══════════════════════════════════════════════════════
export function CollegeForm({ initialData, onSave }: CollegeFormProps) {
    const imageInputRef = useRef<HTMLInputElement>(null);
    const [imagePreview, setImagePreview] = useState<string>(initialData?.college_image || "");

    // Local city data — create unique entries
    const cities = useMemo(() => {
        const all = getAllCitiesWithState();
        // Make unique values by combining city + state
        return all.map((c: any, i: number) => ({
            label: `${c.city} — ${c.state}`,
            value: `${c.city}|${c.state}|${i}`, // guaranteed unique
            city: c.city,
            state: c.state,
        }));
    }, []);

    // Discipline hierarchy
    const disciplines = useMemo(() =>
        allCoursesData.map((d: any, i: number) => ({
            id: i + 1,
            name: d.discipline,
            courses: d.courses,
        })), []);

    // Selected specializations state (managed outside react-hook-form for simplicity)
    const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);

    const form = useForm({
        defaultValues: {
            college_name: initialData?.college_name || "",
            slug: initialData?.slug || "",
            NIRF_rank: initialData?.NIRF_rank || "",
            college_type: initialData?.college_type || "",
            isFeatured: initialData?.isFeatured || false,
            priority: (initialData as any)?.priority || 1,
            college_image: initialData?.college_image || "",
            college_rating: initialData?.college_rating || 4,
            affiliated_with: initialData?.affiliated_with || "",
            cityId: initialData?.cityId?.toString() || "",
            established_year: initialData?.established_year || "",
            college_description: initialData?.college_description || "",
            apply_now_url: (initialData as any)?.apply_now_url || "",
            download_brochure_url: (initialData as any)?.download_brochure_url || "",
            selectedDiscipline: "",
            selectedCourse: "",

            // Repeatable JSON sections
            home_four_list: Array.isArray(initialData?.home_four_list) ? initialData.home_four_list : [],
            overview_fourlist: Array.isArray(initialData?.overview_fourlist) ? initialData.overview_fourlist : [],
            college_timeline: Array.isArray(initialData?.college_timeline) ? initialData.college_timeline : [],
            intake_details: Array.isArray(initialData?.intake_details) ? initialData.intake_details : [],
            fee_structure: Array.isArray(initialData?.fee_structure) ? initialData.fee_structure : [],
            ranking: Array.isArray(initialData?.ranking) ? initialData.ranking : [],
            all_india_cutoff: Array.isArray(initialData?.all_india_cutoff) ? initialData.all_india_cutoff : [],
            state_cutoff: Array.isArray(initialData?.state_cutoff) ? initialData.state_cutoff : [],
            admission_process: Array.isArray(initialData?.admission_process) ? initialData.admission_process : [],
        },
    });

    // Field arrays
    const quickInfo = useFieldArray({ control: form.control, name: "home_four_list" });
    const iconSection = useFieldArray({ control: form.control, name: "overview_fourlist" });
    const timeline = useFieldArray({ control: form.control, name: "college_timeline" });
    const intake = useFieldArray({ control: form.control, name: "intake_details" });
    const fees = useFieldArray({ control: form.control, name: "fee_structure" });
    const rankings = useFieldArray({ control: form.control, name: "ranking" });
    const aiqCutoff = useFieldArray({ control: form.control, name: "all_india_cutoff" });
    const stateCutoff = useFieldArray({ control: form.control, name: "state_cutoff" });
    const admProcess = useFieldArray({ control: form.control, name: "admission_process" });

    // Auto-slug
    const collegeName = form.watch("college_name");
    useEffect(() => {
        if (!initialData) {
            form.setValue("slug", slugify(collegeName));
        }
    }, [collegeName, form, initialData]);

    // Cascading selects
    const selectedDiscipline = form.watch("selectedDiscipline");
    const selectedCourse = form.watch("selectedCourse");

    const coursesForDiscipline = useMemo(() => {
        if (!selectedDiscipline) return [];
        const d = disciplines.find((d: any) => d.name === selectedDiscipline);
        return d?.courses || [];
    }, [selectedDiscipline, disciplines]);

    const specsForCourse = useMemo(() => {
        if (!selectedCourse) return [];
        const c = coursesForDiscipline.find((c: any) => c.name === selectedCourse);
        return c?.specializations || [];
    }, [selectedCourse, coursesForDiscipline]);

    useEffect(() => {
        form.setValue("selectedCourse", "");
    }, [selectedDiscipline, form]);

    // Image upload
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
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

    // Submit
    const onSubmit = async (data: any) => {
        const cityEntry = cities.find((c: any) => c.value === data.cityId);
        const payload = {
            ...data,
            cityId: cityEntry ? cityEntry.city : data.cityId,
            college_rating: parseFloat(data.college_rating) || 4,
            priority: parseInt(data.priority) || 1,
            selectedSpecializations: selectedSpecs,
        };
        delete payload.selectedDiscipline;
        delete payload.selectedCourse;
        await onSave(payload);
    };

    // ─── Input class helper ─────────────────────────────
    const inputCls = "h-9 bg-background border-border/50 text-sm";
    const cardCls = "border-border/40 shadow-none";

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

            {/* ═══════════ BASIC INFO ═══════════ */}
            <Card className={cardCls}>
                <CardHeader className="pb-0 pt-5 px-5">
                    <SectionHeader icon={Building2} title="Basic Information" subtitle="Core college identifiers" />
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <FL required>College Name</FL>
                            <Input {...form.register("college_name")} placeholder="Enter college name" className={inputCls} />
                        </div>
                        <div className="space-y-1.5">
                            <FL>Slug</FL>
                            <Input {...form.register("slug")} placeholder="auto-generated" className={cn(inputCls, "bg-muted/30 text-muted-foreground")} readOnly />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-1.5">
                            <FL>NIRF Rank</FL>
                            <Input {...form.register("NIRF_rank")} placeholder="e.g. 5" className={inputCls} />
                        </div>
                        <div className="space-y-1.5">
                            <FL required>MGMT Type</FL>
                            <Select onValueChange={(val) => form.setValue("college_type", val)} value={form.watch("college_type")}>
                                <SelectTrigger className={inputCls}>
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Government">Government</SelectItem>
                                    <SelectItem value="Private">Private</SelectItem>
                                    <SelectItem value="Trust">Trust</SelectItem>
                                    <SelectItem value="Society">Society</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <FL>Established Year</FL>
                            <Input {...form.register("established_year")} placeholder="1990" className={inputCls} />
                        </div>
                        <div className="space-y-1.5">
                            <FL>Priority</FL>
                            <Input type="number" min="1" {...form.register("priority")} className={inputCls} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <FL>College Rating</FL>
                            <div className="relative">
                                <Input type="number" min="1" max="5" step="0.1" {...form.register("college_rating")} className={cn(inputCls, "pr-8")} />
                                <Star className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <FL>Affiliated With</FL>
                            <Input {...form.register("affiliated_with")} placeholder="University name" className={inputCls} />
                        </div>
                        <div className="space-y-1.5">
                            <FL>City / Location</FL>
                            <Select onValueChange={(val) => form.setValue("cityId", val)} value={form.watch("cityId")}>
                                <SelectTrigger className={inputCls}>
                                    <SelectValue placeholder="Select city" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[250px]">
                                    {cities.map((city: any) => (
                                        <SelectItem key={city.value} value={city.value}>
                                            {city.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex items-end gap-4">
                        <div className="space-y-1.5 w-48">
                            <FL>Featured</FL>
                            <div className="flex border border-border/50 rounded-md overflow-hidden h-9">
                                <button type="button" onClick={() => form.setValue("isFeatured", false)}
                                    className={cn("flex-1 text-[10px] font-bold uppercase transition-all",
                                        !form.watch("isFeatured") ? "bg-red-500/10 text-red-500" : "bg-background text-muted-foreground hover:bg-muted/30"
                                    )}>False</button>
                                <button type="button" onClick={() => form.setValue("isFeatured", true)}
                                    className={cn("flex-1 text-[10px] font-bold uppercase transition-all",
                                        form.watch("isFeatured") ? "bg-emerald-500/10 text-emerald-500" : "bg-background text-muted-foreground hover:bg-muted/30"
                                    )}>True</button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ═══════════ COLLEGE IMAGE ═══════════ */}
            <Card className={cardCls}>
                <CardHeader className="pb-0 pt-5 px-5">
                    <SectionHeader icon={ImageIcon} title="College Image" subtitle="Upload the main image" />
                </CardHeader>
                <CardContent className="p-5">
                    <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    <div
                        onClick={() => imageInputRef.current?.click()}
                        className="relative h-40 border-2 border-dashed border-border/40 rounded-lg flex flex-col items-center justify-center bg-muted/20 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer group overflow-hidden"
                    >
                        {imagePreview ? (
                            <>
                                <img src={imagePreview} alt="College" className="absolute inset-0 w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="text-white text-xs font-semibold">Click to change</span>
                                </div>
                            </>
                        ) : (
                            <>
                                <Upload className="h-8 w-8 text-muted-foreground/30 group-hover:text-primary/50 transition-colors" />
                                <span className="mt-2 text-xs text-muted-foreground">Click to upload or drag & drop</span>
                                <span className="text-[10px] text-muted-foreground/50 mt-0.5">PNG, JPG, WEBP up to 5MB</span>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* ═══════════ DISCIPLINE / COURSE / SPECIALIZATION ═══════════ */}
            <Card className={cardCls}>
                <CardHeader className="pb-0 pt-5 px-5">
                    <SectionHeader icon={GraduationCap} title="Discipline, Course & Specialization" subtitle="Select discipline → course → add specializations" />
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <FL>Discipline</FL>
                            <Select onValueChange={(val) => form.setValue("selectedDiscipline", val)} value={selectedDiscipline}>
                                <SelectTrigger className={inputCls}>
                                    <SelectValue placeholder="Select discipline" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[250px]">
                                    {disciplines.map((d: any) => (
                                        <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <FL>Course</FL>
                            <Select
                                onValueChange={(val) => form.setValue("selectedCourse", val)}
                                value={selectedCourse}
                                disabled={!selectedDiscipline}
                            >
                                <SelectTrigger className={cn(inputCls, "disabled:opacity-40")}>
                                    <SelectValue placeholder={selectedDiscipline ? "Select course" : "Pick discipline first"} />
                                </SelectTrigger>
                                <SelectContent className="max-h-[250px]">
                                    {coursesForDiscipline.map((c: any, i: number) => (
                                        <SelectItem key={`course-${i}`} value={c.name}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Specialization multi-select */}
                    {selectedCourse && specsForCourse.length > 0 && (
                        <div className="space-y-2">
                            <FL>Add Specializations</FL>
                            <Select
                                onValueChange={(val) => {
                                    if (!selectedSpecs.includes(val)) {
                                        setSelectedSpecs(prev => [...prev, val]);
                                    }
                                }}
                                value=""
                            >
                                <SelectTrigger className={inputCls}>
                                    <SelectValue placeholder="+ Pick a specialization to add" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[250px]">
                                    {specsForCourse
                                        .filter((s: string) => !selectedSpecs.includes(s))
                                        .map((s: string, i: number) => (
                                            <SelectItem key={`spec-${i}`} value={s}>{s}</SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Selected tags display */}
                    {(selectedDiscipline || selectedCourse || selectedSpecs.length > 0) && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                            {selectedDiscipline && (
                                <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 text-[11px] py-0.5 px-2">
                                    {selectedDiscipline}
                                </Badge>
                            )}
                            {selectedCourse && (
                                <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 text-[11px] py-0.5 px-2">
                                    {selectedCourse}
                                </Badge>
                            )}
                            {selectedSpecs.map((spec) => (
                                <Badge key={spec} variant="outline" className="bg-purple-50 text-purple-600 border-purple-200 text-[11px] py-0.5 pl-2 pr-1 flex items-center gap-1">
                                    {spec}
                                    <button
                                        type="button"
                                        onClick={() => setSelectedSpecs(prev => prev.filter(s => s !== spec))}
                                        className="ml-0.5 h-3.5 w-3.5 rounded-full hover:bg-purple-200 flex items-center justify-center"
                                    >
                                        <X className="h-2.5 w-2.5" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* ═══════════ ACTION URLS ═══════════ */}
            <Card className={cardCls}>
                <CardHeader className="pb-0 pt-5 px-5">
                    <SectionHeader icon={Globe} title="Action URLs" subtitle="Apply Now and Download Brochure links" />
                </CardHeader>
                <CardContent className="p-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <FL>Apply Now URL</FL>
                            <Input {...form.register("apply_now_url")} placeholder="https://apply.example.com" className={inputCls} />
                        </div>
                        <div className="space-y-1.5">
                            <FL>Download Brochure URL</FL>
                            <Input {...form.register("download_brochure_url")} placeholder="https://brochure.example.com" className={inputCls} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ═══════════ QUICK INFO ═══════════ */}
            <Card className={cardCls}>
                <CardHeader className="pb-0 pt-5 px-5">
                    <SectionHeader icon={FileText} title="Quick Info" subtitle="Key statistics at a glance" count={quickInfo.fields.length} />
                </CardHeader>
                <CardContent className="p-5 space-y-2">
                    {quickInfo.fields.map((field, index) => (
                        <RepeatableRow key={field.id} index={index} onRemove={() => quickInfo.remove(index)}>
                            <div className="space-y-1">
                                <FL>Number</FL>
                                <Input {...form.register(`home_four_list.${index}.number`)} placeholder="500+" className="h-8 bg-card border-border/40 text-sm" />
                            </div>
                            <div className="space-y-1">
                                <FL>Name</FL>
                                <Input {...form.register(`home_four_list.${index}.name`)} placeholder="Students Enrolled" className="h-8 bg-card border-border/40 text-sm" />
                            </div>
                        </RepeatableRow>
                    ))}
                    <AddRowButton onClick={() => quickInfo.append({ number: "", name: "" })} label="Add Quick Info" />
                </CardContent>
            </Card>

            {/* ═══════════ ICON SECTION ═══════════ */}
            <Card className={cardCls}>
                <CardHeader className="pb-0 pt-5 px-5">
                    <SectionHeader icon={Star} title="Icon Section" subtitle="Top icon highlights" count={iconSection.fields.length} />
                </CardHeader>
                <CardContent className="p-5 space-y-2">
                    {iconSection.fields.map((field, index) => (
                        <RepeatableRow key={field.id} index={index} onRemove={() => iconSection.remove(index)}>
                            <div className="space-y-1">
                                <FL>Number</FL>
                                <Input {...form.register(`overview_fourlist.${index}.number`)} placeholder="25" className="h-8 bg-card border-border/40 text-sm" />
                            </div>
                            <div className="space-y-1">
                                <FL>Name</FL>
                                <Input {...form.register(`overview_fourlist.${index}.name`)} placeholder="Years of Excellence" className="h-8 bg-card border-border/40 text-sm" />
                            </div>
                        </RepeatableRow>
                    ))}
                    <AddRowButton onClick={() => iconSection.append({ number: "", name: "" })} label="Add Icon Entry" />
                </CardContent>
            </Card>

            {/* ═══════════ OVERVIEW ═══════════ */}
            <Card className={cardCls}>
                <CardHeader className="pb-0 pt-5 px-5">
                    <SectionHeader icon={BookOpen} title="Overview" subtitle="Detailed college description" />
                </CardHeader>
                <CardContent className="p-5">
                    <Textarea
                        {...form.register("college_description")}
                        placeholder="Write a detailed description about the college..."
                        className="min-h-[140px] bg-background border-border/50 text-sm"
                    />
                </CardContent>
            </Card>

            {/* ═══════════ HISTORY & MILESTONES ═══════════ */}
            <Card className={cardCls}>
                <CardHeader className="pb-0 pt-5 px-5">
                    <SectionHeader icon={History} title="History & Milestones" subtitle="Timeline of achievements" count={timeline.fields.length} />
                </CardHeader>
                <CardContent className="p-5 space-y-2">
                    {timeline.fields.map((field, index) => (
                        <RepeatableRow key={field.id} index={index} onRemove={() => timeline.remove(index)}>
                            <div className="space-y-1">
                                <FL>Name</FL>
                                <Input {...form.register(`college_timeline.${index}.name`)} placeholder="Founded" className="h-8 bg-card border-border/40 text-sm" />
                            </div>
                            <div className="space-y-1">
                                <FL>Year</FL>
                                <Input {...form.register(`college_timeline.${index}.year`)} placeholder="1990" className="h-8 bg-card border-border/40 text-sm" />
                            </div>
                        </RepeatableRow>
                    ))}
                    <AddRowButton onClick={() => timeline.append({ name: "", college: "", year: "" })} label="Add Milestone" />
                </CardContent>
            </Card>

            {/* ═══════════ INTAKE CAPACITY ═══════════ */}
            <Card className={cardCls}>
                <CardHeader className="pb-0 pt-5 px-5">
                    <SectionHeader icon={Users} title="Intake Capacity" subtitle="Course-wise student intake" count={intake.fields.length} />
                </CardHeader>
                <CardContent className="p-5 space-y-2">
                    {intake.fields.map((field, index) => (
                        <RepeatableRow key={field.id} index={index} onRemove={() => intake.remove(index)}>
                            <div className="space-y-1">
                                <FL>Program Name</FL>
                                <Input {...form.register(`intake_details.${index}.name`)} placeholder="MBBS" className="h-8 bg-card border-border/40 text-sm" />
                            </div>
                            <div className="space-y-1">
                                <FL>Seats</FL>
                                <Input type="number" {...form.register(`intake_details.${index}.number`)} placeholder="150" className="h-8 bg-card border-border/40 text-sm" />
                            </div>
                        </RepeatableRow>
                    ))}
                    <AddRowButton onClick={() => intake.append({ name: "", number: "" })} label="Add Intake" />
                </CardContent>
            </Card>

            {/* ═══════════ FEE STRUCTURE ═══════════ */}
            <Card className={cardCls}>
                <CardHeader className="pb-0 pt-5 px-5">
                    <SectionHeader icon={DollarSign} title="Fee Structure" subtitle="Course-wise fee details" count={fees.fields.length} />
                </CardHeader>
                <CardContent className="p-5 space-y-2">
                    {fees.fields.map((field, index) => (
                        <RepeatableRow key={field.id} index={index} onRemove={() => fees.remove(index)}>
                            <div className="space-y-1">
                                <FL>Program</FL>
                                <Input {...form.register(`fee_structure.${index}.name`)} placeholder="MBBS" className="h-8 bg-card border-border/40 text-sm" />
                            </div>
                            <div className="space-y-1">
                                <FL>Fee Amount</FL>
                                <Input {...form.register(`fee_structure.${index}.number`)} placeholder="₹5,00,000" className="h-8 bg-card border-border/40 text-sm" />
                            </div>
                        </RepeatableRow>
                    ))}
                    <AddRowButton onClick={() => fees.append({ name: "", number: "" })} label="Add Fee Entry" />
                </CardContent>
            </Card>

            {/* ═══════════ RANKING & AWARDS ═══════════ */}
            <Card className={cardCls}>
                <CardHeader className="pb-0 pt-5 px-5">
                    <SectionHeader icon={Award} title="Ranking & Awards" subtitle="Recognitions and accolades" count={rankings.fields.length} />
                </CardHeader>
                <CardContent className="p-5 space-y-2">
                    {rankings.fields.map((field, index) => (
                        <RepeatableRow key={field.id} index={index} onRemove={() => rankings.remove(index)}>
                            <div className="space-y-1">
                                <FL>Award Name</FL>
                                <Input {...form.register(`ranking.${index}.name`)} placeholder="NIRF Ranking" className="h-8 bg-card border-border/40 text-sm" />
                            </div>
                            <div className="space-y-1">
                                <FL>Tagline</FL>
                                <Input {...form.register(`ranking.${index}.tagline`)} placeholder="#5 in India" className="h-8 bg-card border-border/40 text-sm" />
                            </div>
                        </RepeatableRow>
                    ))}
                    <AddRowButton onClick={() => rankings.append({ name: "", tagline: "" })} label="Add Ranking" />
                </CardContent>
            </Card>

            {/* ═══════════ CUTOFF SCORES ═══════════ */}
            <Card className={cardCls}>
                <CardHeader className="pb-0 pt-5 px-5">
                    <SectionHeader icon={BarChart3} title="Admission — Cutoff Scores" subtitle="All India Quota & State Quota" />
                </CardHeader>
                <CardContent className="p-5 space-y-5">
                    {/* AIQ */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                            <span className="text-[11px] font-bold uppercase text-foreground">All India Quota</span>
                            <span className="text-[10px] text-muted-foreground">({aiqCutoff.fields.length})</span>
                        </div>
                        {aiqCutoff.fields.map((field, index) => (
                            <RepeatableRow key={field.id} index={index} onRemove={() => aiqCutoff.remove(index)}>
                                <div className="space-y-1">
                                    <FL>Category</FL>
                                    <Input {...form.register(`all_india_cutoff.${index}.name`)} placeholder="General" className="h-8 bg-card border-border/40 text-sm" />
                                </div>
                                <div className="space-y-1">
                                    <FL>Score</FL>
                                    <Input type="number" {...form.register(`all_india_cutoff.${index}.number`)} placeholder="620" className="h-8 bg-card border-border/40 text-sm" />
                                </div>
                            </RepeatableRow>
                        ))}
                        <AddRowButton onClick={() => aiqCutoff.append({ name: "", number: "" })} label="Add AIQ Cutoff" />
                    </div>

                    <div className="border-t border-border/30" />

                    {/* State Quota */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            <span className="text-[11px] font-bold uppercase text-foreground">State Quota</span>
                            <span className="text-[10px] text-muted-foreground">({stateCutoff.fields.length})</span>
                        </div>
                        {stateCutoff.fields.map((field, index) => (
                            <RepeatableRow key={field.id} index={index} onRemove={() => stateCutoff.remove(index)}>
                                <div className="space-y-1">
                                    <FL>Category</FL>
                                    <Input {...form.register(`state_cutoff.${index}.name`)} placeholder="OBC" className="h-8 bg-card border-border/40 text-sm" />
                                </div>
                                <div className="space-y-1">
                                    <FL>Score</FL>
                                    <Input type="number" {...form.register(`state_cutoff.${index}.number`)} placeholder="580" className="h-8 bg-card border-border/40 text-sm" />
                                </div>
                            </RepeatableRow>
                        ))}
                        <AddRowButton onClick={() => stateCutoff.append({ name: "", number: "" })} label="Add State Cutoff" />
                    </div>
                </CardContent>
            </Card>

            {/* ═══════════ ADMISSION PROCESS ═══════════ */}
            <Card className={cardCls}>
                <CardHeader className="pb-0 pt-5 px-5">
                    <SectionHeader icon={ClipboardList} title="Admission Process" subtitle="Step-by-step guide" count={admProcess.fields.length} />
                </CardHeader>
                <CardContent className="p-5 space-y-2">
                    {admProcess.fields.map((field, index) => (
                        <RepeatableRow key={field.id} index={index} onRemove={() => admProcess.remove(index)}>
                            <div className="space-y-1">
                                <FL>Step Name</FL>
                                <Input {...form.register(`admission_process.${index}.name`)} placeholder="Application" className="h-8 bg-card border-border/40 text-sm" />
                            </div>
                            <div className="space-y-1">
                                <FL>Information</FL>
                                <Input {...form.register(`admission_process.${index}.info`)} placeholder="Brief info" className="h-8 bg-card border-border/40 text-sm" />
                            </div>
                        </RepeatableRow>
                    ))}
                    <AddRowButton onClick={() => admProcess.append({ name: "", info: "" })} label="Add Process Step" />
                </CardContent>
            </Card>

            <Button type="submit" className="hidden">Submit</Button>
        </form>
    );
}
