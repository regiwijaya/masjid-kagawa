import "../../styles/components/PageHero.css";

export default function PageHero({
  backgroundImage,
  overlay,
  eyebrow,
  title,
  subtitle,
  className = "",
}) {
  return (
    <section
      className={`page-hero ${className}`.trim()}
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div
        className="page-hero__overlay"
        style={overlay ? { background: overlay } : undefined}
      />

      <div className="site-shell">
        <div className="page-hero__content">
          {eyebrow && <span className="page-hero__eyebrow">{eyebrow}</span>}

          <h1 className="page-hero__title">{title}</h1>

          {subtitle && <p className="page-hero__subtitle">{subtitle}</p>}
        </div>
      </div>
    </section>
  );
}