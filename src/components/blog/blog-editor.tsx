"use client";

/* eslint-disable @next/next/no-img-element */
import { useState, useRef, useCallback, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { blogCategoryService, type BlogCategory } from "@/services/blog-category-service";
import { type Blog } from "@/services/blog-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/rich-text-editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Upload, X, Plus, Tag } from "lucide-react";
import { toast } from "sonner";
import {
  estimateJsonPayloadSize,
  optimizeImageFileToDataUrl,
} from "@/lib/client-image";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";

export type BlogEditorValues = {
  title: string;
  slug: string;
  banner: string;
  excerpt: string;
  description: string;
  meta_title: string;
  meta_description: string;
  keywords: string;
  categoryId: string;
  published: boolean;
  /** ISO string; when in the future the post is scheduled, not live. */
  publishAt: string;
};

export type BlogEditorPayload = {
  title: string;
  slug: string;
  banner: string;
  excerpt?: string;
  description: string;
  meta_title?: string;
  meta_description?: string;
  keywords?: string;
  categoryId?: number;
  publishedAt?: string;
};

interface BlogEditorProps {
  mode: "create" | "edit";
  initialData?: Blog | null;
  isSaving: boolean;
  onCancel: () => void;
  onSubmit: (payload: BlogEditorPayload) => Promise<void>;
}

const getDefaultValues = (initialData?: Blog | null): BlogEditorValues => ({
  title: initialData?.title || "",
  slug: initialData?.slug || "",
  banner: initialData?.banner || "",
  excerpt: initialData?.excerpt || "",
  description: initialData?.description || "",
  meta_title: initialData?.meta_title || "",
  meta_description: initialData?.meta_description || "",
  keywords: initialData?.keywords || "",
  categoryId: initialData?.categoryId ? String(initialData.categoryId) : "",
  published: Boolean(initialData?.publishedAt),
  publishAt: initialData?.publishedAt
    ? new Date(initialData.publishedAt).toISOString().slice(0, 16)
    : "",
});

export function BlogEditor({
  mode,
  initialData,
  isSaving,
  onCancel,
  onSubmit,
}: BlogEditorProps) {
  const [bannerPreview, setBannerPreview] = useState(initialData?.banner || "");
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<BlogEditorValues>({
    defaultValues: getDefaultValues(initialData),
  });

  useUnsavedChanges(isDirty);

  const selectedCategoryId = watch("categoryId");

  useEffect(() => {
    reset(getDefaultValues(initialData));
    setBannerPreview(initialData?.banner || "");
  }, [initialData, reset]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await blogCategoryService.getAll({ pageSize: 100 });
        setCategories(response.data || []);
      } catch (error) {
        console.error("Failed to fetch blog categories:", error);
        toast.error("Failed to load blog categories.");
      }
    };

    void fetchCategories();
  }, []);

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setValue("title", value);

    if (mode === "create" || !watch("slug")) {
      const autoSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setValue("slug", autoSlug);
    }
  };

  const handleBannerUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      event.target.value = "";

      try {
        const optimizedImage = await optimizeImageFileToDataUrl(file, {
          maxWidth: 1600,
          maxHeight: 900,
          quality: 0.82,
        });
        setBannerPreview(optimizedImage);
        setValue("banner", optimizedImage);
      } catch (error) {
        console.error("Failed to process blog banner:", error);
        toast.error("Failed to process the selected image.");
      }
    },
    [setValue],
  );

  const removeBanner = useCallback(() => {
    setBannerPreview("");
    setValue("banner", "");
  }, [setValue]);

  const handleCreateCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return;

    try {
      setIsCreatingCategory(true);
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      const created = await blogCategoryService.create({ name, slug });
      setCategories((prev) =>
        [...prev.filter((category) => category.id !== created.id), created].sort(
          (a, b) => a.name.localeCompare(b.name),
        ),
      );
      setValue("categoryId", String(created.id));
      setNewCategoryName("");
      toast.success("Blog category ready.");
    } catch (error) {
      console.error("Failed to create blog category:", error);
      toast.error("Failed to create blog category.");
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const submitForm = async (data: BlogEditorValues) => {
    const payload: BlogEditorPayload = {
      title: data.title,
      slug: data.slug,
      banner: data.banner,
      excerpt: data.excerpt || undefined,
      description: data.description,
      meta_title: data.meta_title || undefined,
      meta_description: data.meta_description || undefined,
      keywords: data.keywords || undefined,
      categoryId: data.categoryId ? Number(data.categoryId) : undefined,
      // A chosen date wins over "now": a future one schedules the post, which
      // the API hides from the public site until it arrives.
      publishedAt: data.published
        ? data.publishAt
          ? new Date(data.publishAt).toISOString()
          : new Date().toISOString()
        : undefined,
    };

    const payloadSize = estimateJsonPayloadSize(payload);
    const maxPayloadSize = 18 * 1024 * 1024;

    if (payloadSize > maxPayloadSize) {
      toast.error(
        "This blog is too large to save right now. Please reduce embedded images or banner size.",
      );
      return;
    }

    await onSubmit(payload);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-theme(spacing.16))] w-full bg-background">
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border/40 bg-background/95 backdrop-blur px-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">
              {mode === "create" ? "New Blog Post" : "Edit Blog Post"}
            </span>
            <span className="text-[10px] font-medium text-muted-foreground">
              {watch("published") ? "Published" : "Draft"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="h-8 px-3.5 text-xs font-semibold bg-transparent border-border/60 hover:bg-muted/50 rounded-lg"
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit(submitForm)}
            disabled={isSaving}
            className="h-8 px-4 text-xs font-semibold shadow-sm bg-foreground text-background hover:bg-foreground/90 rounded-lg flex items-center gap-1.5"
          >
            {isSaving ? (
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-background border-t-transparent" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            {mode === "create" ? "Save Blog" : "Update Blog"}
          </Button>
        </div>
      </header>

      <div className="flex-1 flex w-full">
        <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
          <div className="px-8 pt-10 pb-2">
            <input
              type="text"
              placeholder="Blog Title..."
              {...register("title", { required: "Title is required" })}
              onChange={handleTitleChange}
              className="w-full bg-transparent border-none text-3xl sm:text-4xl font-bold tracking-tight text-foreground placeholder:text-muted-foreground/25 focus:outline-none focus:ring-0 px-0 py-1"
              style={{ boxShadow: "none" }}
            />
            {errors.title && (
              <span className="text-xs font-medium text-destructive mt-1 block">
                {errors.title.message}
              </span>
            )}
          </div>

          <div className="flex-1 flex flex-col px-8">
            <div className="mb-5 space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Excerpt
              </Label>
              <Textarea
                placeholder="Write a short summary that will appear in blog cards and previews..."
                {...register("excerpt")}
                className="min-h-24 rounded-xl border-border/50 bg-background"
              />
            </div>

            <Controller
              control={control}
              name="description"
              rules={{ required: "Content is required" }}
              render={({ field }) => (
                <RichTextEditor
                  content={field.value}
                  onChange={field.onChange}
                  placeholder="Start writing your blog content..."
                />
              )}
            />
            {errors.description && (
              <span className="text-xs font-medium text-destructive mt-1">
                {errors.description.message}
              </span>
            )}
          </div>
        </div>

        <aside className="w-[340px] border-l border-border/40 bg-muted/5 p-5 flex flex-col gap-7 shrink-0 overflow-y-auto">
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Publishing
            </h3>
            <div className="p-3.5 bg-background border border-border/50 rounded-xl shadow-xs">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-[13px] font-semibold text-foreground">
                    Publish Now
                  </Label>
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    Go live immediately
                  </p>
                </div>
                <Controller
                  control={control}
                  name="published"
                  render={({ field }) => (
                    <button
                      type="button"
                      role="switch"
                      aria-checked={field.value}
                      onClick={() => field.onChange(!field.value)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors ${
                        field.value ? "bg-primary" : "bg-muted-foreground/30"
                      }`}
                    >
                      <span
                        className={`pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg transition-transform ${
                          field.value ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  )}
                />
              </div>

              {watch("published") && (
                <div className="mt-3 border-t border-border/60 pt-3">
                  <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Go live at
                  </Label>
                  <Controller
                    control={control}
                    name="publishAt"
                    render={({ field }) => (
                      <input
                        type="datetime-local"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    )}
                  />
                  <p className="mt-1.5 text-[10px] text-muted-foreground">
                    {watch("publishAt") &&
                    new Date(watch("publishAt")) > new Date()
                      ? "Scheduled — hidden from the site until this time."
                      : "Leave empty to publish immediately."}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Category & SEO
            </h3>
            <div className="space-y-1.5">
              <Label className="text-[13px] font-semibold text-foreground">
                Blog Category
              </Label>
              <Select
                value={selectedCategoryId}
                onValueChange={(value) => setValue("categoryId", value)}
              >
                <SelectTrigger className="h-9 bg-background border-border/50 text-sm rounded-lg shadow-xs">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 rounded-xl border border-border/50 bg-background p-3.5">
              <Label className="text-[11px] font-medium text-muted-foreground">
                Quick add category
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. Admission News"
                  value={newCategoryName}
                  onChange={(event) => setNewCategoryName(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      void handleCreateCategory();
                    }
                  }}
                  className="h-9"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCreateCategory}
                  disabled={!newCategoryName.trim() || isCreatingCategory}
                  className="h-9 shrink-0"
                >
                  {isCreatingCategory ? "..." : <Plus className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[13px] font-semibold text-foreground">
                URL Slug
              </Label>
              <Input
                placeholder="auto-generated-slug"
                {...register("slug", { required: "Slug is required" })}
                className="h-9 bg-background border-border/50 text-sm rounded-lg shadow-xs"
              />
              {errors.slug && (
                <span className="text-[10px] font-medium text-destructive">
                  {errors.slug.message}
                </span>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px] font-semibold text-foreground">
                Meta Title
              </Label>
              <Input
                placeholder="SEO title for search results"
                {...register("meta_title")}
                className="h-9 bg-background border-border/50 text-sm rounded-lg shadow-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px] font-semibold text-foreground">
                Meta Description
              </Label>
              <Textarea
                placeholder="Short SEO description for this blog page"
                {...register("meta_description")}
                className="min-h-24 rounded-xl border-border/50 bg-background"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px] font-semibold text-foreground">
                Keywords
              </Label>
              <Input
                placeholder="admission news, mbbs counseling, college updates"
                {...register("keywords")}
                className="h-9 bg-background border-border/50 text-sm rounded-lg shadow-xs"
              />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Featured Image
            </h3>

            <div
              onClick={() => bannerInputRef.current?.click()}
              className="w-full aspect-[16/9] bg-muted/30 rounded-xl border-2 border-dashed border-border/50 overflow-hidden flex items-center justify-center relative cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-surface group"
            >
              {bannerPreview ? (
                <>
                  <img
                    src={bannerPreview}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                    onError={() => setBannerPreview("")}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">
                      Change Image
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      removeBanner();
                    }}
                    className="absolute top-2 right-2 h-6 w-6 bg-background/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-background transition-colors shadow-sm"
                  >
                    <X className="h-3 w-3 text-foreground" />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-muted-foreground/40 gap-2 px-4 text-center">
                  <div className="h-10 w-10 rounded-full bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <Upload className="h-5 w-5 group-hover:text-primary transition-colors" />
                  </div>
                  <span className="text-[11px] font-semibold text-muted-foreground/60">
                    Click to upload cover image
                  </span>
                  <span className="text-[9px] text-muted-foreground/40">
                    PNG, JPG, GIF up to 10MB
                  </span>
                </div>
              )}
            </div>

            <input
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleBannerUpload}
            />

            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium text-muted-foreground">
                Or paste image URL
              </Label>
              <Input
                placeholder="https://example.com/cover.jpg"
                {...register("banner", {
                  required: "Featured image is required",
                })}
                onChange={(event) => {
                  setValue("banner", event.target.value);
                  setBannerPreview(event.target.value);
                }}
                className="h-9 bg-background border-border/50 text-sm rounded-lg shadow-xs"
              />
              {errors.banner && (
                <span className="text-[10px] font-medium text-destructive">
                  {errors.banner.message}
                </span>
              )}
            </div>
            <div className="rounded-xl border border-border/50 bg-background p-3.5 text-xs text-muted-foreground">
              <div className="mb-2 flex items-center gap-2 font-semibold text-foreground">
                <Tag className="h-3.5 w-3.5 text-primary" />
                SEO checklist
              </div>
              <ul className="space-y-1">
                <li>Use a focused primary keyword in the title.</li>
                <li>Keep meta title concise and intent-driven.</li>
                <li>Write a unique meta description for click-through.</li>
                <li>Add a clean excerpt for cards and previews.</li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
