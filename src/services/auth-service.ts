import { apiClient } from "@/lib/api-client";
import Cookies from "js-cookie";

export interface LoginCredentials {
  email: string;
  password: string;
}

export const authService = {
  async login(credentials: LoginCredentials) {
    // Assuming the backend has a POST /auth/login or /admin/login
    // We'll use the generic one based on the NestJS structure
    const response = await apiClient.post("/auth/login", credentials);
    const { access_token, user } = response.data;
    
    if (user?.role !== "super_admin" && user?.role !== "editor") {
      throw new Error("Access denied: You must be a Super Admin or Editor to access this panel.");
    }
    
    if (access_token) {
      // 1 day. Secure only over https, otherwise the cookie would silently
      // fail to save on http://localhost during development.
      Cookies.set("admin_token", access_token, {
        expires: 1,
        path: "/",
        sameSite: "lax",
        secure: window.location.protocol === "https:",
      });
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
