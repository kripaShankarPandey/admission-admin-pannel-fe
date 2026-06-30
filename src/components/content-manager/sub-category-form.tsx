"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { courseCategoryService, type CourseCategory } from "@/services/course-category-service";
import { subCourseCategoryService, type SubCourseCategory } from "@/services/sub-course-category-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Trash2, ArrowLeft, UploadCloud, GripVertical, Image as ImageIcon, Search } from "lucide-react";
import { uploadImage } from "@/lib/upload";

// Uploads the image to S3 and returns its URL. (Kept the original name so the
// existing call sites work unchanged; images are no longer stored as base64.)
const fileToBase64 = (file: File): Promise<string> => uploadImage(file, "courses");

interface SubCategoryFormProps {
    courseId?: string | number;
}

export function SubCategoryForm({ courseId }: SubCategoryFormProps) {
    const router = useRouter();
    const [allCategories, setAllCategories] = useState<CourseCategory[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [actualId, setActualId] = useState<number | null>(null);

    const form = useForm({
        defaultValues: {
            name: "",
            slug: "",
            courseCategoryId: "",
            priority: "1",
            courses_image: "",
            courseLevel: "",
            duration: "",
            eligibility: "",
            shortDescription: "",
            quickInfoItems: [{ name: "", value: "" }],
            applyNowUrl: "",
            downloadBrochureUrl: "",
            topIcons: [{ name: "", value: "" }],
            banners: [{ imageBase64: "", heading: "", info: "", url: "" }],
            overviewDescription: "",
            careers: [{ name: "", salary: "" }],
            topColleges: [{ name: "", location: "", rating: "", type: "Private", fees: "", buttonUrl: "" }],
            keyFacts: [{ name: "" }],
            meta_title: "",
            meta_description: "",
            keywords: "",
        },
    });

    const { control, handleSubmit, setValue, watch, reset } = form;

    // Field Arrays
    const quickInfoFields = useFieldArray({ control, name: "quickInfoItems" });
    const topIconFields = useFieldArray({ control, name: "topIcons" });
    const bannerFields = useFieldArray({ control, name: "banners" });
    const careerFields = useFieldArray({ control, name: "careers" });
    const collegeFields = useFieldArray({ control, name: "topColleges" });
    const keyFactFields = useFieldArray({ control, name: "keyFacts" });

    // Auto-generate slug
    const nameWatch = watch("name");
    const metaTitleWatch = watch("meta_title");
    const metaDescriptionWatch = watch("meta_description");
    const slugWatch = watch("slug");
    useEffect(() => {
        if (!courseId && nameWatch) {
            setValue("slug", nameWatch.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
        }
    }, [nameWatch, courseId, setValue]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await courseCategoryService.getAll({ page: 1, pageSize: 100 });
                setAllCategories(res.data || []);
            } catch (err) {
                console.error(err);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        if (courseId) {
            setIsLoading(true);
            subCourseCategoryService.getOne(courseId).then((res) => {
                setActualId(res.id);
                let details = {};
                try {
                    details = JSON.parse(res.details || "{}");
                } catch (e) {
                    console.error("Failed to parse details JSON", e);
                }

                reset({
                    name: res.sub_course_category_name || "",
                    slug: res.slug || "",
                    courseCategoryId: res.courseCategoryId?.toString() || "",
                    priority: (details as any).priority?.toString() || "1",
                    courses_image: res.courses_image || "",
                    courseLevel: (details as any).courseLevel || "",
                    duration: (details as any).duration || "",
                    eligibility: (details as any).eligibility || "",
                    shortDescription: (details as any).shortDescription || "",
                    quickInfoItems: (details as any).quickInfo?.items?.length ? (details as any).quickInfo.items : [{ name: "", value: "" }],
                    applyNowUrl: (details as any).quickInfo?.applyNow || "",
                    downloadBrochureUrl: (details as any).quickInfo?.downloadBrochure || "",
                    topIcons: (details as any).topIcons?.length ? (details as any).topIcons : [{ name: "", value: "" }],
                    banners: (details as any).banners?.length ? (details as any).banners : [{ imageBase64: "", heading: "", info: "", url: "" }],
                    overviewDescription: (details as any).overview?.description || "",
                    careers: (details as any).overview?.careers?.length ? (details as any).overview.careers : [{ name: "", salary: "" }],
                    topColleges: (details as any).overview?.topColleges?.length ? (details as any).overview.topColleges : [{ name: "", location: "", rating: "", type: "Private", fees: "", buttonUrl: "" }],
                    keyFacts: (details as any).keyFacts?.length ? (details as any).keyFacts : [{ name: "" }],
                    meta_title: (details as any).seo?.meta_title || "",
                    meta_description: (details as any).seo?.meta_description || "",
                    keywords: (details as any).seo?.keywords || "",
                });
            }).catch(err => {
                console.error(err);
                toast.error("Failed to fetch course data");
            }).finally(() => {
                setIsLoading(false);
            });
        }
    }, [courseId, reset]);

    const onSubmit = async (data: any) => {
        if (!data.name || !data.courseCategoryId) {
            toast.error("Name and Discipline are required");
            return;
        }

        setIsLoading(true);
        try {
            const detailsData = {
                priority: parseInt(data.priority) || 1,
                courseLevel: data.courseLevel,
                duration: data.duration,
                eligibility: data.eligibility,
                shortDescription: data.shortDescription,
                quickInfo: {
                    items: data.quickInfoItems,
                    applyNow: data.applyNowUrl,
                    downloadBrochure: data.downloadBrochureUrl,
                },
                topIcons: data.topIcons,
                banners: data.banners,
                overview: {
                    description: data.overviewDescription,
                    careers: data.careers,
                    topColleges: data.topColleges,
                },
                keyFacts: data.keyFacts,
                seo: {
                    meta_title: data.meta_title,
                    meta_description: data.meta_description,
                    keywords: data.keywords,
                },
            };

            const payload: Partial<SubCourseCategory> = {
                sub_course_category_name: data.name,
                slug: data.slug,
                courseCategoryId: parseInt(data.courseCategoryId),
                courses_image: data.courses_image || "",
                details: JSON.stringify(detailsData),
            };

            if (actualId) {
                await subCourseCategoryService.update(actualId, payload);
                toast.success("Course updated successfully");
            } else {
                await subCourseCategoryService.create(payload);
                toast.success("Course created successfully");
                router.push("/courses"); // only push back if created
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to save course");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto space-y-6 pb-20">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.push("/courses")} className="h-8 w-8">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{courseId ? `Edit Course: ${watch("name") || "Loading..."}` : "Create New Course"}</h1>
                    <p className="text-sm text-muted-foreground">Fill in the comprehensive details for this course page.</p>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                    {/* Basic Info */}
                    <Card className="shadow-sm border-border/50">
                        <CardHeader className="bg-muted/20 border-b border-border/50 pb-4">
                            <CardTitle className="text-lg">Basic Information</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                            {/* Main Course Image Upload */}
                            <div className="md:col-span-2 flex flex-col gap-3">
                                <FormLabel>Course Main Image</FormLabel>
                                <div className="flex items-start gap-4">
                                    {watch("courses_image") ? (
                                        <div className="relative w-32 h-32 rounded-lg border border-border overflow-hidden group">
                                            <img src={watch("courses_image")} alt="Course preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                <Button type="button" variant="destructive" size="sm" onClick={() => setValue("courses_image", "")}>Remove</Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-32 h-32 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground bg-muted/10">
                                            <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
                                            <span className="text-[10px] uppercase font-bold tracking-wider">No Image</span>
                                        </div>
                                    )}
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                className="w-full max-w-sm cursor-pointer"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const base64 = await fileToBase64(file);
                                                        setValue("courses_image", base64);
                                                    }
                                                }}
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground">Upload a high-quality image representing this course. Recommended size: 800x600px.</p>
                                    </div>
                                </div>
                            </div>

                            <FormField control={control} name="name" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Course Name *</FormLabel>
                                    <FormControl><Input placeholder="e.g. MBA in Marketing" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={control} name="slug" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Slug *</FormLabel>
                                    <FormControl><Input placeholder="mba-in-marketing" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={control} name="courseCategoryId" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Discipline *</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger><SelectValue placeholder="Select Discipline" /></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {allCategories.map(c => (
                                                <SelectItem key={c.id} value={c.id.toString()}>{c.courses_category_name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={control} name="priority" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Priority Order (1 is highest)</FormLabel>
                                    <FormControl><Input type="number" min="1" placeholder="e.g. 1" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={control} name="courseLevel" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Course Level</FormLabel>
                                    <FormControl><Input placeholder="e.g. Post Graduate" {...field} /></FormControl>
                                </FormItem>
                            )} />
                            <FormField control={control} name="duration" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Duration</FormLabel>
                                    <FormControl><Input placeholder="e.g. 2 Years" {...field} /></FormControl>
                                </FormItem>
                            )} />
                            <div className="md:col-span-2">
                                <FormField control={control} name="eligibility" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Eligibility</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="e.g. 10+2 with PCB + English | Min. 50% | NEET qualified required"
                                                {...field}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )} />
                            </div>
                            <div className="md:col-span-2">
                                <FormField control={control} name="shortDescription" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Short Description</FormLabel>
                                        <FormControl><Textarea placeholder="Brief overview of the course..." {...field} /></FormControl>
                                    </FormItem>
                                )} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Info Section */}
                    <Card className="shadow-sm border-border/50">
                        <CardHeader className="bg-muted/20 border-b border-border/50 pb-4">
                            <CardTitle className="text-lg flex items-center gap-2">Quick Info Section</CardTitle>
                            <CardDescription>Links and key-value pairs shown at the top of the course page</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={control} name="applyNowUrl" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Apply Now URL</FormLabel>
                                        <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                                    </FormItem>
                                )} />
                                <FormField control={control} name="downloadBrochureUrl" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Download Brochure URL</FormLabel>
                                        <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                                    </FormItem>
                                )} />
                            </div>

                            <div className="space-y-3">
                                <FormLabel>Quick Info Items</FormLabel>
                                {quickInfoFields.fields.map((item, index) => (
                                    <div key={item.id} className="flex gap-3 items-start">
                                        <FormField control={control} name={`quickInfoItems.${index}.name`} render={({ field }) => (
                                            <FormItem className="flex-1"><FormControl><Input placeholder="Name (e.g. Average Fee)" {...field} /></FormControl></FormItem>
                                        )} />
                                        <FormField control={control} name={`quickInfoItems.${index}.value`} render={({ field }) => (
                                            <FormItem className="flex-1"><FormControl><Input placeholder="Value (e.g. 1.2 Lakhs)" {...field} /></FormControl></FormItem>
                                        )} />
                                        <Button type="button" variant="ghost" size="icon" className="text-destructive shrink-0" onClick={() => quickInfoFields.remove(index)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" size="sm" onClick={() => quickInfoFields.append({ name: "", value: "" })}>
                                    <Plus className="h-4 w-4 mr-2" /> Add Quick Info
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Top Icons Section */}
                    <Card className="shadow-sm border-border/50">
                        <CardHeader className="bg-muted/20 border-b border-border/50 pb-4">
                            <CardTitle className="text-lg">Top Icons Section</CardTitle>
                            <CardDescription>Highlights with icons/labels shown across the top header</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-6">
                            {topIconFields.fields.map((item, index) => (
                                <div key={item.id} className="flex gap-3 items-start">
                                    <FormField control={control} name={`topIcons.${index}.name`} render={({ field }) => (
                                        <FormItem className="flex-1"><FormControl><Input placeholder="Attribute Name" {...field} /></FormControl></FormItem>
                                    )} />
                                    <FormField control={control} name={`topIcons.${index}.value`} render={({ field }) => (
                                        <FormItem className="flex-1"><FormControl><Input placeholder="Attribute Value" {...field} /></FormControl></FormItem>
                                    )} />
                                    <Button type="button" variant="ghost" size="icon" className="text-destructive shrink-0" onClick={() => topIconFields.remove(index)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            <Button type="button" variant="outline" size="sm" onClick={() => topIconFields.append({ name: "", value: "" })}>
                                <Plus className="h-4 w-4 mr-2" /> Add Icon Item
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Banner Section */}
                    <Card className="shadow-sm border-border/50">
                        <CardHeader className="bg-muted/20 border-b border-border/50 pb-4">
                            <CardTitle className="text-lg flex items-center justify-between">
                                Banner Highlights
                                <Button type="button" variant="outline" size="sm" onClick={() => bannerFields.append({ imageBase64: "", heading: "", info: "", url: "" })} className="h-8">
                                    <Plus className="h-4 w-4 mr-1" /> Add Banner
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            {bannerFields.fields.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-border rounded-lg bg-muted/10">No banners added yet. Click &quot;Add Banner&quot; above.</div>
                            )}
                            {bannerFields.fields.map((item, index) => (
                                <div key={item.id} className="p-5 border border-border/60 rounded-xl space-y-4 relative bg-card shadow-sm hover:border-primary/30 transition-colors group">
                                    <div className="flex items-center justify-between mb-2">
                                        <Badge variant="outline" className="bg-muted text-muted-foreground font-mono">Banner #{index + 1}</Badge>
                                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => bannerFields.remove(index)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
                                        {/* Banner Image Uploader */}
                                        <div className="flex flex-col gap-2">
                                            <FormLabel>Banner Image</FormLabel>
                                            <div className="relative w-full aspect-video rounded-md border border-border overflow-hidden bg-muted/20 flex items-center justify-center">
                                                {watch(`banners.${index}.imageBase64`) ? (
                                                    <>
                                                        <img src={watch(`banners.${index}.imageBase64`)} alt="Banner preview" className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                                            <Input 
                                                                type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer"
                                                                onChange={async (e) => {
                                                                    const file = e.target.files?.[0];
                                                                    if (file) {
                                                                        const base64 = await fileToBase64(file);
                                                                        setValue(`banners.${index}.imageBase64`, base64);
                                                                    }
                                                                }}
                                                            />
                                                            <span className="text-white text-xs font-semibold flex items-center gap-1 bg-black/40 px-3 py-1.5 rounded-full"><UploadCloud className="h-3 w-3" /> Change</span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="relative w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                                                        <UploadCloud className="h-6 w-6 mb-2 opacity-60" />
                                                        <span className="text-xs">Upload</span>
                                                        <Input 
                                                            type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer"
                                                            onChange={async (e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) {
                                                                    const base64 = await fileToBase64(file);
                                                                    setValue(`banners.${index}.imageBase64`, base64);
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField control={control} name={`banners.${index}.heading`} render={({ field }) => (
                                                <FormItem className="md:col-span-2"><FormLabel>Heading</FormLabel><FormControl><Input placeholder="Banner Title" className="bg-background" {...field} /></FormControl></FormItem>
                                            )} />
                                            <FormField control={control} name={`banners.${index}.info`} render={({ field }) => (
                                                <FormItem><FormLabel>Info Text</FormLabel><FormControl><Input placeholder="Short description..." className="bg-background" {...field} /></FormControl></FormItem>
                                            )} />
                                            <FormField control={control} name={`banners.${index}.url`} render={({ field }) => (
                                                <FormItem><FormLabel>Link URL</FormLabel><FormControl><Input placeholder="https://..." className="bg-background" {...field} /></FormControl></FormItem>
                                            )} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Overview Section */}
                    <Card className="shadow-sm border-border/50">
                        <CardHeader className="bg-muted/20 border-b border-border/50 pb-4">
                            <CardTitle className="text-lg">Overview Section</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-10 pt-6">
                            <FormField control={control} name="overviewDescription" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base font-semibold text-foreground">Full Description</FormLabel>
                                    <FormControl><Textarea className="min-h-[140px] resize-y bg-background" placeholder="Detailed course overview. Use HTML or Markdown if supported..." {...field} /></FormControl>
                                </FormItem>
                            )} />

                            {/* Careers */}
                            <div className="space-y-4 pt-4 border-t border-border/50">
                                <FormLabel className="text-base font-semibold text-foreground flex justify-between items-center">
                                    Careers & Salaries
                                    <Button type="button" variant="outline" size="sm" onClick={() => careerFields.append({ name: "", salary: "" })} className="h-8">
                                        <Plus className="h-4 w-4 mr-1" /> Add Career
                                    </Button>
                                </FormLabel>
                                {careerFields.fields.length === 0 && <div className="text-sm text-muted-foreground italic">No careers added.</div>}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {careerFields.fields.map((item, index) => (
                                        <div key={item.id} className="flex gap-2 items-center p-2 rounded-lg border border-border/60 bg-muted/10">
                                            <div className="flex-none text-muted-foreground/50 cursor-grab px-1"><GripVertical className="h-4 w-4" /></div>
                                            <FormField control={control} name={`careers.${index}.name`} render={({ field }) => (
                                                <FormItem className="flex-1 space-y-0"><FormControl><Input placeholder="Job Role" className="h-9 outline-none border-none shadow-none bg-transparent" {...field} /></FormControl></FormItem>
                                            )} />
                                            <div className="w-[1px] h-6 bg-border/60 mx-1"></div>
                                            <FormField control={control} name={`careers.${index}.salary`} render={({ field }) => (
                                                <FormItem className="flex-1 space-y-0"><FormControl><Input placeholder="Expected Salary" className="h-9 outline-none border-none shadow-none bg-transparent" {...field} /></FormControl></FormItem>
                                            )} />
                                            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive/70 hover:text-destructive shrink-0" onClick={() => careerFields.remove(index)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Top Colleges */}
                            <div className="space-y-4 pt-4 border-t border-border/50">
                                <FormLabel className="text-base font-semibold text-foreground flex justify-between items-center">
                                    Top Colleges
                                    <Button type="button" variant="outline" size="sm" onClick={() => collegeFields.append({ name: "", location: "", rating: "", type: "Private", fees: "", buttonUrl: "" })} className="h-8">
                                        <Plus className="h-4 w-4 mr-1" /> Add College
                                    </Button>
                                </FormLabel>
                                {collegeFields.fields.length === 0 && <div className="text-sm text-muted-foreground italic">No top colleges added.</div>}
                                <div className="grid grid-cols-1 gap-4">
                                    {collegeFields.fields.map((item, index) => (
                                        <div key={item.id} className="p-5 border border-border/60 rounded-xl space-y-4 relative bg-card shadow-sm group">
                                            <Button type="button" variant="ghost" size="icon" className="absolute top-3 right-3 h-8 w-8 text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => collegeFields.remove(index)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mr-8">
                                                <FormField control={control} name={`topColleges.${index}.name`} render={({ field }) => (
                                                    <FormItem className="md:col-span-2"><FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">College Name</FormLabel><FormControl><Input placeholder="Name" className="bg-background" {...field} /></FormControl></FormItem>
                                                )} />
                                                <FormField control={control} name={`topColleges.${index}.location`} render={({ field }) => (
                                                    <FormItem><FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">Location</FormLabel><FormControl><Input placeholder="City, State" className="bg-background" {...field} /></FormControl></FormItem>
                                                )} />
                                                <FormField control={control} name={`topColleges.${index}.rating`} render={({ field }) => (
                                                    <FormItem><FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">Rating</FormLabel><FormControl><Input placeholder="e.g. 4.5/5" className="bg-background" {...field} /></FormControl></FormItem>
                                                )} />
                                                <FormField control={control} name={`topColleges.${index}.type`} render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">Institution Type</FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl><SelectTrigger className="bg-background"><SelectValue /></SelectTrigger></FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="Private">Private</SelectItem>
                                                                <SelectItem value="Government">Government</SelectItem>
                                                                <SelectItem value="Deemed">Deemed</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </FormItem>
                                                )} />
                                                <FormField control={control} name={`topColleges.${index}.fees`} render={({ field }) => (
                                                    <FormItem><FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">Fees</FormLabel><FormControl><Input placeholder="e.g. ₹5,00,000" className="bg-background" {...field} /></FormControl></FormItem>
                                                )} />
                                                <FormField control={control} name={`topColleges.${index}.buttonUrl`} render={({ field }) => (
                                                    <FormItem className="md:col-span-3"><FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">Action URL</FormLabel><FormControl><Input placeholder="https://..." className="bg-background" {...field} /></FormControl></FormItem>
                                                )} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Key Facts Section */}
                    <Card className="shadow-sm border-border/50">
                        <CardHeader className="bg-muted/20 border-b border-border/50 pb-4">
                            <CardTitle className="text-lg">Key Facts Section</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-6">
                            {keyFactFields.fields.map((item, index) => (
                                <div key={item.id} className="flex gap-3 items-center">
                                    <div className="flex-none text-muted-foreground/50 cursor-grab"><GripVertical className="h-4 w-4" /></div>
                                    <FormField control={control} name={`keyFacts.${index}.name`} render={({ field }) => (
                                        <FormItem className="flex-1 m-0 space-y-0"><FormControl><Input placeholder="Key Fact (e.g. 100% Placement Assistance)" {...field} /></FormControl></FormItem>
                                    )} />
                                    <Button type="button" variant="ghost" size="icon" className="text-destructive shrink-0" onClick={() => keyFactFields.remove(index)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            <Button type="button" variant="outline" size="sm" onClick={() => keyFactFields.append({ name: "" })}>
                                <Plus className="h-4 w-4 mr-2" /> Add Fact
                            </Button>
                        </CardContent>
                    </Card>

                    {/* SEO & Google Preview */}
                    <Card className="shadow-sm border-border/50">
                        <CardHeader className="bg-muted/20 border-b border-border/50 pb-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Search className="h-5 w-5 text-primary" />
                                SEO & Google Preview
                            </CardTitle>
                            <CardDescription>Search engine metadata and live preview of how this page appears in Google</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            {/* SEO Fields */}
                            <div className="grid grid-cols-1 gap-4">
                                <FormField control={control} name="meta_title" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Meta Title</FormLabel>
                                        <FormControl><Input placeholder="SEO title — keep under 60 characters" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={control} name="meta_description" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Meta Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Short SEO description — keep under 160 characters"
                                                className="min-h-[90px] resize-y bg-background"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={control} name="keywords" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Keywords</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="anm nursing, anm course fees, anm admission 2026"
                                                className="min-h-[70px] resize-y bg-background"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>

                            {/* Google Search Preview */}
                            <div className="space-y-3">
                                <p className="text-sm font-semibold text-foreground">Live Preview</p>
                                <div className="rounded-xl border border-border/60 bg-background p-5">
                                    {/* Chrome bar mockup */}
                                    <div className="mb-4 flex items-center gap-2 rounded-lg border border-border/50 bg-muted/30 px-3 py-2">
                                        <div className="flex gap-1.5">
                                            <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                                            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
                                            <span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
                                        </div>
                                        <div className="flex flex-1 items-center gap-2 rounded-md border border-border/40 bg-background px-3 py-1 text-xs text-muted-foreground">
                                            <Search className="h-3 w-3 shrink-0 text-muted-foreground/60" />
                                            <span className="truncate font-mono text-[11px]">
                                                google.com/search?q={encodeURIComponent(metaTitleWatch || watch("name") || "course name")}
                                            </span>
                                        </div>
                                    </div>

                                    {/* SERP result */}
                                    <div className="space-y-1 pl-1">
                                        {/* Site + URL */}
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border/50 bg-white shadow-xs">
                                                <svg viewBox="0 0 48 48" className="h-3.5 w-3.5">
                                                    <path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                                                    <path fill="#34A853" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                                                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                                                    <path fill="#EA4335" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                                                    <path fill="none" d="M0 0h48v48H0z"/>
                                                </svg>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate text-xs font-medium text-foreground">Admission Today</p>
                                                <p className="truncate font-mono text-[11px] text-muted-foreground">
                                                    admissiontoday.com › courses{slugWatch ? ` › ${slugWatch}` : ""}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Title */}
                                        <p className={`text-lg font-normal leading-snug ${metaTitleWatch || watch("name") ? "text-[#1a0dab]" : "text-muted-foreground/50 italic"} hover:underline cursor-pointer`}>
                                            {metaTitleWatch || (watch("name") ? `${watch("name")} — Fees, Colleges, Career 2026 | Admission Today` : "Meta title will appear here…")}
                                        </p>

                                        {/* Description */}
                                        <p className={`text-sm leading-relaxed ${metaDescriptionWatch ? "text-[#4d5156]" : "text-muted-foreground/40 italic"}`}>
                                            {metaDescriptionWatch || "Meta description will appear here. Add a description to improve your click-through rate from search results."}
                                        </p>
                                    </div>
                                </div>

                                {/* Character count bars */}
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div className="rounded-lg border border-border/50 bg-muted/20 px-4 py-3">
                                        <div className="mb-1.5 flex items-center justify-between">
                                            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Title Length</span>
                                            <span className={`text-[11px] font-bold ${(metaTitleWatch?.length ?? 0) > 60 ? "text-red-500" : (metaTitleWatch?.length ?? 0) >= 50 ? "text-green-600" : "text-amber-500"}`}>
                                                {metaTitleWatch?.length ?? 0} / 60
                                            </span>
                                        </div>
                                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-border/50">
                                            <div
                                                className={`h-full rounded-full transition-all ${(metaTitleWatch?.length ?? 0) > 60 ? "bg-red-500" : (metaTitleWatch?.length ?? 0) >= 50 ? "bg-green-500" : "bg-amber-400"}`}
                                                style={{ width: `${Math.min(((metaTitleWatch?.length ?? 0) / 60) * 100, 100)}%` }}
                                            />
                                        </div>
                                        <p className="mt-1.5 text-[10px] text-muted-foreground">
                                            {(metaTitleWatch?.length ?? 0) > 60 ? "Too long — Google may truncate" : (metaTitleWatch?.length ?? 0) >= 50 ? "Good length" : "Aim for 50–60 characters"}
                                        </p>
                                    </div>

                                    <div className="rounded-lg border border-border/50 bg-muted/20 px-4 py-3">
                                        <div className="mb-1.5 flex items-center justify-between">
                                            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Description Length</span>
                                            <span className={`text-[11px] font-bold ${(metaDescriptionWatch?.length ?? 0) > 160 ? "text-red-500" : (metaDescriptionWatch?.length ?? 0) >= 120 ? "text-green-600" : "text-amber-500"}`}>
                                                {metaDescriptionWatch?.length ?? 0} / 160
                                            </span>
                                        </div>
                                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-border/50">
                                            <div
                                                className={`h-full rounded-full transition-all ${(metaDescriptionWatch?.length ?? 0) > 160 ? "bg-red-500" : (metaDescriptionWatch?.length ?? 0) >= 120 ? "bg-green-500" : "bg-amber-400"}`}
                                                style={{ width: `${Math.min(((metaDescriptionWatch?.length ?? 0) / 160) * 100, 100)}%` }}
                                            />
                                        </div>
                                        <p className="mt-1.5 text-[10px] text-muted-foreground">
                                            {(metaDescriptionWatch?.length ?? 0) > 160 ? "Too long — Google may truncate" : (metaDescriptionWatch?.length ?? 0) >= 120 ? "Good length" : "Aim for 120–160 characters"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Fixed Action Bottom Bar */}
                    <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-lg border-t border-border z-10 lg:pl-64">
                        <div className="w-full max-w-5xl mx-auto flex justify-end gap-3 pr-4">
                            <Button type="button" variant="outline" onClick={() => router.push("/courses")} disabled={isLoading}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading} className="font-semibold px-8">
                                {isLoading ? "Saving..." : (courseId ? "Save Changes" : "Create Course")}
                            </Button>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    );
}
