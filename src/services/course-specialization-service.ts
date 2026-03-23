import { apiClient } from "@/lib/api-client";
import { PaginatedResponse } from "./types";

export interface CourseCategorySpecialization {
  id: number;
  specialization: string;
  subCourseCategoryId?: number;
  subCourseCategory?: {
    sub_course_category_name: string;
  };
  _count?: {
    colleges: number;
  };
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface SpecializationQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export const courseSpecializationService = {
  async getAll(params?: SpecializationQueryParams) {
    const response = await apiClient.get<PaginatedResponse<CourseCategorySpecialization>>("/course-category-specialization", { params });
    return response.data;
  },

  async getOne(id: number) {
    const response = await apiClient.get<CourseCategorySpecialization>(`/course-category-specialization/${id}`);
    return response.data;
  },

  async create(data: Partial<CourseCategorySpecialization>) {
    const response = await apiClient.post<CourseCategorySpecialization>("/course-category-specialization", data);
    return response.data;
  },

  async update(id: number, data: Partial<CourseCategorySpecialization>) {
    const response = await apiClient.put<CourseCategorySpecialization>(`/course-category-specialization/${id}`, data);
    return response.data;
  },

  async delete(id: number) {
    const response = await apiClient.delete(`/course-category-specialization/${id}`);
    return response.data;
  },
};
