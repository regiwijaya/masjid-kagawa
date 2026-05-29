// client/src/api/http.js
import axios from "axios";

/**
 * baseURL:
 * - Dev (Vite proxy): kosong "" supaya /api langsung ke proxy
 * - Prod: isi VITE_API_BASE_URL mis. https://domain.com
 */
const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://api.masjidkagawa.com",
  headers: {
    "Content-Type": "application/json",
  },
});

// Auto attach adminToken kalau ada
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default http;
