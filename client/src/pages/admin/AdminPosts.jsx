import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import ReactQuill from "react-quill";
import AdminLayout from "./components/AdminLayout";
import AdminImageUploader from "../../components/admin/AdminImageUploader";
import http from "../../api/http";
import "../../styles/admin/AdminPosts.css";
import "react-quill/dist/quill.snow.css";

const BACKEND_BASE_URL = "https://api.masjidkagawa.com";

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

function getImageUrl(url) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  if (url.startsWith("/")) return `${BACKEND_BASE_URL}${url}`;
  return `${BACKEND_BASE_URL}/${url}`;
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

  const quillRef = useRef(null);

  const headers = useMemo(() => {
    const token = getAdminToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
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

  const onChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const startEdit = (item) => {
    setEditId(item.id);
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

  const handleDelete = async (id) => {
    if (!window.confirm("Hapus artikel ini?")) return;

    await http.delete(`/api/posts/${id}`, { headers });
    fetchItems();
  };

  const togglePublish = async (item) => {
    await http.put(
      `/api/posts/${item.id}`,
      { isPublished: !item.isPublished },
      { headers }
    );
    fetchItems();
  };

  const toggleFeatured = async (item) => {
    await http.put(
      `/api/posts/${item.id}`,
      { isFeatured: !item.isFeatured },
      { headers }
    );
    fetchItems();
  };

  const filteredItems = items.filter((item) => {
    const matchSearch = (item.title || "")
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchStatus =
      filterStatus === "all"
        ? true
        : filterStatus === "published"
        ? item.isPublished
        : filterStatus === "draft"
        ? !item.isPublished
        : item.isFeatured;

    return matchSearch && matchStatus;
  });

  const imageHandler = useCallback(function () {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];

      if (!file) return;

      const formData = new FormData();
      formData.append("image", file);

      try {
        const res = await http.post("/api/uploads/posts", formData, {
          headers,
        });

        const imageUrl = getImageUrl(res.data.imageUrl);

        const quill = quillRef.current.getEditor();
        const range = quill.getSelection(true);

        quill.insertEmbed(range.index, "image", imageUrl);
      } catch (err) {
        console.error("Upload gagal:", err);
        alert("Upload gambar gagal");
      }
    };
  }, [headers]);

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, false] }],
          ["bold", "italic"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link", "image"],
          ["clean"],
        ],
        handlers: {
          image: imageHandler,
        },
      },
    }),
    [imageHandler]
  );

  const submit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      if (editId) {
        await http.put(`/api/posts/${editId}`, form, { headers });
        setInfo("Artikel berhasil diperbarui.");
      } else {
        await http.post("/api/posts", form, { headers });
        setInfo("Artikel berhasil ditambahkan.");
      }

      setEditId("");
      setForm(EMPTY_FORM);
      fetchItems();
    } catch (e) {
      console.error(e);
      setErr("Gagal menyimpan artikel.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Kelola Artikel">
      <div className="admin-page admin-posts-page">
        <div className="admin-toolbar">
          <div>
            <h2>Kelola Artikel</h2>
            <div className="admin-muted">CMS Artikel (Search, Filter, Editor)</div>
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
              <p className="admin-card-title">
                {editId ? "Edit Artikel" : "Tulis Artikel"}
              </p>
            </div>

            <div className="admin-card-body">
              <form className="admin-posts-form" onSubmit={submit}>
                <label>
                  Judul
                  <input
                    value={form.title}
                    onChange={(e) => onChange("title", e.target.value)}
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
                    value={form.excerpt}
                    onChange={(e) => onChange("excerpt", e.target.value)}
                  />
                </label>

                <div className="admin-form-row">
                  <input
                    value={form.category}
                    onChange={(e) => onChange("category", e.target.value)}
                  />
                  <input
                    value={form.author}
                    onChange={(e) => onChange("author", e.target.value)}
                  />
                </div>

                <div className="admin-posts-editor-wrap">
                  <ReactQuill
                    ref={quillRef}
                    theme="snow"
                    value={form.content}
                    onChange={(value) => onChange("content", value)}
                    modules={modules}
                  />
                </div>

                <div className="admin-actions">
                  <button className="admin-btn admin-btn-primary" type="submit">
                    {saving ? "Menyimpan..." : editId ? "Update" : "Tambah"}
                  </button>
                </div>
              </form>
            </div>
          </section>

          <section className="admin-card admin-posts-list-card">
            <div className="admin-card-header admin-list-toolbar">
              <div>
                <p className="admin-card-title">Daftar Artikel</p>
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
                  <option value="featured">Featured</option>
                </select>
              </div>
            </div>

            <div className="admin-card-body">
              {filteredItems.map((item) => (
                <div key={item.id} className="admin-posts-item">
                  <div className="admin-posts-item__main">
                    {item.imageUrl && (
                      <div className="admin-posts-item__thumb">
                        <img src={getImageUrl(item.imageUrl)} alt="" />
                      </div>
                    )}

                    <div className="admin-posts-item__content">
                      <h4>{item.title}</h4>

                      <div className="admin-posts-meta">
                        <span className="badge">{item.category}</span>
                        <span className="badge">
                          {item.isPublished ? "Published" : "Draft"}
                        </span>
                        {item.isFeatured && (
                          <span className="badge badge-featured">Featured</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="admin-posts-item__actions">
                    <button onClick={() => startEdit(item)} className="admin-btn">
                      Edit
                    </button>
                    <button onClick={() => togglePublish(item)} className="admin-btn">
                      {item.isPublished ? "Draft" : "Publish"}
                    </button>
                    <button onClick={() => toggleFeatured(item)} className="admin-btn">
                      {item.isFeatured ? "Unfeature" : "Feature"}
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="admin-btn admin-btn-danger"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AdminLayout>
  );
}