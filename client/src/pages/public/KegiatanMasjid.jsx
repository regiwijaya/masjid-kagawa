import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ActivityCardLarge from "../../components/cards/ActivityCardLarge";
import PageHero from "../../components/common/PageHero";
import KegiatanCalendar from "../../components/calendar/KegiatanCalendar";
import "../../styles/pages/KegiatanMasjid.css";

import imgKajian from "../../assets/images/kajian2.png";
import imgAnak from "../../assets/images/anak.png";
import imgSosial from "../../assets/images/sosial.png";
import imgRemaja from "../../assets/images/remaja.png";

import http from "../../api/http";
import { heroConfig } from "../../config/heroConfig";

const API_BASE = "/api/activities";

const ORDERED_CATEGORIES = [
  "Semua",
  "Sosial",
  "Pendidikan",
  "Komunitas",
  "Anak",
  "Remaja",
  "Event Besar",
  "Lainnya",
];

// 🔥 FIX: STRIP HTML
function stripHtml(html) {
  if (!html) return "";
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
}

function formatDateLabel(dateString, startTime = "", endTime = "") {
  if (!dateString) return "-";

  const date = new Date(dateString);
  let dateLabel = dateString;

  if (!Number.isNaN(date.getTime())) {
    dateLabel = new Intl.DateTimeFormat("id-ID", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  }

  if (startTime && endTime) return `${dateLabel} • ${startTime}–${endTime}`;
  if (startTime) return `${dateLabel} • ${startTime}`;
  return dateLabel;
}

export default function KegiatanMasjid() {
  const [filter, setFilter] = useState("Semua");
  const [kegiatan, setKegiatan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const hero = heroConfig.kegiatan;

  useEffect(() => {
    let alive = true;

    const fetchKegiatan = async () => {
      try {
        setLoading(true);
        setErr("");

        const res = await http.get(API_BASE);
        const data = Array.isArray(res.data) ? res.data : [];

        if (!alive) return;
        setKegiatan(data);
      } catch (e) {
        console.error(e);
        if (!alive) return;
        setErr("Gagal memuat kegiatan. Coba refresh halaman.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    };

    fetchKegiatan();

    return () => {
      alive = false;
    };
  }, []);

  const categories = useMemo(() => {
    const available = new Set(kegiatan.map((k) => k.category).filter(Boolean));
    const ordered = ORDERED_CATEGORIES.filter(
      (cat) => cat === "Semua" || available.has(cat)
    );

    if (ordered.length > 1) return ordered;
    return ["Semua", ...[...available].filter(Boolean)];
  }, [kegiatan]);

  const kegiatanFiltered = useMemo(() => {
    if (filter === "Semua") return kegiatan;
    return kegiatan.filter((k) => k.category === filter);
  }, [filter, kegiatan]);

  const pickFallbackImage = (category) => {
    if (!category) return imgKajian;
    if (category.includes("Anak")) return imgAnak;
    if (category.includes("Remaja")) return imgRemaja;
    if (category.includes("Sosial")) return imgSosial;
    return imgKajian;
  };

  return (
    <div className="kegiatan-page">
      <PageHero
        backgroundImage={hero.image}
        eyebrow={hero.eyebrow}
        title={hero.title}
        subtitle={hero.subtitle}
        overlay={hero.overlay}
      />

      <section className="kegiatan-section">
        <div className="site-shell">

          <div className="kegiatan-section-head">
            <span className="kegiatan-section-eyebrow">
              Program & Aktivitas
            </span>
            <h2 className="kegiatan-section-title">Kegiatan Terbaru</h2>
            <p className="kegiatan-section-subtext">
              Kegiatan yang diselenggarakan Masjid Kagawa untuk mendidik,
              membina, mempererat ukhuwah, dan melayani kebutuhan komunitas.
            </p>
          </div>

          {categories.length > 1 && (
            <div className="filter-group">
              {categories.map((kat) => (
                <button
                  key={kat}
                  onClick={() => setFilter(kat)}
                  className={`filter-btn ${
                    filter === kat ? "filter-btn-active" : ""
                  }`}
                >
                  {kat}
                </button>
              ))}
            </div>
          )}

          {!loading && !err && kegiatanFiltered.length > 0 && (
            <div className="kegiatan-grid">
              {kegiatanFiltered.map((k) => {
                const id = k?.id || k?._id;

                if (!id) return null;

                const img = k.imageUrl || pickFallbackImage(k.category);

                return (
                  <Link
                    key={id}
                    to={`/kegiatan/${id}`}
                    className="kegiatan-card-link"
                  >
                    <ActivityCardLarge
                      img={img}
                      title={k.title}
                      date={formatDateLabel(
                        k.date,
                        k.startTime,
                        k.endTime
                      )}
                      category={k.category || "Kegiatan"}

                      // 🔥 FIX UTAMA DI SINI
                      desc={stripHtml(k.description).slice(0, 140) + "..."}
                    />
                  </Link>
                );
              })}
            </div>
          )}

          {!loading && !err && kegiatan.length > 0 && (
            <div style={{ marginTop: "60px" }}>
              <KegiatanCalendar kegiatan={kegiatan} />
            </div>
          )}

        </div>
      </section>
    </div>
  );
}