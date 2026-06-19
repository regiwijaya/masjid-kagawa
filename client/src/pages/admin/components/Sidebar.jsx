import { Link, useLocation } from "react-router-dom";

const menuItems = [
  {
    to: "/admin/dashboard",
    icon: "📊",
    label: "Dashboard",
  },

  {
    type: "label",
    label: "Konten",
  },
  {
    to: "/admin/pengumuman",
    icon: "📣",
    label: "Pengumuman",
  },
  {
    to: "/admin/kegiatan",
    icon: "🕌",
    label: "Kegiatan Masjid",
  },
  {
    to: "/admin/posts",
    icon: "📝",
    label: "Artikel",
  },

  {
    type: "label",
    label: "Operasional",
  },
  {
    to: "/admin/prayer",
    icon: "🕰️",
    label: "Jadwal Shalat",
  },
  {
    to: "/admin/donasi",
    icon: "💝",
    label: "Donasi",
  },
  {
    to: "/admin/donation-confirmations",
    icon: "🧾",
    label: "Konfirmasi Donasi",
  },
  {
    to: "/admin/contact",
    icon: "📩",
    label: "Pesan Masuk",
  },

  {
    type: "label",
    label: "Website",
  },
  {
    to: "/admin/settings",
    icon: "🏛️",
    label: "Tentang Masjid",
  },
];

export default function Sidebar({ open, isMobile, onClose }) {
  const { pathname } = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("token");
    window.location.href = "/admin/login";
  };

  const isActive = (item) => {
    if (!item.to) return false;
    return pathname === item.to || pathname.startsWith(`${item.to}/`);
  };

  const closeIfMobile = () => {
    if (isMobile) onClose?.();
  };

  return (
    <aside className={`admin-sidebar ${open ? "is-open" : ""}`}>
      <div className="admin-sidebar-brand">
        <div className="admin-sidebar-logo">MK</div>

        <div className="admin-sidebar-brand-text">
          <div className="admin-sidebar-title">Masjid Kagawa</div>
          <div className="admin-sidebar-subtitle">Admin Command Center</div>
        </div>

        <button
          type="button"
          className="admin-sidebar-close"
          onClick={onClose}
          aria-label="Tutup sidebar"
        >
          ✕
        </button>
      </div>

      <nav className="admin-sidebar-nav" aria-label="Admin navigation">
        {menuItems.map((item, index) => {
          if (item.type === "label") {
            return (
              <div
                key={`${item.label}-${index}`}
                className="admin-sidebar-section-label"
              >
                {item.label}
              </div>
            );
          }

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`admin-sidebar-link ${
                isActive(item) ? "active" : ""
              }`}
              onClick={closeIfMobile}
            >
              <span className="admin-sidebar-icon">{item.icon}</span>
              <span className="admin-sidebar-link-text">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="admin-sidebar-footer">
        <div className="admin-sidebar-footer-note">
          <strong>Masjid Kagawa</strong>
          <span>Kelola konten website secara terpusat.</span>
        </div>

        <button type="button" className="admin-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </aside>
  );
}