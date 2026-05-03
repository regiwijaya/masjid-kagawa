import "../../../styles/components/Button.css";

export default function ButtonOutline({ href, children }) {
  return (
    <a href={href} className="btn-global btn-outline-green">
      {children}
    </a>
  );
}
