import { useEffect, useState } from "react";
import "../../styles/pages/Donasi.css";
import PageHero from "../../components/common/PageHero";
import http from "../../api/http";
import { heroConfig } from "../../config/heroConfig";
import placeholder from "../../assets/images/placeholder.svg";

const BACKEND_BASE_URL = "https://api.masjidkagawa.com";

const DONATION_PURPOSES = [
  "Operasional Masjid",
  "Listrik",
  "Air",
  "Gas",
  "Internet",
  "Kebersihan Masjid",
  "Alat Kebersihan",
  "Perawatan Bangunan",
  "Perbaikan Fasilitas",
  "Konsumsi Sabtu Malam",
  "Konsumsi Kajian Bulanan",
  "Konsumsi Umum",
  "Halaqah Al-Qur'an",
  "Pendidikan Anak",
  "Dakwah & Kajian",
  "Kegiatan Ramadhan",
  "Idul Fitri",
  "Idul Adha",
  "Qurban",
  "Zakat",
  "Infaq",
  "Sedekah",
  "Wakaf",
  "Bantuan Jamaah",
  "Lainnya",
];

const EMPTY_FORM = {
  donorName: "",
  isAnonymous: false,
  email: "",
  contact: "",
  currency: "JPY",
  amount: "",
  donationPurpose: "",
  otherPurpose: "",
  paymentMethod: "Transfer Bank Jepang",
  message: "",
  proofImage: null,
};

function getImageUrl(url) {
  if (!url) return placeholder;
  if (url.startsWith("http")) return url;
  if (url.startsWith("/")) return `${BACKEND_BASE_URL}${url}`;
  return `${BACKEND_BASE_URL}/${url}`;
}

export default function Donasi() {
  const [data, setData] = useState({
    bankJapanName: "",
    bankJapanAccountName: "",
    bankJapanAccountNumber: "",
    bankJapanBranch: "",
    bankIndonesiaName: "",
    bankIndonesiaAccountName: "",
    bankIndonesiaAccountNumber: "",
    bankIndonesiaBranch: "",
    qrisImageUrl: "",
    donationNote: "",
    confirmationText: "",
    confirmationLink: "",
  });

  const [form, setForm] = useState(EMPTY_FORM);
  const [proofPreview, setProofPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formMessage, setFormMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    let alive = true;

    const fetchDonationSetting = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await http.get("/api/donation-settings");
        const payload = res?.data || {};

        if (!alive) return;

        setData({
          bankJapanName: payload.bankJapanName || "",
          bankJapanAccountName: payload.bankJapanAccountName || "",
          bankJapanAccountNumber: payload.bankJapanAccountNumber || "",
          bankJapanBranch: payload.bankJapanBranch || "",
          bankIndonesiaName: payload.bankIndonesiaName || "",
          bankIndonesiaAccountName: payload.bankIndonesiaAccountName || "",
          bankIndonesiaAccountNumber: payload.bankIndonesiaAccountNumber || "",
          bankIndonesiaBranch: payload.bankIndonesiaBranch || "",
          qrisImageUrl: payload.qrisImageUrl || "",
          donationNote: payload.donationNote || "",
          confirmationText: payload.confirmationText || "",
          confirmationLink: payload.confirmationLink || "",
        });
      } catch (err) {
        console.error("Gagal memuat pengaturan donasi:", err);
        if (!alive) return;
        setError("Informasi donasi belum dapat dimuat. Silakan coba lagi.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    };

    fetchDonationSetting();

    return () => {
      alive = false;
    };
  }, []);

  const hero = heroConfig.donasi;

  const hasJapanBank =
    data.bankJapanName ||
    data.bankJapanAccountName ||
    data.bankJapanAccountNumber ||
    data.bankJapanBranch;

  const hasIndonesiaBank =
    data.bankIndonesiaName ||
    data.bankIndonesiaAccountName ||
    data.bankIndonesiaAccountNumber ||
    data.bankIndonesiaBranch;

  const hasQris = !!data.qrisImageUrl;

  function updateForm(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleProofChange(e) {
    const file = e.target.files?.[0];

    if (!file) {
      updateForm("proofImage", null);
      setProofPreview("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setFormMessage({
        type: "error",
        text: "Bukti transfer harus berupa gambar.",
      });
      e.target.value = "";
      return;
    }

    updateForm("proofImage", file);
    setProofPreview(URL.createObjectURL(file));
  }

  async function submitConfirmation(e) {
    e.preventDefault();

    try {
      setSubmitting(true);
      setFormMessage({ type: "", text: "" });

      if (!form.isAnonymous && !form.donorName.trim()) {
        setFormMessage({
          type: "error",
          text: "Isi nama donatur atau pilih Hamba Allah.",
        });
        return;
      }

      if (!form.donationPurpose) {
        setFormMessage({
          type: "error",
          text: "Pilih tujuan donasi.",
        });
        return;
      }

      const formData = new FormData();
      formData.append("donorName", form.donorName);
      formData.append("isAnonymous", String(form.isAnonymous));
      formData.append("email", form.email);
      formData.append("contact", form.contact);
      formData.append("currency", form.currency);
      formData.append("amount", form.amount);
      formData.append("donationPurpose", form.donationPurpose);
      formData.append("otherPurpose", form.otherPurpose);
      formData.append("paymentMethod", form.paymentMethod);
      formData.append("message", form.message);

      if (form.proofImage) {
        formData.append("proofImage", form.proofImage);
      }

      const res = await http.post("/api/donation-confirmations", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setFormMessage({
        type: "success",
        text:
          res?.data?.msg ||
          "Konfirmasi donasi berhasil dikirim. Jazakumullahu khairan.",
      });

      setForm(EMPTY_FORM);
      setProofPreview("");
    } catch (err) {
      console.error("KONFIRMASI DONASI ERROR:", err);

      setFormMessage({
        type: "error",
        text:
          err?.response?.data?.msg ||
          err?.response?.data?.message ||
          "Konfirmasi donasi gagal dikirim. Silakan coba lagi.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="donasi-page">
      <PageHero
        backgroundImage={hero.image}
        overlay={hero.overlay}
        eyebrow="Dukungan Jamaah"
        title="Donasi Masjid"
        subtitle="Salurkan dukungan terbaik Anda untuk operasional, dakwah, dan pelayanan umat"
      />

      <section className="donasi-section">
        <div className="site-shell">
          <div className="donasi-section-head">
            <span className="donasi-section-eyebrow">Dukungan Kebaikan</span>
            <h2 className="donasi-section-title">Salurkan Donasi Anda</h2>
            <p className="donasi-section-subtext">
              Donasi Anda membantu keberlangsungan ibadah, pendidikan,
              pembinaan, dan kegiatan sosial Masjid Kagawa.
            </p>
          </div>

          {loading ? (
            <div className="donasi-state">Memuat informasi donasi...</div>
          ) : error ? (
            <div className="donasi-state donasi-state--error">{error}</div>
          ) : (
            <>
              <div className="donasi-grid">
                {hasJapanBank && (
                  <section className="donasi-card">
                    <div className="donasi-card__head">
                      <span className="donasi-card__badge">JPY / Yen</span>
                      <h3>Transfer Bank Jepang</h3>
                    </div>

                    <div className="donasi-bank-list">
                      {data.bankJapanName && (
                        <div className="donasi-bank-row">
                          <span>Bank</span>
                          <strong>{data.bankJapanName}</strong>
                        </div>
                      )}

                      {data.bankJapanBranch && (
                        <div className="donasi-bank-row">
                          <span>Cabang</span>
                          <strong>{data.bankJapanBranch}</strong>
                        </div>
                      )}

                      {data.bankJapanAccountNumber && (
                        <div className="donasi-bank-row highlight">
                          <span>No. Rekening</span>
                          <strong>{data.bankJapanAccountNumber}</strong>
                        </div>
                      )}

                      {data.bankJapanAccountName && (
                        <div className="donasi-bank-row">
                          <span>Atas Nama</span>
                          <strong>{data.bankJapanAccountName}</strong>
                        </div>
                      )}
                    </div>
                  </section>
                )}

                {hasIndonesiaBank && (
                  <section className="donasi-card">
                    <div className="donasi-card__head">
                      <span className="donasi-card__badge">IDR / Rupiah</span>
                      <h3>Transfer Bank Indonesia</h3>
                    </div>

                    <div className="donasi-bank-list">
                      {data.bankIndonesiaName && (
                        <div className="donasi-bank-row">
                          <span>Bank</span>
                          <strong>{data.bankIndonesiaName}</strong>
                        </div>
                      )}

                      {data.bankIndonesiaBranch && (
                        <div className="donasi-bank-row">
                          <span>Cabang</span>
                          <strong>{data.bankIndonesiaBranch}</strong>
                        </div>
                      )}

                      {data.bankIndonesiaAccountNumber && (
                        <div className="donasi-bank-row highlight">
                          <span>No. Rekening</span>
                          <strong>{data.bankIndonesiaAccountNumber}</strong>
                        </div>
                      )}

                      {data.bankIndonesiaAccountName && (
                        <div className="donasi-bank-row">
                          <span>Atas Nama</span>
                          <strong>{data.bankIndonesiaAccountName}</strong>
                        </div>
                      )}
                    </div>
                  </section>
                )}
              </div>

              {hasQris && (
                <section className="donasi-qris-section">
                  <div className="donasi-qris-card">
                    <div className="donasi-qris-card__content">
                      <span className="donasi-card__badge">QRIS</span>
                      <h3>Scan untuk Berdonasi</h3>

                      {data.donationNote && (
                        <p className="donasi-qris-note">{data.donationNote}</p>
                      )}
                    </div>

                    <div className="donasi-qris-media">
                      <img
                        src={getImageUrl(data.qrisImageUrl)}
                        alt="QRIS Donasi"
                        className="donasi-qris-image"
                        onError={(e) => {
                          e.currentTarget.src = placeholder;
                        }}
                      />
                    </div>
                  </div>
                </section>
              )}

              <section className="donasi-confirmation-section">
                <div className="donasi-confirmation-card">
                  <div className="donasi-confirmation-head">
                    <span className="donasi-section-eyebrow">
                      Konfirmasi Donasi
                    </span>
                    <h3>Isi Formulir Konfirmasi</h3>
                    <p>
                      Setelah transfer, isi formulir ini agar donasi dapat
                      dicatat oleh pengurus Masjid Kagawa.
                    </p>
                  </div>

                  <form
                    className="donasi-confirmation-form"
                    onSubmit={submitConfirmation}
                  >
                    <div className="donasi-form-row">
                      <label>
                        Nama Donatur
                        <input
                          type="text"
                          value={form.donorName}
                          onChange={(e) =>
                            updateForm("donorName", e.target.value)
                          }
                          disabled={form.isAnonymous}
                          placeholder="Nama lengkap"
                        />
                      </label>

                      <label className="donasi-checkbox">
                        <input
                          type="checkbox"
                          checked={form.isAnonymous}
                          onChange={(e) => {
                            updateForm("isAnonymous", e.target.checked);
                            if (e.target.checked) {
                              updateForm("donorName", "");
                            }
                          }}
                        />
                        Tulis sebagai Hamba Allah
                      </label>
                    </div>

                    <div className="donasi-form-row">
                      <label>
                        Email
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => updateForm("email", e.target.value)}
                          placeholder="Opsional"
                        />
                      </label>

                      <label>
                        WhatsApp / LINE
                        <input
                          type="text"
                          value={form.contact}
                          onChange={(e) =>
                            updateForm("contact", e.target.value)
                          }
                          placeholder="Opsional"
                        />
                      </label>
                    </div>

                    <div className="donasi-form-row">
                      <label>
                        Mata Uang
                        <select
                          value={form.currency}
                          onChange={(e) =>
                            updateForm("currency", e.target.value)
                          }
                        >
                          <option value="JPY">Yen Jepang (JPY)</option>
                          <option value="IDR">Rupiah Indonesia (IDR)</option>
                        </select>
                      </label>

                      <label>
                        Nominal
                        <input
                          type="text"
                          value={form.amount}
                          onChange={(e) => updateForm("amount", e.target.value)}
                          placeholder="Contoh: 5000 / 100000"
                        />
                      </label>
                    </div>

                    <div className="donasi-form-row">
                      <label>
                        Tujuan Donasi
                        <select
                          value={form.donationPurpose}
                          onChange={(e) =>
                            updateForm("donationPurpose", e.target.value)
                          }
                        >
                          <option value="">Pilih tujuan donasi</option>
                          {DONATION_PURPOSES.map((item) => (
                            <option value={item} key={item}>
                              {item}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label>
                        Metode Transfer
                        <select
                          value={form.paymentMethod}
                          onChange={(e) =>
                            updateForm("paymentMethod", e.target.value)
                          }
                        >
                          <option value="Transfer Bank Jepang">
                            Transfer Bank Jepang
                          </option>
                          <option value="Transfer Bank Indonesia">
                            Transfer Bank Indonesia
                          </option>
                          <option value="QRIS">QRIS</option>
                          <option value="Tunai">Tunai</option>
                          <option value="Lainnya">Lainnya</option>
                        </select>
                      </label>
                    </div>

                    {form.donationPurpose === "Lainnya" && (
                      <label>
                        Keterangan Tujuan Lainnya
                        <input
                          type="text"
                          value={form.otherPurpose}
                          onChange={(e) =>
                            updateForm("otherPurpose", e.target.value)
                          }
                          placeholder="Tuliskan tujuan donasi"
                        />
                      </label>
                    )}

                    <label>
                      Upload Bukti Transfer
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProofChange}
                      />
                    </label>

                    {proofPreview && (
                      <div className="donasi-proof-preview">
                        <img src={proofPreview} alt="Preview bukti transfer" />
                      </div>
                    )}

                    <label>
                      Catatan untuk Pengurus
                      <textarea
                        rows={4}
                        value={form.message}
                        onChange={(e) => updateForm("message", e.target.value)}
                        placeholder="Opsional"
                      />
                    </label>

                    {formMessage.text && (
                      <div
                        className={`donasi-form-alert ${
                          formMessage.type === "success"
                            ? "donasi-form-alert--success"
                            : "donasi-form-alert--error"
                        }`}
                      >
                        {formMessage.text}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="donasi-confirm-btn"
                      disabled={submitting}
                    >
                      {submitting
                        ? "Mengirim..."
                        : "Kirim Konfirmasi Donasi"}
                    </button>
                  </form>
                </div>
              </section>

              {!hasJapanBank && !hasIndonesiaBank && !hasQris && (
                <div className="donasi-state">
                  Informasi donasi belum tersedia.
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}