import { apiClient } from "@/lib/api-client";

export interface GlobalSettings {
  id: number;
  siteName: string;
  siteDescription: string;
  favicon?: string | null;
  logoUrl?: string | null;
  defaultSeo?: Record<string, unknown> | null;

  // Contact
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  whatsappNumber?: string | null;
  businessHours?: string | null;

  // Brand copy
  tagline?: string | null;
  companyDescription?: string | null;

  // Social
  socialFacebook?: string | null;
  socialTwitter?: string | null;
  socialInstagram?: string | null;
  socialYoutube?: string | null;
  socialLinkedin?: string | null;

  // Stats
  statStudents?: string | null;
  statColleges?: string | null;
  statSuccessRate?: string | null;
  statYears?: string | null;

  updatedAt: string;
}

export const globalSettingsService = {
  async get(): Promise<GlobalSettings> {
    const res = await apiClient.get<GlobalSettings>("/global");
    return res.data;
  },

  async update(data: Partial<GlobalSettings>): Promise<GlobalSettings> {
    const res = await apiClient.put<GlobalSettings>("/global", data);
    return res.data;
  },
};
