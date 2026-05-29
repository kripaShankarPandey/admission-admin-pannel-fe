"use client";

/* eslint-disable @next/next/no-img-element */
import { useState, useRef, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { type LatestNews } from "@/services/latest-news-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/rich-text-editor";
import { ArrowLeft, Save, Upload, X, Star } from "lucide-react";
import { toast } from "sonner";
import { optimizeImageFileToDataUrl } from "@/lib/client-image";
import { Switch } from "@/components/ui/switch";

export type LatestNewsEditorValues = {
  title: string;
  slug: string;
  image: string;
  excerpt: string;
  content: string;
  source: string;
  source_url: string;
  is_featured: boolean;
  meta_title: string;
  meta_description: string;
  keywords: string;
  published: boolean;
};

export type LatestNewsEditorPayload = {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  image?: string;
  source?: string;
  source_url?: string;
  is_featured?: boolean;
  meta_title?: string;
  meta_description?: string;
  keywords?: string;
  publishedAt?: string;
};

interface Props {
  mode: "create" | "edit";
  initialData?: LatestNews | null;
  isSaving: boolean;
  onCancel: () => void;
  onSubmit: (payload: LatestNewsEditorPayload) => Promise<void>;
}

const getDefaultValues = (d?: LatestNews | null): LatestNewsEditorValues => ({
  title: d?.title ?? "",
  slug: d?.slug ?? "",
  image: d?.image ?? "",
  excerpt: d?.excerpt ?? "",
  content: d?.content ?? "",
  source: d?.source ?? "",
  source_url: d?.source_url ?? "",
  is_featured: d?.is_featured ?? false,
  meta_title: d?.meta_title ?? "",
  meta_description: d?.meta_description ?? "",
  keywords: d?.keywords ?? "",
  published: Boolean(d?.publishedAt),
});

function toSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
}

export function LatestNewsEditor({ mode, initialData, isSaving, onCancel, onSubmit }: Props) {
  const [imagePreview, setImagePreview] = useState(initialData?.image ?? "");
  const imageInputRef = useRef<HTMLInputElement>(null);

  const {
    register, handleSubmit, control, setValue, watch,
    formState: { errors },
  } = useForm<LatestNewsEditorValues>({ defaultValues: getDefaultValues(initialData) });

  const titleValue = watch("title");

  const handleImageChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await optimizeImageFileToDataUrl(file, { maxWidth: 1200, maxHeight: 800, quality: 0.85 });
      setValue("image", dataUrl);
      setImagePreview(dataUrl);
    } catch {
      toast.error("Failed to process image.");
    }
  }, [setValue]);

  const handleAutoSlug = () => {
    if (titleValue) setValue("slug", toSlug(titleValue));
  };

  const onFormSubmit = async (values: LatestNewsEditorValues) => {
    const payload: LatestNewsEditorPayload = {
      title: values.title,
      slug: values.slug,
      content: values.content,
      excerpt: values.excerpt || undefined,
      image: values.image || undefined,
      source: values.source || undefined,
      source_url: values.source_url || undefined,
      is_featured: values.is_featured,
      meta_title: values.meta_title || undefined,
      meta_description: values.meta_description || undefined,
      keywords: values.keywords || undefined,
      publishedAt: values.published ? new Date().toISOString() : undefined,
    };
    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button type="button" variant="ghost" size="sm" onClick={onCancel} className="gap-1.5">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              {mode === "create" ? "New Latest News" : "Edit Latest News"}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {mode === "create" ? "Add a news item to the homepage" : `Editing: ${initialData?.title}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
          <Button type="submit" size="sm" disabled={isSaving} className="gap-1.5">
            {isSaving ? <><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" /> Saving…</> : <><Save className="h-3.5 w-3.5" /> Save</>}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">

          {/* Title */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h2 className="text-sm font-semibold text-foreground">Content</h2>

            <div className="space-y-1.5">
              <Label htmlFor="title">Headline <span className="text-destructive">*</span></Label>
              <Input id="title" placeholder="NEET 2026 Registration Opens…" {...register("title", { required: "Headline is required" })} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="slug">
                Slug <span className="text-destructive">*</span>
                <button type="button" onClick={handleAutoSlug} className="ml-2 text-[10px] text-primary underline underline-offset-2 font-medium">Auto-generate</button>
              </Label>
              <Input id="slug" placeholder="neet-2026-registration-opens" {...register("slug", { required: "Slug is required", pattern: { value: /^[a-z0-9-]+$/, message: "Lowercase alphanumeric + hyphens only" } })} />
              {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="excerpt">Excerpt <span className="text-muted-foreground text-xs">(shown in news cards)</span></Label>
              <Textarea id="excerpt" placeholder="Short summary for card previews…" rows={2} {...register("excerpt")} />
            </div>

            <div className="space-y-1.5">
              <Label>Full Content <span className="text-destructive">*</span></Label>
              <Controller
                name="content"
                control={control}
                rules={{ required: "Content is required" }}
                render={({ field }) => (
                  <RichTextEditor
                    content={field.value}
                    onChange={field.onChange}
                    placeholder="Write the full news article…"
                  />
                )}
              />
              {errors.content && <p className="text-xs text-destructive">{errors.content.message}</p>}
            </div>
          </div>

          {/* SEO */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h2 className="text-sm font-semibold text-foreground">SEO</h2>
            <div className="space-y-1.5">
              <Label htmlFor="meta_title">Meta Title</Label>
              <Input id="meta_title" placeholder="NEET 2026 Registration | Admission Today" {...register("meta_title")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="meta_description">Meta Description</Label>
              <Textarea id="meta_description" rows={2} placeholder="NTA opens NEET 2026 registration from July 1…" {...register("meta_description")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="keywords">Keywords</Label>
              <Input id="keywords" placeholder="NEET 2026, NTA, medical admission" {...register("keywords")} />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">

          {/* Publish */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h2 className="text-sm font-semibold text-foreground">Publish</h2>
            <Controller
              name="published"
              control={control}
              render={({ field }) => (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Published</p>
                    <p className="text-xs text-muted-foreground">Visible on frontend</p>
                  </div>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </div>
              )}
            />
            <Controller
              name="is_featured"
              control={control}
              render={({ field }) => (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Star className="h-3.5 w-3.5 text-amber-500" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Featured</p>
                      <p className="text-xs text-muted-foreground">Pin at top with badge</p>
                    </div>
                  </div>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </div>
              )}
            />
          </div>

          {/* Cover image */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <h2 className="text-sm font-semibold text-foreground">Cover Image</h2>
            {imagePreview ? (
              <div className="relative rounded-lg overflow-hidden border border-border">
                <img src={imagePreview} alt="Cover" className="w-full h-36 object-cover" />
                <button
                  type="button"
                  onClick={() => { setValue("image", ""); setImagePreview(""); }}
                  className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:opacity-80"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="w-full h-28 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-accent/30 transition-colors"
              >
                <Upload className="h-5 w-5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Click to upload image</span>
              </button>
            )}
            <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            <Input placeholder="Or paste image URL…" {...register("image")} onChange={(e) => { register("image").onChange(e); setImagePreview(e.target.value); }} />
          </div>

          {/* Source */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h2 className="text-sm font-semibold text-foreground">Source</h2>
            <div className="space-y-1.5">
              <Label htmlFor="source">Source Name</Label>
              <Input id="source" placeholder="Times of India" {...register("source")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="source_url">Source URL</Label>
              <Input id="source_url" placeholder="https://timesofindia.com/…" {...register("source_url")} />
            </div>
          </div>

        </div>
      </div>
    </form>
  );
}
