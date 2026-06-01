import { apiClient } from "@/lib/api-client";

export interface HomeBannerItem {
  title: string;
  subtitle?: string;
  image: string;
  ctaText?: string;
  ctaUrl?: string;
}

export interface HomeSelectionItem {
  id: number;
  name: string;
}

export interface HomeReviewItem {
  review: string;
  name: string;
  position: string;
}

export interface HomePageSettings {
  id: number;
  banner: HomeBannerItem[] | null;
  categories?: HomeSelectionItem[] | null;
  popularCourses?: HomeSelectionItem[] | null;
  topColleges?: HomeSelectionItem[] | null;
  reviews?: HomeReviewItem[] | null;
  seoData?: {
    metaTitle?: string;
    metaDescription?: string;
  } | null;
  seoContent?: {
    title?: string;
    introParagraph1?: string;
    introParagraph2?: string;
    disclaimer?: string;
    topics?: {
      heading: string;
      links: { label: string; href: string }[];
    }[];
    cities?: {
      city: string;
      href: string;
    }[];
    directoryTitle?: string;
    directorySubtitle?: string;
    quickLinks?: { label: string; href: string }[];
    examLinks?: { label: string; href: string }[];
  } | null;
  createdAt: string;
  updatedAt: string;
}

export const homePageService = {
  async getSettings() {
    const response = await apiClient.get<HomePageSettings>("/home-page");
    return response.data;
  },

  async updateSettings(data: Partial<HomePageSettings>) {
    const response = await apiClient.patch<HomePageSettings>("/home-page", data);
    return response.data;
  },

  async getBanner(): Promise<HomeBannerItem[]> {
    const response = await apiClient.get<{ banner: HomeBannerItem[] }>("/home-page/banner");
    return response.data.banner ?? [];
  },

  async updateBanner(banner: HomeBannerItem[]): Promise<void> {
    await apiClient.patch("/home-page/banner", { banner });
  },
};
