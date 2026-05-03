import { useEffect, useMemo, useState, useCallback } from "react";
import AdminLayout from "./components/AdminLayout";
import AdminImageUploader from "../../components/admin/AdminImageUploader";
import http from "../../api/http";
import "../../styles/admin/AdminKajian.css";

const KAJIAN_CATEGORIES = [
  "Tauhid",
  "Aqidah",
  "Fiqih",
  "Hadits",
  "Tafsir",
  "Sirah",
  "Adab",
  "Lainnya",
];

const INITIAL_FORM = {
  title: "",
  category: "Lainnya",
  ustadz: "",
  date: "",
  time: "",
  location: "Masjid Kagawa",
  description: "",
  imageUrl: "",
  isPublished: true,
  isFeatured: false,
};

function getAdminToken() {
  return localStorage.getItem("adminToken") || localStorage.getItem("token") || "";
}

export default function AdminKajian() {
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

  const loadKajian = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await http.get("/api/kajian/admin/all", { headers });
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Gagal load kajian:", err);
      setError("Gagal memuat daftar kajian.");
    } finally {
      setLoading(false);
    }
  }, [headers]);

  useEffect(() => {
    loadKajian();
  }, [loadKajian]);

  const filteredItems = items.filter((item) => {
    const title = item.title || "";
    const ustadz = item.ustadz || "";
    const matchSearch =
      title.toLowerCase().includes(search.toLowerCase()) ||
      ustadz.toLowerCase().includes(search.toLowerCase());

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
      setError("Judul kajian wajib diisi.");
      return;
    }

    if (!form.date) {
      setError("Tanggal kajian wajib diisi.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setInfo("");

      const payload = {
        title: form.title.trim(),
        category: form.category || "Lainnya",
        ustadz: form.ustadz.trim(),
        date: form.date,
        time: form.time.trim(),
        location: form.location.trim() || "Masjid Kagawa",
        description: form.description.trim(),
        imageUrl: form.imageUrl || "",
        isPublished: !!form.isPublished,
        isFeatured: !!form.isFeatured,
      };

      if (editingId) {
        await http.put(`/api/kajian/${editingId}`, payload, { headers });
        setInfo("Kajian berhasil diperbarui.");
      } else {
        await http.post("/api/kajian", payload, { headers });
        setInfo("Kajian berhasil ditambahkan.");
      }

      resetForm();
      await loadKajian();
    } catch (err) {
      console.error("Gagal simpan kajian:", err);
      setError(err?.response?.data?.msg || "Gagal menyimpan kajian.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setInfo("");
    setError("");

    setForm({
      title: item.title || "",
      category: item.category || "Lainnya",
      ustadz: item.ustadz || "",
      date: item.date ? String(item.date).slice(0, 10) : "",
      time: item.time || "",
      location: item.location || "Masjid Kagawa",
      description: item.description || "",
      imageUrl: item.imageUrl || "",
      isPublished: !!item.isPublished,
      isFeatured: !!item.isFeatured,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Hapus kajian ini?")) return;

    try {
      setError("");
      setInfo("");

      await http.delete(`/api/kajian/${id}`, { headers });
      setInfo("Kajian berhasil dihapus.");

      if (editingId === id) resetForm();
      await loadKajian();
    } catch (err) {
      console.error("Gagal hapus kajian:", err);
      setError(err?.response?.data?.msg || "Gagal menghapus kajian.");
    }
  };

  const handleTogglePublish = async (item) => {
    try {
      setError("");
      setInfo("");

      await http.put(
        `/api/kajian/${item._id}`,
        { isPublished: !item.isPublished },
        { headers }
      );

      setInfo(item.isPublished ? "Kajian dijadikan draft." : "Kajian dipublikasikan.");
      await loadKajian();
    } catch (err) {
      console.error("Gagal ubah publish:", err);
      setError("Gagal mengubah status publish.");
    }
  };

  const handleToggleFeatured = async (item) => {
    try {
      setError("");
      setInfo("");

      await http.put(
        `/api/kajian/${item._id}`,
        { isFeatured: !item.isFeatured },
        { headers }
      );

      setInfo(item.isFeatured ? "Kajian dihapus dari pilihan." : "Kajian dijadikan pilihan.");
      await loadKajian();
    } catch (err) {
      console.error("Gagal ubah featured:", err);
      setError("Gagal mengubah status pilihan.");
    }
  };

  return (
    <AdminLayout title="Kelola Kajian">
      <div className="admin-page admin-kajian-page">
        <div className="admin-toolbar">
          <div className="admin-toolbar-left">
            <h2>Kelola Kajian</h2>
            <div className="admin-muted">
              Tambah, edit, publikasikan, dan tandai kajian pilihan untuk homepage.
            </div>
          </div>
        </div>

        {(error || info) && (
          <div
            className={`admin-kajian__notice ${
              error ? "admin-kajian__notice--error" : "admin-kajian__notice--success"
            }`}
          >
            {error || info}
          </div>
        )}

        <div className="admin-kajian__grid">
          <section className="admin-card admin-kajian__form-card">
            <div className="admin-card-header">
              <div>
                <p className="admin-card-title">
                  {editingId ? "Edit Kajian" : "Tambah Kajian"}
                </p>
                <p className="admin-card-subtitle">
                  Isi informasi kajian dengan jelas, rapi, dan siap tayang.
                </p>
              </div>
            </div>

            <div className="admin-card-body">
              <form className="admin-kajian__form" onSubmit={handleSubmit}>
                <label>
                  Judul Kajian
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    placeholder="Contoh: Tauhid: Pondasi Kehidupan"
                  />
                </label>

                <AdminImageUploader
                  type="kajian"
                  label="Poster Kajian"
                  value={form.imageUrl}
                  onChange={(url) => handleChange("imageUrl", url)}
                />

                <label>
                  Deskripsi
                  <textarea
                    value={form.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    rows={6}
                    placeholder="Tulis deskripsi singkat kajian..."
                  />
                </label>

                <div className="admin-kajian__row">
                  <label>
                    Kategori
                    <select
                      value={form.category}
                      onChange={(e) => handleChange("category", e.target.value)}
                    >
                      {KAJIAN_CATEGORIES.map((cat) => (
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

                <div className="admin-kajian__row">
                  <label>
                    Ustadz / Pemateri
                    <input
                      type="text"
                      value={form.ustadz}
                      onChange={(e) => handleChange("ustadz", e.target.value)}
                      placeholder="Contoh: Ust. Abdullah"
                    />
                  </label>

                  <label>
                    Waktu
                    <input
                      type="text"
                      value={form.time}
                      onChange={(e) => handleChange("time", e.target.value)}
                      placeholder="Contoh: Ahad • 14:00 JST"
                    />
                  </label>
                </div>

                <label>
                  Lokasi
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                    placeholder="Contoh: Masjid Kagawa"
                  />
                </label>

                <div className="admin-kajian__checklist">
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
                    {saving ? "Menyimpan..." : editingId ? "Simpan Perubahan" : "Tambah Kajian"}
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

          <section className="admin-card admin-kajian__list-card">
            <div className="admin-card-header admin-list-toolbar">
              <div>
                <p className="admin-card-title">Daftar Kajian</p>
                <p className="admin-card-subtitle">
                  Kelola status publish dan pilihan homepage dengan cepat.
                </p>
              </div>

              <div className="admin-list-controls">
                <input
                  type="text"
                  placeholder="Cari judul/ustadz..."
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
                <p className="admin-muted">Tidak ada kajian yang cocok.</p>
              ) : (
                <ul className="admin-list">
                  {filteredItems.map((item) => (
                    <li key={item._id} className="admin-list-item">
                      <div className="admin-item-main">
                        {item.imageUrl && (
                          <div className="admin-item-thumb">
                            <img src={item.imageUrl} alt={item.title || "Kajian"} />
                          </div>
                        )}

                        <div className="admin-item-content">
                          <div className="admin-item-title">{item.title}</div>

                          <div className="admin-item-meta">
                            <span className="admin-pill">
                              {item.category || "Lainnya"}
                            </span>
                            <span className="admin-pill">
                              {item.date ? String(item.date).slice(0, 10) : "-"}
                            </span>

                            {item.ustadz && (
                              <span className="admin-pill">{item.ustadz}</span>
                            )}

                            {item.time && (
                              <span className="admin-pill">{item.time}</span>
                            )}

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
                        <button
                          className="admin-btn"
                          type="button"
                          onClick={() => handleEdit(item)}
                        >
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