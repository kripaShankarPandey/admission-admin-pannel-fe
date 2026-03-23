import { apiClient } from "@/lib/api-client";
import { PaginatedResponse } from "./types";

export interface City {
  id: number;
  city: string;
  state: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface CityQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  courseCategoryId?: number;
  subCourseCategoryId?: number;
}

export const cityService = {
  async getAll(params?: CityQueryParams) {
    const response = await apiClient.get<PaginatedResponse<City>>("/city", { params });
    return response.data;
  },

  async getOne(id: number) {
    const response = await apiClient.get<City>(`/city/${id}`);
    return response.data;
  },

  async create(data: Partial<City>) {
    const response = await apiClient.post<City>("/city", data);
    return response.data;
  },

  async update(id: number, data: Partial<City>) {
    const response = await apiClient.put<City>(`/city/${id}`, data);
    return response.data;
  },

  async delete(id: number) {
    const response = await apiClient.delete(`/city/${id}`);
    return response.data;
  },
};
