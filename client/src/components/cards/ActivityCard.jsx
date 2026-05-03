import "../../styles/components/Card.css";

export default function ActivityCard({ icon, title, desc }) {
  return (
    <article className="activity-card">
      <div className="activity-card__icon">
        <i className={`bi ${icon}`}></i>
      </div>

      <div className="activity-card__content">
        <h3 className="activity-card__title">{title}</h3>
        <p className="activity-card__desc">{desc}</p>
      </div>
    </article>
  );
}