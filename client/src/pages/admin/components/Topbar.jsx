export default function Topbar({ title, admin, onToggleSidebar }) {
  const name = admin?.name || "Admin";
  const role = admin?.role || "administrator";
  const email = admin?.email || "";
  const initial = name.slice(0, 1).toUpperCase();

  return (
    <header className="admin-topbar">
      <div className="admin-topbar-left">
        <button
          type="button"
          className="admin-menu-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle menu"
        >
          ☰
        </button>

        <div className="admin-topbar-titlewrap">
          <div className="admin-topbar-eyebrow">Admin Panel</div>
          <div className="admin-topbar-title">{title}</div>
        </div>
      </div>

      <div className="admin-topbar-right">
        <div className="admin-topbar-user">
          <div className="admin-topbar-name">{name}</div>
          <div className="admin-topbar-role">{email || role}</div>
        </div>

        <div className="admin-topbar-avatar">{initial}</div>
      </div>
    </header>
  );
}