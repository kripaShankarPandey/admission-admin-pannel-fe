import { apiClient } from "@/lib/api-client";
import { PaginatedResponse } from "./types";

export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogCategoryQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export const blogCategoryService = {
  async getAll(params?: BlogCategoryQueryParams) {
    const response = await apiClient.get<PaginatedResponse<BlogCategory>>("/blog-category", { params });
    return response.data;
  },

  async getOne(id: number) {
    const response = await apiClient.get<BlogCategory>(`/blog-category/${id}`);
    return response.data;
  },

  async create(data: Partial<BlogCategory>) {
    const response = await apiClient.post<BlogCategory>("/blog-category", data);
    return response.data;
  },

  async update(id: number, data: Partial<BlogCategory>) {
    const response = await apiClient.put<BlogCategory>(`/blog-category/${id}`, data);
    return response.data;
  },

  async delete(id: number) {
    const response = await apiClient.delete(`/blog-category/${id}`);
    return response.data;
  },
};
