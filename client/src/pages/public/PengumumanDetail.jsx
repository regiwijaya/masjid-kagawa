import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "../../styles/pages/MasjidPages.css";
import http from "../../api/http";
import placeholder from "../../assets/images/placeholder.svg";

const API_BASE = "/api/announcements";
const BACKEND_BASE_URL = "https://api.masjidkagawa.com";

function getImageUrl(url) {
  if (!url) return placeholder;
  if (url.startsWith("http")) return url;
  if (url.startsWith("/")) return `${BACKEND_BASE_URL}${url}`;
  return `${BACKEND_BASE_URL}/${url}`;
}

function formatDateLabel(dateString) {
  if (!dateString) return "-";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;

  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default function PengumumanDetail() {
  const { id } = useParams();
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;

    const fetchDetail = async () => {
      try {
        setLoading(true);
        setErr("");

        const res = await http.get(`${API_BASE}/${id}`);
        const data = res.data;

        if (!alive) return;
        setAnnouncement(data);
      } catch (e) {
        console.error(e);
        if (!alive) return;
        setErr("Detail pengumuman tidak ditemukan atau gagal dimuat.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    };

    fetchDetail();

    return () => {
      alive = false;
    };
  }, [id]);

  if (loading) {
    return (
      <section className="detail-page-section">
        <div className="site-shell">
          <div className="detail-state-card">
            <p>Memuat detail pengumuman…</p>
          </div>
        </div>
      </section>
    );
  }

  if (err) {
    return (
      <section className="detail-page-section">
        <div className="site-shell">
          <div className="detail-state-card detail-state-card--error">
            <p>{err}</p>
            <Link to="/pengumuman" className="detail-back-link">
              ← Kembali ke daftar pengumuman
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (!announcement) return null;

  const poster = getImageUrl(announcement.imageUrl);
  const title = announcement.title || "Pengumuman";
  const dateText = formatDateLabel(announcement.date);
  const category = announcement.category || "Pengumuman";
  const desc =
    announcement.description ||
    announcement.summary ||
    "Informasi detail pengumuman akan segera diperbarui.";

  return (
    <section className="detail-page-section">
      <div className="site-shell">
        <div className="detail-page-wrap">
          <Link to="/pengumuman" className="detail-back-link">
            ← Kembali ke daftar pengumuman
          </Link>

          <article className="detail-article-card">
            <div className="detail-media-wrap">
              <img
                src={poster}
                alt={title}
                className="detail-media-image"
                onError={(e) => {
                  e.currentTarget.src = placeholder;
                }}
              />
            </div>

            <div className="detail-article-body">
              <div className="detail-meta-row">
                <span className="detail-badge">{category}</span>
                {dateText && <span className="detail-date">{dateText}</span>}
              </div>

              <h1 className="detail-title">{title}</h1>

              <div className="detail-divider"></div>

              <div className="detail-content">
                <p>{desc}</p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}