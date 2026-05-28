import { useState } from "react";
import "../../styles/pages/ContactPage.css";
import http from "../../api/http";

// 🔥 TAMBAHAN
import LocationCard from "../../components/common/LocationCard";

const TYPES = [
  { key: "general", label: "Kontak Umum" },
  { key: "ustadz", label: "Tanya Ustadz" },
  { key: "collab", label: "Kerjasama / Donasi" },
];

export default function ContactPage() {
  const [type, setType] = useState("general");

  const [form, setForm] = useState({
    name: "",
    contact: "",
    message: "",
    category: "Umum",
    isAnonymous: false,
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const onChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMsg("");

      await http.post("/api/contact", {
        ...form,
        type,
      });

      setMsg("Pesan berhasil dikirim.");
      setForm({
        name: "",
        contact: "",
        message: "",
        category: "Umum",
        isAnonymous: false,
      });
    } catch (err) {
      setMsg("Gagal mengirim pesan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      
      {/* HERO */}
      <div className="contact-hero">
        <h1>Hubungi Kami</h1>
        <p>Kami siap membantu Anda</p>
      </div>

      {/* LAYOUT GRID */}
      <div className="contact-layout">

        {/* LEFT: FORM */}
        <div className="contact-left">

          {/* TYPE SELECTOR */}
          <div className="contact-types">
            {TYPES.map((t) => (
              <button
                key={t.key}
                className={type === t.key ? "active" : ""}
                onClick={() => setType(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* FORM */}
          <form className="contact-form" onSubmit={submit}>

            {/* NAME */}
            {type !== "ustadz" && (
              <label>
                Nama
                <input
                  value={form.name}
                  onChange={(e) => onChange("name", e.target.value)}
                />
              </label>
            )}

            {/* CONTACT */}
            <label>
              Email / WhatsApp
              <input
                value={form.contact}
                onChange={(e) => onChange("contact", e.target.value)}
              />
            </label>

            {/* USTADZ MODE */}
            {type === "ustadz" && (
              <>
                <label>
                  Kategori
                  <select
                    value={form.category}
                    onChange={(e) => onChange("category", e.target.value)}
                  >
                    <option>Aqidah</option>
                    <option>Fiqih</option>
                    <option>Ibadah</option>
                    <option>Kehidupan</option>
                  </select>
                </label>

                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={form.isAnonymous}
                    onChange={(e) =>
                      onChange("isAnonymous", e.target.checked)
                    }
                  />
                  Kirim sebagai anonim
                </label>
              </>
            )}

            {/* MESSAGE */}
            <label>
              Pesan
              <textarea
                rows={6}
                value={form.message}
                onChange={(e) => onChange("message", e.target.value)}
              />
            </label>

            <button type="submit" disabled={loading}>
              {loading ? "Mengirim..." : "Kirim Pesan"}
            </button>

            {msg && <p className="contact-msg">{msg}</p>}
          </form>

        </div>
          {/* QUICK CONTACT */}
          <div className="contact-quick">
            <p>Kontak Langsung</p>

            <a href="https://wa.me/your-number">
              WhatsApp
            </a>

            <a href="mailto:your@email.com">
              Email
            </a>
          </div>

        {/* RIGHT: INFO + MAP */}
        <div className="contact-right">

          {/* 🔥 LOCATION CARD */}
          <LocationCard />

          {/* 🔥 MAP */}
          <div className="contact-map">
            <iframe
              title="Masjid Kagawa Map"
              src="https://www.google.com/maps?q=Masjid+Kagawa&output=embed"
              width="100%"
              height="260"
              style={{
                border: 0,
                borderRadius: "14px",
              }}
              loading="lazy"
            />
          </div>


        </div>

      </div>
    </div>
  );
}