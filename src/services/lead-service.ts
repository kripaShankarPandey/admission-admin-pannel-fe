import { apiClient } from "@/lib/api-client";

export const LEAD_STATUSES = ["NEW", "CONTACTED", "CONVERTED", "CLOSED"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export interface ContactLead {
  id: number;
  name: string;
  email: string;
  number?: string;
  subject?: string;
  message: string;
  courseInterest?: string | null;
  preferredTime?: string | null;
  status?: LeadStatus;
  /** Workflow fields — see LeadWorkflowPanel. */
  assigneeEmail?: string | null;
  followUpAt?: string | null;
  createdAt: string;
}

export interface NewsletterLead {
  id: number;
  email: string;
  createdAt: string;
}

export interface CounselorLead {
  id: number;
  name: string;
  phone: string;
  collegeName?: string | null;
  counselorId?: number | null;
  counselorName?: string | null;
  status?: LeadStatus;
  assigneeEmail?: string | null;
  followUpAt?: string | null;
  createdAt: string;
}

export const leadService = {
  async getContactLeads() {
    const response = await apiClient.get<{ data: ContactLead[] } | ContactLead[]>("/contact-us");
    const payload = response.data;
    return Array.isArray(payload) ? payload : (payload.data ?? []);
  },

  async updateContactLeadStatus(id: number, status: LeadStatus) {
    const response = await apiClient.patch(`/contact-us/${id}/status`, { status });
    return response.data;
  },

  async deleteContactLead(id: number) {
    const response = await apiClient.delete(`/contact-us/${id}`);
    return response.data;
  },

  async getCounselorLeads() {
    const response = await apiClient.get<{ data: CounselorLead[] } | CounselorLead[]>("/counselor-lead");
    const payload = response.data;
    return Array.isArray(payload) ? payload : (payload.data ?? []);
  },

  async updateCounselorLeadStatus(id: number, status: LeadStatus) {
    const response = await apiClient.patch(`/counselor-lead/${id}/status`, { status });
    return response.data;
  },

  async deleteCounselorLead(id: number) {
    const response = await apiClient.delete(`/counselor-lead/${id}`);
    return response.data;
  },

  async getNewsletterLeads() {
    const response = await apiClient.get<{ data: NewsletterLead[] } | NewsletterLead[]>("/newsletter-subscribe");
    const payload = response.data;
    return Array.isArray(payload) ? payload : (payload.data ?? []);
  },

  async deleteNewsletterLead(id: number) {
    const response = await apiClient.delete(`/newsletter-subscribe/${id}`);
    return response.data;
  },
};
