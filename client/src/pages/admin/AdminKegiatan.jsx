import { useEffect, useMemo, useState, useCallback } from "react";
import AdminLayout from "./components/AdminLayout";
import AdminImageUploader from "../../components/admin/AdminImageUploader";
import "../../styles/admin/AdminKegiatan.css";
import http from "../../api/http";

const API_BASE = "/api/activities";

const ACTIVITY_CATEGORIES = [
  "Sosial",
  "Pendidikan",
  "Komunitas",
  "Anak",
  "Remaja",
  "Event Besar",
  "Lainnya",
];

const EMPTY_FORM = {
  title: "",
  category: "Lainnya",
  date: "",
  startTime: "",
  endTime: "",
  location: "Masjid Kagawa",
  description: "",
  imageUrl: "",
  isPublished: true,
  isFeatured: false,
};

function getAdminToken() {
  return localStorage.getItem("adminToken") || localStorage.getItem("token") || "";
}

export default function AdminKegiatan() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const headers = useMemo(() => {
    const token = getAdminToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setErr("");

      const res = await http.get(`${API_BASE}/admin/all`, { headers });
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
      setErr("Gagal memuat kegiatan.");
    } finally {
      setLoading(false);
    }
  }, [headers]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // =========================
  // FILTER
  // =========================
  const filteredItems = items.filter((item) => {
    const matchSearch = (item.title || "")
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchStatus =
      filterStatus === "all"
        ? true
        : filterStatus === "published"
        ? item.isPublished
        : !item.isPublished;

    return matchSearch && matchStatus;
  });

  const onChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onCheckbox = (key, checked) => {
    setForm((prev) => ({ ...prev, [key]: checked }));
  };

  const resetForm = () => {
    setEditId("");
    setForm(EMPTY_FORM);
    setErr("");
    setInfo("");
  };

  const startEdit = (item) => {
    setEditId(item.id); // ✅ FIX

    setForm({
      title: item.title || "",
      category: item.category || "Lainnya",
      date: item.date ? String(item.date).slice(0, 10) : "",
      startTime: item.startTime || "",
      endTime: item.endTime || "",
      location: item.location || "Masjid Kagawa",
      description: item.description || "",
      imageUrl: item.imageUrl || "",
      isPublished: !!item.isPublished,
      isFeatured: !!item.isFeatured,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) return setErr("Judul wajib diisi.");
    if (!form.date) return setErr("Tanggal wajib diisi.");

    try {
      setSaving(true);
      setErr("");
      setInfo("");

      const payload = {
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
      };

      if (editId) {
        await http.put(`${API_BASE}/${editId}`, payload, { headers });
        setInfo("Kegiatan berhasil diperbarui.");
      } else {
        await http.post(API_BASE, payload, { headers });
        setInfo("Kegiatan berhasil ditambahkan.");
      }

      resetForm();
      fetchItems();
    } catch (e) {
      console.error(e);
      setErr(e?.response?.data?.msg || "Gagal menyimpan kegiatan.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Hapus kegiatan ini?")) return;

    await http.delete(`${API_BASE}/${id}`, { headers });
    fetchItems();
  };

  const togglePublish = async (item) => {
    await http.put(
      `${API_BASE}/${item.id}`,
      { isPublished: !item.isPublished },
      { headers }
    );
    fetchItems();
  };

  const toggleFeatured = async (item) => {
    await http.put(
      `${API_BASE}/${item.id}`,
      { isFeatured: !item.isFeatured },
      { headers }
    );
    fetchItems();
  };

  return (
    <AdminLayout title="Kegiatan">
      <div className="admin-page admin-kegiatan-page">

        <div className="admin-toolbar">
          <div>
            <h2>Kelola Kegiatan</h2>
            <div className="admin-muted">
              Tambah, edit, publish, dan tandai kegiatan pilihan untuk homepage.
            </div>
          </div>
        </div>

        {(err || info) && (
          <div className={`admin-kegiatan__notice ${err ? "admin-kegiatan__notice--error" : "admin-kegiatan__notice--success"}`}>
            {err || info}
          </div>
        )}

        <div className="admin-kegiatan__grid">

          {/* FORM */}
          <section className="admin-card admin-kegiatan__form-card">
            <div className="admin-card-header">
              <div>
                <p className="admin-card-title">
                  {editId ? "Edit Kegiatan" : "Tambah Kegiatan"}
                </p>
                <p className="admin-card-subtitle">
                  Isi data kegiatan dengan jelas, rapi, dan siap tayang.
                </p>
              </div>
            </div>

            <div className="admin-card-body">
              <form className="admin-kegiatan__form" onSubmit={submit}>

                <label>
                  Judul
                  <input
                    value={form.title}
                    onChange={(e) => onChange("title", e.target.value)}
                  />
                </label>

                <AdminImageUploader
                  type="activities"
                  label="Poster Kegiatan"
                  value={form.imageUrl}
                  onChange={(url) => onChange("imageUrl", url)}
                />

                <label>
                  Deskripsi
                  <textarea
                    value={form.description}
                    onChange={(e) => onChange("description", e.target.value)}
                  />
                </label>

                <div className="admin-kegiatan__row">
                  <label>
                    Kategori
                    <select
                      value={form.category}
                      onChange={(e) => onChange("category", e.target.value)}
                    >
                      {ACTIVITY_CATEGORIES.map((cat) => (
                        <option key={cat}>{cat}</option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Tanggal
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => onChange("date", e.target.value)}
                    />
                  </label>
                </div>

                <div className="admin-kegiatan__row admin-kegiatan__row--time">
                  <label>
                    Jam Mulai
                    <input
                      type="time"
                      value={form.startTime}
                      onChange={(e) => onChange("startTime", e.target.value)}
                    />
                  </label>

                  <label>
                    Jam Selesai
                    <input
                      type="time"
                      value={form.endTime}
                      onChange={(e) => onChange("endTime", e.target.value)}
                    />
                  </label>
                </div>

                <label>
                  Lokasi
                  <input
                    value={form.location}
                    onChange={(e) => onChange("location", e.target.value)}
                  />
                </label>

                <div className="admin-kegiatan__checklist">
                  <label className="admin-checkbox">
                    <input
                      type="checkbox"
                      checked={form.isPublished}
                      onChange={(e) => onCheckbox("isPublished", e.target.checked)}
                    />
                    <span>Langsung publikasikan</span>
                  </label>

                  <label className="admin-checkbox">
                    <input
                      type="checkbox"
                      checked={form.isFeatured}
                      onChange={(e) => onCheckbox("isFeatured", e.target.checked)}
                    />
                    <span>Jadikan pilihan di homepage</span>
                  </label>
                </div>

                <div className="admin-actions">
                  <button className="admin-btn admin-btn-primary">
                    {saving ? "Menyimpan..." : editId ? "Simpan Perubahan" : "Tambah Kegiatan"}
                  </button>
                </div>

              </form>
            </div>
          </section>

          {/* LIST */}
          <section className="admin-card admin-kegiatan__list-card">

            <div className="admin-card-header admin-list-toolbar">
              <div>
                <p className="admin-card-title">Daftar Kegiatan</p>
              </div>

              <div className="admin-list-controls">
                <input
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
                <p className="admin-muted">Memuat...</p>
              ) : filteredItems.length === 0 ? (
                <p className="admin-muted">Tidak ada kegiatan.</p>
              ) : (
                <ul className="admin-list">
                  {filteredItems.map((it) => (
                    <li key={it.id} className="admin-list-item">

                      <div className="admin-item-main">

                        {it.imageUrl && (
                          <div className="admin-item-thumb">
                            <img src={it.imageUrl} alt="" />
                          </div>
                        )}

                        <div className="admin-item-content">
                          <div className="admin-item-title">{it.title}</div>

                          <div className="admin-item-meta">
                            <span className="admin-pill">{it.category}</span>
                            <span className="admin-pill">
                              {String(it.date).slice(0, 10)}
                            </span>

                            {it.startTime && (
                              <span className="admin-pill">
                                {it.startTime} - {it.endTime}
                              </span>
                            )}

                            <span className={`admin-pill admin-pill--status ${it.isPublished ? "is-published" : "is-draft"}`}>
                              {it.isPublished ? "Published" : "Draft"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="admin-item-actions">
                        <button className="admin-btn" onClick={() => startEdit(it)}>Edit</button>
                        <button className="admin-btn admin-btn-ghost" onClick={() => togglePublish(it)}>Draft</button>
                        <button className="admin-btn admin-btn-ghost" onClick={() => toggleFeatured(it)}>Feature</button>
                        <button className="admin-btn admin-btn-danger" onClick={() => remove(it.id)}>Hapus</button>
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