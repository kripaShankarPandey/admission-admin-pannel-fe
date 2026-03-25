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
import { Plus, Trash2, ArrowLeft, UploadCloud, GripVertical, Image as ImageIcon } from "lucide-react";

// Helper function to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
};

interface SubCategoryFormProps {
    courseId?: number;
}

export function SubCategoryForm({ courseId }: SubCategoryFormProps) {
    const router = useRouter();
    const [allCategories, setAllCategories] = useState<CourseCategory[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm({
        defaultValues: {
            name: "",
            slug: "",
            courseCategoryId: "",
            priority: "1",
            courses_image: "",
            courseLevel: "",
            duration: "",
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
            toast.error("Name and Category are required");
            return;
        }

        setIsLoading(true);
        try {
            const detailsData = {
                priority: parseInt(data.priority) || 1,
                courseLevel: data.courseLevel,
                duration: data.duration,
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
            };

            const payload: Partial<SubCourseCategory> = {
                sub_course_category_name: data.name,
                slug: data.slug,
                courseCategoryId: parseInt(data.courseCategoryId),
                courses_image: data.courses_image || "",
                details: JSON.stringify(detailsData),
            };

            if (courseId) {
                await subCourseCategoryService.update(courseId, payload);
                toast.success("Course updated successfully");
            } else {
                await subCourseCategoryService.create(payload);
                toast.success("Course created successfully");
                router.push("/sub-categories"); // only push back if created
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
                <Button variant="outline" size="icon" onClick={() => router.push("/sub-categories")} className="h-8 w-8">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{courseId ? "Edit Course Details" : "Create New Course"}</h1>
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
                                    <FormLabel>Parent Category *</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger><SelectValue placeholder="Select Parent Category" /></SelectTrigger>
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

                    {/* Fixed Action Bottom Bar */}
                    <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-lg border-t border-border z-10 lg:pl-64">
                        <div className="w-full max-w-5xl mx-auto flex justify-end gap-3 pr-4">
                            <Button type="button" variant="outline" onClick={() => router.push("/sub-categories")} disabled={isLoading}>
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
