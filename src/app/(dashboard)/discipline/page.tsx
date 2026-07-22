"use client";

/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Edit, Image as ImageIcon, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { uploadImage } from "@/lib/upload";
import { courseCategoryService, type CourseCategory } from "@/services/course-category-service";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDebounce } from "@/hooks/use-debounce";
import { TableStateRow } from "@/components/content-manager/table-state-row";

type DisciplineFormValues = {
  courses_category_name: string;
  description: string;
  color: string;
  icon: string;
  priority: number;
};

type DisciplineRow = CourseCategory & {
  priority?: number;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<DisciplineRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<DisciplineRow | null>(null);
  const [iconPreview, setIconPreview] = useState("");
  const iconInputRef = useRef<HTMLInputElement>(null);
  const debouncedSearch = useDebounce(search, 500);
  const pageSize = 20;

  const form = useForm<DisciplineFormValues>({
    defaultValues: {
      courses_category_name: "",
      description: "",
      color: "#10b981",
      icon: "",
      priority: 1,
    },
  });

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await courseCategoryService.getAll({ page: 1, pageSize: 9999 });
      setCategories((response.data || []) as DisciplineRow[]);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch disciplines.");
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const { paginatedRows, totalCount, pageCount } = useMemo(() => {
    let rows = [...categories];
    rows.sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999));
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      rows = rows.filter((row) => row.courses_category_name.toLowerCase().includes(query));
    }
    const total = rows.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (currentPage - 1) * pageSize;
    return { paginatedRows: rows.slice(start, start + pageSize), totalCount: total, pageCount: totalPages };
  }, [categories, currentPage, debouncedSearch]);

  const handleIconUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const url = await uploadImage(file, "disciplines");
      setIconPreview(url);
      form.setValue("icon", url);
    } catch {
      toast.error("Icon upload failed.");
    }
  };

  const removeIcon = () => {
    setIconPreview("");
    form.setValue("icon", "");
  };

  const handleOpenDialog = (row: DisciplineRow | null = null) => {
    setEditingCategory(row);
    form.reset({
      courses_category_name: row?.courses_category_name || "",
      description: row?.description || "",
      color: row?.color || "#10b981",
      icon: row?.icon || "",
      priority: row?.priority ?? 1,
    });
    setIconPreview(row?.icon || "");
    setIsDialogOpen(true);
  };

  const onSubmit = async (values: DisciplineFormValues) => {
    try {
      const payload = {
        courses_category_name: values.courses_category_name,
        description: values.description || undefined,
        color: values.color || undefined,
        icon: values.icon,
        priority: Number(values.priority),
      };
      if (editingCategory) {
        await courseCategoryService.update(editingCategory.id, payload);
        toast.success("Discipline updated successfully.");
      } else {
        await courseCategoryService.create(payload);
        toast.success("Discipline created successfully.");
      }
      setIsDialogOpen(false);
      await fetchCategories();
    } catch (error: unknown) {
      console.error("Error saving discipline:", error);
      toast.error("Failed to save discipline.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this discipline?")) return;
    try {
      await courseCategoryService.delete(id);
      toast.success("Discipline deleted successfully.");
      await fetchCategories();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete discipline.");
    }
  };

  return (
    <>
      <ListingLayout
        title="Discipline"
        description="Manage top-level course disciplines, their display priority, and associated iconography."
        count={totalCount}
        onCreateClick={() => handleOpenDialog()}
        createLabel="Add discipline"
        onSearchChange={(value) => { setSearch(value); setCurrentPage(1); }}
        searchPlaceholder="Search disciplines..."
      >
        <Table>
          <TableHeader className="bg-card">
            <TableRow className="hover:bg-transparent border-b border-border/50">
              <TableHead className="w-[60px] font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Priority</TableHead>
              <TableHead className="w-[60px] font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Image</TableHead>
              <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Discipline Name</TableHead>
              <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Description</TableHead>
              <TableHead className="w-[80px] font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Color</TableHead>
              <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Courses</TableHead>
              <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Status</TableHead>
              <TableHead className="text-right font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableStateRow colSpan={8} isLoading emptyLabel="" />
            ) : paginatedRows.length > 0 ? (
              paginatedRows.map((row) => (
                <TableRow
                  key={row.id}
                  className="group hover:bg-muted/50 border-b border-border/50"
                >
                  <TableCell>
                    <span
                      className="inline-flex items-center justify-center h-6 w-6 rounded-md text-[11px] font-bold text-white"
                      style={{ backgroundColor: row.color || "#10b981" }}
                    >
                      {row.priority ?? "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {row.icon ? (
                      <div className="h-9 w-9 rounded-lg overflow-hidden bg-muted/50 border border-border/40">
                        <img src={row.icon} alt={row.courses_category_name} className="h-full w-full object-cover" />
                      </div>
                    ) : (
                      <div
                        className="h-9 w-9 rounded-lg border border-border/30 flex items-center justify-center"
                        style={{ backgroundColor: row.color ? `${row.color}18` : undefined }}
                      >
                        <ImageIcon className="h-4 w-4 text-muted-foreground/30" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: row.color || "#10b981" }}
                      />
                      <span className="font-semibold text-foreground text-[13px]">
                        {row.courses_category_name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-[12px] max-w-[200px]">
                    {row.description ? (
                      <span className="line-clamp-1">{row.description}</span>
                    ) : (
                      <span className="text-muted-foreground/40 italic text-[11px]">No description</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {row.color ? (
                      <div className="flex items-center gap-2">
                        <span
                          className="h-6 w-6 rounded-md border border-border/30 shadow-sm shrink-0"
                          style={{ backgroundColor: row.color }}
                        />
                        <span className="text-[11px] text-muted-foreground font-mono">{row.color}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground/40 italic text-[11px]">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-[13px]">
                    {row._count?.subCourseCategories !== undefined
                      ? `${row._count.subCourseCategories} items`
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {row.publishedAt ? (
                      <Badge className="bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20 shadow-none text-[10px] font-bold uppercase py-0 px-2">
                        Published
                      </Badge>
                    ) : (
                      <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20 hover:bg-orange-500/20 shadow-none text-[10px] font-bold uppercase py-0 px-2">
                        Draft
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(row)}
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Edit className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDelete(row.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableStateRow colSpan={8} emptyLabel="No disciplines found." />
            )}
          </TableBody>
        </Table>

        {totalCount > pageSize && (
          <div className="p-4 border-t border-border/50 bg-muted/20">
            <Pagination
              currentPage={currentPage}
              pageCount={pageCount}
              total={totalCount}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </ListingLayout>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md bg-background border-border text-foreground">
          <DialogHeader>
            {/* Color preview strip at top of dialog */}
            <div
              className="absolute top-0 left-0 right-0 h-1 rounded-t-lg transition-colors duration-200"
              style={{ backgroundColor: form.watch("color") || "#10b981" }}
            />
            <DialogTitle className="text-foreground">
              {editingCategory ? "Edit Discipline" : "Add New Discipline"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="courses_category_name"
                rules={{ required: "Name is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Discipline Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Engineering"
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Description</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Programs focused on technical and applied sciences"
                        {...field}
                        className="bg-background border-border text-foreground"
                      />
                    </FormControl>
                    <p className="text-[11px] text-muted-foreground">One-line description shown on the website</p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Brand Color</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <input
                            type="color"
                            value={field.value || "#10b981"}
                            onChange={(e) => field.onChange(e.target.value)}
                            className="h-10 w-14 cursor-pointer rounded-lg border border-border bg-background p-1"
                          />
                        </div>
                        <Input
                          placeholder="#10b981"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value)}
                          className="bg-background border-border text-foreground font-mono text-sm"
                        />
                        {field.value && (
                          <div
                            className="h-9 w-9 rounded-lg border border-border/50 shrink-0 shadow-sm"
                            style={{ backgroundColor: field.value }}
                          />
                        )}
                      </div>
                    </FormControl>
                    <p className="text-[11px] text-muted-foreground">Used for accent color on website cards</p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Priority Order</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={100}
                        placeholder="1"
                        {...field}
                        onChange={(event) => field.onChange(Number(event.target.value))}
                        className="bg-background border-border text-foreground"
                      />
                    </FormControl>
                    <p className="text-[11px] text-muted-foreground">Lower number = higher priority</p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="icon"
                render={() => (
                  <FormItem>
                    <FormLabel className="text-foreground">Image</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <div
                          onClick={() => iconInputRef.current?.click()}
                          className="w-full h-28 bg-muted/30 rounded-xl border-2 border-dashed border-border/50 overflow-hidden flex items-center justify-center relative cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-surface group"
                        >
                          {iconPreview ? (
                            <>
                              <img src={iconPreview} alt="Preview" className="h-full w-full object-contain p-2" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-white text-xs font-semibold">Change Image</span>
                              </div>
                              <button
                                type="button"
                                onClick={(event) => { event.stopPropagation(); removeIcon(); }}
                                className="absolute top-1.5 right-1.5 h-5 w-5 bg-background/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-background transition-colors shadow-sm"
                              >
                                <X className="h-3 w-3 text-foreground" />
                              </button>
                            </>
                          ) : (
                            <div className="flex flex-col items-center justify-center gap-1.5 text-muted-foreground/40">
                              <Upload className="h-5 w-5 group-hover:text-primary transition-colors" />
                              <span className="text-[11px] font-semibold">Click to upload image</span>
                            </div>
                          )}
                        </div>
                        <input
                          ref={iconInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleIconUpload}
                        />
                      </div>
                    </FormControl>
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
                  className="text-white"
                  style={{ backgroundColor: form.watch("color") || "#10b981" }}
                >
                  {editingCategory ? "Save Changes" : "Create Discipline"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
