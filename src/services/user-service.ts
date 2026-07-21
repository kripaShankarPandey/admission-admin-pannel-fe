import { apiClient } from "@/lib/api-client";

export enum AdmRole {
  USER = "user",
  EDITOR = "editor",
  SUPER_ADMIN = "super_admin",
}

export interface User {
  id: number;
  email: string;
  username: string | null;
  name?: string | null;
  phone?: string | null;
  city?: string | null;
  state?: string | null;
  confirmed: boolean;
  role: AdmRole;
  permissions?: string[] | null;
  createdAt: string;
  updatedAt: string;
}

export type CreateUserPayload = Pick<User, "email" | "username" | "role"> &
  Partial<Pick<User, "name" | "phone" | "city" | "state" | "permissions">> & {
    password: string;
  };

export type UpdateUserPayload = Partial<CreateUserPayload>;

export const userService = {
  async getAll() {
    const response = await apiClient.get<User[]>("/users");
    return response.data;
  },

  async getOne(id: number) {
    const response = await apiClient.get<User>(`/users/${id}`);
    return response.data;
  },

  async create(data: CreateUserPayload) {
    const response = await apiClient.post<User>("/users", data);
    return response.data;
  },

  async update(id: number, data: UpdateUserPayload) {
    const response = await apiClient.patch<User>(`/users/${id}`, data);
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
