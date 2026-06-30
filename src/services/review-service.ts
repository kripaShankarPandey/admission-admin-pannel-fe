import { apiClient } from "@/lib/api-client";

export const REVIEW_STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export interface Review {
  id: number;
  collegeId: number;
  name: string;
  email?: string | null;
  rating: number;
  comment: string;
  status: ReviewStatus;
  createdAt: string;
  college?: { id: number; college_name: string; slug?: string };
}

export const reviewService = {
  async getAll(params?: { status?: ReviewStatus; collegeId?: number; pageSize?: number }) {
    const response = await apiClient.get<{ data: Review[] } | Review[]>("/review", {
      params: { pageSize: 200, ...params },
    });
    const payload = response.data;
    return Array.isArray(payload) ? payload : (payload.data ?? []);
  },

  async updateStatus(id: number, status: ReviewStatus) {
    const response = await apiClient.patch(`/review/${id}/status`, { status });
    return response.data;
  },

  async remove(id: number) {
    const response = await apiClient.delete(`/review/${id}`);
    return response.data;
  },
};
