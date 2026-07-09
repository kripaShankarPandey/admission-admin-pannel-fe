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
}

export interface SubCategoryQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  courseCategoryId?: number;
  courseLevel?: string;
}

export interface CourseBulkUploadResult {
  totalRows: number;
  created: number;
  updated: number;
  failed: number;
  errors: Array<{ row: number; name?: string; message: string }>;
}

export const subCourseCategoryService = {
  async getAll(params?: SubCategoryQueryParams) {
    const response = await apiClient.get<PaginatedResponse<SubCourseCategory>>("/sub-course-category", { params });
    return response.data;
  },

  async bulkUpload(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post<CourseBulkUploadResult>(
      "/sub-course-category/bulk-upload",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data;
  },

  async downloadBulkUploadTemplate() {
    const response = await apiClient.get<Blob>(
      "/sub-course-category/bulk-upload-template",
      { responseType: "blob" },
    );
    return response.data;
  },

  async getOne(idOrSlug: number | string) {
    const response = await apiClient.get<SubCourseCategory>(`/sub-course-category/${idOrSlug}`);
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
