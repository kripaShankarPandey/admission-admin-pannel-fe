import { apiClient } from "@/lib/api-client";

export const EXAM_STATUSES = ["upcoming", "ongoing", "closed"] as const;
export type ExamStatus = (typeof EXAM_STATUSES)[number];

export interface ExamDate {
  id: number;
  name: string;
  examDate: string;
  registration?: string | null;
  stream: string;
  status: ExamStatus;
  officialUrl?: string | null;
  priority?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type ExamDatePayload = {
  name: string;
  examDate: string;
  registration?: string;
  stream: string;
  status: ExamStatus;
  officialUrl?: string;
  priority?: number;
};

export const examDateService = {
  async getAll() {
    const res = await apiClient.get<{ data: ExamDate[] } | ExamDate[]>("/exam-date");
    const payload = res.data;
    return Array.isArray(payload) ? payload : (payload.data ?? []);
  },

  async create(data: ExamDatePayload) {
    const res = await apiClient.post<ExamDate>("/exam-date", data);
    return res.data;
  },

  async update(id: number, data: Partial<ExamDatePayload>) {
    const res = await apiClient.patch<ExamDate>(`/exam-date/${id}`, data);
    return res.data;
  },

  async remove(id: number) {
    const res = await apiClient.delete(`/exam-date/${id}`);
    return res.data;
  },
};
