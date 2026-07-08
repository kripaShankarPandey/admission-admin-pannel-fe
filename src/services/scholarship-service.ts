import { apiClient } from "@/lib/api-client";

export interface Scholarship {
  id: number;
  name: string;
  value: string;
  eligibility: string;
  type: string;
  officialUrl?: string | null;
  priority?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type ScholarshipPayload = {
  name: string;
  value: string;
  eligibility: string;
  type: string;
  officialUrl?: string;
  priority?: number;
};

export const scholarshipService = {
  async getAll() {
    const res = await apiClient.get<{ data: Scholarship[] } | Scholarship[]>("/scholarship");
    const payload = res.data;
    return Array.isArray(payload) ? payload : (payload.data ?? []);
  },

  async create(data: ScholarshipPayload) {
    const res = await apiClient.post<Scholarship>("/scholarship", data);
    return res.data;
  },

  async update(id: number, data: Partial<ScholarshipPayload>) {
    const res = await apiClient.patch<Scholarship>(`/scholarship/${id}`, data);
    return res.data;
  },

  async remove(id: number) {
    const res = await apiClient.delete(`/scholarship/${id}`);
    return res.data;
  },
};
