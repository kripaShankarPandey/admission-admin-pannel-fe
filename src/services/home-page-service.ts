import { apiClient } from "@/lib/api-client";

export interface HomeRunningTextItem {
  text: string;
  featured: boolean;
}

export interface HomeBannerItem {
  title: string;
  image: string;
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
  runningText: HomeRunningTextItem[] | null;
  categories?: HomeSelectionItem[] | null;
  popularCourses?: HomeSelectionItem[] | null;
  topColleges?: HomeSelectionItem[] | null;
  reviews?: HomeReviewItem[] | null;
  seoData?: {
    metaTitle?: string;
    metaDescription?: string;
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
};
