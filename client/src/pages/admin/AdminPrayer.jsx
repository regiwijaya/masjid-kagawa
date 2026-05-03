import { useEffect, useMemo, useState } from "react";
import AdminLayout from "./components/AdminLayout";
import http from "../../api/http";
import "../../styles/admin/AdminPrayer.css";

const EMPTY_PRAYER = {
  date: "",
  location: "Masjid Kagawa",
  timezone: "Asia/Tokyo",
  adzan: {
    subuh: "-",
    syuruq: "-",
    zuhur: "-",
    asar: "-",
    maghrib: "-",
    isya: "-",
  },
  iqamah: {
    subuh: "",
    zuhur: "",
    asar: "",
    maghrib: "",
    isya: "",
  },
};

function getAdminToken() {
  return localStorage.getItem("adminToken") || localStorage.getItem("token") || "";
}

function formatDateLabel(dateString) {
  if (!dateString) return "Hari ini";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;

  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default function AdminDashboard() {
  const [data, setData] = useState(EMPTY_PRAYER);
  const [form, setForm] = useState({
    subuh: "",
    zuhur: "",
    asar: "",
    maghrib: "",
    isya: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");

  const headers = useMemo(() => {
    const token = getAdminToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const loadPrayerData = async () => {
    try {
      setLoading(true);
      setErr("");

      const res = await http.get("/api/prayer");
      const payload = res?.data || {};

      const nextData = {
        date: payload.date || "",
        location: payload.location || "Masjid Kagawa",
        timezone: payload.timezone || "Asia/Tokyo",
        adzan: {
          subuh: payload?.adzan?.subuh || "-",
          syuruq: payload?.adzan?.syuruq || "-",
          zuhur: payload?.adzan?.zuhur || "-",
          asar: payload?.adzan?.asar || "-",
          maghrib: payload?.adzan?.maghrib || "-",
          isya: payload?.adzan?.isya || "-",
        },
        iqamah: {
          subuh: payload?.iqamah?.subuh || "",
          zuhur: payload?.iqamah?.zuhur || "",
          asar: payload?.iqamah?.asar || "",
          maghrib: payload?.iqamah?.maghrib || "",
          isya: payload?.iqamah?.isya || "",
        },
      };

      setData(nextData);
      setForm(nextData.iqamah);
    } catch (e) {
      console.error(e);
      setErr("Gagal memuat data jadwal shalat.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrayerData();
  }, []);

  const onChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const submitIqamah = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setErr("");
      setInfo("");

      const payload = {
        subuh: form.subuh,
        zuhur: form.zuhur,
        asar: form.asar,
        maghrib: form.maghrib,
        isya: form.isya,
      };

      await http.put("/api/prayer/iqamah", payload, { headers });

      setInfo("Jam iqamah berhasil diperbarui.");
      await loadPrayerData();
    } catch (e) {
      console.error(e);
      setErr(
        e?.response?.data?.message ||
          "Gagal menyimpan jam iqamah. Pastikan login admin masih aktif."
      );
    } finally {
      setSaving(false);
    }
  };

  const rows = [
    {
      key: "subuh",
      name: "Subuh",
      adzan: data.adzan.subuh,
      iqamah: form.subuh,
    },
    {
      key: "syuruq",
      name: "Syuruq",
      adzan: data.adzan.syuruq,
      iqamah: "-",
      locked: true,
    },
    {
      key: "zuhur",
      name: "Dzuhur",
      adzan: data.adzan.zuhur,
      iqamah: form.zuhur,
    },
    {
      key: "asar",
      name: "Ashar",
      adzan: data.adzan.asar,
      iqamah: form.asar,
    },
    {
      key: "maghrib",
      name: "Maghrib",
      adzan: data.adzan.maghrib,
      iqamah: form.maghrib,
    },
    {
      key: "isya",
      name: "Isya",
      adzan: data.adzan.isya,
      iqamah: form.isya,
    },
  ];

  return (
    <AdminLayout title="Jadwal Shalat">
      <div className="admin-prayer">
        <div className="admin-prayer__header">
          <div>
            <h2>Kelola Jam Iqamah</h2>
            <p>
              Waktu adzan diambil otomatis dari Aladhan. Admin hanya mengatur
              jam iqamah resmi Masjid Kagawa.
            </p>
          </div>
        </div>

        {(err || info) && (
          <div
            className={`admin-prayer__notice ${
              err ? "admin-prayer__notice--error" : "admin-prayer__notice--success"
            }`}
          >
            {err || info}
          </div>
        )}

        <div className="admin-prayer__summary">
          <div className="admin-prayer__summary-card">
            <span className="admin-prayer__summary-label">Lokasi</span>
            <strong>{data.location}</strong>
          </div>

          <div className="admin-prayer__summary-card">
            <span className="admin-prayer__summary-label">Tanggal</span>
            <strong>{formatDateLabel(data.date)}</strong>
          </div>

          <div className="admin-prayer__summary-card">
            <span className="admin-prayer__summary-label">Zona Waktu</span>
            <strong>{data.timezone}</strong>
          </div>
        </div>

        <div className="admin-prayer__grid">
          <section className="admin-card">
            <div className="admin-card-header">
              <div>
                <p className="admin-card-title">Jadwal Hari Ini</p>
                <p className="admin-card-subtitle">
                  Kolom adzan otomatis, kolom iqamah dapat diatur admin.
                </p>
              </div>
            </div>

            <div className="admin-card-body">
              {loading ? (
                <div className="admin-prayer__state">Memuat jadwal...</div>
              ) : (
                <div className="admin-prayer__table-wrap">
                  <table className="admin-prayer__table">
                    <thead>
                      <tr>
                        <th>Shalat</th>
                        <th>Adzan</th>
                        <th>Iqamah Saat Ini</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr key={row.key}>
                          <td>{row.name}</td>
                          <td>{row.adzan}</td>
                          <td>{row.locked ? "-" : data.iqamah[row.key] || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>

          <section className="admin-card">
            <div className="admin-card-header">
              <div>
                <p className="admin-card-title">Update Jam Iqamah</p>
                <p className="admin-card-subtitle">
                  Gunakan format 24 jam, misalnya 05:55 atau 19:10.
                </p>
              </div>
            </div>

            <div className="admin-card-body">
              {loading ? (
                <div className="admin-prayer__state">Menyiapkan form...</div>
              ) : (
                <form className="admin-prayer__form" onSubmit={submitIqamah}>
                  <div className="admin-prayer__form-grid">
                    <label>
                      Subuh
                      <input
                        type="time"
                        value={form.subuh}
                        onChange={(e) => onChange("subuh", e.target.value)}
                      />
                    </label>

                    <label>
                      Dzuhur
                      <input
                        type="time"
                        value={form.zuhur}
                        onChange={(e) => onChange("zuhur", e.target.value)}
                      />
                    </label>

                    <label>
                      Ashar
                      <input
                        type="time"
                        value={form.asar}
                        onChange={(e) => onChange("asar", e.target.value)}
                      />
                    </label>

                    <label>
                      Maghrib
                      <input
                        type="time"
                        value={form.maghrib}
                        onChange={(e) => onChange("maghrib", e.target.value)}
                      />
                    </label>

                    <label>
                      Isya
                      <input
                        type="time"
                        value={form.isya}
                        onChange={(e) => onChange("isya", e.target.value)}
                      />
                    </label>
                  </div>

                  <div className="admin-actions">
                    <button
                      className="admin-btn admin-btn-primary"
                      type="submit"
                      disabled={saving}
                    >
                      {saving ? "Menyimpan..." : "Simpan Jam Iqamah"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </section>
        </div>
      </div>
    </AdminLayout>
  );
}