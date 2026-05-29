// client/src/api/http.js
import axios from "axios";

/**
 * API base URL:
 * - Local dev: pakai Vite proxy → "/api"
 * - Production: pakai backend Hostinger → https://api.masjidkagawa.com/api
 *
 * Database MySQL tetap di backend Hostinger.
 * Frontend tidak connect langsung ke database.
 */
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? "/api" : "https://api.masjidkagawa.com/api");

const http = axios.create({
  baseURL: API_BASE_URL,
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