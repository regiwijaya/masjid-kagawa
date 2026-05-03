import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "../../styles/pages/MasjidPages.css";
import http from "../../api/http";
import placeholder from "../../assets/images/placeholder.svg";

const API_BASE = "/api/kajian";

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

export default function KajianDetail() {
  const { id } = useParams();
  const [kajian, setKajian] = useState(null);
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
        setKajian(data);
      } catch (e) {
        console.error(e);
        if (!alive) return;
        setErr("Detail kajian tidak ditemukan atau gagal dimuat.");
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
            <p>Memuat detail kajian…</p>
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
            <Link to="/kajian" className="detail-back-link">
              ← Kembali ke daftar kajian
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (!kajian) return null;

  const poster = kajian.imageUrl || placeholder;
  const title = kajian.title || "Kajian";
  const dateText = formatDateLabel(kajian.date);
  const category = kajian.category || "Kajian";
  const ustadz = kajian.ustadz || "";
  const time = kajian.time || "";
  const location = kajian.location || "";
  const desc =
    kajian.description || "Informasi detail kajian akan segera diperbarui.";

  return (
    <section className="detail-page-section">
      <div className="site-shell">
        <div className="detail-page-wrap">
          <Link to="/kajian" className="detail-back-link">
            ← Kembali ke daftar kajian
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

              {(ustadz || time || location) && (
                <div className="detail-info-box">
                  {ustadz && (
                    <p>
                      <strong>Ustadz:</strong> {ustadz}
                    </p>
                  )}
                  {time && (
                    <p>
                      <strong>Waktu:</strong> {time}
                    </p>
                  )}
                  {location && (
                    <p>
                      <strong>Tempat:</strong> {location}
                    </p>
                  )}
                </div>
              )}

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