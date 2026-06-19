// client/src/pages/admin/forms/PrayerTimesForm.jsx
import { useEffect, useState } from "react";
import http from "../../../api/http";

export default function PrayerTimesForm() {
  const [form, setForm] = useState({
    subuh: "",
    zuhur: "",
    asar: "",
    maghrib: "",
    isya: "",
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    loadCurrent();
  }, []);

  function cleanTime(value) {
    if (!value || value === "-") return "";
    return String(value).trim();
  }

  function getAdminToken() {
    return localStorage.getItem("adminToken") || localStorage.getItem("token") || "";
  }

  async function loadCurrent() {
    setLoading(true);
    setMsg({ type: "", text: "" });

    try {
      const res = await http.get("/api/prayer");
      const data = res?.data || {};

      setForm({
        subuh: cleanTime(data?.iqamah?.subuh),
        zuhur: cleanTime(data?.iqamah?.zuhur || data?.iqamah?.dzuhur),
        asar: cleanTime(data?.iqamah?.asar),
        maghrib: cleanTime(data?.iqamah?.maghrib),
        isya: cleanTime(data?.iqamah?.isya),
      });
    } catch (err) {
      console.error("LOAD PRAYER FORM ERROR:", err);
      setMsg({ type: "error", text: "Tidak dapat terhubung ke server." });
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: "", text: "" });

    const token = getAdminToken();

    if (!token) {
      setSaving(false);
      window.location.href = "/admin/login";
      return;
    }

    try {
      const payload = {
        subuh: form.subuh,
        zuhur: form.zuhur,
        dzuhur: form.zuhur,
        asar: form.asar,
        maghrib: form.maghrib,
        isya: form.isya,
      };

      const res = await http.put("/api/prayer/iqamah", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMsg({
        type: "success",
        text: res?.data?.message || "Jam iqamah berhasil disimpan.",
      });

      await loadCurrent();
    } catch (err) {
      console.error("SAVE PRAYER FORM ERROR:", err);
      setMsg({
        type: "error",
        text:
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Gagal menyimpan jadwal.",
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div style={{ color: "#6b7b73" }}>Memuat jadwal...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="admin-form">
      <div className="admin-form-grid">
        <div className="admin-field">
          <label className="admin-label">Subuh</label>
          <input
            type="time"
            name="subuh"
            className="admin-input"
            value={form.subuh}
            onChange={handleChange}
            required
          />
        </div>

        <div className="admin-field">
          <label className="admin-label">Zuhur</label>
          <input
            type="time"
            name="zuhur"
            className="admin-input"
            value={form.zuhur}
            onChange={handleChange}
            required
          />
        </div>

        <div className="admin-field">
          <label className="admin-label">Asar</label>
          <input
            type="time"
            name="asar"
            className="admin-input"
            value={form.asar}
            onChange={handleChange}
            required
          />
        </div>

        <div className="admin-field">
          <label className="admin-label">Maghrib</label>
          <input
            type="time"
            name="maghrib"
            className="admin-input"
            value={form.maghrib}
            onChange={handleChange}
            required
          />
        </div>

        <div className="admin-field">
          <label className="admin-label">Isya</label>
          <input
            type="time"
            name="isya"
            className="admin-input"
            value={form.isya}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="admin-form-actions">
        <button className="admin-primary-btn" type="submit" disabled={saving}>
          {saving ? "Menyimpan..." : "Simpan Jadwal"}
        </button>

        {msg.text && (
          <div
            className={`admin-alert ${
              msg.type === "success" ? "success" : "error"
            }`}
          >
            {msg.text}
          </div>
        )}
      </div>
    </form>
  );
}