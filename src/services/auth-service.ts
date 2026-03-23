import { apiClient } from "@/lib/api-client";
import Cookies from "js-cookie";

export const authService = {
  async login(credentials: any) {
    // Assuming the backend has a POST /auth/login or /admin/login
    // We'll use the generic one based on the NestJS structure
    const response = await apiClient.post("/auth/login", credentials);
    const { access_token } = response.data;
    
    if (access_token) {
      Cookies.set("admin_token", access_token, { expires: 1, path: "/" }); // 1 day
    }
    
    return response.data;
  },

  logout() {
    Cookies.remove("admin_token", { path: "/" });
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  },

  isAuthenticated() {
    return !!Cookies.get("admin_token");
  },
  
  getToken() {
    return Cookies.get("admin_token");
  }
};
