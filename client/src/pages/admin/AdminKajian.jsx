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
      console.error(err);
      setError("Gagal memuat daftar kajian.");
    } finally {
      setLoading(false);
    }
  }, [headers]);

  useEffect(() => {
    loadKajian();
  }, [loadKajian]);

  const filteredItems = items.filter((item) => {
    const matchSearch =
      (item.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.ustadz || "").toLowerCase().includes(search.toLowerCase());

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

    if (!form.title.trim()) return setError("Judul wajib diisi.");
    if (!form.date) return setError("Tanggal wajib diisi.");

    try {
      setSaving(true);
      setError("");
      setInfo("");

      const payload = {
        ...form,
        title: form.title.trim(),
        ustadz: form.ustadz.trim(),
        location: form.location.trim(),
        description: form.description.trim(),
      };

      if (editingId) {
        await http.put(`/api/kajian/${editingId}`, payload, { headers });
        setInfo("Kajian berhasil diperbarui.");
      } else {
        await http.post("/api/kajian", payload, { headers });
        setInfo("Kajian berhasil ditambahkan.");
      }

      resetForm();
      loadKajian();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.msg || "Gagal menyimpan kajian.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id); // ✅ FIX

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

    await http.delete(`/api/kajian/${id}`, { headers });
    loadKajian();
  };

  const handleTogglePublish = async (item) => {
    await http.put(
      `/api/kajian/${item.id}`, // ✅ FIX
      { isPublished: !item.isPublished },
      { headers }
    );
    loadKajian();
  };

  const handleToggleFeatured = async (item) => {
    await http.put(
      `/api/kajian/${item.id}`, // ✅ FIX
      { isFeatured: !item.isFeatured },
      { headers }
    );
    loadKajian();
  };

  return (
    <AdminLayout title="Kelola Kajian">
      <div className="admin-page admin-kajian-page">

        <div className="admin-toolbar">
          <div className="admin-toolbar-left">
            <h2>Kelola Kajian</h2>
            <div className="admin-muted">
              Tambah, edit, publikasikan, dan tandai kajian pilihan.
            </div>
          </div>
        </div>

        {(error || info) && (
          <div className={`admin-kajian__notice ${error ? "admin-kajian__notice--error" : "admin-kajian__notice--success"}`}>
            {error || info}
          </div>
        )}

        <div className="admin-kajian__grid">

          {/* FORM */}
          <section className="admin-card admin-kajian__form-card">
            <div className="admin-card-header">
              <div>
                <p className="admin-card-title">
                  {editingId ? "Edit Kajian" : "Tambah Kajian"}
                </p>
                <p className="admin-card-subtitle">
                  Isi data kajian dengan jelas dan siap tayang.
                </p>
              </div>
            </div>

            <div className="admin-card-body">
              <form className="admin-kajian__form" onSubmit={handleSubmit}>

                <label>
                  Judul Kajian
                  <input value={form.title} onChange={(e) => handleChange("title", e.target.value)} />
                </label>

                <AdminImageUploader
                  type="kajian"
                  label="Poster Kajian"
                  value={form.imageUrl}
                  onChange={(url) => handleChange("imageUrl", url)}
                />

                <label>
                  Deskripsi
                  <textarea value={form.description} onChange={(e) => handleChange("description", e.target.value)} />
                </label>

                <div className="admin-kajian__row">
                  <label>
                    Kategori
                    <select value={form.category} onChange={(e) => handleChange("category", e.target.value)}>
                      {KAJIAN_CATEGORIES.map((cat) => <option key={cat}>{cat}</option>)}
                    </select>
                  </label>

                  <label>
                    Tanggal
                    <input type="date" value={form.date} onChange={(e) => handleChange("date", e.target.value)} />
                  </label>
                </div>

                <div className="admin-kajian__row">
                  <label>
                    Ustadz
                    <input value={form.ustadz} onChange={(e) => handleChange("ustadz", e.target.value)} />
                  </label>

                  <label>
                    Waktu
                    <input value={form.time} onChange={(e) => handleChange("time", e.target.value)} />
                  </label>
                </div>

                <label>
                  Lokasi
                  <input value={form.location} onChange={(e) => handleChange("location", e.target.value)} />
                </label>

                <div className="admin-kajian__checklist">
                  <label className="admin-checkbox">
                    <input type="checkbox" checked={form.isPublished} onChange={(e) => handleCheckbox("isPublished", e.target.checked)} />
                    <span>Publish</span>
                  </label>

                  <label className="admin-checkbox">
                    <input type="checkbox" checked={form.isFeatured} onChange={(e) => handleCheckbox("isFeatured", e.target.checked)} />
                    <span>Featured</span>
                  </label>
                </div>

                <div className="admin-actions">
                  <button className="admin-btn admin-btn-primary">
                    {saving ? "Menyimpan..." : editingId ? "Update" : "Tambah"}
                  </button>
                </div>

              </form>
            </div>
          </section>

          {/* LIST */}
          <section className="admin-card admin-kajian__list-card">
            <div className="admin-card-header admin-list-toolbar">

              <div>
                <p className="admin-card-title">Daftar Kajian</p>
              </div>

              <div className="admin-list-controls">
                <input
                  placeholder="Cari..."
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
                <p>Loading...</p>
              ) : (
                <ul className="admin-list">
                  {filteredItems.map((item) => (
                    <li key={item.id} className="admin-list-item">

                      <div className="admin-item-main">

                        {item.imageUrl && (
                          <div className="admin-item-thumb">
                            <img src={item.imageUrl} alt="" />
                          </div>
                        )}

                        <div className="admin-item-content">
                          <div className="admin-item-title">{item.title}</div>

                          <div className="admin-item-meta">
                            <span className="admin-pill">{item.category}</span>
                            <span className="admin-pill">{String(item.date).slice(0,10)}</span>
                            {item.ustadz && <span className="admin-pill">{item.ustadz}</span>}
                            {item.time && <span className="admin-pill">{item.time}</span>}
                          </div>
                        </div>

                      </div>

                      <div className="admin-item-actions">
                        <button className="admin-btn" onClick={() => handleEdit(item)}>Edit</button>
                        <button className="admin-btn admin-btn-ghost" onClick={() => handleTogglePublish(item)}>Publish</button>
                        <button className="admin-btn admin-btn-ghost" onClick={() => handleToggleFeatured(item)}>Feature</button>
                        <button className="admin-btn admin-btn-danger" onClick={() => handleDelete(item.id)}>Hapus</button>
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