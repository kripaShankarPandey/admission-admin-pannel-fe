"use client";

/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  globalSettingsService,
  type GlobalSettings,
} from "@/services/global-settings-service";
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
  MapPin,
  Clock,
  Share2,
  BarChart2,
  Image as ImageIcon,
  Upload,
  X,
  Info,
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
}: {
  value: string | null | undefined;
  onChange: (v: string) => void;
  label: string;
  hint?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Upload an image file."); return; }
    setUploading(true);
    try {
      const dataUrl = await optimizeImageFileToDataUrl(file, { maxWidth: 512, maxHeight: 512, quality: 0.9 });
      onChange(dataUrl);
    } catch { toast.error("Failed to process image."); }
    finally { setUploading(false); }
  };

  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold">{label}</Label>
      <div className="flex items-center gap-3">
        {value ? (
          <div className="relative h-14 w-14 rounded-lg overflow-hidden border border-border bg-muted/30 shrink-0">
            <img src={value} alt="preview" className="h-full w-full object-contain p-1" />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute right-0.5 top-0.5 rounded-full bg-destructive p-0.5 text-white"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={uploading}
            onClick={() => ref.current?.click()}
            className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg border-2 border-dashed border-border hover:border-primary/50 hover:bg-accent/20 transition-colors"
          >
            {uploading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : (
              <Upload className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        )}
        <Input
          placeholder="Or paste image URL…"
          value={value?.startsWith("data:") ? "" : (value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          className="text-xs"
        />
      </div>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit, reset, watch, setValue } = useForm<FormValues>({
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

  useEffect(() => { loadSettings(); }, [loadSettings]);

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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-10">
      {/* Header */}
      <div className="sticky top-0 z-20 -mx-6 border-b border-border/50 bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border/60 bg-card text-primary">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Global Settings</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Site-wide configuration — contact info, social links, brand copy, stats.
              </p>
            </div>
          </div>
          <Button type="submit" disabled={isSaving} className="gap-2">
            <Save className="h-4 w-4" />
            {isSaving ? "Saving…" : "Save Settings"}
          </Button>
        </div>
      </div>

      {/* ── Site Identity ── */}
      <Section icon={Globe} title="Site Identity" description="Brand name, logo, favicon, and SEO description.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FieldRow label="Site Name *">
            <Input {...register("siteName")} placeholder="Admission Today" />
          </FieldRow>
          <FieldRow label="Site Description">
            <Input {...register("siteDescription")} placeholder="India's trusted admission platform" />
          </FieldRow>
          <div className="sm:col-span-2">
            <ImageUploadField
              label="Logo"
              hint="Displayed in navbar/footer. PNG or SVG recommended."
              value={watch("logoUrl")}
              onChange={(v) => setValue("logoUrl", v)}
            />
          </div>
          <ImageUploadField
            label="Favicon"
            hint="32×32 or 64×64 px ICO/PNG."
            value={watch("favicon")}
            onChange={(v) => setValue("favicon", v)}
          />
        </div>
      </Section>

      {/* ── Contact & Business ── */}
      <Section icon={Phone} title="Contact & Business" description="Phone, email, address, WhatsApp, and business hours.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FieldRow label="Phone" hint="Shown in navbar top bar and footer.">
            <Input {...register("phone")} placeholder="+91 80000 00000" />
          </FieldRow>
          <FieldRow label="Email" hint="mailto: link in navbar and footer.">
            <Input {...register("email")} placeholder="info@admissiontoday.in" />
          </FieldRow>
          <FieldRow label="Address">
            <Input {...register("address")} placeholder="New Delhi, India" />
          </FieldRow>
          <FieldRow label="WhatsApp Number" hint="Used for WhatsApp float button (digits only, with country code).">
            <Input {...register("whatsappNumber")} placeholder="+918000000000" />
          </FieldRow>
          <FieldRow label="Business Hours" hint="Shown in navbar top bar.">
            <Input {...register("businessHours")} placeholder="Mon–Sat, 9AM–6PM" />
          </FieldRow>
        </div>
      </Section>

      {/* ── Brand Copy ── */}
      <Section icon={Info} title="Brand Copy" description="Tagline and company description shown across the site.">
        <div className="grid grid-cols-1 gap-4">
          <FieldRow label="Tagline" hint="Short line shown in navbar top bar.">
            <Input {...register("tagline")} placeholder="India's trusted admission counselling platform" />
          </FieldRow>
          <FieldRow label="Company Description" hint="Shown in footer brand column.">
            <Textarea
              {...register("companyDescription")}
              rows={3}
              placeholder="India's most trusted platform for college admissions. Expert counselling, verified data, and personalised guidance — all free."
            />
          </FieldRow>
        </div>
      </Section>

      {/* ── Stats ── */}
      <Section icon={BarChart2} title="Stats & Numbers" description="Key figures displayed on homepage stats bar and footer.">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <FieldRow label="Students Count">
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
        <div className="mt-3 flex items-start gap-1.5 rounded-lg bg-muted/50 p-2.5">
          <Info className="h-3.5 w-3.5 shrink-0 text-muted-foreground mt-0.5" />
          <p className="text-[11px] text-muted-foreground">These numbers appear in the StatsBar section and footer trust strip.</p>
        </div>
      </Section>

      {/* ── Social Media ── */}
      <Section icon={Share2} title="Social Media" description="Full URLs for social profile links in the footer.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            { key: "socialFacebook" as const, label: "Facebook", placeholder: "https://facebook.com/admissiontoday" },
            { key: "socialTwitter" as const, label: "Twitter / X", placeholder: "https://twitter.com/admissiontoday" },
            { key: "socialInstagram" as const, label: "Instagram", placeholder: "https://instagram.com/admissiontoday" },
            { key: "socialYoutube" as const, label: "YouTube", placeholder: "https://youtube.com/@admissiontoday" },
            { key: "socialLinkedin" as const, label: "LinkedIn", placeholder: "https://linkedin.com/company/admissiontoday" },
          ].map(({ key, label, placeholder }) => (
            <FieldRow key={key} label={label}>
              <Input {...register(key)} placeholder={placeholder} />
            </FieldRow>
          ))}
        </div>
      </Section>

      {/* Sticky save footer */}
      <div className="sticky bottom-4 flex justify-end">
        <Button type="submit" disabled={isSaving} className="gap-2 shadow-lg">
          <Save className="h-4 w-4" />
          {isSaving ? "Saving…" : "Save Settings"}
        </Button>
      </div>
    </form>
  );
}
