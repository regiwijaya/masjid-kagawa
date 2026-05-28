import "../../styles/components/LocationCard.css";

export default function LocationCard({
  title = "Masjid Kagawa",
  address = "Sakaide, Kagawa, Japan",
  mapUrl = "https://maps.google.com/?q=Masjid+Kagawa",
}) {
  return (
    <div className="location-card">
      <div className="location-card__content">
        <h3 className="location-card__title">{title}</h3>

        <p className="location-card__address">
          📍 {address}
        </p>

      </div>
    </div>
  );
}