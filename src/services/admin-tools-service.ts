import { apiClient } from "@/lib/api-client";

/* ─── Activity log ─────────────────────────────────────────────────────────── */

export interface AuditEntry {
  id: number;
  userId: number | null;
  userEmail: string | null;
  action: string;
  entityType: string | null;
  entityId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface AuditFilters {
  page?: number;
  pageSize?: number;
  userEmail?: string;
  entityType?: string;
  action?: string;
  search?: string;
  from?: string;
  to?: string;
}

export const auditService = {
  async getAll(params: AuditFilters = {}) {
    const res = await apiClient.get<{
      data: AuditEntry[];
      meta: { pagination: { total: number; pageCount: number; page: number } };
    }>("/audit-log", { params });
    return res.data;
  },

  async filterOptions() {
    const res = await apiClient.get<{
      userEmails: string[];
      entityTypes: string[];
      actions: string[];
    }>("/audit-log/filters");
    return res.data;
  },
};

/* ─── Lead workflow ────────────────────────────────────────────────────────── */

export type LeadType = "contact" | "counselor";

export interface LeadNote {
  id: number;
  body: string;
  authorEmail: string | null;
  createdAt: string;
}

export interface DueLead {
  type: LeadType;
  lead: {
    id: number;
    name: string;
    status: string;
    followUpAt: string | null;
    assigneeEmail: string | null;
    email?: string;
    phone?: string;
  };
}

export const leadWorkflowService = {
  async update(
    type: LeadType,
    id: number,
    payload: {
      status?: string;
      assigneeId?: number;
      assigneeEmail?: string;
      followUpAt?: string | null;
    },
  ) {
    const res = await apiClient.patch(`/lead/${type}/${id}`, payload);
    return res.data;
  },

  async listNotes(type: LeadType, id: number) {
    const res = await apiClient.get<{ data: LeadNote[] }>(
      `/lead/${type}/${id}/notes`,
    );
    return res.data.data ?? [];
  },

  async addNote(type: LeadType, id: number, body: string) {
    const res = await apiClient.post<LeadNote>(`/lead/${type}/${id}/notes`, {
      body,
    });
    return res.data;
  },

  async due() {
    const res = await apiClient.get<{ data: DueLead[] }>("/lead/due");
    return res.data.data ?? [];
  },

  async exportCsv(type: LeadType) {
    const res = await apiClient.get<Blob>(`/lead/${type}/export`, {
      responseType: "blob",
    });
    return res.data;
  },
};

/* ─── Dashboard analytics ──────────────────────────────────────────────────── */

export interface AnalyticsOverview {
  range: { days: number; since: string };
  totals: {
    contactLeads: number;
    counselorLeads: number;
    users: number;
    colleges: number;
    conversionRate: number;
  };
  leadsPerDay: { date: string; count: number }[];
  signupsPerDay: { date: string; count: number }[];
  signupMethods: { phone: number; google: number; email: number };
  leadStatus: {
    contact: Record<string, number>;
    counselor: Record<string, number>;
  };
  reviewStatus: Record<string, number>;
  topSavedColleges: {
    collegeId: number;
    name: string;
    slug: string | null;
    saves: number;
  }[];
}

export const analyticsService = {
  async overview(days = 30) {
    const res = await apiClient.get<AnalyticsOverview>("/analytics/overview", {
      params: { days },
    });
    return res.data;
  },
};

/* ─── Media library ────────────────────────────────────────────────────────── */

export interface MediaItem {
  key: string;
  url: string;
  size: number;
  lastModified: string;
}

export const mediaService = {
  async list(params: { prefix?: string; token?: string; limit?: number } = {}) {
    const res = await apiClient.get<{
      items: MediaItem[];
      nextToken: string | null;
    }>("/upload/media", { params });
    return res.data;
  },

  async remove(key: string) {
    await apiClient.delete("/upload/media", { params: { key } });
  },
};

/* ─── Global search ────────────────────────────────────────────────────────── */

export interface SearchHit {
  type: string;
  id: number;
  title: string;
  subtitle?: string | null;
  href: string;
}

export const searchService = {
  async find(q: string) {
    const res = await apiClient.get<{ data: SearchHit[] }>("/search", {
      params: { q },
    });
    return res.data.data ?? [];
  },
};
