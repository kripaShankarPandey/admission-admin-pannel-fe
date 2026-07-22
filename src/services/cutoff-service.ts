import { apiClient } from "@/lib/api-client";
import type { CutoffColumn } from "@/services/cutoff-type-service";

export interface Cutoff {
  id: number;
  collegeId: number;
  subCourseCategoryId: number;
  cutoffTypeId: number;
  year: string;
  values: Record<string, string>;
  college: { id: number; college_name: string; slug: string };
  subCourseCategory: {
    id: number;
    sub_course_category_name: string;
    slug: string;
  };
  cutoffType: {
    id: number;
    name: string;
    slug: string;
    columns: CutoffColumn[];
    color: string;
  };
}

export interface CutoffListParams {
  page?: number;
  pageSize?: number;
  collegeId?: number;
  subCourseCategoryId?: number;
  cutoffTypeId?: number;
  year?: string;
  search?: string;
}

export interface CutoffImportResult {
  totalRows: number;
  created: number;
  updated: number;
  failed: number;
  errors: { row: number; message: string }[];
}

/** One editor screen: every block for a single college + course + year. */
export interface SaveCutoffScreenPayload {
  collegeId: number;
  subCourseCategoryId: number;
  year: string;
  blocks: { cutoffTypeId: number; values: Record<string, string> }[];
}

export const cutoffService = {
  async getAll(params: CutoffListParams = {}) {
    const response = await apiClient.get<{
      data: Cutoff[];
      meta: { pagination: { total: number; pageCount: number } };
    }>("/cutoff", { params });
    return response.data;
  },

  async getScreen(
    collegeId: number,
    subCourseCategoryId: number,
    year: string,
  ) {
    const response = await apiClient.get<{ data: Cutoff[] }>(
      `/cutoff/screen/${collegeId}/${subCourseCategoryId}/${year}`,
    );
    return response.data.data ?? [];
  },

  async getYears(collegeId: number, subCourseCategoryId: number) {
    const response = await apiClient.get<{ data: string[] }>(
      `/cutoff/years/${collegeId}/${subCourseCategoryId}`,
    );
    return response.data.data ?? [];
  },

  async saveScreen(payload: SaveCutoffScreenPayload) {
    const response = await apiClient.put<{ data: Cutoff[] }>(
      "/cutoff/screen",
      payload,
    );
    return response.data.data ?? [];
  },

  async remove(id: number) {
    await apiClient.delete(`/cutoff/${id}`);
  },

  async bulkUpload(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post<CutoffImportResult>(
      "/cutoff/bulk-upload",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data;
  },

  async downloadTemplate() {
    const response = await apiClient.get<Blob>("/cutoff/bulk-upload-template", {
      responseType: "blob",
    });
    return response.data;
  },

  async exportAll() {
    const response = await apiClient.get<Blob>("/cutoff/export", {
      responseType: "blob",
    });
    return response.data;
  },
};
