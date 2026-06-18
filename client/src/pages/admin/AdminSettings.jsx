import { useEffect, useState, useCallback } from "react";
import AdminLayout from "./components/AdminLayout";
import AdminImageUploader from "../../components/admin/AdminImageUploader";
import http from "../../api/http";
import "../../styles/admin/AdminSettings.css";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const BACKEND_BASE_URL = "https://api.masjidkagawa.com";

const DEFAULT_LEADERS = [
  { role: "Ketua", name: "", imageUrl: "", note: "" },
  { role: "Imam", name: "", imageUrl: "", note: "" },
  { role: "Imam Magang", name: "", imageUrl: "", note: "" },
  { role: "Imam Magang", name: "", imageUrl: "", note: "" },
];

const EMPTY_FORM = {
  heroTitle: "",
  heroSubtitle: "",
  heroImageUrl: "",
  historyTitle: "",
  historyText: "",
  historyImageUrl: "",
  visionTitle: "",
  visionText: "",
  missionTitle: "",
  missionItemsText: "",
  footerDescription: "",
  address: "",
  email: "",
  phone: "",
  mapEmbedUrl: "",
  imamDuty: "",
  muadzinDuty: "",
  socialFacebook: "",
  socialInstagram: "",
  socialYoutube: "",
  leaders: DEFAULT_LEADERS,
};

const tabs = [
  { key: "page", label: "Halaman" },
  { key: "contact", label: "Kontak & Sosial" },
  { key: "leaders", label: "Pengurus" },
];

function getAdminToken() {
  return localStorage.getItem("adminToken") || localStorage.getItem("token") || "";
}

function toText(value) {
  if (typeof value === "string") return value;
  if (value?.imageUrl && typeof value.imageUrl === "string") return value.imageUrl;
  if (value?.url && typeof value.url === "string") return value.url;
  return "";
}

function getImageUrl(url) {
  const cleanUrl = toText(url).trim();

  if (!cleanUrl) return "";
  if (cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://")) {
    return cleanUrl;
  }
  if (cleanUrl.startsWith("/")) {
    return `${BACKEND_BASE_URL}${cleanUrl}`;
  }

  return `${BACKEND_BASE_URL}/${cleanUrl}`;
}

function getRawImageUrl(value) {
  return toText(value).trim();
}

const imageHandler = async function () {
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
      const token = getAdminToken();

      const res = await http.post("/api/uploads/about", formData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const imageUrl = getImageUrl(res.data?.imageUrl || res.data?.url);

      const quill = this.quill;
      const range = quill.getSelection(true);

      quill.insertEmbed(range.index, "image", imageUrl);
    } catch (err) {
      console.error("Upload gambar editor gagal:", err);
      alert("Upload gambar gagal");
    }
  };
};

const quillModules = {
  toolbar: {
    container: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      ["clean"],
    ],
    handlers: {
      image: imageHandler,
    },
  },
};

export default function AdminSettings() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [activeTab, setActiveTab] = useState("page");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setErr("");
      setInfo("");

      const res = await http.get("/api/about-settings");
      const data = res?.data || {};

      const leaders =
        Array.isArray(data.leaders) && data.leaders.length > 0
          ? data.leaders
          : DEFAULT_LEADERS;

      setForm({
        heroTitle: data.heroTitle || "Tentang Masjid Kagawa",
        heroSubtitle:
          data.heroSubtitle || "Sejarah • Visi Misi • Struktur Pengurus",
        heroImageUrl: data.heroImageUrl || "",

        historyTitle: data.historyTitle || "Sejarah Masjid",
        historyText: data.historyText || "",
        historyImageUrl: data.historyImageUrl || "",

        visionTitle: data.visionTitle || "Visi",
        visionText: data.visionText || "",
        missionTitle: data.missionTitle || "Misi",
        missionItemsText: Array.isArray(data.missionItems)
          ? data.missionItems.join("\n")
          : "",

        footerDescription: data.footerDescription || "",
        address: data.address || "",
        email: data.email || "",
        phone: data.phone || "",
        mapEmbedUrl: data.mapEmbedUrl || "",
        imamDuty: data.imamDuty || "",
        muadzinDuty: data.muadzinDuty || "",

        socialFacebook: data?.social?.facebook || "",
        socialInstagram: data?.social?.instagram || "",
        socialYoutube: data?.social?.youtube || "",

        leaders: leaders.map((item) => ({
          role: item?.role || "",
          name: item?.name || "",
          imageUrl: item?.imageUrl || "",
          note: item?.note || "",
        })),
      });
    } catch (e) {
      console.error("LOAD ABOUT SETTINGS ERROR:", e);
      setErr("Gagal memuat pengaturan Tentang Masjid.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onLeaderChange = (index, key, value) => {
    setForm((prev) => {
      const leaders = [...prev.leaders];
      leaders[index] = { ...leaders[index], [key]: value };
      return { ...prev, leaders };
    });
  };

  const addLeader = () => {
    setForm((prev) => ({
      ...prev,
      leaders: [...prev.leaders, { role: "", name: "", imageUrl: "", note: "" }],
    }));
  };

  const removeLeader = (index) => {
    setForm((prev) => ({
      ...prev,
      leaders: prev.leaders.filter((_, i) => i !== index),
    }));
  };

  const submit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setErr("");
      setInfo("");

      const token = getAdminToken();

      if (!token) {
        setErr("Token admin tidak ditemukan. Silakan login ulang.");
        return;
      }

      const payload = {
        heroTitle: form.heroTitle.trim(),
        heroSubtitle: form.heroSubtitle.trim(),
        heroImageUrl: getRawImageUrl(form.heroImageUrl),

        historyTitle: form.historyTitle.trim(),
        historyText: form.historyText.trim(),
        historyImageUrl: getRawImageUrl(form.historyImageUrl),

        visionTitle: form.visionTitle.trim(),
        visionText: form.visionText.trim(),

        missionTitle: form.missionTitle.trim(),
        missionItems: form.missionItemsText
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),

        footerDescription: form.footerDescription.trim(),
        address: form.address.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        mapEmbedUrl: form.mapEmbedUrl.trim(),
        imamDuty: form.imamDuty.trim(),
        muadzinDuty: form.muadzinDuty.trim(),

        social: {
          facebook: form.socialFacebook.trim(),
          instagram: form.socialInstagram.trim(),
          youtube: form.socialYoutube.trim(),
        },

        leaders: form.leaders
          .map((item) => ({
            role: toText(item.role).trim(),
            name: toText(item.name).trim(),
            imageUrl: getRawImageUrl(item.imageUrl),
            note: toText(item.note).trim(),
          }))
          .filter((item) => item.role || item.name || item.imageUrl || item.note),
      };

      await http.put("/api/about-settings", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setInfo("Pengaturan Tentang Masjid berhasil diperbarui.");
      await loadData();
    } catch (e) {
      console.error("SAVE ABOUT SETTINGS ERROR:", e);
      setErr(e?.response?.data?.msg || "Gagal menyimpan pengaturan.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Tentang Masjid">
      <div className="admin-page admin-settings-page">
        <div className="admin-settings-hero">
          <div>
            <p className="admin-settings-eyebrow">Website Settings</p>
            <h2>Tentang Masjid</h2>
            <p>
              Kelola identitas halaman, kontak, sosial media, peta, footer, dan
              struktur pengurus.
            </p>
          </div>

          <button
            className="admin-btn admin-btn-primary"
            type="button"
            disabled={saving || loading}
            onClick={submit}
          >
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>

        {(err || info) && (
          <div
            className={`admin-settings__notice ${
              err
                ? "admin-settings__notice--error"
                : "admin-settings__notice--success"
            }`}
          >
            {err || info}
          </div>
        )}

        {loading ? (
          <div className="admin-settings__state">Memuat data...</div>
        ) : (
          <form className="admin-settings-shell" onSubmit={submit}>
            <aside className="admin-settings-tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  className={activeTab === tab.key ? "is-active" : ""}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </aside>

            <main className="admin-settings-panel">
              {activeTab === "page" && (
                <>
                  <section className="admin-card">
                    <div className="admin-card-header">
                      <div>
                        <p className="admin-card-title">Hero Halaman</p>
                        <p className="admin-card-subtitle">
                          Bagian pembuka halaman Tentang Masjid.
                        </p>
                      </div>
                    </div>

                    <div className="admin-card-body admin-settings__form">
                      <label>
                        Judul Hero
                        <input
                          value={form.heroTitle}
                          onChange={(e) =>
                            onChange("heroTitle", e.target.value)
                          }
                        />
                      </label>

                      <label>
                        Subtitle Hero
                        <input
                          value={form.heroSubtitle}
                          onChange={(e) =>
                            onChange("heroSubtitle", e.target.value)
                          }
                        />
                      </label>

                      <AdminImageUploader
                        type="about"
                        label="Gambar Hero"
                        value={form.heroImageUrl}
                        onChange={(url) => onChange("heroImageUrl", url)}
                      />
                    </div>
                  </section>

                  <section className="admin-card">
                    <div className="admin-card-header">
                      <div>
                        <p className="admin-card-title">Sejarah Masjid</p>
                        <p className="admin-card-subtitle">
                          Narasi sejarah dan gambar pendukung.
                        </p>
                      </div>
                    </div>

                    <div className="admin-card-body admin-settings__form">
                      <label>
                        Judul Bagian
                        <input
                          value={form.historyTitle}
                          onChange={(e) =>
                            onChange("historyTitle", e.target.value)
                          }
                        />
                      </label>

                      <AdminImageUploader
                        type="about"
                        label="Gambar Sejarah"
                        value={form.historyImageUrl}
                        onChange={(url) => onChange("historyImageUrl", url)}
                      />

                      <label>
                        Teks Sejarah
                        <ReactQuill
                          theme="snow"
                          value={form.historyText}
                          onChange={(value) => onChange("historyText", value)}
                          modules={quillModules}
                          className="admin-quill"
                        />
                      </label>
                    </div>
                  </section>

                  <section className="admin-card">
                    <div className="admin-card-header">
                      <div>
                        <p className="admin-card-title">Visi & Misi</p>
                        <p className="admin-card-subtitle">
                          Visi utama dan daftar misi masjid.
                        </p>
                      </div>
                    </div>

                    <div className="admin-card-body admin-settings__form">
                      <div className="admin-settings__row">
                        <label>
                          Judul Visi
                          <input
                            value={form.visionTitle}
                            onChange={(e) =>
                              onChange("visionTitle", e.target.value)
                            }
                          />
                        </label>

                        <label>
                          Judul Misi
                          <input
                            value={form.missionTitle}
                            onChange={(e) =>
                              onChange("missionTitle", e.target.value)
                            }
                          />
                        </label>
                      </div>

                      <label>
                        Teks Visi
                        <textarea
                          rows={4}
                          value={form.visionText}
                          onChange={(e) =>
                            onChange("visionText", e.target.value)
                          }
                        />
                      </label>

                      <label>
                        Daftar Misi
                        <textarea
                          rows={6}
                          value={form.missionItemsText}
                          onChange={(e) =>
                            onChange("missionItemsText", e.target.value)
                          }
                          placeholder="Satu baris untuk satu poin misi"
                        />
                      </label>
                    </div>
                  </section>
                </>
              )}

              {activeTab === "contact" && (
                <section className="admin-card">
                  <div className="admin-card-header">
                    <div>
                      <p className="admin-card-title">Kontak, Footer & Map</p>
                      <p className="admin-card-subtitle">
                        Data ini digunakan di halaman publik dan footer website.
                      </p>
                    </div>
                  </div>

                  <div className="admin-card-body admin-settings__form">
                    <label>
                      Deskripsi Footer
                      <textarea
                        rows={4}
                        value={form.footerDescription}
                        onChange={(e) =>
                          onChange("footerDescription", e.target.value)
                        }
                      />
                    </label>

                    <div className="admin-settings__row">
                      <label>
                        Alamat
                        <input
                          value={form.address}
                          onChange={(e) => onChange("address", e.target.value)}
                        />
                      </label>

                      <label>
                        Email
                        <input
                          value={form.email}
                          onChange={(e) => onChange("email", e.target.value)}
                        />
                      </label>
                    </div>

                    <div className="admin-settings__row">
                      <label>
                        Telepon
                        <input
                          value={form.phone}
                          onChange={(e) => onChange("phone", e.target.value)}
                        />
                      </label>

                      <label>
                        Instagram URL
                        <input
                          value={form.socialInstagram}
                          onChange={(e) =>
                            onChange("socialInstagram", e.target.value)
                          }
                        />
                      </label>
                    </div>

                    <div className="admin-settings__row">
                      <label>
                        Facebook URL
                        <input
                          value={form.socialFacebook}
                          onChange={(e) =>
                            onChange("socialFacebook", e.target.value)
                          }
                        />
                      </label>

                      <label>
                        YouTube URL
                        <input
                          value={form.socialYoutube}
                          onChange={(e) =>
                            onChange("socialYoutube", e.target.value)
                          }
                        />
                      </label>
                    </div>

                    <div className="admin-settings__row">
                      <label>
                        Imam On-Duty
                        <input
                          value={form.imamDuty}
                          onChange={(e) =>
                            onChange("imamDuty", e.target.value)
                          }
                        />
                      </label>

                      <label>
                        Muadzin On-Duty
                        <input
                          value={form.muadzinDuty}
                          onChange={(e) =>
                            onChange("muadzinDuty", e.target.value)
                          }
                        />
                      </label>
                    </div>

                    <label>
                      Google Maps Embed URL
                      <textarea
                        rows={3}
                        value={form.mapEmbedUrl}
                        onChange={(e) =>
                          onChange("mapEmbedUrl", e.target.value)
                        }
                        placeholder="https://www.google.com/maps/embed?pb=..."
                      />
                    </label>
                  </div>
                </section>
              )}

              {activeTab === "leaders" && (
                <section className="admin-card">
                  <div className="admin-card-header admin-settings__leaders-header">
                    <div>
                      <p className="admin-card-title">
                        Struktur Pengurus / Tokoh
                      </p>
                      <p className="admin-card-subtitle">
                        Isi jabatan, nama, foto, dan catatan tambahan.
                      </p>
                    </div>

                    <button
                      type="button"
                      className="admin-btn admin-btn-ghost"
                      onClick={addLeader}
                    >
                      Tambah Tokoh
                    </button>
                  </div>

                  <div className="admin-card-body admin-settings__leaders">
                    {form.leaders.map((leader, index) => (
                      <div className="admin-settings__leader-card" key={index}>
                        <div className="admin-settings__leader-top">
                          <div>
                            <strong>{leader.name || "Nama belum diisi"}</strong>
                            <span>{leader.role || "Jabatan belum diisi"}</span>
                          </div>

                          <button
                            type="button"
                            className="admin-btn admin-btn-danger"
                            onClick={() => removeLeader(index)}
                          >
                            Hapus
                          </button>
                        </div>

                        <div className="admin-settings__leader-grid">
                          <label>
                            Jabatan
                            <input
                              value={leader.role}
                              onChange={(e) =>
                                onLeaderChange(index, "role", e.target.value)
                              }
                            />
                          </label>

                          <label>
                            Nama
                            <input
                              value={leader.name}
                              onChange={(e) =>
                                onLeaderChange(index, "name", e.target.value)
                              }
                            />
                          </label>
                        </div>

                        <AdminImageUploader
                          type="about"
                          label="Foto Pengurus"
                          value={leader.imageUrl}
                          aspect={1 / 1}
                          onChange={(url) =>
                            onLeaderChange(index, "imageUrl", url)
                          }
                        />

                        <label className="admin-settings__leader-note">
                          Catatan
                          <input
                            value={leader.note}
                            onChange={(e) =>
                              onLeaderChange(index, "note", e.target.value)
                            }
                            placeholder="Contoh: 20 Januari 2026 – 10 April 2026"
                          />
                        </label>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <div className="admin-settings-savebar">
                <span>
                  {saving
                    ? "Sedang menyimpan perubahan..."
                    : "Perubahan akan disimpan ke halaman publik."}
                </span>

                <button
                  className="admin-btn admin-btn-primary"
                  type="submit"
                  disabled={saving}
                >
                  {saving ? "Menyimpan..." : "Simpan Pengaturan"}
                </button>
              </div>
            </main>
          </form>
        )}
      </div>
    </AdminLayout>
  );
}