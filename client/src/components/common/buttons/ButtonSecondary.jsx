import "../../../styles/components/Button.css";

export default function ButtonSecondary({ href, children }) {
  return (
    <a href={href} className="btn btn-outline-white btn-hero-secondary">
      {children}
    </a>
  );
}