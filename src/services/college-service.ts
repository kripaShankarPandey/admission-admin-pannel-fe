import { apiClient } from "@/lib/api-client";
import { PaginatedResponse } from "./types";

export interface College {
  id: number;
  college_name: string;
  slug: string;
  NIRF_rank: string;
  affiliated_with?: string;
  established_year: string;
  isFeatured: boolean;
  college_description: string;
  college_rating: number;
  college_type: string;
  college_image: string;
  gallery?: string[];
  cityId?: number;
  city?: {
    id: number;
    city: string;
    state: string;
  };
  course_categories?: any[];
  sub_course_categories?: any[];
  course_category_specializations?: any[];
  
  // Repeatable JSON fields
  home_four_list?: any;
  overview_fourlist?: any;
  college_timeline?: any;
  intake_details?: any;
  fee_structure?: any;
  all_india_cutoff?: any;
  state_cutoff?: any;
  admission_process?: any;
  placement_overview?: any;
  industry_partners?: any;
  location?: any;
  ranking?: any;
  review_rating?: any;

  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface CollegeQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  courseCategoryId?: number;
  subCourseCategoryId?: number;
  collegeType?: string;
  city?: string;
  state?: string;
  isFeatured?: boolean;
}

export const collegeService = {
  async getAll(params?: CollegeQueryParams) {
    const response = await apiClient.get<PaginatedResponse<College>>("/college", { params });
    return response.data;
  },

  async getOne(id: number) {
    const response = await apiClient.get<College>(`/college/${id}`);
    return response.data;
  },

  async getBySlug(slug: string) {
    const response = await apiClient.get<College>(`/college/slug/${slug}`);
    return response.data;
  },

  async create(data: Partial<College>) {
    const response = await apiClient.post<College>("/college", data);
    return response.data;
  },

  async update(id: number, data: Partial<College>) {
    const response = await apiClient.put<College>(`/college/${id}`, data);
    return response.data;
  },

  async delete(id: number) {
    const response = await apiClient.delete(`/college/${id}`);
    return response.data;
  },
};
