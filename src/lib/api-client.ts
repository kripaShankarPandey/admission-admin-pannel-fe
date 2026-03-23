import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to add the JWT token to the headers
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get("admin_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle specialized errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;

    if (status === 401) {
      // Clear token and redirect to login if unauthorized
      Cookies.remove("admin_token", { path: "/" });
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    if (status === 403) {
      toast.error("Access Forbidden: You don't have permission to perform this action.");
    } else if (status === 404) {
      toast.error("Resource not found. Please check the URL or try again later.");
    } else if (status >= 500) {
      toast.error("Server Error: Something went wrong on our end. Please contact support.");
    } else if (error.code === "ERR_NETWORK") {
      toast.error("Network Error: Please check your internet connection.");
    } else {
      // Avoid showing toasts for login errors here as they are handled in the LoginPage
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        toast.error(message || "An unexpected error occurred.");
      }
    }

    return Promise.reject(error);
  }
);
