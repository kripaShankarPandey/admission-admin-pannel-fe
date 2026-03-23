import { apiClient } from "@/lib/api-client";
import { PaginatedResponse } from "./types";

export interface CourseCategory {
  id: number;
  courses_category_name: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  _count?: {
    subCourseCategories: number;
  };
}

export interface CategoryQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export const courseCategoryService = {
  async getAll(params?: CategoryQueryParams) {
    const response = await apiClient.get<PaginatedResponse<CourseCategory>>("/course-category", { params });
    return response.data;
  },

  async getOne(id: number) {
    const response = await apiClient.get<CourseCategory>(`/course-category/${id}`);
    return response.data;
  },

  async create(data: Partial<CourseCategory>) {
    const response = await apiClient.post<CourseCategory>("/course-category", data);
    return response.data;
  },

  async update(id: number, data: Partial<CourseCategory>) {
    const response = await apiClient.put<CourseCategory>(`/course-category/${id}`, data);
    return response.data;
  },

  async delete(id: number) {
    const response = await apiClient.delete(`/course-category/${id}`);
    return response.data;
  },
};
