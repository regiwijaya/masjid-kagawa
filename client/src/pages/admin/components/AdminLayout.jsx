import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "../../../styles/admin/AdminLayout.css";

const MOBILE_BP = 900;

export default function AdminLayout({ children, title = "Admin Panel" }) {
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [admin, setAdmin] = useState(null);

  const [isMobile, setIsMobile] = useState(() =>
    window.matchMedia(`(max-width:${MOBILE_BP}px)`).matches
  );

  const [sidebarOpen, setSidebarOpen] = useState(() =>
  window.matchMedia(`(max-width:${MOBILE_BP}px)`).matches ? false : true
);
  const location = useLocation();

  useEffect(() => {
    const mq = window.matchMedia(`(max-width:${MOBILE_BP}px)`);

    const handleResize = () => {
  const mobile = mq.matches;
  setIsMobile(mobile);
  setSidebarOpen(mobile ? false : true);
};

    handleResize();

    mq.addEventListener?.("change", handleResize);
    return () => mq.removeEventListener?.("change", handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [location.pathname, isMobile]);

  useEffect(() => {
    if (!isMobile) return;

    document.body.style.overflow = sidebarOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen, isMobile]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");

    if (!token) {
      window.location.href = "/admin/login";
      return;
    }

    const controller = new AbortController();
    validateToken(token, controller.signal);

    return () => controller.abort();
  }, []);

  async function validateToken(token, signal) {
    try {
      const res = await fetch("/api/admin/me", {
        headers: { Authorization: `Bearer ${token}` },
        signal,
      });

      if (!res.ok) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("token");
        window.location.href = "/admin/login";
        return;
      }

      const data = await res.json();
      setAdmin(data);
      setAuthorized(true);
    } catch (err) {
      if (err?.name === "AbortError" || signal?.aborted) return;

      console.error("VALIDATION ERROR:", err);
      localStorage.removeItem("adminToken");
      localStorage.removeItem("token");
      window.location.href = "/admin/login";
    } finally {
      if (!signal?.aborted) setChecking(false);
    }
  }

  if (checking) {
    return (
      <div className="admin-loading-screen">
        <div className="admin-loading-card">
          <div className="admin-loading-mark">MK</div>
          <p>Memeriksa akses admin...</p>
        </div>
      </div>
    );
  }

  if (!authorized) return null;

  return (
    <div className={`admin-shell ${sidebarOpen ? "is-drawer-open" : ""}`}>
      <Topbar
        title={title}
        admin={admin}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
      />

      <div className="admin-body">
        <Sidebar
          open={sidebarOpen}
          isMobile={isMobile}
          onClose={() => setSidebarOpen(false)}
        />

        <button
          type="button"
          className="admin-drawer-overlay"
          aria-label="Tutup menu"
          onClick={() => setSidebarOpen(false)}
        />

        <main className="admin-workspace">
          <div className="admin-workspace-inner">{children}</div>
        </main>
      </div>
    </div>
  );
}