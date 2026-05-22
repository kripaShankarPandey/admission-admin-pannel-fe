"use client";

import { useCallback, useEffect, useState } from "react";
import { Edit, Tag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ListingLayout } from "@/components/content-manager/listing-layout";
import { TableStateRow } from "@/components/content-manager/table-state-row";
import { useDebounce } from "@/hooks/use-debounce";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { blogCategoryService, type BlogCategory } from "@/services/blog-category-service";

type BlogCategoryFormState = {
  name: string;
  slug: string;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default function BlogCategoriesPage() {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BlogCategory | null>(
    null,
  );
  const [formState, setFormState] = useState<BlogCategoryFormState>({
    name: "",
    slug: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await blogCategoryService.getAll({
        page: 1,
        pageSize: 500,
        search: debouncedSearch || undefined,
      });
      setCategories(response.data || []);
    } catch (error) {
      console.error("Failed to fetch blog categories:", error);
      toast.error("Failed to load blog categories.");
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  const openCreate = () => {
    setEditingCategory(null);
    setFormState({ name: "", slug: "" });
    setIsDialogOpen(true);
  };

  const openEdit = (category: BlogCategory) => {
    setEditingCategory(category);
    setFormState({
      name: category.name,
      slug: category.slug,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formState.name.trim() || !formState.slug.trim()) {
      toast.error("Name and slug are required.");
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        name: formState.name.trim(),
        slug: formState.slug.trim(),
      };

      if (editingCategory) {
        await blogCategoryService.update(editingCategory.id, payload);
        toast.success("Blog category updated.");
      } else {
        await blogCategoryService.create(payload);
        toast.success("Blog category created.");
      }

      setIsDialogOpen(false);
      await fetchCategories();
    } catch (error) {
      console.error("Failed to save blog category:", error);
      toast.error("Failed to save blog category.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (category: BlogCategory) => {
    if (!confirm(`Delete ${category.name}?`)) return;

    try {
      await blogCategoryService.delete(category.id);
      toast.success("Blog category deleted.");
      await fetchCategories();
    } catch (error) {
      console.error("Failed to delete blog category:", error);
      toast.error("Failed to delete blog category.");
    }
  };

  return (
    <>
      <ListingLayout
        title="Blog Categories"
        description="Organize blog content into reusable ranking-friendly content buckets."
        count={categories.length}
        onCreateClick={openCreate}
        createLabel="Add category"
        onSearchChange={setSearch}
        searchPlaceholder="Search blog categories..."
      >
        <Table>
          <TableHeader className="bg-card">
            <TableRow className="hover:bg-transparent border-b border-border/50">
              <TableHead className="w-[90px] font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                ID
              </TableHead>
              <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                Category
              </TableHead>
              <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                Slug
              </TableHead>
              <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                Blogs
              </TableHead>
              <TableHead className="text-right font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableStateRow colSpan={5} isLoading emptyLabel="" />
            ) : categories.length > 0 ? (
              categories.map((category) => (
                <TableRow
                  key={category.id}
                  className="group hover:bg-muted/50 border-b border-border/50"
                >
                  <TableCell className="text-muted-foreground font-medium text-[13px]">
                    #{category.id}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Tag className="h-4 w-4" />
                      </div>
                      <span className="font-semibold text-foreground text-[13px]">
                        {category.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-[13px] font-medium">
                    {category.slug}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-[13px]">
                    {category._count?.blogs ?? 0}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => openEdit(category)}
                      >
                        <Edit className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDelete(category)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableStateRow colSpan={5} emptyLabel="No blog categories found." />
            )}
          </TableBody>
        </Table>
      </ListingLayout>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Blog Category" : "Add Blog Category"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input
                value={formState.name}
                onChange={(event) => {
                  const name = event.target.value;
                  setFormState((current) => ({
                    ...current,
                    name,
                    slug:
                      editingCategory && current.slug
                        ? current.slug
                        : slugify(name),
                  }));
                }}
                placeholder="e.g. Admission News"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Slug</Label>
              <Input
                value={formState.slug}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    slug: slugify(event.target.value),
                  }))
                }
                placeholder="admission-news"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleSave} disabled={isSaving}>
              {isSaving
                ? "Saving..."
                : editingCategory
                  ? "Save Changes"
                  : "Create Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
