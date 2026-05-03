import { useEffect, useMemo, useState } from "react";
import PageHero from "../../components/common/PageHero";
import AnnouncementCard from "../../components/cards/AnnouncementCard";
import "../../styles/pages/Pengumuman.css";
import http from "../../api/http";
import { heroConfig } from "../../config/heroConfig";

const ORDERED_CATEGORIES = ["Semua", "Umum", "Layanan", "Lainnya"];

export default function PengumumanPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [filter, setFilter] = useState("Semua");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const hero = heroConfig.pengumuman;

  useEffect(() => {
    let alive = true;

    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await http.get("/api/announcements");
        const data = Array.isArray(res.data) ? res.data : [];

        if (!alive) return;
        setAnnouncements(data);
      } catch (err) {
        console.error(err);
        if (!alive) return;
        setError("Pengumuman belum dapat dimuat. Silakan coba lagi.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    };

    fetchAnnouncements();

    return () => {
      alive = false;
    };
  }, []);

  const categories = useMemo(() => {
    const available = new Set(
      announcements.map((a) => a.category).filter(Boolean)
    );

    const ordered = ORDERED_CATEGORIES.filter(
      (cat) => cat === "Semua" || available.has(cat)
    );

    if (ordered.length > 1) return ordered;

    return ["Semua", ...[...available].filter(Boolean)];
  }, [announcements]);

  const filteredAnnouncements = useMemo(() => {
    if (filter === "Semua") return announcements;
    return announcements.filter((a) => a.category === filter);
  }, [filter, announcements]);

  return (
    <div className="pengumuman-page">
      <PageHero
        backgroundImage={hero.image}
        eyebrow={hero.eyebrow}
        title={hero.title}
        subtitle={hero.subtitle}
        overlay={hero.overlay}
      />

      <section className="pengumuman-section">
        <div className="site-shell">
          <div className="pengumuman-section-head">
            <span className="pengumuman-section-eyebrow">
              Informasi Terbaru
            </span>

            <h2 className="pengumuman-section-title">
              Pengumuman Masjid Kagawa
            </h2>

            <p className="pengumuman-section-subtext">
              Ikuti pengumuman terbaru, informasi layanan, dan pemberitahuan
              penting yang berkaitan dengan aktivitas Masjid Kagawa.
            </p>
          </div>

          {!loading && !error && categories.length > 1 && (
            <div className="pengumuman-filter-group">
              {categories.map((kat) => (
                <button
                  key={kat}
                  type="button"
                  onClick={() => setFilter(kat)}
                  className={`pengumuman-filter-btn ${
                    filter === kat ? "is-active" : ""
                  }`}
                >
                  {kat}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="pengumuman-state">Memuat pengumuman...</div>
          ) : error ? (
            <div className="pengumuman-state pengumuman-state--error">
              {error}
            </div>
          ) : filteredAnnouncements.length === 0 ? (
            <div className="pengumuman-state">
              Belum ada pengumuman yang tersedia.
            </div>
          ) : (
            <div className="pengumuman-grid">
              {filteredAnnouncements.map((a) => (
                <div key={a._id} className="pengumuman-grid__item">
                  <AnnouncementCard
                    id={a._id}
                    img={a.imageUrl}
                    title={a.title}
                    date={a.date}
                    desc={a.description || a.summary || ""}
                    category={a.category || "Umum"}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}