import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageHero from "../../components/common/PageHero";
import http from "../../api/http";
import "../../styles/pages/Artikel.css";
import { heroConfig } from "../../config/heroConfig";
import placeholder from "../../assets/images/placeholder.svg";

function formatDate(dateString) {
  if (!dateString) return "-";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default function Artikel() {
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState("Semua");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await http.get("/api/posts");
        setPosts(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
        setError("Artikel belum dapat dimuat.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const categories = useMemo(() => {
    const set = new Set(posts.map((p) => p.category).filter(Boolean));
    return ["Semua", ...Array.from(set)];
  }, [posts]);

  const filteredPosts = useMemo(() => {
    if (filter === "Semua") return posts;
    return posts.filter((p) => p.category === filter);
  }, [filter, posts]);

  const hero = heroConfig.artikel;

  return (
    <div className="artikel-page">
      <PageHero
        backgroundImage={hero.image}
        overlay={hero.overlay}
        eyebrow="Tulisan & Wawasan"
        title="Artikel"
        subtitle="Tulisan dakwah, pembinaan, dan wawasan Islami dari Masjid Kagawa"
      />

      <section className="artikel-section">
        <div className="site-shell">
          <div className="artikel-head">
            <span className="artikel-head__eyebrow">Artikel Terbaru</span>
            <h2 className="artikel-head__title">Artikel & Tulisan Pilihan</h2>
            <p className="artikel-head__subtext">
              Bacaan yang memberi manfaat, menambah wawasan, dan menguatkan nilai Islam dalam kehidupan sehari-hari.
            </p>
          </div>

          {!loading && !error && categories.length > 1 && (
            <div className="artikel-filter">
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setFilter(item)}
                  className={`artikel-filter__btn ${
                    filter === item ? "is-active" : ""
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="artikel-state">Memuat artikel...</div>
          ) : error ? (
            <div className="artikel-state artikel-state--error">{error}</div>
          ) : filteredPosts.length === 0 ? (
            <div className="artikel-state">Belum ada artikel.</div>
          ) : (
            <div className="artikel-grid">
              {filteredPosts.map((post) => (
                <article key={post._id} className="artikel-card">
                  <Link to={`/artikel/${post.slug}`} className="artikel-card__media">
                    <img
                      src={post.imageUrl || placeholder}
                      alt={post.title}
                      onError={(e) => {
                        e.currentTarget.src = placeholder;
                      }}
                    />
                  </Link>

                  <div className="artikel-card__body">
                    <div className="artikel-card__meta">
                      <span className="artikel-card__badge">
                        {post.category || "Artikel"}
                      </span>
                      <span className="artikel-card__date">
                        {formatDate(post.createdAt)}
                      </span>
                    </div>

                    <h3 className="artikel-card__title">
                      <Link to={`/artikel/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h3>

                    <p className="artikel-card__excerpt">
                      {post.excerpt || "Ringkasan artikel belum tersedia."}
                    </p>

                    <div className="artikel-card__footer">
                      <span className="artikel-card__author">
                        {post.author || "Admin"}
                      </span>

                      <Link
                        to={`/artikel/${post.slug}`}
                        className="artikel-card__link"
                      >
                        Baca →
                      </Link>
                    </div>
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