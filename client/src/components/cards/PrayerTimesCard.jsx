import "../../styles/components/Card.css";

function getPrayerIcon(name) {
  const lower = String(name).toLowerCase();

  if (lower === "subuh") return "bi-brightness-alt-high";
  if (lower === "syuruq") return "bi-sunrise";
  if (lower === "dzuhur" || lower === "zuhur") return "bi-sun";
  if (lower === "ashar" || lower === "asar") return "bi-brightness-high";
  if (lower === "maghrib") return "bi-moon";
  if (lower === "isya") return "bi-stars";

  return "bi-clock";
}

export default function PrayerTimesCard({ name, time, iqamah = "-" }) {
  return (
    <article className="card-prayer card-prayer--simple">
      <div className="card-prayer__icon" aria-hidden="true">
        <i className={`bi ${getPrayerIcon(name)}`}></i>
      </div>

      <span className="card-prayer__label">{name}</span>
      <strong className="card-prayer__time">{time}</strong>

      {iqamah && iqamah !== "-" ? (
        <div className="card-prayer__iqamah">
          <span>Jamaah:</span>
          <strong>{iqamah}</strong>
        </div>
      ) : (
        <div className="card-prayer__iqamah card-prayer__iqamah--empty">
          <span>-</span>
        </div>
      )}
    </article>
  );
}