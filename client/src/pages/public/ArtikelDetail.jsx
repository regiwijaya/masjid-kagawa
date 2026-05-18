import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import PageHero from "../../components/common/PageHero";
import http from "../../api/http";
import "../../styles/pages/ArtikelDetail.css";
import placeholder from "../../assets/images/placeholder.svg";
import DOMPurify from "dompurify";

// =========================
// FORMAT DATE
// =========================
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

// =========================
// FIX: DECODE HTML
// =========================
function decodeHtml(html = "") {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

// =========================
// COMPONENT
// =========================
export default function ArtikelDetail() {
  const { slug } = useParams();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) {
      setError("Slug artikel tidak valid.");
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchPost = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await http.get(`/api/posts/slug/${slug}`);

        if (!res.data || !res.data.slug) {
          throw new Error("Data artikel tidak valid");
        }

        if (isMounted) {
          setPost(res.data);
        }
      } catch (err) {
        console.error("Fetch artikel error:", err);

        if (isMounted) {
          setError("Artikel tidak ditemukan atau gagal dimuat.");
          setPost(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPost();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div className="artikel-detail-page">
        <div className="artikel-detail-state">
          Memuat artikel...
        </div>
      </div>
    );
  }

  // =========================
  // ERROR
  // =========================
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

  // =========================
  // FINAL HTML (DECODE + SANITIZE)
  // =========================
  const safeHtml = DOMPurify.sanitize(
    decodeHtml(post.content || "<p>-</p>"),
    {
      ALLOWED_TAGS: [
        "p", "b", "i", "strong", "em",
        "h1", "h2", "h3",
        "ul", "ol", "li",
        "a", "img", "blockquote", "br"
      ],
      ALLOWED_ATTR: ["href", "src", "alt", "target"]
    }
  );

  // =========================
  // SUCCESS
  // =========================
  return (
    <div className="artikel-detail-page">
      <PageHero
        backgroundImage={post.imageUrl || placeholder}
        eyebrow={post.category || "Artikel"}
        title={post.title || "Tanpa Judul"}
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
              alt={post.title || "Artikel"}
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

            <h1 className="artikel-detail-title">
              {post.title || "Tanpa Judul"}
            </h1>

            {post.excerpt && (
              <p className="artikel-detail-excerpt">
                {post.excerpt}
              </p>
            )}

            <div
              className="artikel-detail-body"
              dangerouslySetInnerHTML={{ __html: safeHtml }}
            />

          </article>
        </div>
      </section>
    </div>
  );
}