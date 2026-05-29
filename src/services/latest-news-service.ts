import { apiClient } from "@/lib/api-client";
import { PaginatedResponse } from "./types";

export interface LatestNews {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  image?: string;
  source?: string;
  source_url?: string;
  is_featured: boolean;
  meta_title?: string;
  meta_description?: string;
  keywords?: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LatestNewsQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  featured?: boolean;
  status?: "published" | "draft";
}

export const latestNewsService = {
  async getAll(params?: LatestNewsQueryParams) {
    const response = await apiClient.get<PaginatedResponse<LatestNews>>("/latest-news", { params });
    return response.data;
  },

  async getOne(id: number) {
    const response = await apiClient.get<LatestNews>(`/latest-news/${id}`);
    return response.data;
  },

  async getBySlug(slug: string) {
    const response = await apiClient.get<LatestNews>(`/latest-news/slug/${slug}`);
    return response.data;
  },

  async create(data: Partial<LatestNews>) {
    const response = await apiClient.post<LatestNews>("/latest-news", data);
    return response.data;
  },

  async update(id: number, data: Partial<LatestNews>) {
    const response = await apiClient.put<LatestNews>(`/latest-news/${id}`, data);
    return response.data;
  },

  async delete(id: number) {
    const response = await apiClient.delete(`/latest-news/${id}`);
    return response.data;
  },
};
