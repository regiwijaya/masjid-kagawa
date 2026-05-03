import "../../styles/components/Card.css";
import placeholder from "../../assets/images/placeholder.svg";

export default function ActivityCardLarge({
  img,
  title,
  date,
  category,
  desc,
}) {
  return (
    <article className="card-base card-activity-large">
      <div className="card-media card-activity-large__media">
        <img
          src={img || placeholder}
          alt={title}
          className="card-media__image"
          onError={(e) => {
            e.currentTarget.src = placeholder;
          }}
        />
      </div>

      <div className="card-body-modern card-activity-large__body">
        <div className="card-meta-row card-activity-large__meta">
          <span className="card-badge">{category || "Kegiatan"}</span>
          <span className="card-date">{date || ""}</span>
        </div>

        <h3 className="card-title card-activity-large__title">{title}</h3>

        <p className="card-desc card-activity-large__desc">
          {desc || "Informasi kegiatan akan segera diperbarui."}
        </p>

        <div className="card-link-btn card-link-btn--static">
          Lihat Detail
        </div>
      </div>
    </article>
  );
}