import { apiClient } from "@/lib/api-client";
import { PaginatedResponse } from "./types";

export interface Blog {
  id: number;
  title: string;
  slug: string;
  banner: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface BlogQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export const blogService = {
  async getAll(params?: BlogQueryParams) {
    const response = await apiClient.get<PaginatedResponse<Blog>>("/blog", { params });
    return response.data;
  },

  async getOne(id: number) {
    const response = await apiClient.get<Blog>(`/blog/${id}`);
    return response.data;
  },

  async getBySlug(slug: string) {
    const response = await apiClient.get<Blog>(`/blog/slug/${slug}`);
    return response.data;
  },

  async create(data: Partial<Blog>) {
    const response = await apiClient.post<Blog>("/blog", data);
    return response.data;
  },

  async update(id: number, data: Partial<Blog>) {
    const response = await apiClient.put<Blog>(`/blog/${id}`, data);
    return response.data;
  },

  async delete(id: number) {
    const response = await apiClient.delete(`/blog/${id}`);
    return response.data;
  },
};
