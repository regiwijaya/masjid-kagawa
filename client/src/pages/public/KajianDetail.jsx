import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PageHero from "../../components/common/PageHero";
import http from "../../api/http";
import "../../styles/pages/DetailPage.css";
import placeholder from "../../assets/images/placeholder.svg";

export default function KajianDetail() {
  const { id } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await http.get(`/api/kajian/${id}`);
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <p className="detail-loading">Memuat...</p>;
  if (!data) return <p className="detail-error">Data tidak ditemukan</p>;

  return (
    <div className="detail-page">
      <PageHero
        backgroundImage={data.imageUrl || placeholder}
        eyebrow={data.category}
        title={data.title}
        subtitle={`${data.ustadz || "-"} • ${data.time || ""}`}
      />

      <section className="detail-content">
        <div className="site-shell">
          <article className="detail-article">
            <img
              src={data.imageUrl || placeholder}
              alt={data.title}
              className="detail-image"
              onError={(e) => (e.currentTarget.src = placeholder)}
            />

            <div className="detail-meta">
              <span className="detail-badge">{data.category}</span>
            </div>

            <h1 className="detail-title">{data.title}</h1>

            <div className="detail-info-box">
              <p><strong>Ustadz:</strong> {data.ustadz}</p>
              <p><strong>Waktu:</strong> {data.time}</p>
              <p><strong>Tempat:</strong> {data.location}</p>
            </div>

            <p className="detail-text">{data.description}</p>
          </article>
        </div>
      </section>
    </div>
  );
}