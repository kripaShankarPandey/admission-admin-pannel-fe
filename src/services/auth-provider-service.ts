import { apiClient } from "@/lib/api-client";

export interface ProviderField {
  key: string;
  label: string;
  secret: boolean;
  required: boolean;
  hint?: string;
}

export interface AuthProvider {
  id: number;
  kind: "google" | "msg91" | "twilio" | "firebase";
  label: string;
  isEnabled: boolean;
  priority: number;
  config: Record<string, string>;
  /** Masked, e.g. "••••1234". Send back unchanged to keep the stored value. */
  secrets: Record<string, string>;
  fields: ProviderField[];
  /** Whether this provider takes part in the SMS fallback chain. */
  sms: boolean;
  updatedAt: string;
}

export interface UpdateAuthProviderPayload {
  isEnabled?: boolean;
  priority?: number;
  config?: Record<string, string>;
  secrets?: Record<string, string>;
}

export const authProviderService = {
  async getAll() {
    const res = await apiClient.get<{ data: AuthProvider[] }>("/auth-provider");
    return res.data.data ?? [];
  },

  async update(kind: string, payload: UpdateAuthProviderPayload) {
    const res = await apiClient.patch<{ data: AuthProvider[] }>(
      `/auth-provider/${kind}`,
      payload,
    );
    return res.data.data ?? [];
  },

  async sendTest(kind: string, phone: string) {
    const res = await apiClient.post<{ ok: boolean; message: string }>(
      `/auth-provider/${kind}/test`,
      { phone },
    );
    return res.data;
  },
};
