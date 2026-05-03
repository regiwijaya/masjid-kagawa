import "../../../styles/components/Button.css";

export default function ButtonPrimary({ href, children }) {
  return (
    <a href={href} className="btn btn-gold btn-hero-primary">
      {children}
    </a>
  );
}