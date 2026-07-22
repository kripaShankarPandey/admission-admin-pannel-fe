import { apiClient } from "@/lib/api-client";

export const EXAM_STATUSES = ["upcoming", "ongoing", "closed"] as const;
export type ExamStatus = (typeof EXAM_STATUSES)[number];

export interface ExamDate {
  id: number;
  name: string;
  examDate: string;
  /** Legacy single window; superseded by the two fields below. */
  registration?: string | null;
  registrationOpen?: string | null;
  registrationClose?: string | null;
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
  registrationOpen?: string;
  registrationClose?: string;
  stream: string;
  status: ExamStatus;
  officialUrl?: string;
  priority?: number;
};

export const examDateService = {
  async getAll() {
    const res = await apiClient.get<{ data: ExamDate[] } | ExamDate[]>(
      "/exam-date",
    );
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

/**
 * One display string for the registration window.
 *
 * Rows created before the open/close split only have the legacy `registration`
 * free-text field, so that is used whenever the two new fields are empty —
 * otherwise every pre-existing exam would suddenly render a dash.
 */
export function formatRegistrationWindow(
  exam: Pick<
    ExamDate,
    "registration" | "registrationOpen" | "registrationClose"
  >,
): string | null {
  const open = exam.registrationOpen?.trim();
  const close = exam.registrationClose?.trim();
  if (open && close) return `${open} – ${close}`;
  if (open) return `Opens ${open}`;
  if (close) return `Closes ${close}`;
  return exam.registration?.trim() || null;
}
