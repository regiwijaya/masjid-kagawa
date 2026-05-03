import { useEffect, useMemo, useState, useCallback } from "react";
import AdminLayout from "./components/AdminLayout";
import http from "../../api/http";
import "../../styles/admin/AdminPengumuman.css";
import AdminImageUploader from "../../components/admin/AdminImageUploader";

const ANNOUNCEMENT_CATEGORIES = ["Umum", "Layanan", "Lainnya"];

const INITIAL_FORM = {
  title: "",
  category: "Umum",
  date: "",
  summary: "",
  imageUrl: "",
  isPublished: true,
  isFeatured: false,
};

function getAdminToken() {
  return localStorage.getItem("adminToken") || localStorage.getItem("token") || "";
}

export default function AdminPengumuman() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [editingId, setEditingId] = useState("");

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const headers = useMemo(() => {
    const token = getAdminToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const loadAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await http.get("/api/announcements/admin/all", { headers });
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data pengumuman.");
    } finally {
      setLoading(false);
    }
  }, [headers]);

  useEffect(() => {
    loadAnnouncements();
  }, [loadAnnouncements]);

  const filteredItems = items.filter((item) => {
    const title = item.title || "";
    const matchSearch = title.toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      filterStatus === "all"
        ? true
        : filterStatus === "published"
        ? item.isPublished
        : !item.isPublished;

    return matchSearch && matchStatus;
  });

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckbox = (name, checked) => {
    setForm((prev) => ({ ...prev, [name]: checked }));
  };

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setEditingId("");
    setError("");
    setInfo("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      setError("Judul wajib diisi.");
      return;
    }

    if (!form.date) {
      setError("Tanggal wajib diisi.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setInfo("");

      const payload = {
        title: form.title.trim(),
        category: form.category || "Umum",
        date: form.date,
        summary: form.summary.trim(),
        description: form.summary.trim(),
        imageUrl: form.imageUrl || "",
        isPublished: !!form.isPublished,
        isFeatured: !!form.isFeatured,
      };

      if (editingId) {
        await http.put(`/api/announcements/${editingId}`, payload, { headers });
        setInfo("Pengumuman berhasil diperbarui.");
      } else {
        await http.post("/api/announcements", payload, { headers });
        setInfo("Pengumuman berhasil ditambahkan.");
      }

      resetForm();
      await loadAnnouncements();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.msg || "Gagal menyimpan pengumuman.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setError("");
    setInfo("");

    setForm({
      title: item.title || "",
      category: item.category || "Umum",
      date: item.date ? String(item.date).slice(0, 10) : "",
      summary: item.summary || item.description || "",
      imageUrl: item.imageUrl || "",
      isPublished: !!item.isPublished,
      isFeatured: !!item.isFeatured,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Hapus pengumuman ini?")) return;

    try {
      setError("");
      setInfo("");

      await http.delete(`/api/announcements/${id}`, { headers });
      setInfo("Pengumuman berhasil dihapus.");

      if (editingId === id) resetForm();
      await loadAnnouncements();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.msg || "Gagal menghapus pengumuman.");
    }
  };

  const handleTogglePublish = async (item) => {
    try {
      setError("");
      setInfo("");

      await http.put(
        `/api/announcements/${item._id}`,
        { isPublished: !item.isPublished },
        { headers }
      );

      setInfo(item.isPublished ? "Pengumuman dijadikan draft." : "Pengumuman dipublikasikan.");
      await loadAnnouncements();
    } catch (err) {
      console.error(err);
      setError("Gagal mengubah status publish.");
    }
  };

  const handleToggleFeatured = async (item) => {
    try {
      setError("");
      setInfo("");

      await http.put(
        `/api/announcements/${item._id}`,
        { isFeatured: !item.isFeatured },
        { headers }
      );

      setInfo(item.isFeatured ? "Pengumuman dihapus dari pilihan." : "Pengumuman dijadikan pilihan.");
      await loadAnnouncements();
    } catch (err) {
      console.error(err);
      setError("Gagal mengubah status pilihan.");
    }
  };

  return (
    <AdminLayout title="Pengumuman">
      <div className="admin-page admin-pengumuman-page">
        <div className="admin-toolbar">
          <div className="admin-toolbar-left">
            <h2>Kelola Pengumuman</h2>
            <div className="admin-muted">
              Kelola konten pengumuman secara profesional.
            </div>
          </div>
        </div>

        {(error || info) && (
          <div
            className={`admin-pengumuman__notice ${
              error ? "admin-pengumuman__notice--error" : "admin-pengumuman__notice--success"
            }`}
          >
            {error || info}
          </div>
        )}

        <div className="admin-pengumuman__grid">
          <section className="admin-card admin-pengumuman__form-card">
            <div className="admin-card-header">
              <div>
                <p className="admin-card-title">
                  {editingId ? "Edit Pengumuman" : "Tambah Pengumuman"}
                </p>
                <p className="admin-card-subtitle">
                  Isi data dengan ringkas, jelas, dan siap tayang.
                </p>
              </div>
            </div>

            <div className="admin-card-body">
              <form className="admin-pengumuman__form" onSubmit={handleSubmit}>
                <label>
                  Judul
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    placeholder="Contoh: Perubahan jadwal kajian pekan ini"
                  />
                </label>

                <AdminImageUploader
                  type="announcements"
                  label="Poster Pengumuman"
                  value={form.imageUrl}
                  onChange={(url) => handleChange("imageUrl", url)}
                />

                <label>
                  Ringkasan
                  <textarea
                    value={form.summary}
                    onChange={(e) => handleChange("summary", e.target.value)}
                    rows={5}
                    placeholder="Tulis ringkasan pengumuman..."
                  />
                </label>

                <div className="admin-pengumuman__row">
                  <label>
                    Kategori
                    <select
                      value={form.category}
                      onChange={(e) => handleChange("category", e.target.value)}
                    >
                      {ANNOUNCEMENT_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Tanggal
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => handleChange("date", e.target.value)}
                    />
                  </label>
                </div>

                <div className="admin-pengumuman__checklist">
                  <label className="admin-checkbox">
                    <input
                      type="checkbox"
                      checked={form.isPublished}
                      onChange={(e) => handleCheckbox("isPublished", e.target.checked)}
                    />
                    <span>Langsung publikasikan</span>
                  </label>

                  <label className="admin-checkbox">
                    <input
                      type="checkbox"
                      checked={form.isFeatured}
                      onChange={(e) => handleCheckbox("isFeatured", e.target.checked)}
                    />
                    <span>Jadikan pilihan di homepage</span>
                  </label>
                </div>

                <div className="admin-actions">
                  <button
                    className="admin-btn admin-btn-primary"
                    type="submit"
                    disabled={saving}
                  >
                    {saving ? "Menyimpan..." : editingId ? "Simpan Perubahan" : "Tambah Pengumuman"}
                  </button>

                  {editingId && (
                    <button
                      className="admin-btn admin-btn-ghost"
                      type="button"
                      onClick={resetForm}
                      disabled={saving}
                    >
                      Batal
                    </button>
                  )}
                </div>
              </form>
            </div>
          </section>

          <section className="admin-card admin-pengumuman__list-card">
            <div className="admin-card-header admin-list-toolbar">
              <div>
                <p className="admin-card-title">Daftar Pengumuman</p>
                <p className="admin-card-subtitle">
                  Kelola status publish dan pilihan homepage dengan cepat.
                </p>
              </div>

              <div className="admin-list-controls">
                <input
                  type="text"
                  placeholder="Cari judul..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">Semua</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>

            <div className="admin-card-body">
              {loading ? (
                <p className="admin-muted">Memuat data...</p>
              ) : filteredItems.length === 0 ? (
                <p className="admin-muted">Tidak ada pengumuman yang cocok.</p>
              ) : (
                <ul className="admin-list">
                  {filteredItems.map((item) => (
                    <li key={item._id} className="admin-list-item">
                      <div className="admin-item-main">
                        {item.imageUrl && (
                          <div className="admin-item-thumb">
                            <img src={item.imageUrl} alt={item.title || "Pengumuman"} />
                          </div>
                        )}

                        <div className="admin-item-content">
                          <div className="admin-item-title">{item.title}</div>

                          <div className="admin-item-meta">
                            <span className="admin-pill">{item.category || "Umum"}</span>
                            <span className="admin-pill">
                              {item.date ? String(item.date).slice(0, 10) : "-"}
                            </span>

                            <span
                              className={`admin-pill admin-pill--status ${
                                item.isPublished ? "is-published" : "is-draft"
                              }`}
                            >
                              {item.isPublished ? "Published" : "Draft"}
                            </span>

                            {item.isFeatured && (
                              <span className="admin-pill admin-pill--featured">
                                Pilihan
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="admin-item-actions">
                        <button className="admin-btn" type="button" onClick={() => handleEdit(item)}>
                          Edit
                        </button>

                        <button
                          className="admin-btn admin-btn-ghost"
                          type="button"
                          onClick={() => handleTogglePublish(item)}
                        >
                          {item.isPublished ? "Draft" : "Publish"}
                        </button>

                        <button
                          className="admin-btn admin-btn-ghost"
                          type="button"
                          onClick={() => handleToggleFeatured(item)}
                        >
                          {item.isFeatured ? "Unfeature" : "Feature"}
                        </button>

                        <button
                          className="admin-btn admin-btn-danger"
                          type="button"
                          onClick={() => handleDelete(item._id)}
                        >
                          Hapus
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>
      </div>
    </AdminLayout>
  );
}