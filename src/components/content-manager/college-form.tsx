"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { College, collegeService } from "@/services/college-service";
import { cityService } from "@/services/city-service";
import { courseCategoryService } from "@/services/course-category-service";
import { subCourseCategoryService } from "@/services/sub-course-category-service";
import { courseSpecializationService } from "@/services/course-specialization-service";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    Plus,
    Trash2,
    ChevronDown,
    ChevronUp,
    GripVertical,
    Upload,
    Link as LinkIcon
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CollegeFormProps {
    initialData?: College;
    onSave: (data: any) => Promise<void>;
}

export function CollegeForm({ initialData, onSave }: CollegeFormProps) {
    const [cities, setCities] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [subCategories, setSubCategories] = useState<any[]>([]);
    const [specializations, setSpecializations] = useState<any[]>([]);

    const form = useForm({
        defaultValues: {
            college_name: initialData?.college_name || "",
            slug: initialData?.slug || "",
            cityId: initialData?.cityId?.toString() || "",
            affiliated_with: initialData?.affiliated_with || "",
            established_year: initialData?.established_year || "",
            college_type: initialData?.college_type || "Choose here",
            isFeatured: initialData?.isFeatured || false,
            college_rating: initialData?.college_rating || 4,
            college_description: initialData?.college_description || "",
            college_image: initialData?.college_image || "",
            NIRF_rank: initialData?.NIRF_rank || "",
            course_categories: initialData?.course_categories?.map(c => c.id.toString()) || [],
            sub_course_categories: initialData?.sub_course_categories?.map(c => c.id.toString()) || [],
            course_category_specializations: initialData?.course_category_specializations?.map(c => c.id.toString()) || [],

            // Repeatable sections
            home_four_list: Array.isArray(initialData?.home_four_list) ? initialData.home_four_list : [],
            fee_structure: Array.isArray(initialData?.fee_structure) ? initialData.fee_structure : [],
            admission_process: Array.isArray(initialData?.admission_process) ? initialData.admission_process : [],
            intake_details: Array.isArray(initialData?.intake_details) ? initialData.intake_details : [],
        }
    });

    const fetchData = useCallback(async () => {
        try {
            const [cRes, catRes, subRes, specRes] = await Promise.all([
                cityService.getAll({ pageSize: 100 }),
                courseCategoryService.getAll({ pageSize: 100 }),
                subCourseCategoryService.getAll({ pageSize: 100 }),
                courseSpecializationService.getAll({ pageSize: 100 })
            ]);
            setCities(cRes.data || []);
            setCategories(catRes.data || []);
            setSubCategories(subRes.data || []);
            setSpecializations(specRes.data || []);
        } catch (error) {
            console.error("Error fetching form data:", error);
        }
    }, []);

    const selectedCategories = form.watch("course_categories");
    const selectedSubCategories = form.watch("sub_course_categories");

    // Cleanup Sub-Categories when Categories change
    useEffect(() => {
        const currentSubCats = form.getValues("sub_course_categories");
        const validSubCats = currentSubCats.filter(id => {
            const sc = subCategories.find(s => s.id.toString() === id);
            return sc && selectedCategories.includes(sc.courseCategoryId?.toString());
        });
        if (validSubCats.length !== currentSubCats.length) {
            form.setValue("sub_course_categories", validSubCats);
        }
    }, [selectedCategories, subCategories, form]);

    // Cleanup Specializations when Sub-Categories change
    useEffect(() => {
        const currentSpecs = form.getValues("course_category_specializations");
        const validSpecs = currentSpecs.filter(id => {
            const sp = specializations.find(s => s.id.toString() === id);
            return sp && selectedSubCategories.includes(sp.subCourseCategoryId?.toString());
        });
        if (validSpecs.length !== currentSpecs.length) {
            form.setValue("course_category_specializations", validSpecs);
        }
    }, [selectedSubCategories, specializations, form]);

    const filteredSubCategories = subCategories.filter(sc =>
        selectedCategories.includes(sc.courseCategoryId?.toString())
    );

    const filteredSpecializations = specializations.filter(sp =>
        selectedSubCategories.includes(sp.subCourseCategoryId?.toString())
    );

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const onSubmit = async (data: any) => {
        const payload = {
            ...data,
            cityId: parseInt(data.cityId),
            college_rating: parseInt(data.college_rating),
            course_categories: data.course_categories.map((id: string) => ({ id: parseInt(id) })),
            sub_course_categories: data.sub_course_categories.map((id: string) => ({ id: parseInt(id) })),
            course_category_specializations: data.course_category_specializations.map((id: string) => ({ id: parseInt(id) })),
        };
        await onSave(payload);
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-[#a5a5ba] text-xs font-bold uppercase">College Name*</Label>
                        <Input
                            {...form.register("college_name")}
                            placeholder="Enter college name"
                            className="bg-muted/20 border-white/10 text-white focus:ring-primary"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[#a5a5ba] text-xs font-bold uppercase">Slug*</Label>
                        <Input
                            {...form.register("slug")}
                            placeholder="college-slug"
                            className="bg-muted/20 border-white/10 text-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[#a5a5ba] text-xs font-bold uppercase">College Type*</Label>
                        <Select
                            onValueChange={(val) => form.setValue("college_type", val)}
                            value={form.watch("college_type")}
                        >
                            <SelectTrigger className="bg-muted/20 border-white/10 text-white">
                                <SelectValue placeholder="Choose here" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#212134] border-white/10 text-white">
                                <SelectItem value="Government">Government</SelectItem>
                                <SelectItem value="Private">Private</SelectItem>
                                <SelectItem value="Semi-Government">Semi-Government</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-[#a5a5ba] text-xs font-bold uppercase">City</Label>
                        <Select
                            onValueChange={(val) => form.setValue("cityId", val)}
                            value={form.watch("cityId")}
                        >
                            <SelectTrigger className="bg-muted/20 border-white/10 text-white">
                                <SelectValue placeholder="Add or create a relation" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#212134] border-white/10 text-white max-h-[300px]">
                                {cities.map(city => (
                                    <SelectItem key={city.id} value={city.id.toString()}>{city.city}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[#a5a5ba] text-xs font-bold uppercase">Affiliated With</Label>
                        <Input
                            {...form.register("affiliated_with")}
                            placeholder="Enter affiliation"
                            className="bg-muted/20 border-white/10 text-white"
                        />
                    </div>
                    <div className="flex items-end gap-6">
                        <div className="flex-1 space-y-2">
                            <Label className="text-[#a5a5ba] text-xs font-bold uppercase">Established Year*</Label>
                            <Input
                                {...form.register("established_year")}
                                placeholder="Year"
                                className="bg-muted/20 border-white/10 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[#a5a5ba] text-xs font-bold uppercase block">isFeatured*</Label>
                            <div className="flex border border-white/10 rounded-md overflow-hidden h-9">
                                <button
                                    type="button"
                                    onClick={() => form.setValue("isFeatured", false)}
                                    className={cn(
                                        "flex-1 px-4 text-[10px] font-bold uppercase transition-colors",
                                        !form.watch("isFeatured") ? "bg-destructive text-white" : "bg-muted/10 text-[#a5a5ba] hover:bg-muted/20"
                                    )}
                                >
                                    FALSE
                                </button>
                                <button
                                    type="button"
                                    onClick={() => form.setValue("isFeatured", true)}
                                    className={cn(
                                        "flex-1 px-4 text-[10px] font-bold uppercase transition-colors",
                                        form.watch("isFeatured") ? "bg-green-600 text-white" : "bg-muted/10 text-[#a5a5ba] hover:bg-muted/20"
                                    )}
                                >
                                    TRUE
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Relations Section */}
            <div className="space-y-6 pt-4 border-t border-white/5">
                <div className="space-y-2">
                    <Label className="text-[#a5a5ba] text-xs font-bold uppercase">Course Categories</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-white/5 border border-white/5 rounded-lg">
                        {categories.map(cat => (
                            <div key={cat.id} className="flex items-center gap-2">
                                <Checkbox
                                    id={`cat-${cat.id}`}
                                    checked={form.watch("course_categories").includes(cat.id.toString())}
                                    onCheckedChange={(checked) => {
                                        const current = form.getValues("course_categories");
                                        if (checked) form.setValue("course_categories", [...current, cat.id.toString()]);
                                        else form.setValue("course_categories", current.filter(id => id !== cat.id.toString()));
                                    }}
                                />
                                <Label htmlFor={`cat-${cat.id}`} className="text-sm font-medium leading-none cursor-pointer">
                                    {cat.courses_category_name}
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label className={cn(
                            "text-[#a5a5ba] text-xs font-bold uppercase",
                            selectedCategories.length === 0 && "opacity-50"
                        )}>
                            Sub Course Categories {selectedCategories.length === 0 && "(Select Category first)"}
                        </Label>
                        <Select
                            disabled={selectedCategories.length === 0}
                            onValueChange={(val) => {
                                const current = form.getValues("sub_course_categories");
                                if (!current.includes(val)) form.setValue("sub_course_categories", [...current, val]);
                            }}
                        >
                            <SelectTrigger className="bg-muted/20 border-white/10 text-white h-10 disabled:opacity-50">
                                <SelectValue placeholder={selectedCategories.length === 0 ? "Select Category first" : "Add or create a relation"} />
                            </SelectTrigger>
                            <SelectContent className="bg-[#212134] border-white/10 text-white">
                                {filteredSubCategories.map(sub => (
                                    <SelectItem key={sub.id} value={sub.id.toString()}>{sub.sub_course_category_name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {form.watch("sub_course_categories").map(id => {
                                const sub = subCategories.find(s => s.id.toString() === id);
                                return sub ? (
                                    <Badge key={id} variant="outline" className="bg-primary/10 text-primary border-primary/20 py-1 px-2.5">
                                        {sub.sub_course_category_name}
                                        <button
                                            type="button"
                                            onClick={() => form.setValue("sub_course_categories", form.getValues("sub_course_categories").filter(val => val !== id))}
                                            className="ml-2 hover:text-white"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ) : null;
                            })}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className={cn(
                            "text-[#a5a5ba] text-xs font-bold uppercase",
                            selectedSubCategories.length === 0 && "opacity-50"
                        )}>
                            Course Category Specializations {selectedSubCategories.length === 0 && "(Select Sub-Category first)"}
                        </Label>
                        <Select
                            disabled={selectedSubCategories.length === 0}
                            onValueChange={(val) => {
                                const current = form.getValues("course_category_specializations");
                                if (!current.includes(val)) form.setValue("course_category_specializations", [...current, val]);
                            }}
                        >
                            <SelectTrigger className="bg-muted/20 border-white/10 text-white h-10 disabled:opacity-50">
                                <SelectValue placeholder={selectedSubCategories.length === 0 ? "Select Sub-Category first" : "Add or create a relation"} />
                            </SelectTrigger>
                            <SelectContent className="bg-[#212134] border-white/10 text-white">
                                {filteredSpecializations.map(spec => (
                                    <SelectItem key={spec.id} value={spec.id.toString()}>{spec.specialization}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {form.watch("course_category_specializations").map(id => {
                                const spec = specializations.find(s => s.id.toString() === id);
                                return spec ? (
                                    <Badge key={id} variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20 py-1 px-2.5">
                                        {spec.specialization}
                                        <button
                                            type="button"
                                            onClick={() => form.setValue("course_category_specializations", form.getValues("course_category_specializations").filter(val => val !== id))}
                                            className="ml-2 hover:text-white"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ) : null;
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Images & Ratings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-[#a5a5ba] text-xs font-bold uppercase">College Rating*</Label>
                        <Input
                            type="number"
                            min="1"
                            max="5"
                            {...form.register("college_rating")}
                            className="bg-muted/20 border-white/10 text-white"
                        />
                        <span className="text-[10px] text-muted-foreground">min. 1 / max. 5</span>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[#a5a5ba] text-xs font-bold uppercase">NIRF Rank*</Label>
                        <Input
                            {...form.register("NIRF_rank")}
                            placeholder="Enter rank"
                            className="bg-muted/20 border-white/10 text-white"
                        />
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-[#a5a5ba] text-xs font-bold uppercase">College Image*</Label>
                        <div className="h-40 border-2 border-dashed border-white/10 rounded-lg flex flex-col items-center justify-center bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                            <Upload className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                            <span className="mt-2 text-sm text-muted-foreground">Click to add an asset or drag and drop one in this area</span>
                            <div className="mt-4 flex gap-2 w-full px-4">
                                <Input
                                    {...form.register("college_image")}
                                    placeholder="Or enter Image URL"
                                    className="bg-muted/20 border-white/10 text-white flex-1"
                                />
                                <Button size="icon" variant="outline" className="bg-muted/20 border-white/10 text-white">
                                    <LinkIcon className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <Label className="text-[#a5a5ba] text-xs font-bold uppercase">College Description*</Label>
                <Textarea
                    {...form.register("college_description")}
                    placeholder="Enter description..."
                    className="bg-muted/20 border-white/10 text-white min-h-[150px]"
                />
            </div>

            {/* Repeatable Sections Section */}
            <div className="space-y-8 pt-8 border-t border-white/5">
                <RepeatableJsonSection
                    title="Home Four List"
                    name="home_four_list"
                    form={form}
                    fields={[{ name: "name", label: "Name" }, { name: "number", label: "Number", type: "number" }]}
                />

                <RepeatableJsonSection
                    title="Fee Structure"
                    name="fee_structure"
                    form={form}
                    fields={[{ name: "course", label: "Course" }, { name: "fees", label: "Fees" }]}
                />

                <RepeatableJsonSection
                    title="Admission Process"
                    name="admission_process"
                    form={form}
                    fields={[{ name: "title", label: "Title" }, { name: "description", label: "Description" }]}
                />
            </div>

            <div className="flex justify-end pt-6">
                <Button type="submit" className="hidden">Submit Hidden</Button>
            </div>
        </form>
    );
}

function RepeatableJsonSection({ title, name, form, fields }: { title: string, name: string, form: any, fields: Array<{ name: string, label: string, type?: string }> }) {
    const { fields: items, append, remove } = useFieldArray({
        control: form.control,
        name: name
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                    {title} ({items.length})
                </h3>
            </div>
            <div className="space-y-3">
                {items.map((field, index) => (
                    <Card key={field.id} className="bg-muted/5 border-white/10 shadow-none relative group overflow-visible">
                        <div className="absolute -left-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 text-destructive hover:text-destructive hover:bg-destructive/10 z-10"
                            onClick={() => remove(index)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {fields.map(f => (
                                <div key={f.name} className="space-y-1.5">
                                    <Label className="text-[#a5a5ba] text-[10px] font-bold uppercase">{f.label}*</Label>
                                    <Input
                                        type={f.type || "text"}
                                        {...form.register(`${name}.${index}.${f.name}`)}
                                        className="bg-muted/10 border-white/5 text-white h-8 text-[13px]"
                                    />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                ))}
            </div>
            <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full bg-white/5 border border-white/10 text-white hover:bg-white/10 h-10 border-dashed"
                onClick={() => {
                    const newItem: any = {};
                    fields.forEach(f => newItem[f.name] = f.type === 'number' ? 0 : '');
                    append(newItem);
                }}
            >
                <Plus className="h-4 w-4 mr-2" /> Add an entry
            </Button>
        </div>
    );
}
