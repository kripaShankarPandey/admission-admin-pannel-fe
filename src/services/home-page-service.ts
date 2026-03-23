import { apiClient } from "@/lib/api-client";

export interface HomePageSettings {
  id: number;
  banner: any[] | null;
  runningText: any[] | null;
  seoData: any | null;
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
