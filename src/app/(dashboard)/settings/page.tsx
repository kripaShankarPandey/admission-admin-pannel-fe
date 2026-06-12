"use client";

/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  globalSettingsService,
  type GlobalSettings,
} from "@/services/global-settings-service";
import { homePageService } from "@/services/home-page-service";
import { optimizeImageFileToDataUrl } from "@/lib/client-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Save,
  Globe,
  Phone,
  Mail,
  Share2,
  BarChart2,
  Upload,
  X,
  Info,
  Search,
  ExternalLink,
} from "lucide-react";

type FormValues = Omit<GlobalSettings, "id" | "updatedAt" | "defaultSeo">;

function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-3 border-b border-border/60 bg-muted/20 px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-card text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function FieldRow({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold">{label}</Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function ImageUploadField({
  value,
  onChange,
  label,
  hint,
  previewSize = "md",
}: {
  value: string | null | undefined;
  onChange: (v: string) => void;
  label: string;
  hint?: string;
  previewSize?: "sm" | "md" | "lg";
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const sizes = {
    sm: "h-10 w-10",
    md: "h-14 w-14",
    lg: "h-20 w-32",
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Upload an image file.");
      return;
    }
    setUploading(true);
    try {
      const dataUrl = await optimizeImageFileToDataUrl(file, {
        maxWidth: 1200,
        maxHeight: 630,
        quality: 0.9,
      });
      onChange(dataUrl);
    } catch {
      toast.error("Failed to process image.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold">{label}</Label>
      <div className="flex items-center gap-3">
        {value ? (
          <div
            className={`relative ${sizes[previewSize]} rounded-lg overflow-hidden border border-border bg-muted/30 shrink-0`}
          >
            <img
              src={value}
              alt="preview"
              className="h-full w-full object-contain p-1"
            />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute right-0.5 top-0.5 rounded-full bg-destructive p-0.5 text-white"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={uploading}
            onClick={() => ref.current?.click()}
            className={`flex ${sizes[previewSize]} shrink-0 flex-col items-center justify-center rounded-lg border-2 border-dashed border-border hover:border-primary/50 hover:bg-accent/20 transition-colors gap-1`}
          >
            {uploading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : (
              <>
                <Upload className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-[9px] text-muted-foreground font-medium">Upload</span>
              </>
            )}
          </button>
        )}
        <div className="flex-1 space-y-1.5">
          <Input
            placeholder="Or paste image URL…"
            value={value?.startsWith("data:") ? "" : (value ?? "")}
            onChange={(e) => onChange(e.target.value)}
            className="text-xs"
          />
          {!value && (
            <button
              type="button"
              disabled={uploading}
              onClick={() => ref.current?.click()}
              className="inline-flex items-center gap-1.5 text-[11px] text-primary hover:text-primary/80 font-medium transition-colors"
            >
              <Upload className="h-3 w-3" />
              Choose file
            </button>
          )}
        </div>
      </div>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [seoLoading, setSeoLoading] = useState(true);
  const [seoSaving, setSeoSaving] = useState(false);
  const [seoData, setSeoData] = useState({
    metaTitle: "",
    metaDescription: "",
    keywords: "",
    ogImage: "",
  });

  const { register, handleSubmit, reset, watch, setValue } =
    useForm<FormValues>({
      defaultValues: {
        siteName: "",
        siteDescription: "",
        favicon: "",
        logoUrl: "",
        phone: "",
        email: "",
        address: "",
        whatsappNumber: "",
        businessHours: "",
        tagline: "",
        companyDescription: "",
        socialFacebook: "",
        socialTwitter: "",
        socialInstagram: "",
        socialYoutube: "",
        socialLinkedin: "",
        statStudents: "",
        statColleges: "",
        statSuccessRate: "",
        statYears: "",
      },
    });

  const loadSettings = useCallback(async () => {
    try {
      const data = await globalSettingsService.get();
      reset({
        siteName: data.siteName ?? "",
        siteDescription: data.siteDescription ?? "",
        favicon: data.favicon ?? "",
        logoUrl: data.logoUrl ?? "",
        phone: data.phone ?? "",
        email: data.email ?? "",
        address: data.address ?? "",
        whatsappNumber: data.whatsappNumber ?? "",
        businessHours: data.businessHours ?? "",
        tagline: data.tagline ?? "",
        companyDescription: data.companyDescription ?? "",
        socialFacebook: data.socialFacebook ?? "",
        socialTwitter: data.socialTwitter ?? "",
        socialInstagram: data.socialInstagram ?? "",
        socialYoutube: data.socialYoutube ?? "",
        socialLinkedin: data.socialLinkedin ?? "",
        statStudents: data.statStudents ?? "",
        statColleges: data.statColleges ?? "",
        statSuccessRate: data.statSuccessRate ?? "",
        statYears: data.statYears ?? "",
      });
    } catch {
      toast.error("Failed to load settings.");
    } finally {
      setIsLoading(false);
    }
  }, [reset]);

  const loadSeoSettings = useCallback(async () => {
    try {
      const home = await homePageService.getSettings();
      const s = home.seoData as Record<string, string> | null | undefined;
      setSeoData({
        metaTitle: s?.metaTitle ?? "",
        metaDescription: s?.metaDescription ?? "",
        keywords: s?.keywords ?? "",
        ogImage: s?.ogImage ?? "",
      });
    } catch {
      toast.error("Failed to load SEO data.");
    } finally {
      setSeoLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
    loadSeoSettings();
  }, [loadSettings, loadSeoSettings]);

  const saveSeo = async () => {
    setSeoSaving(true);
    try {
      await homePageService.updateSettings({
        seoData: {
          metaTitle: seoData.metaTitle || null,
          metaDescription: seoData.metaDescription || null,
          keywords: seoData.keywords || null,
          ogImage: seoData.ogImage || null,
        } as Record<string, unknown>,
      });
      toast.success("Home page SEO saved.");
    } catch {
      toast.error("Failed to save SEO.");
    } finally {
      setSeoSaving(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    setIsSaving(true);
    try {
      const clean: Partial<FormValues> = {};
      for (const [k, v] of Object.entries(values)) {
        (clean as Record<string, unknown>)[k] = v === "" ? null : v;
      }
      await globalSettingsService.update(clean);
      toast.success("Settings saved.");
    } catch {
      toast.error("Failed to save settings.");
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

  const titleLen = seoData.metaTitle.length;
  const descLen = seoData.metaDescription.length;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-10">
      {/* ── Header ── */}
      <div className="sticky top-0 z-20 -mx-6 border-b border-border/50 bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border/60 bg-card text-primary">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Global Settings
              </h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Site-wide configuration — identity, contact, social, and SEO.
              </p>
            </div>
          </div>
          <Button type="submit" disabled={isSaving} className="gap-2">
            <Save className="h-4 w-4" />
            {isSaving ? "Saving…" : "Save Settings"}
          </Button>
        </div>
      </div>

      {/* ── Home Page SEO ── */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center gap-3 border-b border-border/60 bg-muted/20 px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-card text-primary">
            <Search className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-foreground">
              Home Page SEO
            </h2>
            <p className="text-xs text-muted-foreground">
              Meta tags shown in Google search results and social shares.
            </p>
          </div>
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            Preview frontend
          </a>
        </div>
        <div className="p-5 space-y-5">
          {(seoData.metaTitle || seoData.metaDescription) && (
            <div className="rounded-lg border border-border/60 bg-muted/20 p-4 space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Google Preview
              </p>
              <p className="text-[17px] font-medium text-blue-600 hover:underline cursor-pointer leading-tight">
                {seoData.metaTitle || "Page Title"}
              </p>
              <p className="text-[13px] text-green-700">admissiontoday.in</p>
              <p className="text-[13px] text-gray-600 leading-snug">
                {seoData.metaDescription || "Page description will appear here…"}
              </p>
            </div>
          )}

          {seoLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              Loading…
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold">Meta Title</Label>
                    <span
                      className={`text-[11px] font-medium ${
                        titleLen > 60
                          ? "text-destructive"
                          : titleLen > 50
                            ? "text-amber-500"
                            : "text-muted-foreground"
                      }`}
                    >
                      {titleLen}/60
                    </span>
                  </div>
                  <Input
                    value={seoData.metaTitle}
                    onChange={(e) =>
                      setSeoData((p) => ({ ...p, metaTitle: e.target.value }))
                    }
                    placeholder="Admission Today — Find Your Perfect College"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Browser tab & Google title. Under 60 chars.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Keywords</Label>
                  <Input
                    value={seoData.keywords}
                    onChange={(e) =>
                      setSeoData((p) => ({ ...p, keywords: e.target.value }))
                    }
                    placeholder="college admission, NEET 2026, JEE, MBA"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Comma-separated keywords.
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold">
                    Meta Description
                  </Label>
                  <span
                    className={`text-[11px] font-medium ${
                      descLen > 160
                        ? "text-destructive"
                        : descLen > 140
                          ? "text-amber-500"
                          : "text-muted-foreground"
                    }`}
                  >
                    {descLen}/160
                  </span>
                </div>
                <Textarea
                  value={seoData.metaDescription}
                  onChange={(e) =>
                    setSeoData((p) => ({
                      ...p,
                      metaDescription: e.target.value,
                    }))
                  }
                  rows={2}
                  placeholder="India's trusted platform for NEET, JEE, CAT & CLAT college admissions."
                />
                <p className="text-[11px] text-muted-foreground">
                  Google search snippet. 120–160 characters.
                </p>
              </div>

              <ImageUploadField
                label="OG Image"
                hint="Social share preview image — 1200×630 px recommended. Shown when sharing on WhatsApp, Twitter, Facebook."
                value={seoData.ogImage}
                onChange={(v) => setSeoData((p) => ({ ...p, ogImage: v }))}
                previewSize="lg"
              />

              <div className="flex items-center justify-between pt-1 gap-4">
                <div className="flex items-start gap-1.5 rounded-lg bg-muted/50 p-2.5 flex-1">
                  <Info className="h-3.5 w-3.5 shrink-0 text-muted-foreground mt-0.5" />
                  <p className="text-[11px] text-muted-foreground">
                    Changes are live within ~5 minutes (ISR). Force refresh in
                    dev with{" "}
                    <code className="font-mono bg-muted px-1 rounded">
                      revalidate=0
                    </code>
                    .
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={saveSeo}
                  disabled={seoSaving}
                  className="gap-2 shrink-0"
                >
                  <Save className="h-4 w-4" />
                  {seoSaving ? "Saving…" : "Save SEO"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Site Identity ── */}
      <Section
        icon={Globe}
        title="Site Identity"
        description="Brand name, logo, favicon, and site description."
      >
        <div className="grid grid-cols-1 gap-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FieldRow label="Site Name *">
              <Input
                {...register("siteName")}
                placeholder="Admission Today"
              />
            </FieldRow>
            <FieldRow
              label="Site Description"
              hint="Short tagline shown in search results."
            >
              <Input
                {...register("siteDescription")}
                placeholder="India's trusted admission platform"
              />
            </FieldRow>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ImageUploadField
              label="Logo"
              hint="Displayed in navbar & footer. PNG or SVG, recommended 200×60 px."
              value={watch("logoUrl")}
              onChange={(v) => setValue("logoUrl", v)}
              previewSize="lg"
            />
            <ImageUploadField
              label="Favicon"
              hint="Browser tab icon — 32×32 or 64×64 px ICO/PNG."
              value={watch("favicon")}
              onChange={(v) => setValue("favicon", v)}
              previewSize="sm"
            />
          </div>

          <FieldRow
            label="Company Description"
            hint="Shown in the footer brand column."
          >
            <Textarea
              {...register("companyDescription")}
              rows={3}
              placeholder="India's most trusted platform for college admissions. Expert counselling, verified data, and personalised guidance — all free."
            />
          </FieldRow>
        </div>
      </Section>

      {/* ── Contact & Business ── */}
      <Section
        icon={Phone}
        title="Contact & Business"
        description="Phone, email, address, WhatsApp, business hours, and tagline."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FieldRow label="Phone" hint="Shown in navbar top bar and footer.">
            <Input {...register("phone")} placeholder="+91 80000 00000" />
          </FieldRow>
          <FieldRow label="Email" hint="Shown in navbar and footer.">
            <Input
              {...register("email")}
              placeholder="info@admissiontoday.in"
            />
          </FieldRow>
          <FieldRow label="WhatsApp Number" hint="Digits only, with country code.">
            <Input
              {...register("whatsappNumber")}
              placeholder="+918000000000"
            />
          </FieldRow>
          <FieldRow label="Business Hours" hint="Shown in navbar top bar.">
            <Input
              {...register("businessHours")}
              placeholder="Mon–Sat, 9AM–6PM"
            />
          </FieldRow>
          <FieldRow label="Address">
            <Input {...register("address")} placeholder="New Delhi, India" />
          </FieldRow>
          <FieldRow
            label="Tagline"
            hint="Short line shown in navbar top bar."
          >
            <Input
              {...register("tagline")}
              placeholder="India's trusted admission counselling platform"
            />
          </FieldRow>
        </div>
      </Section>

      {/* ── Stats ── */}
      <Section
        icon={BarChart2}
        title="Stats & Numbers"
        description="Key figures shown on the homepage stats bar and footer."
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <FieldRow label="Students Guided">
            <Input {...register("statStudents")} placeholder="50,000+" />
          </FieldRow>
          <FieldRow label="Partner Colleges">
            <Input {...register("statColleges")} placeholder="500+" />
          </FieldRow>
          <FieldRow label="Success Rate">
            <Input {...register("statSuccessRate")} placeholder="98%" />
          </FieldRow>
          <FieldRow label="Years of Expertise">
            <Input {...register("statYears")} placeholder="15+" />
          </FieldRow>
        </div>
      </Section>

      {/* ── Social Media ── */}
      <Section
        icon={Share2}
        title="Social Media"
        description="Full URLs for social profile links in the footer."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {(
            [
              {
                key: "socialFacebook" as const,
                label: "Facebook",
                placeholder: "https://facebook.com/admissiontoday",
              },
              {
                key: "socialTwitter" as const,
                label: "Twitter / X",
                placeholder: "https://twitter.com/admissiontoday",
              },
              {
                key: "socialInstagram" as const,
                label: "Instagram",
                placeholder: "https://instagram.com/admissiontoday",
              },
              {
                key: "socialYoutube" as const,
                label: "YouTube",
                placeholder: "https://youtube.com/@admissiontoday",
              },
              {
                key: "socialLinkedin" as const,
                label: "LinkedIn",
                placeholder: "https://linkedin.com/company/admissiontoday",
              },
            ] as const
          ).map(({ key, label, placeholder }) => (
            <FieldRow key={key} label={label}>
              <Input {...register(key)} placeholder={placeholder} />
            </FieldRow>
          ))}
        </div>
      </Section>

      {/* ── Sticky save footer ── */}
      <div className="sticky bottom-4 flex justify-end">
        <Button type="submit" disabled={isSaving} className="gap-2 shadow-lg">
          <Save className="h-4 w-4" />
          {isSaving ? "Saving…" : "Save Settings"}
        </Button>
      </div>
    </form>
  );
}
