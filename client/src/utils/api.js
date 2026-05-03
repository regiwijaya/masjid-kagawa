// client/src/utils/api.js
const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:5050";

export const api = {
  base: API_BASE,

  adminRegister: `${API_BASE}/api/admin/register`,
  adminLogin: `${API_BASE}/api/admin/login`,
  adminMe: `${API_BASE}/api/admin/me`,

  prayerGet: `${API_BASE}/api/prayer`,
  prayerUpdate: `${API_BASE}/api/prayer/update`,

  health: `${API_BASE}/api/health`,
};

export default api;
