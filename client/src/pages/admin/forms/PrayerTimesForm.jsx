// client/src/pages/admin/forms/PrayerTimesForm.jsx
import { useEffect, useState } from "react";

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
    const controller = new AbortController();
    loadCurrent(controller.signal);
    return () => controller.abort();
  }, []);

  async function loadCurrent(signal) {
    setLoading(true);
    setMsg({ type: "", text: "" });

    try {
      const res = await fetch("/api/prayer", { signal });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMsg({ type: "error", text: data?.error || "Gagal memuat jadwal." });
        return;
      }

      setForm({
        subuh: data?.subuh && data.subuh !== "-" ? data.subuh : "",
        zuhur: data?.zuhur && data.zuhur !== "-" ? data.zuhur : "",
        asar: data?.asar && data.asar !== "-" ? data.asar : "",
        maghrib: data?.maghrib && data.maghrib !== "-" ? data.maghrib : "",
        isya: data?.isya && data.isya !== "-" ? data.isya : "",
      });
    } catch (err) {
      if (err?.name === "AbortError") return;
      setMsg({ type: "error", text: "Tidak dapat terhubung ke server." });
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: "", text: "" });

    const token = localStorage.getItem("adminToken");
    if (!token) {
      setSaving(false);
      window.location.href = "/admin/login";
      return;
    }

    try {
      const res = await fetch("/api/prayer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // wajib untuk protectAdmin
        },
        body: JSON.stringify(form),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMsg({
          type: "error",
          text: data?.message || data?.error || "Gagal menyimpan jadwal.",
        });
        return;
      }

      setMsg({ type: "success", text: data?.message || "Berhasil disimpan." });
    } catch (err) {
      setMsg({ type: "error", text: "Tidak dapat terhubung ke server." });
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
            className={`admin-alert ${msg.type === "success" ? "success" : "error"}`}
          >
            {msg.text}
          </div>
        )}
      </div>
    </form>
  );
}
