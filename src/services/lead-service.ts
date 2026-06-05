import { apiClient } from "@/lib/api-client";

export interface ContactLead {
  id: number;
  name: string;
  email: string;
  phone?: string;
  message: string;
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
