import { NavLink } from "react-router-dom";
import "../../styles/components/TopBar.css";

export default function TopBar() {
  return (
    <div className="topbar-global">
      <div className="topbar-inner">
        <div className="topbar-right">

          <div className="lang-switch">
            <button>JP</button>
            <button className="active">EN</button>
            <button>ID</button>
          </div>

          <span className="divider" />

          <NavLink to="/contact" className="contact-link">
            Contact
          </NavLink>

        </div>
      </div>
    </div>
  );
}