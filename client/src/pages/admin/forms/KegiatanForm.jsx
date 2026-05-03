import { useEffect, useState } from "react";
import "../../../styles/admin/AdminKegiatan.css";

const initialState = {
  title: "",
  category: "Umum",
  date: "",
  timeStart: "",
  timeEnd: "",
  location: "",
  description: "",
  imageUrl: "",
  isPublished: true,
};

export default function KegiatanForm({ editingItem, onCancelEdit, onSaved }) {
  const [form, setForm] = useState(initialState);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingItem) {
      setForm({
        title: editingItem.title || "",
        category: editingItem.category || "Umum",
        date: editingItem.date || "",
        timeStart: editingItem.timeStart || "",
        timeEnd: editingItem.timeEnd || "",
        location: editingItem.location || "",
        description: editingItem.description || "",
        imageUrl: editingItem.imageUrl || "",
        isPublished:
          typeof editingItem.isPublished === "boolean"
            ? editingItem.isPublished
            : true,
      });
    } else {
      setForm(initialState);
    }
  }, [editingItem]);

  const token = localStorage.getItem("adminToken");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      const isEdit = !!editingItem?._id;
      const url = isEdit ? `/api/kegiatan/${editingItem._id}` : `/api/kegiatan`;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setMsg(data.msg || "Gagal menyimpan kegiatan");
        setLoading(false);
        return;
      }

      setMsg(isEdit ? "Berhasil update kegiatan" : "Berhasil menambah kegiatan");
      setLoading(false);
      onSaved?.();
      if (!isEdit) setForm(initialState);
    } catch (err) {
      setLoading(false);
      setMsg("Tidak dapat terhubung ke server");
    }
  };

  return (
    <form onSubmit={submit}>
      <div className="admin-grid">
        <div>
          <label className="admin-label">Judul</label>
          <input
            className="admin-input"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="admin-label">Kategori</label>
          <input
            className="admin-input"
            name="category"
            value={form.category}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="admin-label">Tanggal</label>
          <input
            className="admin-input"
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="admin-label">Waktu Mulai</label>
          <input
            className="admin-input"
            type="time"
            name="timeStart"
            value={form.timeStart}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="admin-label">Waktu Selesai</label>
          <input
            className="admin-input"
            type="time"
            name="timeEnd"
            value={form.timeEnd}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="admin-label">Lokasi</label>
          <input
            className="admin-input"
            name="location"
            value={form.location}
            onChange={handleChange}
          />
        </div>

        <div className="admin-grid-full">
          <label className="admin-label">Deskripsi</label>
          <textarea
            className="admin-textarea"
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
          />
        </div>

        <div className="admin-grid-full">
          <label className="admin-label">Image URL (opsional)</label>
          <input
            className="admin-input"
            name="imageUrl"
            value={form.imageUrl}
            onChange={handleChange}
          />
        </div>

        <div className="admin-grid-full">
          <label className="admin-checkbox">
            <input
              type="checkbox"
              name="isPublished"
              checked={form.isPublished}
              onChange={handleChange}
            />
            Publish
          </label>
        </div>
      </div>

      <div className="admin-actions">
        <button className="admin-btn" disabled={loading}>
          {loading ? "Menyimpan..." : editingItem ? "Update Kegiatan" : "Tambah Kegiatan"}
        </button>

        {editingItem && (
          <button
            type="button"
            className="admin-btn-outline"
            onClick={onCancelEdit}
            disabled={loading}
          >
            Batal Edit
          </button>
        )}
      </div>

      {msg && <div className="admin-msg">{msg}</div>}
    </form>
  );
}
