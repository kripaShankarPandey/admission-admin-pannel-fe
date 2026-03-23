import { apiClient } from "@/lib/api-client";
import { PaginatedResponse } from "./types";

export interface Counselor {
  id: number;
  name: string;
  designation: string;
  profile: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface CounselorQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export const counselorService = {
  async getAll(params?: CounselorQueryParams) {
    const response = await apiClient.get<PaginatedResponse<Counselor>>("/counselor", { params });
    return response.data;
  },

  async getOne(id: number) {
    const response = await apiClient.get<Counselor>(`/counselor/${id}`);
    return response.data;
  },

  async create(data: Partial<Counselor>) {
    const response = await apiClient.post<Counselor>("/counselor", data);
    return response.data;
  },

  async update(id: number, data: Partial<Counselor>) {
    const response = await apiClient.put<Counselor>(`/counselor/${id}`, data);
    return response.data;
  },

  async delete(id: number) {
    const response = await apiClient.delete(`/counselor/${id}`);
    return response.data;
  },
};
