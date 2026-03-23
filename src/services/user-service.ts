import { apiClient } from "@/lib/api-client";

export enum AdmRole {
  USER = "user",
  SUPER_ADMIN = "super_admin",
}

export interface User {
  id: number;
  email: string;
  username: string | null;
  confirmed: boolean;
  role: AdmRole;
  createdAt: string;
  updatedAt: string;
}

export const userService = {
  async getAll() {
    const response = await apiClient.get<User[]>("/users");
    return response.data;
  },

  async getOne(id: number) {
    const response = await apiClient.get<User>(`/users/${id}`);
    return response.data;
  },

  async updateRole(id: number, role: AdmRole) {
    const response = await apiClient.patch<User>(`/users/${id}/role`, { role });
    return response.data;
  },

  async delete(id: number) {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  },
};
