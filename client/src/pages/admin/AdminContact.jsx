import { useEffect, useMemo, useState, useCallback } from "react";
import AdminLayout from "./components/AdminLayout";
import http from "../../api/http";
import "../../styles/admin/AdminContact.css";

function getAdminToken() {
  return localStorage.getItem("adminToken") || localStorage.getItem("token") || "";
}

function formatDate(date) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export default function AdminContact() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [search, setSearch] = useState("");

  const headers = useMemo(() => {
    const token = getAdminToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setErr("");

      const res = await http.get("/api/contact/admin", { headers });
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
      setErr("Gagal memuat pesan.");
    } finally {
      setLoading(false);
    }
  }, [headers]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const remove = async (id) => {
    if (!window.confirm("Hapus pesan ini?")) return;

    try {
      await http.delete(`/api/contact/${id}`, { headers });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = items.filter((it) => {
    const q = search.toLowerCase();
    return (
      (it.message || "").toLowerCase().includes(q) ||
      (it.name || "").toLowerCase().includes(q) ||
      (it.contact || "").toLowerCase().includes(q)
    );
  });

  return (
    <AdminLayout title="Pesan Masuk">
      <div className="admin-page admin-contact-page">

        {/* HEADER */}
        <div className="admin-contact-header">
          <div>
            <h2>Pesan Masuk</h2>
            <p>Kelola pesan dari user website</p>
          </div>

          <div className="admin-contact-search">
            <input
              placeholder="Cari nama / pesan / kontak..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {err && <div className="admin-error-box">{err}</div>}

        {/* LIST */}
        <div className="admin-contact-list">

          {loading && (
            <div className="admin-contact-empty">
              Loading data...
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="admin-contact-empty">
              Tidak ada pesan ditemukan
            </div>
          )}

          {!loading &&
            filtered.map((it) => (
              <div key={it.id} className="admin-contact-card">

                {/* TOP */}
                <div className="admin-contact-top">
                  <div className="admin-contact-user">
                    <strong>
                      {it.isAnonymous ? "Anonim" : it.name || "-"}
                    </strong>

                    <div className="admin-contact-badges">
                      <span className="badge-type">{it.type}</span>
                      <span className="badge-category">{it.category}</span>
                    </div>
                  </div>

                  <button
                    className="admin-btn admin-btn-danger"
                    onClick={() => remove(it.id)}
                  >
                    Hapus
                  </button>
                </div>

                {/* META */}
                <div className="admin-contact-meta">
                  <span>{it.contact || "-"}</span>
                  <span>{formatDate(it.createdAt)}</span>
                </div>

                {/* MESSAGE */}
                <p className="admin-contact-message">
                  {it.message}
                </p>

              </div>
            ))}

        </div>
      </div>
    </AdminLayout>
  );
}