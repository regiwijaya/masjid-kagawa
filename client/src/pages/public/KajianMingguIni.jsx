import { useEffect, useMemo, useState } from "react";
import PageHero from "../../components/common/PageHero";
import "../../styles/pages/KajianMingguIni.css";
import http from "../../api/http";
import { heroConfig } from "../../config/heroConfig";
import placeholder from "../../assets/images/placeholder.svg";

const ORDERED_CATEGORIES = [
  "Semua",
  "Tauhid",
  "Aqidah",
  "Fiqih",
  "Hadits",
  "Tafsir",
  "Sirah",
  "Adab",
  "Lainnya",
];

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

function isNewItem(item) {
  const ref = item.createdAt || item.updatedAt || item.date;
  if (!ref) return false;

  const date = new Date(ref);
  if (Number.isNaN(date.getTime())) return false;

  const diff = Date.now() - date.getTime();
  return diff <= 7 * 24 * 60 * 60 * 1000;
}

export default function KajianMingguIni() {
  const [kajianList, setKajianList] = useState([]);
  const [filter, setFilter] = useState("Semua");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const hero = heroConfig.kajian;

  useEffect(() => {
    let alive = true;

    const fetchKajian = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await http.get("/api/kajian");
        const items = Array.isArray(res.data) ? res.data : [];

        if (!alive) return;
        setKajianList(items);
      } catch (err) {
        console.error("Gagal memuat data kajian:", err);
        if (!alive) return;
        setError("Data kajian belum dapat dimuat. Silakan coba lagi.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    };

    fetchKajian();

    return () => {
      alive = false;
    };
  }, []);

  const categories = useMemo(() => {
    const available = new Set(
      kajianList.map((item) => item.category).filter(Boolean)
    );

    const ordered = ORDERED_CATEGORIES.filter(
      (cat) => cat === "Semua" || available.has(cat)
    );

    if (ordered.length > 1) return ordered;
    return ["Semua", ...[...available].filter(Boolean)];
  }, [kajianList]);

  const filteredKajian = useMemo(() => {
    if (filter === "Semua") return kajianList;
    return kajianList.filter((item) => item.category === filter);
  }, [kajianList, filter]);

  return (
    <div className="kajian-page">
      {/* HERO (pakai system) */}
      <PageHero
        backgroundImage={hero.image}
        eyebrow={hero.eyebrow}
        title={hero.title}
        subtitle={hero.subtitle}
        overlay={hero.overlay}
      />

      <section className="kajian-section">
        <div className="site-shell">
          <div className="kajian-section-head">
            <span className="kajian-section-eyebrow">Jadwal Kajian</span>

            <h2 className="kajian-section-title">
              Kajian Terbaru & Pembinaan Ilmu
            </h2>

            <p className="kajian-section-subtext">
              Ikuti kajian rutin dan tematik yang diselenggarakan di Masjid
              Kagawa, mulai dari tauhid, aqidah, fiqih, hingga sirah dan adab.
            </p>
          </div>

          {categories.length > 1 && (
            <div className="kajian-filter-group">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFilter(cat)}
                  className={`kajian-filter-btn ${
                    filter === cat ? "is-active" : ""
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="kajian-state">Memuat data kajian...</div>
          ) : error ? (
            <div className="kajian-state kajian-state--error">{error}</div>
          ) : filteredKajian.length === 0 ? (
            <div className="kajian-state">
              Belum ada kajian pada kategori ini.
            </div>
          ) : (
            <div className="kajian-list">
              {filteredKajian.map((item) => (
                <article className="kajian-card" key={item._id}>
                  <div className="kajian-card__media">
                    <img
                      src={item.imageUrl || placeholder}
                      alt={item.title}
                      className="kajian-card__image"
                      onError={(e) => {
                        e.currentTarget.src = placeholder;
                      }}
                    />

                    <div className="kajian-card__badges">
                      <span className="kajian-card__badge">
                        {item.category || "Lainnya"}
                      </span>

                      {isNewItem(item) && (
                        <span className="kajian-card__badge kajian-card__badge--new">
                          NEW
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="kajian-card__content">
                    <div className="kajian-card__meta">
                      <span>{formatDateLabel(item.date)}</span>
                      {item.time && <span>{item.time}</span>}
                    </div>

                    <h3 className="kajian-card__title">{item.title}</h3>

                    <div className="kajian-card__info">
                      {item.ustadz && (
                        <p>
                          <strong>Ustadz:</strong> {item.ustadz}
                        </p>
                      )}

                      {item.location && (
                        <p>
                          <strong>Tempat:</strong> {item.location}
                        </p>
                      )}
                    </div>

                    {item.description && (
                      <p className="kajian-card__desc">
                        {item.description}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}