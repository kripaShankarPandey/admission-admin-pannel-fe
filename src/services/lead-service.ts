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
    const response = await apiClient.get<ContactLead[]>("/contact-us");
    return response.data;
  },

  async deleteContactLead(id: number) {
    const response = await apiClient.delete(`/contact-us/${id}`);
    return response.data;
  },

  async getNewsletterLeads() {
    const response = await apiClient.get<NewsletterLead[]>("/newsletter-subscribe");
    return response.data;
  },

  async deleteNewsletterLead(id: number) {
    const response = await apiClient.delete(`/newsletter-subscribe/${id}`);
    return response.data;
  },
};
