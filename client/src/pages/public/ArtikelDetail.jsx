import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import PageHero from "../../components/common/PageHero";
import http from "../../api/http";
import "../../styles/pages/ArtikelDetail.css";
import placeholder from "../../assets/images/placeholder.svg";

function formatDate(dateString) {
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

export default function ArtikelDetail() {
  const { slug } = useParams();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await http.get(`/api/posts/${slug}`);
        setPost(res.data);
      } catch (err) {
        console.error(err);
        setError("Artikel tidak ditemukan atau gagal dimuat.");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  if (loading) {
    return <p className="artikel-detail-state">Memuat artikel...</p>;
  }

  if (error || !post) {
    return (
      <div className="artikel-detail-page">
        <div className="site-shell">
          <div className="artikel-detail-error">
            <p>{error || "Artikel tidak ditemukan."}</p>
            <Link to="/artikel" className="artikel-detail-back">
              ← Kembali ke daftar artikel
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="artikel-detail-page">
      <PageHero
        backgroundImage={post.imageUrl || placeholder}
        eyebrow={post.category || "Artikel"}
        title={post.title}
        subtitle={`${post.author || "Admin"} • ${formatDate(post.createdAt)}`}
      />

      <section className="artikel-detail-content">
        <div className="site-shell">
          <article className="artikel-detail-article">
            <Link to="/artikel" className="artikel-detail-back">
              ← Kembali ke daftar artikel
            </Link>

            <img
              src={post.imageUrl || placeholder}
              alt={post.title}
              className="artikel-detail-image"
              onError={(e) => {
                e.currentTarget.src = placeholder;
              }}
            />

            <div className="artikel-detail-meta">
              <span className="artikel-detail-badge">
                {post.category || "Artikel"}
              </span>
              <span className="artikel-detail-date">
                {formatDate(post.createdAt)}
              </span>
            </div>

            <h1 className="artikel-detail-title">{post.title}</h1>

            {post.excerpt && (
              <p className="artikel-detail-excerpt">{post.excerpt}</p>
            )}

            <div
              className="artikel-detail-body"
              dangerouslySetInnerHTML={{ __html: post.content || "<p>-</p>" }}
            />
          </article>
        </div>
      </section>
    </div>
  );
}