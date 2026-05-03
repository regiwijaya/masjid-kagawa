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
  const [kajian, setKajian] = useState([]);
  const [posts, setPosts] = useState([]);
  const [prayer, setPrayer] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const headers = useMemo(() => {
    const token = getAdminToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  useEffect(() => {
    fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [annRes, actRes, kajianRes, postRes, prayerRes] =
        await Promise.all([
          http.get("/api/announcements/admin/all", { headers }),
          http.get("/api/activities/admin/all", { headers }),
          http.get("/api/kajian/admin/all", { headers }),
          http.get("/api/posts/admin/all", { headers }),
          http.get("/api/prayer"),
        ]);

      setAnnouncements(normalizeArray(annRes));
      setActivities(normalizeArray(actRes));
      setKajian(normalizeArray(kajianRes));
      setPosts(normalizeArray(postRes));
      setPrayer(prayerRes?.data || null);
    } catch (err) {
      console.error("Dashboard error:", err);
      setError("Dashboard belum dapat memuat data. Periksa backend atau login admin.");
    } finally {
      setLoading(false);
    }
  };

  const publishedAnnouncements = announcements.filter((item) => item.isPublished);
  const upcomingActivities = activities.filter(
    (item) => item.isPublished && isFutureOrToday(item.date)
  );
  const upcomingKajian = kajian.filter(
    (item) => item.isPublished && isFutureOrToday(item.date)
  );
  const publishedPosts = posts.filter((item) => item.isPublished);

  const draftCount =
    announcements.filter((item) => !item.isPublished).length +
    activities.filter((item) => !item.isPublished).length +
    kajian.filter((item) => !item.isPublished).length +
    posts.filter((item) => !item.isPublished).length;

  const noImageCount =
    announcements.filter((item) => !item.imageUrl).length +
    activities.filter((item) => !item.imageUrl).length +
    kajian.filter((item) => !item.imageUrl).length +
    posts.filter((item) => !item.imageUrl).length;

  const featuredAnnouncements = announcements.filter(
    (item) => item.isPublished && item.isFeatured
  );
  const featuredActivities = activities.filter(
    (item) => item.isPublished && item.isFeatured
  );
  const featuredKajian = kajian.filter(
    (item) => item.isPublished && item.isFeatured
  );

  const latestAnnouncements = [...announcements]
    .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
    .slice(0, 3);

  const latestActivities = [...activities]
    .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
    .slice(0, 3);

  const latestKajian = [...kajian]
    .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
    .slice(0, 3);

  const latestPosts = [...posts]
    .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
    .slice(0, 3);

  const statCards = [
    {
      label: "Pengumuman Aktif",
      value: publishedAnnouncements.length,
      to: "/admin/pengumuman",
      icon: "📣",
    },
    {
      label: "Kajian Mendatang",
      value: upcomingKajian.length,
      to: "/admin/kajian",
      icon: "📖",
    },
    {
      label: "Kegiatan Mendatang",
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
  ];

  const attentionItems = [
    {
      label: "Draft belum dipublish",
      value: draftCount,
      tone: draftCount > 0 ? "warning" : "good",
    },
    {
      label: "Konten tanpa gambar/poster",
      value: noImageCount,
      tone: noImageCount > 0 ? "warning" : "good",
    },
    {
      label: "Featured pengumuman",
      value: featuredAnnouncements.length,
      tone: featuredAnnouncements.length === 0 ? "warning" : "good",
    },
    {
      label: "Featured kajian",
      value: featuredKajian.length,
      tone: featuredKajian.length === 0 ? "warning" : "good",
    },
    {
      label: "Featured kegiatan",
      value: featuredActivities.length,
      tone: featuredActivities.length === 0 ? "warning" : "good",
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
            <p>
              Ringkasan kondisi website, konten terbaru, jadwal shalat hari ini,
              dan hal-hal yang perlu diperhatikan oleh admin.
            </p>
          </div>

          <div className="admin-dashboard-hero-status">
            <span>Website</span>
            <strong>Aktif</strong>
          </div>
        </section>

        {error && <div className="admin-dashboard-error">{error}</div>}

        <section className="admin-dashboard-stats">
          {statCards.map((item) => (
            <Link to={item.to} className="admin-dashboard-stat-card" key={item.label}>
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
            <div className="admin-card-header admin-dashboard-card-header">
              <div>
                <p className="admin-card-title">Jadwal Shalat Hari Ini</p>
                <p className="admin-card-subtitle">
                  Ringkasan adzan dan iqamah yang tampil di website publik.
                </p>
              </div>

              <Link to="/admin/prayer" className="admin-dashboard-small-link">
                Kelola Iqamah
              </Link>
            </div>

            <div className="admin-card-body">
              {loading ? (
                <p className="admin-muted">Memuat jadwal...</p>
              ) : (
                <div className="admin-dashboard-prayer-list">
                  {prayerRows.map(([name, adzan, iqamah]) => (
                    <div className="admin-dashboard-prayer-row" key={name}>
                      <span>{name}</span>
                      <div>
                        <strong>{adzan || "-"}</strong>
                        <small>Iqamah: {iqamah || "-"}</small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="admin-card">
            <div className="admin-card-header">
              <p className="admin-card-title">Perlu Perhatian</p>
              <p className="admin-card-subtitle">
                Poin yang sebaiknya dicek agar website tetap lengkap.
              </p>
            </div>

            <div className="admin-card-body">
              <div className="admin-dashboard-attention-list">
                {attentionItems.map((item) => (
                  <div
                    className={`admin-dashboard-attention-item is-${item.tone}`}
                    key={item.label}
                  >
                    <span>{item.label}</span>
                    <strong>{loading ? "…" : item.value}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="admin-card">
          <div className="admin-card-header">
            <p className="admin-card-title">Konten Terbaru di Website</p>
            <p className="admin-card-subtitle">
              Preview ringkas konten terakhir dari setiap modul.
            </p>
          </div>

          <div className="admin-card-body">
            <div className="admin-dashboard-content-grid">
              <ContentColumn
                title="Pengumuman"
                items={latestAnnouncements}
                to="/admin/pengumuman"
                empty="Belum ada pengumuman."
              />
              <ContentColumn
                title="Kajian"
                items={latestKajian}
                to="/admin/kajian"
                empty="Belum ada kajian."
              />
              <ContentColumn
                title="Kegiatan"
                items={latestActivities}
                to="/admin/kegiatan"
                empty="Belum ada kegiatan."
              />
              <ContentColumn
                title="Artikel"
                items={latestPosts}
                to="/admin/posts"
                empty="Belum ada artikel."
              />
            </div>
          </div>
        </section>

        <section className="admin-dashboard-homepage-status">
          <div className="admin-card">
            <div className="admin-card-header">
              <p className="admin-card-title">Status Homepage</p>
              <p className="admin-card-subtitle">
                Jumlah konten pilihan yang dapat ditampilkan di halaman utama.
              </p>
            </div>

            <div className="admin-card-body">
              <div className="admin-dashboard-featured-row">
                <FeaturedBox label="Pengumuman Pilihan" value={featuredAnnouncements.length} />
                <FeaturedBox label="Kajian Pilihan" value={featuredKajian.length} />
                <FeaturedBox label="Kegiatan Pilihan" value={featuredActivities.length} />
              </div>
            </div>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}

function ContentColumn({ title, items, to, empty }) {
  return (
    <div className="admin-dashboard-content-column">
      <div className="admin-dashboard-content-column-head">
        <h4>{title}</h4>
        <Link to={to}>Lihat semua</Link>
      </div>

      {items.length === 0 ? (
        <p className="admin-dashboard-empty">{empty}</p>
      ) : (
        <div className="admin-dashboard-content-list">
          {items.map((item) => (
            <div className="admin-dashboard-content-item" key={item._id}>
              <strong>{item.title}</strong>
              <span>
                {item.category || "Umum"} • {formatDate(item.date || item.createdAt)}
              </span>
              <div>
                <em className={item.isPublished ? "is-published" : "is-draft"}>
                  {item.isPublished ? "Published" : "Draft"}
                </em>
                {item.isFeatured && <em className="is-featured">Featured</em>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FeaturedBox({ label, value }) {
  return (
    <div className={`admin-dashboard-featured-box ${value === 0 ? "is-empty" : ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}