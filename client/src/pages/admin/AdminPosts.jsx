import { useEffect, useMemo, useState, useCallback } from "react";
import ReactQuill from "react-quill";
import AdminLayout from "./components/AdminLayout";
import AdminImageUploader from "../../components/admin/AdminImageUploader";
import http from "../../api/http";
import "../../styles/admin/AdminPosts.css";
import "react-quill/dist/quill.snow.css";

const EMPTY_FORM = {
  title: "",
  excerpt: "",
  content: "",
  imageUrl: "",
  category: "Artikel",
  author: "Admin Masjid Kagawa",
  isPublished: true,
  isFeatured: false,
};

function getAdminToken() {
  return localStorage.getItem("adminToken") || localStorage.getItem("token") || "";
}

export default function AdminPosts() {
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

      const res = await http.get("/api/posts/admin/all", { headers });
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
      setErr("Gagal memuat daftar artikel.");
    } finally {
      setLoading(false);
    }
  }, [headers]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const filteredItems = items.filter((item) => {
    const title = item.title || "";
    const category = item.category || "";

    const matchSearch =
      title.toLowerCase().includes(search.toLowerCase()) ||
      category.toLowerCase().includes(search.toLowerCase());

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

  const startEdit = (item) => {
    setEditId(item.id); // ✅ FIX
    setErr("");
    setInfo("");

    setForm({
      title: item.title || "",
      excerpt: item.excerpt || "",
      content: item.content || "",
      imageUrl: item.imageUrl || "",
      category: item.category || "Artikel",
      author: item.author || "Admin Masjid Kagawa",
      isPublished: !!item.isPublished,
      isFeatured: !!item.isFeatured,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditId("");
    setForm(EMPTY_FORM);
    setErr("");
    setInfo("");
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      setErr("Judul artikel wajib diisi.");
      return;
    }

    try {
      setSaving(true);
      setErr("");
      setInfo("");

      const payload = {
        title: form.title.trim(),
        excerpt: form.excerpt.trim(),
        content: form.content || "",
        imageUrl: form.imageUrl || "",
        category: form.category.trim() || "Artikel",
        author: form.author.trim() || "Admin Masjid Kagawa",
        isPublished: !!form.isPublished,
        isFeatured: !!form.isFeatured,
      };

      if (editId) {
        await http.put(`/api/posts/${editId}`, payload, { headers });
        setInfo("Artikel berhasil diperbarui.");
      } else {
        await http.post("/api/posts", payload, { headers });
        setInfo("Artikel berhasil ditambahkan.");
      }

      setEditId("");
      setForm(EMPTY_FORM);
      await fetchItems();
    } catch (e) {
      console.error(e);
      setErr(e?.response?.data?.msg || "Gagal menyimpan artikel.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Hapus artikel ini?")) return;

    try {
      setErr("");
      setInfo("");

      await http.delete(`/api/posts/${id}`, { headers });
      setInfo("Artikel berhasil dihapus.");

      if (editId === id) cancelEdit();
      await fetchItems();
    } catch (e) {
      console.error(e);
      setErr(e?.response?.data?.msg || "Gagal menghapus artikel.");
    }
  };

  const togglePublish = async (item) => {
    try {
      setErr("");
      setInfo("");

      await http.put(
        `/api/posts/${item.id}`, // ✅ FIX
        { isPublished: !item.isPublished },
        { headers }
      );

      setInfo(item.isPublished ? "Artikel dijadikan draft." : "Artikel dipublikasikan.");
      await fetchItems();
    } catch (e) {
      console.error(e);
      setErr("Gagal mengubah status publish.");
    }
  };

  const toggleFeatured = async (item) => {
    try {
      setErr("");
      setInfo("");

      await http.put(
        `/api/posts/${item.id}`, // ✅ FIX
        { isFeatured: !item.isFeatured },
        { headers }
      );

      setInfo(item.isFeatured ? "Artikel dihapus dari pilihan." : "Artikel dijadikan pilihan.");
      await fetchItems();
    } catch (e) {
      console.error(e);
      setErr("Gagal mengubah status pilihan.");
    }
  };

  return (
    <AdminLayout title="Kelola Artikel">
      <div className="admin-page admin-posts-page">
        <div className="admin-toolbar">
          <div className="admin-toolbar-left">
            <h2>Kelola Artikel</h2>
            <div className="admin-muted">
              Tulis, edit, publikasikan, dan tandai artikel pilihan untuk website.
            </div>
          </div>
        </div>

        {(err || info) && (
          <div
            className={`admin-posts-notice ${
              err ? "admin-posts-notice--error" : "admin-posts-notice--success"
            }`}
          >
            {err || info}
          </div>
        )}

        <div className="admin-posts-grid">
          <section className="admin-card admin-posts-form-card">
            <div className="admin-card-header">
              <div>
                <p className="admin-card-title">
                  {editId ? "Edit Artikel" : "Tulis Artikel"}
                </p>
                <p className="admin-card-subtitle">
                  Isi judul, ringkasan, gambar, dan konten artikel.
                </p>
              </div>
            </div>

            <div className="admin-card-body">
              <form className="admin-posts-form" onSubmit={submit}>
                <label>
                  Judul
                  <input
                    value={form.title}
                    onChange={(e) => onChange("title", e.target.value)}
                    placeholder="Judul artikel"
                  />
                </label>

                <AdminImageUploader
                  type="posts"
                  label="Gambar Artikel"
                  value={form.imageUrl}
                  onChange={(url) => onChange("imageUrl", url)}
                />

                <label>
                  Ringkasan
                  <textarea
                    rows={4}
                    value={form.excerpt}
                    onChange={(e) => onChange("excerpt", e.target.value)}
                    placeholder="Ringkasan singkat artikel"
                  />
                </label>

                <div className="admin-form-row">
                  <label>
                    Kategori
                    <input
                      value={form.category}
                      onChange={(e) => onChange("category", e.target.value)}
                      placeholder="Contoh: Dakwah, Aqidah, Fiqih"
                    />
                  </label>

                  <label>
                    Penulis
                    <input
                      value={form.author}
                      onChange={(e) => onChange("author", e.target.value)}
                      placeholder="Nama penulis"
                    />
                  </label>
                </div>

                <label className="admin-posts-editor-label">
                  Konten
                  <div className="admin-posts-editor-wrap">
                    <ReactQuill
                      theme="snow"
                      value={form.content}
                      onChange={(value) => onChange("content", value)}
                      className="admin-posts-editor"
                    />
                  </div>
                </label>

                <div className="admin-posts-checks">
                  <label className="admin-checkbox">
                    <input
                      type="checkbox"
                      checked={form.isPublished}
                      onChange={(e) => onChange("isPublished", e.target.checked)}
                    />
                    <span>Langsung publikasikan</span>
                  </label>

                  <label className="admin-checkbox">
                    <input
                      type="checkbox"
                      checked={form.isFeatured}
                      onChange={(e) => onChange("isFeatured", e.target.checked)}
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
                    {saving ? "Menyimpan..." : editId ? "Simpan Perubahan" : "Tambah Artikel"}
                  </button>

                  {editId && (
                    <button
                      type="button"
                      className="admin-btn admin-btn-ghost"
                      onClick={cancelEdit}
                      disabled={saving}
                    >
                      Batal
                    </button>
                  )}
                </div>
              </form>
            </div>
          </section>

          <section className="admin-card admin-posts-list-card">
            <div className="admin-card-header admin-list-toolbar">
              <div>
                <p className="admin-card-title">Daftar Artikel</p>
                <p className="admin-card-subtitle">
                  Kelola artikel, status publish, dan artikel pilihan.
                </p>
              </div>

              <div className="admin-list-controls">
                <input
                  type="text"
                  placeholder="Cari judul/kategori..."
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
                <p className="admin-muted">Tidak ada artikel yang cocok.</p>
              ) : (
                <ul className="admin-posts-list">
                  {filteredItems.map((item) => (
                    <li key={item.id} className="admin-posts-item">
                      <div className="admin-posts-item__main">
                        {item.imageUrl && (
                          <div className="admin-posts-item__thumb">
                            <img src={item.imageUrl} alt={item.title || "Artikel"} />
                          </div>
                        )}

                        <div className="admin-posts-item__content">
                          <h4>{item.title}</h4>

                          <div className="admin-posts-item__meta">
                            <span className="admin-pill">{item.category || "Artikel"}</span>

                            {item.slug && (
                              <span className="admin-pill">{item.slug}</span>
                            )}

                            <span
                              className={`admin-pill admin-pill--status ${
                                item.isPublished ? "is-published" : "is-draft"
                              }`}
                            >
                              {item.isPublished ? "Published" : "Draft"}
                            </span>

                            {item.isFeatured && (
                              <span className="admin-pill admin-pill--gold">
                                Featured
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="admin-posts-item__actions">
                        <button
                          className="admin-btn"
                          type="button"
                          onClick={() => startEdit(item)}
                        >
                          Edit
                        </button>

                        <button
                          className="admin-btn admin-btn-ghost"
                          type="button"
                          onClick={() => togglePublish(item)}
                        >
                          {item.isPublished ? "Draft" : "Publish"}
                        </button>

                        <button
                          className="admin-btn admin-btn-ghost"
                          type="button"
                          onClick={() => toggleFeatured(item)}
                        >
                          {item.isFeatured ? "Unfeature" : "Feature"}
                        </button>

                        <button
                          className="admin-btn admin-btn-danger"
                          type="button"
                          onClick={() => remove(item.id)}
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