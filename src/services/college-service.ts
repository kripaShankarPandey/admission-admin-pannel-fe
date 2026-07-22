import { apiClient } from "@/lib/api-client";
import { PaginatedResponse } from "./types";

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export interface College {
  id: number;
  college_name: string;
  slug: string;
  NIRF_rank: string;
  university_name?: string;
  approval?: string;
  status?: string;
  state?: string;
  city_name?: string;
  mgmt_type?: string;
  establish_year?: string;
  campus_area?: string;
  nirf_rank?: string;
  naac?: string;
  nba?: string;
  featured?: boolean;
  priority?: number;
  action_url?: string;
  discipline?: string;
  overview?: string;
  facilities_enabled?: boolean;
  hospital_overview_enabled?: boolean;
  admission_counselling?: string;
  eligibility?: string;
  exam_accepted?: string;
  internship?: string;
  exchange_program?: string;
  sponsorship?: string;
  stipend_year_1?: string;
  stipend_year_2?: string;
  stipend_year_3?: string;
  no_of_ot?: string;
  hospital_bed?: string;
  airport?: string;
  railway_station?: string;
  bus_stand?: string;
  total_bed?: string;
  ss_bed?: string;
  ms_bed?: string;
  opd_running?: string;
  average_ot?: string;
  clinical_rotation?: string;
  medical_camping?: string;
  clinical_excilence_lab?: JsonValue[];
  cutoff_state_enabled?: boolean;
  cutoff_all_india_enabled?: boolean;
  cutoff_minority_enabled?: boolean;
  govt_state_cutoff_enabled?: boolean;
  government_college_aiq_cutoff_enabled?: boolean;
  affiliated_with?: string;
  established_year: string;
  isFeatured: boolean;
  college_description: string;
  college_rating: number;
  college_type: string;
  college_image?: string;
  gallery?: string[];
  campus_tour_icon?: string;
  podcast?: string;
  meta_title?: string;
  meta_description?: string;
  keywords?: string;
  cityId?: number;
  city?: {
    id: number;
    city: string;
    state: string;
  };
  course_categories?: JsonValue[];
  sub_course_categories?: JsonValue[];
  courses?: JsonValue[];
  add_on_facilities?: JsonValue[];
  cutoff_state?: JsonValue;
  cutoff_all_india?: JsonValue;
  cutoff_minority?: JsonValue;
  govt_state_cutoff?: JsonValue;
  government_college_aiq_cutoff?: JsonValue;
  
  // Repeatable JSON fields
  home_four_list?: JsonValue;
  overview_fourlist?: JsonValue;
  college_timeline?: JsonValue;
  intake_details?: JsonValue;
  fee_structure?: JsonValue;
  all_india_cutoff?: JsonValue;
  state_cutoff?: JsonValue;
  admission_process?: JsonValue;
  placement_overview?: JsonValue;
  industry_partners?: JsonValue;
  location?: JsonValue;
  ranking?: JsonValue;
  review_rating?: JsonValue;

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

export interface CollegeBulkUploadResult {
  totalRows: number;
  created: number;
  updated: number;
  /** Matched an existing college but the row carried nothing to change. */
  skipped: number;
  failed: number;
  errors: Array<{
    row: number;
    college_name?: string;
    message: string;
  }>;
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

  async bulkUpload(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post<CollegeBulkUploadResult>(
      "/college/bulk-upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  },

  async downloadBulkUploadTemplate() {
    const response = await apiClient.get<Blob>("/college/bulk-upload-template", {
      responseType: "blob",
    });
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
