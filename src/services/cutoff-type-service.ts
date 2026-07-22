import { apiClient } from "@/lib/api-client";

export interface CutoffColumn {
  key: string;
  label: string;
}

export interface CutoffType {
  id: number;
  name: string;
  /**
   * Storage key inside College.courses[].cutoffs. Editing it on a type that
   * already has saved values orphans them — the UI warns before allowing it.
   */
  slug: string;
  columns: CutoffColumn[];
  color: string;
  priority: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type CutoffTypePayload = {
  name: string;
  slug: string;
  columns: CutoffColumn[];
  color?: string;
  priority?: number;
  isActive?: boolean;
};

export const cutoffTypeService = {
  async getAll(activeOnly = false) {
    const res = await apiClient.get<{ data: CutoffType[] } | CutoffType[]>(
      `/cutoff-type${activeOnly ? "?activeOnly=true" : ""}`,
    );
    const payload = res.data;
    return Array.isArray(payload) ? payload : (payload.data ?? []);
  },

  async create(data: CutoffTypePayload) {
    const res = await apiClient.post<CutoffType>("/cutoff-type", data);
    return res.data;
  },

  async update(id: number, data: Partial<CutoffTypePayload>) {
    const res = await apiClient.patch<CutoffType>(`/cutoff-type/${id}`, data);
    return res.data;
  },

  async remove(id: number) {
    await apiClient.delete(`/cutoff-type/${id}`);
  },
};
