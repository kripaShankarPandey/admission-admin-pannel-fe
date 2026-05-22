import { apiClient } from "@/lib/api-client";
import { PaginatedResponse } from "./types";

export type ReachUsCategory = "airport" | "bus-station" | "railway-station";

export interface ReachUsLocation {
  id: number;
  category: ReachUsCategory;
  state: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface ReachUsQueryParams {
  page?: number;
  pageSize?: number;
  category?: ReachUsCategory;
  state?: string;
  search?: string;
}

export interface ReachUsResponse extends PaginatedResponse<ReachUsLocation> {
  meta: PaginatedResponse<ReachUsLocation>["meta"] & {
    states?: string[];
  };
}

export const reachUsService = {
  async getAll(params?: ReachUsQueryParams) {
    const response = await apiClient.get<ReachUsResponse>("/reach-us", {
      params,
    });
    return response.data;
  },

  async create(data: Pick<ReachUsLocation, "category" | "state" | "name">) {
    const response = await apiClient.post<ReachUsLocation>("/reach-us", data);
    return response.data;
  },

  async update(
    id: number,
    data: Partial<Pick<ReachUsLocation, "state" | "name">>,
  ) {
    const response = await apiClient.put<ReachUsLocation>(
      `/reach-us/${id}`,
      data,
    );
    return response.data;
  },

  async delete(id: number) {
    const response = await apiClient.delete(`/reach-us/${id}`);
    return response.data;
  },
};
