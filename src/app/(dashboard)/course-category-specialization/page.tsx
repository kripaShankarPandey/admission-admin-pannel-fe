"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { courseCategoryService, type CourseCategory } from "@/services/course-category-service";
import {
  courseSpecializationService,
  type CourseCategorySpecialization,
} from "@/services/course-specialization-service";
import {
  subCourseCategoryService,
  type SubCourseCategory,
} from "@/services/sub-course-category-service";
import { ListingLayout } from "@/components/content-manager/listing-layout";
import { Pagination } from "@/components/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDebounce } from "@/hooks/use-debounce";
import { TableStateRow } from "@/components/content-manager/table-state-row";

type SpecializationFormValues = {
  specialization: string;
  disciplineId: string;
  subCourseCategoryId: string;
};

export default function SpecializationsPage() {
  const [specializations, setSpecializations] = useState<
    CourseCategorySpecialization[]
  >([]);
  const [disciplines, setDisciplines] = useState<CourseCategory[]>([]);
  const [courses, setCourses] = useState<SubCourseCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSpecialization, setEditingSpecialization] =
    useState<CourseCategorySpecialization | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedDisciplineId, setSelectedDisciplineId] = useState("all");
  const [selectedCourseId, setSelectedCourseId] = useState("all");
  const debouncedSearch = useDebounce(search, 300);
  const pageSize = 15;

  const form = useForm<SpecializationFormValues>({
    defaultValues: {
      specialization: "",
      disciplineId: "",
      subCourseCategoryId: "",
    },
  });

  const formDisciplineId = form.watch("disciplineId");

  useEffect(() => {
    if (!editingSpecialization && formDisciplineId) {
      form.setValue("subCourseCategoryId", "");
    }
  }, [editingSpecialization, form, formDisciplineId]);

  const formCourseOptions = useMemo(() => {
    if (!formDisciplineId) {
      return [];
    }

    return courses.filter(
      (course) => course.courseCategoryId?.toString() === formDisciplineId,
    );
  }, [courses, formDisciplineId]);

  const fetchPageData = async () => {
    setIsLoading(true);
    try {
      const [specializationsResponse, disciplinesResponse, coursesResponse] =
        await Promise.all([
          courseSpecializationService.getAll({ page: 1, pageSize: 500 }),
          courseCategoryService.getAll({ page: 1, pageSize: 500 }),
          subCourseCategoryService.getAll({ page: 1, pageSize: 2000 }),
        ]);

      setSpecializations(specializationsResponse.data || []);
      setDisciplines(disciplinesResponse.data || []);
      setCourses(coursesResponse.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch specializations.");
      setSpecializations([]);
      setDisciplines([]);
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchPageData();
  }, []);

  const filteredSpecializations = useMemo(() => {
    return specializations.filter((item) => {
      const matchesSearch =
        !debouncedSearch ||
        item.specialization?.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesDiscipline =
        selectedDisciplineId === "all" ||
        item.subCourseCategory?.courseCategoryId?.toString() ===
          selectedDisciplineId;
      const matchesCourse =
        selectedCourseId === "all" ||
        item.subCourseCategoryId?.toString() === selectedCourseId;

      return matchesSearch && matchesDiscipline && matchesCourse;
    });
  }, [debouncedSearch, selectedCourseId, selectedDisciplineId, specializations]);

  const listCourseOptions = useMemo(() => {
    if (selectedDisciplineId === "all") {
      return courses;
    }

    return courses.filter(
      (course) => course.courseCategoryId?.toString() === selectedDisciplineId,
    );
  }, [courses, selectedDisciplineId]);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredSpecializations.slice(startIndex, startIndex + pageSize);
  }, [currentPage, filteredSpecializations]);

  const pageCount = Math.ceil(filteredSpecializations.length / pageSize);

  const handleOpenDialog = (spec?: CourseCategorySpecialization) => {
    setEditingSpecialization(spec || null);

    form.reset({
      specialization: spec?.specialization || "",
      disciplineId: spec?.subCourseCategory?.courseCategoryId?.toString() || "",
      subCourseCategoryId: spec?.subCourseCategoryId?.toString() || "",
    });

    setIsDialogOpen(true);
  };

  const onSubmit = async (values: SpecializationFormValues) => {
    try {
      const payload = {
        specialization: values.specialization,
        subCourseCategoryId: Number(values.subCourseCategoryId),
      };

      if (editingSpecialization) {
        await courseSpecializationService.update(editingSpecialization.id, payload);
        toast.success("Specialization updated successfully.");
      } else {
        await courseSpecializationService.create(payload);
        toast.success("Specialization created successfully.");
      }

      setIsDialogOpen(false);
      await fetchPageData();
    } catch (error) {
      console.error("Error saving specialization:", error);
      toast.error("Failed to save specialization.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this specialization?")) {
      return;
    }

    try {
      await courseSpecializationService.delete(id);
      toast.success("Specialization deleted successfully.");
      await fetchPageData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete specialization.");
    }
  };

  return (
    <>
      <ListingLayout
        title="Specialization"
        description="Manage course specializations and map them to the correct discipline and course."
        count={filteredSpecializations.length}
        onCreateClick={() => handleOpenDialog()}
        createLabel="Add specialization"
        onSearchChange={(value) => {
          setSearch(value);
          setCurrentPage(1);
        }}
        searchPlaceholder="Search specializations..."
        actions={
          <div className="flex gap-2">
            <Select
              value={selectedDisciplineId}
              onValueChange={(value) => {
                setSelectedDisciplineId(value);
                setSelectedCourseId("all");
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[180px] h-9 text-xs">
                <SelectValue placeholder="Discipline" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Disciplines</SelectItem>
                {disciplines.map((discipline) => (
                  <SelectItem
                    key={discipline.id}
                    value={discipline.id.toString()}
                  >
                    {discipline.courses_category_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedCourseId}
              onValueChange={(value) => {
                setSelectedCourseId(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[180px] h-9 text-xs">
                <SelectValue placeholder="Course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {listCourseOptions.map((course) => (
                  <SelectItem key={course.id} value={course.id.toString()}>
                    {course.sub_course_category_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      >
        <Table>
          <TableHeader className="bg-card">
            <TableRow className="hover:bg-transparent border-b border-border/50">
              <TableHead className="w-[80px] font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                ID
              </TableHead>
              <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                Specialization Name
              </TableHead>
              <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                Course
              </TableHead>
              <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                Discipline
              </TableHead>
              <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                Colleges
              </TableHead>
              <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                Status
              </TableHead>
              <TableHead className="text-right font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                <MoreHorizontal className="h-4 w-4 ml-auto" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableStateRow colSpan={7} isLoading emptyLabel="" />
            ) : paginatedItems.length > 0 ? (
              paginatedItems.map((spec) => (
                <TableRow
                  key={spec.id}
                  className="group hover:bg-muted/50 border-b border-border/50"
                >
                  <TableCell className="text-muted-foreground font-medium text-[13px]">
                    #{spec.id}
                  </TableCell>
                  <TableCell className="font-semibold text-foreground text-[13px]">
                    {spec.specialization || "Unknown"}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-[13px]">
                    {spec.subCourseCategory?.sub_course_category_name || "N/A"}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-[13px]">
                    {spec.subCourseCategory?.courseCategory?.courses_category_name ||
                      "N/A"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-muted-foreground text-[13px]">
                      {spec._count?.colleges || 0} colleges
                    </div>
                  </TableCell>
                  <TableCell>
                    {spec.publishedAt ? (
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
              <TableStateRow colSpan={7} emptyLabel="No specializations found." />
            )}
          </TableBody>
        </Table>

        {(pageCount > 1 || filteredSpecializations.length > 0) && (
          <div className="p-4 border-t border-border/50 bg-muted/50">
            <Pagination
              currentPage={currentPage}
              pageCount={pageCount}
              total={filteredSpecializations.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </ListingLayout>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md bg-background border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingSpecialization
                ? "Edit Specialization"
                : "Add New Specialization"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="specialization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">
                      Specialization Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter specialization name"
                        {...field}
                        className="bg-background border-border text-foreground"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="disciplineId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discipline</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-border">
                          <SelectValue placeholder="Select discipline" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-background border-border text-foreground">
                        {disciplines.map((discipline) => (
                          <SelectItem
                            key={discipline.id}
                            value={discipline.id.toString()}
                          >
                            {discipline.courses_category_name}
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
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!formDisciplineId}
                    >
                      <FormControl>
                        <SelectTrigger className="border-border">
                          <SelectValue placeholder="Select course" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-background border-border text-foreground">
                        {formCourseOptions.length === 0 && (
                          <div className="p-2 text-sm text-muted-foreground text-center">
                            No courses found
                          </div>
                        )}
                        {formCourseOptions.map((course) => (
                          <SelectItem
                            key={course.id}
                            value={course.id.toString()}
                          >
                            {course.sub_course_category_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="bg-background border-border text-foreground hover:bg-muted/40 hover:text-foreground"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-foreground font-semibold"
                >
                  {editingSpecialization ? "Save Changes" : "Create Specialization"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
