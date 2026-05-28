import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "./components/AdminLayout";
import http from "../../api/http";
import "../../styles/admin/AdminDashboard.css";

function getAdminToken() {
  return localStorage.getItem("adminToken") || localStorage.getItem("token") || "";
}

function normalizeArray(res) {
  return Array.isArray(res?.data) ? res.data : res?.data?.data || [];
}

function formatDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function isFutureOrToday(dateString) {
  if (!dateString) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return false;

  date.setHours(0, 0, 0, 0);
  return date >= today;
}

export default function AdminDashboard() {
  const [announcements, setAnnouncements] = useState([]);
  const [activities, setActivities] = useState([]);
  const [posts, setPosts] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [prayer, setPrayer] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const headers = useMemo(() => {
    const token = getAdminToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [annRes, actRes, postRes, prayerRes, contactRes] =
        await Promise.all([
          http.get("/api/announcements/admin/all", { headers }),
          http.get("/api/activities/admin/all", { headers }),
          http.get("/api/posts/admin/all", { headers }),
          http.get("/api/prayer"),
         http.get("/api/contact/admin", { headers }),
        ]);

      setAnnouncements(normalizeArray(annRes));
      setActivities(normalizeArray(actRes));
      setPosts(normalizeArray(postRes));
      setContacts(normalizeArray(contactRes));
      setPrayer(prayerRes?.data || null);
    } catch (err) {
      console.error("Dashboard error:", err);
      setError("Dashboard belum dapat memuat data.");
    } finally {
      setLoading(false);
    }
  };

  const publishedAnnouncements = announcements.filter((i) => i.isPublished);
  const upcomingActivities = activities.filter(
    (i) => i.isPublished && isFutureOrToday(i.date)
  );
  const publishedPosts = posts.filter((i) => i.isPublished);
  const unreadContacts = contacts.filter((c) => !c.isRead);

  const statCards = [
    {
      label: "Pengumuman Aktif",
      value: publishedAnnouncements.length,
      to: "/admin/pengumuman",
      icon: "📣",
    },
    {
      label: "Event Mendatang",
      value: upcomingActivities.length,
      to: "/admin/kegiatan",
      icon: "🕌",
    },
    {
      label: "Artikel Published",
      value: publishedPosts.length,
      to: "/admin/posts",
      icon: "📝",
    },
    {
      label: "Pesan Masuk",
      value: unreadContacts.length,
      to: "/admin/contact",
      icon: "📩",
    },
  ];

  const prayerRows = [
    ["Subuh", prayer?.adzan?.subuh, prayer?.iqamah?.subuh],
    ["Dzuhur", prayer?.adzan?.zuhur, prayer?.iqamah?.zuhur],
    ["Ashar", prayer?.adzan?.asar, prayer?.iqamah?.asar],
    ["Maghrib", prayer?.adzan?.maghrib, prayer?.iqamah?.maghrib],
    ["Isya", prayer?.adzan?.isya, prayer?.iqamah?.isya],
  ];

  return (
    <AdminLayout title="Dashboard">
      <div className="admin-dashboard-page">

        <section className="admin-dashboard-hero">
          <div>
            <span className="admin-dashboard-eyebrow">Masjid Kagawa Admin</span>
            <h1>Dashboard Masjid</h1>
            <p>Ringkasan kondisi website dan konten.</p>
          </div>
          <div className="admin-dashboard-hero-status">
            <span>Website</span>
            <strong>Aktif</strong>
          </div>
        </section>

        {error && <div className="admin-dashboard-error">{error}</div>}

        <section className="admin-dashboard-stats">
          {statCards.map((item) => (
            <Link key={item.label} to={item.to} className="admin-dashboard-stat-card">
              <div className="admin-dashboard-stat-icon">{item.icon}</div>
              <div>
                <p>{item.label}</p>
                <h3>{loading ? "…" : item.value}</h3>
              </div>
            </Link>
          ))}
        </section>

        <section className="admin-dashboard-main-grid">
          <div className="admin-card">
            <div className="admin-card-body">
              <div className="admin-dashboard-prayer-list">
                {prayerRows.map(([name, adzan, iqamah]) => (
                  <div key={name} className="admin-dashboard-prayer-row">
                    <span>{name}</span>
                    <div>
                      <strong>{adzan || "-"}</strong>
                      <small>Iqamah: {iqamah || "-"}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="admin-card">
            <div className="admin-card-body">
              <div className="admin-dashboard-attention-list">
                <div className="admin-dashboard-attention-item is-warning">
                  <span>Pesan belum dibaca</span>
                  <strong>{unreadContacts.length}</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </AdminLayout>
  );
}