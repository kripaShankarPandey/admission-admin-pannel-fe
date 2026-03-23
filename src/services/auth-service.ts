import { apiClient } from "@/lib/api-client";
import Cookies from "js-cookie";

export const authService = {
  async login(credentials: any) {
    // Assuming the backend has a POST /auth/login or /admin/login
    // We'll use the generic one based on the NestJS structure
    const response = await apiClient.post("/auth/login", credentials);
    const { access_token, user } = response.data;
    
    if (user?.role !== "super_admin") {
      throw new Error("Access denied: You must be a Super Admin to access this panel.");
    }
    
    if (access_token) {
      Cookies.set("admin_token", access_token, { expires: 1, path: "/" }); // 1 day
      // Store user info for UI display
      localStorage.setItem("admin_user", JSON.stringify(user));
    }
    
    return response.data;
  },

  logout() {
    Cookies.remove("admin_token", { path: "/" });
    if (typeof window !== "undefined") {
      localStorage.removeItem("admin_user");
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
