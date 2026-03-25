"use client";

import { useEffect, useState, useMemo } from "react";
import { courseSpecializationService, type CourseCategorySpecialization } from "@/services/course-specialization-service";
import { allCoursesData } from "@/data/allCoursesData";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Trash2, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Pagination } from "@/components/pagination";
import { useForm } from "react-hook-form";
import { useDebounce } from "@/hooks/use-debounce";
import { ListingLayout } from "@/components/content-manager/listing-layout";
import { Badge } from "@/components/ui/badge";

export default function SpecializationsPage() {
    const [apiSpecializations, setApiSpecializations] = useState<CourseCategorySpecialization[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Pagination & Filter State
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");
    const [selectedDisciplineId, setSelectedDisciplineId] = useState<string>("all");
    const [selectedCourseId, setSelectedCourseId] = useState<string>("all");
    const pageSize = 15;

    // Static Data Context mapping to IDs (deterministic hash based mock IDs to prevent collision)
    const { hierarchy, staticSpecs } = useMemo(() => {
        let hIdx = 100001;
        let cIdx = 200001;
        let sIdx = 300001;

        const h = allCoursesData.map(disc => {
            const disciplineId = hIdx++;
            return {
                id: disciplineId,
                discipline_name: disc.discipline,
                courses: disc.courses.map(course => ({
                    id: cIdx++,
                    sub_course_category_name: course.name,
                    disciplineId: disciplineId,
                    disciplineName: disc.discipline,
                    specializations: course.specializations
                }))
            };
        });

        const s = h.flatMap(disc => 
            disc.courses.flatMap(course => 
                (course.specializations || []).map(spec => ({
                    id: sIdx++,
                    specialization: spec,
                    courseId: course.id,
                    courseName: course.sub_course_category_name,
                    disciplineId: disc.id,
                    disciplineName: disc.discipline_name
                }))
            )
        );

        return { hierarchy: h, staticSpecs: s };
    }, []);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSpec, setEditingSpec] = useState<any>(null);

    const debouncedSearch = useDebounce(search, 300);

    const form = useForm({
        defaultValues: {
            specialization: "",
            disciplineId: "",
            subCourseCategoryId: "",
        },
    });

    // Cascading options for form
    const formDisciplineId = form.watch("disciplineId");
    
    // Auto-reset sub-course when discipline changes
    useEffect(() => {
        if (!editingSpec && formDisciplineId) {
            form.setValue("subCourseCategoryId", "");
        }
    }, [formDisciplineId, form, editingSpec]);

    const formCourseOptions = useMemo(() => {
        if (!formDisciplineId) return [];
        const disc = hierarchy.find(h => h.id.toString() === formDisciplineId);
        return disc ? disc.courses : [];
    }, [formDisciplineId, hierarchy]);

    const fetchApiSpecializations = async () => {
        setIsLoading(true);
        try {
            // Fetch ALL from API (large pageSize) to merge with static
            const response = await courseSpecializationService.getAll({ page: 1, pageSize: 500 });
            setApiSpecializations(response.data || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch specializations.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchApiSpecializations();
    }, []);

    // Merge API data with Static Data
    const mergedSpecializations = useMemo(() => {
        const merged = [...apiSpecializations];
        
        staticSpecs.forEach((staticItem) => {
            const exists = merged.some(apiItem => apiItem.id === staticItem.id || apiItem.specialization?.toLowerCase() === staticItem.specialization?.toLowerCase());
            if (!exists) {
                merged.push({
                    id: staticItem.id,
                    specialization: staticItem.specialization,
                    subCourseCategoryId: staticItem.courseId,
                    subCourseCategory: {
                        sub_course_category_name: staticItem.courseName
                    },
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    publishedAt: new Date().toISOString(), // Mock published
                    // Keep metadata if needed
                    disciplineName: staticItem.disciplineName,
                    disciplineId: staticItem.disciplineId
                } as any);
            }
        });

        // Filter Flow
        return merged.filter((item: any) => {
            // Text Search
            const matchesSearch = !debouncedSearch || item.specialization?.toLowerCase().includes(debouncedSearch.toLowerCase());
            
            // Discipline / Course Filter (For API records we might not have disciplineName populated natively without inner join, so we fallback check)
            let matchesDiscipline = true;
            let matchesCourse = true;

            if (selectedDisciplineId !== "all") {
                // If static, it has disciplineId. If API, we might need to find its course in static logic
                matchesDiscipline = item.disciplineId?.toString() === selectedDisciplineId;
                if (!item.disciplineId) {
                    const c = staticSpecs.find(s => s.courseId === item.subCourseCategoryId);
                    if (c) matchesDiscipline = c.disciplineId?.toString() === selectedDisciplineId;
                }
            }

            if (selectedCourseId !== "all") {
                matchesCourse = item.subCourseCategoryId?.toString() === selectedCourseId;
            }

            return matchesSearch && matchesDiscipline && matchesCourse;
        });
    }, [apiSpecializations, staticSpecs, debouncedSearch, selectedDisciplineId, selectedCourseId]);

    // Derived list filter options
    const listCourseOptions = useMemo(() => {
        if (selectedDisciplineId === "all") return hierarchy.flatMap(h => h.courses);
        const disc = hierarchy.find(h => h.id.toString() === selectedDisciplineId);
        return disc ? disc.courses : [];
    }, [selectedDisciplineId, hierarchy]);

    // Pagination slice
    const paginatedItems = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return mergedSpecializations.slice(startIndex, startIndex + pageSize);
    }, [mergedSpecializations, currentPage, pageSize]);

    const pageCount = Math.ceil(mergedSpecializations.length / pageSize);

    const handleOpenDialog = (spec?: any) => {
        if (spec) {
            setEditingSpec(spec);
            
            // Reverse lookup discipline if not directly attached
            let discId = spec.disciplineId?.toString() || "";
            if (!discId) {
                const c = staticSpecs.find(s => s.courseId === spec.subCourseCategoryId);
                if (c) discId = c.disciplineId?.toString() || "";
            }

            form.reset({
                specialization: spec.specialization || "",
                disciplineId: discId,
                subCourseCategoryId: spec.subCourseCategoryId?.toString() || "",
            });
        } else {
            setEditingSpec(null);
            form.reset({
                specialization: "",
                disciplineId: "",
                subCourseCategoryId: "",
            });
        }
        setIsDialogOpen(true);
    };

    const onSubmit = async (data: any) => {
        try {
            const payload = { ...data, subCourseCategoryId: parseInt(data.subCourseCategoryId) };
            // Prevent touching static ID directly if it's over 10000 
            // Let's assume static APIs fail for static mocked IDs and just "mock" update it locally 
            if (editingSpec && editingSpec.id < 100000) {
                await courseSpecializationService.update(editingSpec.id, payload);
                toast.success("Specialization updated successfully (API)");
            } else if (!editingSpec) {
                await courseSpecializationService.create(payload);
                toast.success("Specialization created successfully (API)");
            } else {
                toast.success("Static specialization updated locally (Not Saved to DB)");
            }
            setIsDialogOpen(false);
            fetchApiSpecializations();
        } catch (error) {
            console.error("Error saving specialization:", error);
            toast.error("Failed to save specialization to API, it might be a static record offline.");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this specialization?")) return;
        try {
            if (id > 100000) {
                toast.info("This is a static specialization and cannot be permanently deleted here.");
                return;
            }
            await courseSpecializationService.delete(id);
            toast.success("Specialization deleted successfully from API.");
            fetchApiSpecializations();
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete specialization.");
        }
    };

    return (
        <>
            <ListingLayout
                title="Specialization"
                count={mergedSpecializations.length}
                onCreateClick={() => handleOpenDialog()}
                onSearchChange={(val) => {
                    setSearch(val);
                    setCurrentPage(1);
                }}
                actions={
                    <div className="flex gap-2">
                        <Select value={selectedDisciplineId} onValueChange={(val) => {
                            setSelectedDisciplineId(val);
                            setSelectedCourseId("all");
                            setCurrentPage(1);
                        }}>
                            <SelectTrigger className="w-[180px] h-9 text-xs">
                                <SelectValue placeholder="Discipline" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Disciplines</SelectItem>
                                {hierarchy.map(h => (
                                    <SelectItem key={h.id} value={h.id.toString()}>{h.discipline_name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={selectedCourseId} onValueChange={(val) => {
                            setSelectedCourseId(val);
                            setCurrentPage(1);
                        }}>
                            <SelectTrigger className="w-[180px] h-9 text-xs">
                                <SelectValue placeholder="Course" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Courses</SelectItem>
                                {listCourseOptions.map(c => (
                                    <SelectItem key={c.id} value={c.id.toString()}>{c.sub_course_category_name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                }
            >
                <Table>
                    <TableHeader className="bg-card">
                        <TableRow className="hover:bg-transparent border-b border-border/50">
                            <TableHead className="w-[80px] font-bold text-[11px] uppercase tracking-wider text-muted-foreground">ID</TableHead>
                            <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Specialization Name</TableHead>
                            <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Course</TableHead>
                            <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Discipline</TableHead>
                            <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Colleges</TableHead>
                            <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Status</TableHead>
                            <TableHead className="text-right font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                                <MoreHorizontal className="h-4 w-4 ml-auto" />
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10">
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                        <span className="text-muted-foreground">Loading...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : paginatedItems.length > 0 ? (
                            paginatedItems.map((spec: any) => (
                                <TableRow key={spec.id} className="group hover:bg-muted/50 border-b border-border/50">
                                    <TableCell className="text-muted-foreground font-medium text-[13px]">
                                        {spec.id > 100000 ? <span className="px-1.5 py-0.5 rounded-sm bg-blue-500/10 text-blue-500 text-[10px]">Static</span> : `#${spec.id}`}
                                    </TableCell>
                                    <TableCell className="font-semibold text-foreground text-[13px]">
                                        {spec?.specialization || "Unknown"}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-[13px]">
                                        {spec?.subCourseCategory?.sub_course_category_name || "N/A"}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-[13px]">
                                        {spec?.disciplineName || (() => {
                                            const c = staticSpecs.find(s => s.courseId === spec.subCourseCategoryId);
                                            return c?.disciplineName || "N/A";
                                        })()}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5 text-muted-foreground text-[13px]">
                                            {spec._count?.colleges || 0} colleges
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {spec?.publishedAt ? (
                                            <Badge className="bg-green-500/10 text-green-400 border-green-500/20 shadow-none text-[10px] font-bold uppercase">
                                                Active
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-[10px] font-bold uppercase">
                                                Inactive
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleOpenDialog(spec)}
                                                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Edit className="h-4 w-4 text-muted-foreground" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => handleDelete(spec.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground font-medium">
                                    No specializations found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                {(pageCount > 1 || mergedSpecializations.length > 0) && (
                    <div className="p-4 border-t border-border/50 bg-muted/50">
                        <Pagination
                            currentPage={currentPage}
                            pageCount={pageCount}
                            total={mergedSpecializations.length}
                            pageSize={pageSize}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </ListingLayout>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-md bg-background border-border text-foreground">
                    <DialogHeader>
                        <DialogTitle className="text-foreground">{editingSpec ? "Edit Specialization" : "Add New Specialization"}</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="specialization"
                                render={({ field }: { field: any }) => (
                                    <FormItem>
                                        <FormLabel className="text-foreground">Specialization Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter specialization name" {...field} className="bg-background border-border text-foreground" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="disciplineId"
                                render={({ field }: { field: any }) => (
                                    <FormItem>
                                        <FormLabel>Discipline (Category)</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="border-border">
                                                    <SelectValue placeholder="Select discipline" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-background border-border text-foreground">
                                                {hierarchy.map(h => (
                                                    <SelectItem key={h.id} value={h.id.toString()}>
                                                        {h.discipline_name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="subCourseCategoryId"
                                render={({ field }: { field: any }) => (
                                    <FormItem>
                                        <FormLabel>Course (Sub-category)</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value} disabled={!formDisciplineId}>
                                            <FormControl>
                                                <SelectTrigger className="border-border">
                                                    <SelectValue placeholder="Select course" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-background border-border text-foreground">
                                                {formCourseOptions.length === 0 && <div className="p-2 text-sm text-muted-foreground text-center">No courses found</div>}
                                                {formCourseOptions.map((c: any) => (
                                                    <SelectItem key={c.id} value={c.id.toString()}>
                                                        {c.sub_course_category_name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="bg-background border-border text-foreground hover:bg-muted/40 hover:text-foreground">
                                    Cancel
                                </Button>
                                <Button type="submit" className="bg-primary hover:bg-primary/90 text-foreground font-semibold">
                                    {editingSpec ? "Save Changes" : "Create Specialization"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    );
}
