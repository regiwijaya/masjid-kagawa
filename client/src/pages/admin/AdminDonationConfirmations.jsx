import { useCallback, useEffect, useMemo, useState } from "react";
import AdminLayout from "./components/AdminLayout";
import http from "../../api/http";
import "../../styles/admin/AdminDonationConfirmations.css";

const BACKEND_BASE_URL = "https://api.masjidkagawa.com";

function getAdminToken() {
  return localStorage.getItem("adminToken") || localStorage.getItem("token") || "";
}

function getImageUrl(url) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  if (url.startsWith("/")) return `${BACKEND_BASE_URL}${url}`;
  return `${BACKEND_BASE_URL}/${url}`;
}

function formatDate(date) {
  if (!date) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

function statusLabel(status) {
  if (status === "verified") return "Terverifikasi";
  if (status === "rejected") return "Ditolak";
  return "Pending";
}

export default function AdminDonationConfirmations() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [purpose, setPurpose] = useState("all");

  const headers = useMemo(() => {
    const token = getAdminToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setErr("");
      setInfo("");

      const res = await http.get("/api/donation-confirmations", { headers });
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("LOAD DONATION CONFIRMATIONS ERROR:", e);
      setErr("Gagal memuat konfirmasi donasi.");
    } finally {
      setLoading(false);
    }
  }, [headers]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const purposes = useMemo(() => {
    const unique = new Set();

    items.forEach((item) => {
      if (item.donationPurpose) unique.add(item.donationPurpose);
    });

    return Array.from(unique);
  }, [items]);

  const filtered = items.filter((item) => {
    const q = search.toLowerCase();

    const matchSearch =
      (item.donorName || "").toLowerCase().includes(q) ||
      (item.contact || "").toLowerCase().includes(q) ||
      (item.email || "").toLowerCase().includes(q) ||
      (item.donationPurpose || "").toLowerCase().includes(q) ||
      (item.amount || "").toLowerCase().includes(q);

    const matchStatus = status === "all" || item.status === status;
    const matchPurpose = purpose === "all" || item.donationPurpose === purpose;

    return matchSearch && matchStatus && matchPurpose;
  });

  const summary = useMemo(() => {
    return {
      total: items.length,
      pending: items.filter((item) => item.status === "pending").length,
      verified: items.filter((item) => item.status === "verified").length,
      rejected: items.filter((item) => item.status === "rejected").length,
    };
  }, [items]);

  async function updateStatus(id, nextStatus) {
    try {
      setErr("");
      setInfo("");

      await http.put(
        `/api/donation-confirmations/${id}/status`,
        { status: nextStatus },
        { headers }
      );

      setInfo("Status konfirmasi donasi berhasil diperbarui.");
      setSelected(null);
      await fetchData();
    } catch (e) {
      console.error("UPDATE DONATION CONFIRMATION STATUS ERROR:", e);
      setErr(e?.response?.data?.msg || "Gagal memperbarui status.");
    }
  }

  async function remove(id) {
    if (!window.confirm("Hapus konfirmasi donasi ini?")) return;

    try {
      setErr("");
      setInfo("");

      await http.delete(`/api/donation-confirmations/${id}`, { headers });

      setInfo("Konfirmasi donasi berhasil dihapus.");
      setSelected(null);
      await fetchData();
    } catch (e) {
      console.error("DELETE DONATION CONFIRMATION ERROR:", e);
      setErr(e?.response?.data?.msg || "Gagal menghapus data.");
    }
  }

  return (
    <AdminLayout title="Konfirmasi Donasi">
      <div className="admin-page admin-donation-confirm-page">
        <div className="admin-donation-confirm-header">
          <div>
            <h2>Konfirmasi Donasi</h2>
            <p>Kelola laporan donasi masuk dari jamaah.</p>
          </div>

          <div className="admin-donation-confirm-search">
            <input
              placeholder="Cari nama / kontak / tujuan / nominal..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {(err || info) && (
          <div
            className={`admin-donation-confirm-notice ${
              err
                ? "admin-donation-confirm-notice--error"
                : "admin-donation-confirm-notice--success"
            }`}
          >
            {err || info}
          </div>
        )}

        <div className="admin-donation-confirm-summary">
          <div>
            <span>Total</span>
            <strong>{summary.total}</strong>
          </div>
          <div>
            <span>Pending</span>
            <strong>{summary.pending}</strong>
          </div>
          <div>
            <span>Terverifikasi</span>
            <strong>{summary.verified}</strong>
          </div>
          <div>
            <span>Ditolak</span>
            <strong>{summary.rejected}</strong>
          </div>
        </div>

        <div className="admin-donation-confirm-filter">
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">Semua Status</option>
            <option value="pending">Pending</option>
            <option value="verified">Terverifikasi</option>
            <option value="rejected">Ditolak</option>
          </select>

          <select value={purpose} onChange={(e) => setPurpose(e.target.value)}>
            <option value="all">Semua Tujuan</option>
            {purposes.map((item) => (
              <option value={item} key={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="admin-donation-confirm-list">
          {loading && (
            <div className="admin-donation-confirm-empty">
              Loading data...
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="admin-donation-confirm-empty">
              Tidak ada konfirmasi donasi ditemukan.
            </div>
          )}

          {!loading &&
            filtered.map((item) => (
              <article className="admin-donation-confirm-card" key={item.id}>
                <div className="admin-donation-confirm-card-top">
                  <div>
                    <strong>{item.donorName || "Hamba Allah"}</strong>
                    <div className="admin-donation-confirm-badges">
                      <span className={`badge-status ${item.status}`}>
                        {statusLabel(item.status)}
                      </span>
                      <span className="badge-currency">{item.currency}</span>
                      <span className="badge-purpose">
                        {item.donationPurpose}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="admin-btn admin-btn-primary"
                    onClick={() => setSelected(item)}
                  >
                    Detail
                  </button>
                </div>

                <div className="admin-donation-confirm-meta">
                  <span>
                    Nominal:{" "}
                    <strong>
                      {item.amount || "-"} {item.currency}
                    </strong>
                  </span>
                  <span>{formatDate(item.createdAt)}</span>
                </div>

                <p className="admin-donation-confirm-message">
                  {item.message || "Tidak ada catatan."}
                </p>
              </article>
            ))}
        </div>

        {selected && (
          <div
            className="admin-donation-confirm-modal"
            onClick={() => setSelected(null)}
          >
            <div
              className="admin-donation-confirm-modal-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="admin-donation-confirm-modal-head">
                <div>
                  <h3>Detail Konfirmasi Donasi</h3>
                  <p>{formatDate(selected.createdAt)}</p>
                </div>

                <button type="button" onClick={() => setSelected(null)}>
                  ✕
                </button>
              </div>

              <div className="admin-donation-confirm-detail-grid">
                <div>
                  <span>Nama</span>
                  <strong>{selected.donorName || "Hamba Allah"}</strong>
                </div>
                <div>
                  <span>Status</span>
                  <strong>{statusLabel(selected.status)}</strong>
                </div>
                <div>
                  <span>Nominal</span>
                  <strong>
                    {selected.amount || "-"} {selected.currency}
                  </strong>
                </div>
                <div>
                  <span>Tujuan</span>
                  <strong>
                    {selected.donationPurpose}
                    {selected.otherPurpose ? ` - ${selected.otherPurpose}` : ""}
                  </strong>
                </div>
                <div>
                  <span>Metode</span>
                  <strong>{selected.paymentMethod || "-"}</strong>
                </div>
                <div>
                  <span>Kontak</span>
                  <strong>{selected.contact || "-"}</strong>
                </div>
                <div>
                  <span>Email</span>
                  <strong>{selected.email || "-"}</strong>
                </div>
              </div>

              <div className="admin-donation-confirm-detail-message">
                <span>Catatan</span>
                <p>{selected.message || "Tidak ada catatan."}</p>
              </div>

              {selected.proofImageUrl && (
                <div className="admin-donation-confirm-proof">
                  <span>Bukti Transfer</span>
                  <a
                    href={getImageUrl(selected.proofImageUrl)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img
                      src={getImageUrl(selected.proofImageUrl)}
                      alt="Bukti transfer"
                    />
                  </a>
                </div>
              )}

              <div className="admin-donation-confirm-actions">
                <button
                  className="admin-btn admin-btn-primary"
                  onClick={() => updateStatus(selected.id, "verified")}
                >
                  Verifikasi
                </button>

                <button
                  className="admin-btn admin-btn-warning"
                  onClick={() => updateStatus(selected.id, "rejected")}
                >
                  Tolak
                </button>

                <button
                  className="admin-btn admin-btn-danger"
                  onClick={() => remove(selected.id)}
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}