import { apiClient } from "@/lib/api-client";

export interface Faq {
  id: number;
  question: string;
  answer: string;
  priority?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type FaqPayload = {
  question: string;
  answer: string;
  priority?: number;
};

export const faqService = {
  async getAll() {
    const res = await apiClient.get<{ data: Faq[] } | Faq[]>("/faq");
    const payload = res.data;
    return Array.isArray(payload) ? payload : (payload.data ?? []);
  },

  async create(data: FaqPayload) {
    const res = await apiClient.post<Faq>("/faq", data);
    return res.data;
  },

  async update(id: number, data: Partial<FaqPayload>) {
    const res = await apiClient.patch<Faq>(`/faq/${id}`, data);
    return res.data;
  },

  async remove(id: number) {
    const res = await apiClient.delete(`/faq/${id}`);
    return res.data;
  },
};
