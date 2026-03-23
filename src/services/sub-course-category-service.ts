import { apiClient } from "@/lib/api-client";
import { PaginatedResponse } from "./types";

export interface SubCourseCategory {
  id: number;
  sub_course_category_name: string;
  slug: string;
  courses_image?: string;
  isFeatured: boolean;
  details?: string;
  courseCategoryId?: number;
  courseCategory?: {
    courses_category_name: string;
  };
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  _count?: {
    courseCategorySpecializations: number;
  };
}

export interface SubCategoryQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  courseCategoryId?: number;
}

export const subCourseCategoryService = {
  async getAll(params?: SubCategoryQueryParams) {
    const response = await apiClient.get<PaginatedResponse<SubCourseCategory>>("/sub-course-category", { params });
    return response.data;
  },

  async getOne(id: number) {
    const response = await apiClient.get<SubCourseCategory>(`/sub-course-category/${id}`);
    return response.data;
  },

  async create(data: Partial<SubCourseCategory>) {
    const response = await apiClient.post<SubCourseCategory>("/sub-course-category", data);
    return response.data;
  },

  async update(id: number, data: Partial<SubCourseCategory>) {
    const response = await apiClient.put<SubCourseCategory>(`/sub-course-category/${id}`, data);
    return response.data;
  },

  async delete(id: number) {
    const response = await apiClient.delete(`/sub-course-category/${id}`);
    return response.data;
  },
};
