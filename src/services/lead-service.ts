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
  createdAt: string;
}

export interface NewsletterLead {
  id: number;
  email: string;
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
