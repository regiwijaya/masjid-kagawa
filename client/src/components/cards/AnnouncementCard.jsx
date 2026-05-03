import { Link } from "react-router-dom";
import "../../styles/components/Card.css";
import placeholder from "../../assets/images/placeholder.svg";

function formatDate(dateString) {
  if (!dateString) return "-";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function AnnouncementCard({
  id,
  img,
  title,
  date,
  desc,
  category = "Pengumuman",
}) {
  const imageSrc = img || placeholder;

  return (
    <article className="card-base card-announcement">
      <div className="card-media card-announcement__media">
        <img
          src={imageSrc}
          alt={title}
          className="card-media__image"
          onError={(e) => {
            e.currentTarget.src = placeholder;
          }}
        />
      </div>

      <div className="card-body-modern card-announcement__body">
        <div className="card-meta-row">
          <span className="card-badge">{category}</span>
          <span className="card-date">{formatDate(date)}</span>
        </div>

        <h3 className="card-title">{title}</h3>

        <p className="card-desc">{desc}</p>

        {id ? (
          <Link to={`/pengumuman/${id}`} className="card-link-btn">
            Lihat Detail
          </Link>
        ) : (
          <div className="card-link-btn card-link-btn--static">
            Lihat Detail
          </div>
        )}
      </div>
    </article>
  );
}