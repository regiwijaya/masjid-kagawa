import { useEffect, useMemo, useState, useCallback } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

import AdminLayout from "./components/AdminLayout";
import AdminImageUploader from "../../components/admin/AdminImageUploader";
import "../../styles/admin/AdminKegiatan.css";
import http from "../../api/http";

const API_BASE = "/api/activities";

const EVENT_TYPES = ["kegiatan", "kajian"];

const ACTIVITY_CATEGORIES = [
  "Sosial",
  "Pendidikan",
  "Komunitas",
  "Anak",
  "Remaja",
  "Event Besar",
  "Tauhid",
  "Aqidah",
  "Fiqih",
  "Hadits",
  "Tafsir",
  "Sirah",
  "Adab",
  "Lainnya",
];

const EMPTY_FORM = {
  type: "kegiatan",
  title: "",
  category: "Lainnya",
  ustadz: "",
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
      const res = await http.get(`${API_BASE}/admin/all`, { headers });
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
      setErr("Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  }, [headers]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const filteredItems = items.filter((item) => {
    const matchSearch =
      (item.title || "").toLowerCase().includes(search.toLowerCase());

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
    setEditId(item.id);

    setForm({
      type: item.type || "kegiatan",
      title: item.title || "",
      category: item.category || "Lainnya",
      ustadz: item.ustadz || "",
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

      const payload = {
        ...form,
        title: form.title.trim(),
      };

      if (editId) {
        await http.put(`${API_BASE}/${editId}`, payload, { headers });
        setInfo("Berhasil update.");
      } else {
        await http.post(API_BASE, payload, { headers });
        setInfo("Berhasil tambah.");
      }

      resetForm();
      fetchItems();
    } catch (e) {
      console.error(e);
      setErr("Gagal menyimpan.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Hapus?")) return;
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

  // 🔥 CLEAN TOOLBAR (tidak terlalu ramai)
  const quillModules = {
    toolbar: [
      [{ header: [2, 3, false] }],
      ["bold", "italic"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link"],
      ["clean"],
    ],
  };

  return (
    <AdminLayout title="Kelola Event">
      <div className="admin-page admin-kegiatan-page">

        <div className="admin-toolbar">
          <div>
            <h2>Unified Event System</h2>
            <div className="admin-muted">
              Kelola kegiatan & kajian dalam satu sistem.
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
              <p className="admin-card-title">
                {editId ? "Edit Event" : "Tambah Event"}
              </p>
            </div>

            <div className="admin-card-body">
              <form className="admin-kegiatan__form" onSubmit={submit}>

                <label>
                  Tipe
                  <select value={form.type} onChange={(e) => onChange("type", e.target.value)}>
                    {EVENT_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </label>

                <label>
                  Judul
                  <input value={form.title} onChange={(e) => onChange("title", e.target.value)} />
                </label>

                {form.type === "kajian" && (
                  <label>
                    Ustadz
                    <input value={form.ustadz} onChange={(e) => onChange("ustadz", e.target.value)} />
                  </label>
                )}

                <AdminImageUploader
                  type="activities"
                  value={form.imageUrl}
                  onChange={(url) => onChange("imageUrl", url)}
                />

                {/* 🔥 RICH TEXT EDITOR */}
                <label>Deskripsi</label>
                <ReactQuill
                  theme="snow"
                  value={form.description}
                  onChange={(value) => onChange("description", value)}
                  modules={quillModules}
                />

                <div className="admin-kegiatan__row">
                  <label>
                    Kategori
                    <select value={form.category} onChange={(e) => onChange("category", e.target.value)}>
                      {ACTIVITY_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </label>

                  <label>
                    Tanggal
                    <input type="date" value={form.date} onChange={(e) => onChange("date", e.target.value)} />
                  </label>
                </div>

                <div className="admin-kegiatan__row">
                  <label>
                    Jam Mulai
                    <input type="time" value={form.startTime} onChange={(e) => onChange("startTime", e.target.value)} />
                  </label>

                  <label>
                    Jam Selesai
                    <input type="time" value={form.endTime} onChange={(e) => onChange("endTime", e.target.value)} />
                  </label>
                </div>

                <label>
                  Lokasi
                  <input value={form.location} onChange={(e) => onChange("location", e.target.value)} />
                </label>

                <div className="admin-kegiatan__checklist">
                  <label className="admin-checkbox">
                    <input type="checkbox" checked={form.isPublished} onChange={(e) => onCheckbox("isPublished", e.target.checked)} />
                    Publish
                  </label>

                  <label className="admin-checkbox">
                    <input type="checkbox" checked={form.isFeatured} onChange={(e) => onCheckbox("isFeatured", e.target.checked)} />
                    Featured
                  </label>
                </div>

                <button className="admin-btn admin-btn-primary">
                  {saving ? "Menyimpan..." : editId ? "Update" : "Tambah"}
                </button>

              </form>
            </div>
          </section>

          {/* LIST tetap sama */}
          <section className="admin-card admin-kegiatan__list-card">
            <div className="admin-card-header admin-list-toolbar">
              <p className="admin-card-title">Daftar Event</p>

              <div className="admin-list-controls">
                <input placeholder="Cari..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>

            <div className="admin-card-body">
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
                          <span className="admin-pill">{it.type}</span>
                          <span className="admin-pill">{it.category}</span>
                          <span className="admin-pill">
                            {new Date(it.date).toLocaleDateString("id-ID")}
                          </span>

                          {it.startTime && (
                            <span className="admin-pill">
                              {it.startTime} - {it.endTime}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="admin-item-actions">
                      <button className="admin-btn" onClick={() => startEdit(it)}>Edit</button>
                      <button className="admin-btn admin-btn-danger" onClick={() => remove(it.id)}>Hapus</button>
                    </div>

                  </li>
                ))}
              </ul>
            </div>
          </section>

        </div>
      </div>
    </AdminLayout>
  );
}