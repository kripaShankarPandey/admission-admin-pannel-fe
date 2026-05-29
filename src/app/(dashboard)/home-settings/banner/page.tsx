"use client";

/* eslint-disable @next/next/no-img-element */
import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import {
  homePageService,
  type HomeBannerItem,
} from "@/services/home-page-service";
import { optimizeImageFileToDataUrl } from "@/lib/client-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Save,
  Plus,
  Trash2,
  Upload,
  X,
  Image as ImageIcon,
  ArrowUp,
  ArrowDown,
  Info,
  LayoutPanelTop,
} from "lucide-react";
import { cn } from "@/lib/utils";

const RECOMMENDED_SIZE = "1920 × 640 px  (16:5 landscape, max 5 MB)";

const emptySlide = (): HomeBannerItem => ({
  title: "",
  subtitle: "",
  image: "",
  ctaText: "",
  ctaUrl: "",
});

interface SlideCardProps {
  slide: HomeBannerItem;
  index: number;
  total: number;
  onChange: (updated: HomeBannerItem) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}

function SlideCard({
  slide,
  index,
  total,
  onChange,
  onMoveUp,
  onMoveDown,
  onDelete,
}: SlideCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10 MB.");
      return;
    }
    setUploading(true);
    try {
      const dataUrl = await optimizeImageFileToDataUrl(file, {
        maxWidth: 1920,
        maxHeight: 640,
        quality: 0.88,
      });
      onChange({ ...slide, image: dataUrl });
    } catch {
      toast.error("Failed to process image.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Card header */}
      <div className="flex items-center justify-between border-b border-border/60 bg-muted/20 px-5 py-3">
        <span className="text-sm font-semibold text-foreground">
          Slide {index + 1}
          {index === 0 && (
            <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
              FIRST
            </span>
          )}
        </span>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            disabled={index === 0}
            onClick={onMoveUp}
            title="Move up"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            disabled={index === total - 1}
            onClick={onMoveDown}
            title="Move down"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={onDelete}
            title="Delete slide"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 p-5 lg:grid-cols-[280px_1fr]">
        {/* Image column */}
        <div className="space-y-3">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Background Image
          </Label>

          {slide.image ? (
            <div className="relative overflow-hidden rounded-lg border border-border">
              <img
                src={slide.image}
                alt={`Slide ${index + 1}`}
                className="h-36 w-full object-cover"
              />
              <button
                type="button"
                onClick={() => onChange({ ...slide, image: "" })}
                className="absolute right-2 top-2 rounded-full bg-destructive p-1 text-white hover:opacity-80"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="flex h-36 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border hover:border-primary/50 hover:bg-accent/20 transition-colors"
            >
              {uploading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              ) : (
                <>
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Click to upload</span>
                </>
              )}
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageFile}
          />

          <Input
            placeholder="Or paste image URL…"
            value={slide.image.startsWith("data:") ? "" : slide.image}
            onChange={(e) => onChange({ ...slide, image: e.target.value })}
            className="text-xs"
          />

          <div className="flex items-start gap-1.5 rounded-lg bg-muted/50 p-2.5">
            <Info className="h-3.5 w-3.5 shrink-0 text-muted-foreground mt-0.5" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Recommended: <span className="font-semibold text-foreground">{RECOMMENDED_SIZE}</span>
            </p>
          </div>
        </div>

        {/* Text fields column */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor={`title-${index}`} className="text-xs font-semibold">
              Headline <span className="text-destructive">*</span>
            </Label>
            <Input
              id={`title-${index}`}
              placeholder="Find Your Dream College."
              value={slide.title}
              onChange={(e) => onChange({ ...slide, title: e.target.value })}
            />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor={`subtitle-${index}`} className="text-xs font-semibold">
              Subtitle
            </Label>
            <Textarea
              id={`subtitle-${index}`}
              placeholder="Expert admission counselling. Verified college data. Personalised guidance."
              rows={2}
              value={slide.subtitle ?? ""}
              onChange={(e) => onChange({ ...slide, subtitle: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`cta-text-${index}`} className="text-xs font-semibold">
              CTA Button Text
            </Label>
            <Input
              id={`cta-text-${index}`}
              placeholder="Explore Colleges"
              value={slide.ctaText ?? ""}
              onChange={(e) => onChange({ ...slide, ctaText: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`cta-url-${index}`} className="text-xs font-semibold">
              CTA Button URL
            </Label>
            <Input
              id={`cta-url-${index}`}
              placeholder="/colleges"
              value={slide.ctaUrl ?? ""}
              onChange={(e) => onChange({ ...slide, ctaUrl: e.target.value })}
            />
          </div>

          {/* Live preview strip */}
          {(slide.title || slide.image) && (
            <div className="sm:col-span-2 rounded-lg border border-border/60 overflow-hidden">
              <div
                className="relative flex min-h-[80px] items-center px-5 py-4"
                style={{
                  background: slide.image
                    ? `linear-gradient(to right, rgba(11,45,110,0.95) 0%, rgba(11,45,110,0.7) 60%, transparent 100%), url(${slide.image}) center/cover no-repeat`
                    : "linear-gradient(135deg, #0B2D6E 0%, #1e40af 100%)",
                }}
              >
                <div>
                  {slide.title && (
                    <p className="text-sm font-bold text-white leading-snug">
                      {slide.title}
                    </p>
                  )}
                  {slide.subtitle && (
                    <p className="text-[11px] text-white/70 mt-0.5 line-clamp-1">
                      {slide.subtitle}
                    </p>
                  )}
                  {slide.ctaText && (
                    <span className="mt-2 inline-block rounded-lg bg-orange-500 px-3 py-1 text-[10px] font-bold text-white">
                      {slide.ctaText}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BannerPage() {
  const [slides, setSlides] = useState<HomeBannerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadBanner = useCallback(async () => {
    try {
      const data = await homePageService.getBanner();
      setSlides(data.length > 0 ? data : [emptySlide()]);
    } catch {
      toast.error("Failed to load banner settings.");
      setSlides([emptySlide()]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadBanner(); }, [loadBanner]);

  const updateSlide = (index: number, updated: HomeBannerItem) => {
    setSlides((prev) => prev.map((s, i) => (i === index ? updated : s)));
  };

  const addSlide = () => {
    if (slides.length >= 5) {
      toast.info("Maximum 5 banner slides allowed.");
      return;
    }
    setSlides((prev) => [...prev, emptySlide()]);
  };

  const deleteSlide = (index: number) => {
    if (slides.length === 1) {
      toast.info("At least one slide is required.");
      return;
    }
    setSlides((prev) => prev.filter((_, i) => i !== index));
  };

  const moveSlide = (from: number, to: number) => {
    setSlides((prev) => {
      const arr = [...prev];
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return arr;
    });
  };

  const handleSave = async () => {
    const valid = slides.filter((s) => s.title.trim());
    if (valid.length === 0) {
      toast.error("At least one slide needs a headline.");
      return;
    }
    setIsSaving(true);
    try {
      await homePageService.updateBanner(slides);
      toast.success("Banner saved successfully.");
    } catch {
      toast.error("Failed to save banner.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="sticky top-0 z-20 -mx-6 border-b border-border/50 bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border/60 bg-card text-primary">
              <LayoutPanelTop className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Homepage Banners
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage hero banner slides — image, headline, subtitle and CTA button.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={addSlide}
              disabled={slides.length >= 5}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Slide
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="gap-2">
              <Save className="h-4 w-4" />
              {isSaving ? "Saving…" : "Save Banner"}
            </Button>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          ["Total Slides", slides.length],
          ["With Image", slides.filter((s) => s.image).length],
          ["With CTA", slides.filter((s) => s.ctaText).length],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-border/50 bg-card p-4 shadow-xs">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {label}
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">{value}</div>
          </div>
        ))}
      </div>

      {/* Slides */}
      <div className="space-y-4">
        {slides.map((slide, index) => (
          <SlideCard
            key={index}
            slide={slide}
            index={index}
            total={slides.length}
            onChange={(updated) => updateSlide(index, updated)}
            onMoveUp={() => moveSlide(index, index - 1)}
            onMoveDown={() => moveSlide(index, index + 1)}
            onDelete={() => deleteSlide(index)}
          />
        ))}
      </div>

      {/* Add slide CTA */}
      {slides.length < 5 && (
        <button
          type="button"
          onClick={addSlide}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
        >
          <Plus className="h-4 w-4" />
          Add another slide ({slides.length}/5)
        </button>
      )}

      {/* Sticky save */}
      <div className="sticky bottom-4 flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="gap-2 shadow-lg"
        >
          <Save className="h-4 w-4" />
          {isSaving ? "Saving…" : "Save Banner"}
        </Button>
      </div>
    </div>
  );
}
