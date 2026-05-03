import "../../styles/components/HomeNewsFeed.css";

export default function HomeNewsFeed({
  kicker,
  title,
  moreHref,
  moreLabel = "Lihat semua →",
  categories = [],
  filter = "Semua",
  onFilterChange,
  loading = false,
  error = "",
  items = [],
  emptyText = "Belum ada data.",
}) {
  return (
    <section className="home-news-feed">
      <div className="home-news-feed__head">
        <div>
          <span className="home-news-feed__kicker">{kicker}</span>
          <h2 className="home-news-feed__title">{title}</h2>
        </div>

        <a href={moreHref} className="home-news-feed__more-link">
          {moreLabel}
        </a>
      </div>

      {categories.length > 1 && (
        <div className="home-news-feed__tabs">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => onFilterChange?.(cat)}
              className={`home-news-feed__tab ${
                filter === cat ? "is-active" : ""
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="home-news-feed__state">Memuat data...</div>
      ) : error ? (
        <div className="home-news-feed__state home-news-feed__state--error">
          {error}
        </div>
      ) : items.length === 0 ? (
        <div className="home-news-feed__state">{emptyText}</div>
      ) : (
        <div className="home-news-feed__list">
          {items.map((item) => (
            <a
              key={item.id}
              href={item.href}
              className="home-news-feed__item"
            >
              <div className="home-news-feed__date-wrap">
                <span className="home-news-feed__date">{item.dateLabel}</span>
              </div>

              <div className="home-news-feed__content">
                <span className="home-news-feed__item-title">{item.title}</span>
              </div>

              <div className="home-news-feed__meta">
                {item.isNew && (
                  <span className="home-news-feed__badge home-news-feed__badge--new">
                    NEW
                  </span>
                )}

                {item.category && (
                  <span className="home-news-feed__badge">
                    {item.category}
                  </span>
                )}
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}