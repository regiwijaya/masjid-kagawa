import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "../../styles/pages/MasjidPages.css";
import http from "../../api/http";
import placeholder from "../../assets/images/placeholder.svg";

const API_BASE = "/api/activities";
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

export default function EventDetail() {
  const { id } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;

    const fetchDetail = async () => {
      try {
        setLoading(true);
        setErr("");

        const res = await http.get(`${API_BASE}/${id}`);

        if (!alive) return;
        setData(res.data);
      } catch (e) {
        console.error("DETAIL ERROR:", e);
        if (!alive) return;
        setErr("Data tidak ditemukan atau gagal dimuat.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    };

    if (id) {
      fetchDetail();
    }

    return () => {
      alive = false;
    };
  }, [id]);

  if (loading) {
    return (
      <section className="detail-page-section">
        <div className="site-shell">
          <div className="detail-state-card">
            <p>Memuat detail...</p>
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

            <Link to="/kegiatan" className="detail-back-link">
              ← Kembali
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="detail-page-section">
        <div className="site-shell">
          <div className="detail-state-card">
            <p>Data kosong.</p>

            <Link to="/kegiatan" className="detail-back-link">
              ← Kembali
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const poster = getImageUrl(data?.imageUrl);
  const title = data?.title || "Event";
  const category = data?.category || "Kegiatan";
  const dateText = formatDateLabel(data?.date);

  const ustadz = data?.ustadz || "";
  const time =
    data?.time ||
    (data?.startTime
      ? `${data.startTime}${data.endTime ? " - " + data.endTime : ""}`
      : "");

  const locationText = data?.location || "";
  const desc = data?.description || "Informasi detail akan segera diperbarui.";

  return (
    <section className="detail-page-section">
      <div className="site-shell">
        <div className="detail-page-wrap">
          <Link to="/kegiatan" className="detail-back-link">
            ← Kembali
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

              {(ustadz || time || locationText) && (
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

                  {locationText && (
                    <p>
                      <strong>Tempat:</strong> {locationText}
                    </p>
                  )}
                </div>
              )}

              <div className="detail-divider"></div>

              <div
                className="detail-content"
                dangerouslySetInnerHTML={{ __html: desc }}
              />
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}