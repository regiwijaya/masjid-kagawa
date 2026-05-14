import { useEffect, useState, useCallback } from "react";
import AdminLayout from "./components/AdminLayout";
import AdminImageUploader from "../../components/admin/AdminImageUploader";
import http from "../../api/http";
import "../../styles/admin/AdminDonasi.css";

const EMPTY_FORM = {
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
};

export default function AdminDonasi() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");

  // =========================
  // LOAD DATA
  // =========================
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setErr("");

      const res = await http.get("/api/donation-settings");
      const data = res?.data || {};

      setForm({
        bankJapanName: data.bankJapanName || "",
        bankJapanAccountName: data.bankJapanAccountName || "",
        bankJapanAccountNumber: data.bankJapanAccountNumber || "",
        bankJapanBranch: data.bankJapanBranch || "",

        bankIndonesiaName: data.bankIndonesiaName || "",
        bankIndonesiaAccountName: data.bankIndonesiaAccountName || "",
        bankIndonesiaAccountNumber: data.bankIndonesiaAccountNumber || "",
        bankIndonesiaBranch: data.bankIndonesiaBranch || "",

        qrisImageUrl: data.qrisImageUrl || "",
        donationNote: data.donationNote || "",
        confirmationText: data.confirmationText || "",
        confirmationLink: data.confirmationLink || "",
      });
    } catch (e) {
      console.error("LOAD DONATION ERROR:", e);
      setErr("Gagal memuat pengaturan donasi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // =========================
  // HANDLE CHANGE
  // =========================
  const onChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // =========================
  // SUBMIT
  // =========================
  const submit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setErr("");
      setInfo("");

      // ❗ TIDAK pakai headers manual
      await http.put("/api/donation-settings", form);

      setInfo("Pengaturan donasi berhasil diperbarui.");
      await loadData();
    } catch (e) {
      console.error("SAVE DONATION ERROR:", e);

      if (e?.response?.status === 401) {
        setErr("Session habis. Silakan login ulang.");
      } else {
        setErr(
          e?.response?.data?.msg ||
            "Gagal menyimpan pengaturan donasi. Pastikan login admin masih aktif."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Kelola Donasi">
      <div className="admin-page admin-donasi-page">
        <div className="admin-toolbar">
          <div className="admin-toolbar-left">
            <h2>Kelola Donasi</h2>
            <div className="admin-muted">
              Atur rekening donasi Jepang, rekening Indonesia, QRIS, dan link konfirmasi donasi.
            </div>
          </div>
        </div>

        {(err || info) && (
          <div
            className={`admin-donasi__notice ${
              err ? "admin-donasi__notice--error" : "admin-donasi__notice--success"
            }`}
          >
            {err || info}
          </div>
        )}

        <form className="admin-donasi__layout" onSubmit={submit}>
          <div className="admin-donasi__grid">
            {/* ========================= */}
            {/* REKENING JEPANG */}
            {/* ========================= */}
            <section className="admin-card">
              <div className="admin-card-header">
                <div>
                  <p className="admin-card-title">Rekening Jepang</p>
                  <p className="admin-card-subtitle">
                    Informasi transfer untuk donatur di Jepang.
                  </p>
                </div>
              </div>

              <div className="admin-card-body admin-donasi__form">
                <label>
                  Nama Bank
                  <input
                    value={form.bankJapanName}
                    onChange={(e) => onChange("bankJapanName", e.target.value)}
                  />
                </label>

                <label>
                  Cabang / Kode
                  <input
                    value={form.bankJapanBranch}
                    onChange={(e) => onChange("bankJapanBranch", e.target.value)}
                  />
                </label>

                <label>
                  Nomor Rekening
                  <input
                    value={form.bankJapanAccountNumber}
                    onChange={(e) =>
                      onChange("bankJapanAccountNumber", e.target.value)
                    }
                  />
                </label>

                <label>
                  Atas Nama
                  <input
                    value={form.bankJapanAccountName}
                    onChange={(e) =>
                      onChange("bankJapanAccountName", e.target.value)
                    }
                  />
                </label>
              </div>
            </section>

            {/* ========================= */}
            {/* REKENING INDONESIA */}
            {/* ========================= */}
            <section className="admin-card">
              <div className="admin-card-header">
                <div>
                  <p className="admin-card-title">Rekening Indonesia</p>
                  <p className="admin-card-subtitle">
                    Informasi transfer untuk donatur dari Indonesia.
                  </p>
                </div>
              </div>

              <div className="admin-card-body admin-donasi__form">
                <label>
                  Nama Bank
                  <input
                    value={form.bankIndonesiaName}
                    onChange={(e) =>
                      onChange("bankIndonesiaName", e.target.value)
                    }
                  />
                </label>

                <label>
                  Cabang
                  <input
                    value={form.bankIndonesiaBranch}
                    onChange={(e) =>
                      onChange("bankIndonesiaBranch", e.target.value)
                    }
                  />
                </label>

                <label>
                  Nomor Rekening
                  <input
                    value={form.bankIndonesiaAccountNumber}
                    onChange={(e) =>
                      onChange("bankIndonesiaAccountNumber", e.target.value)
                    }
                  />
                </label>

                <label>
                  Atas Nama
                  <input
                    value={form.bankIndonesiaAccountName}
                    onChange={(e) =>
                      onChange("bankIndonesiaAccountName", e.target.value)
                    }
                  />
                </label>
              </div>
            </section>
          </div>

          {/* ========================= */}
          {/* QRIS */}
          {/* ========================= */}
          <section className="admin-card admin-donasi__full">
            <div className="admin-card-header">
              <div>
                <p className="admin-card-title">QRIS & Instruksi Donasi</p>
                <p className="admin-card-subtitle">
                  Tampilkan QRIS dan instruksi donasi.
                </p>
              </div>
            </div>

            <div className="admin-card-body admin-donasi__form">
              <AdminImageUploader
                type="donation"
                label="Gambar QRIS"
                value={form.qrisImageUrl}
                onChange={(url) => onChange("qrisImageUrl", url)}
              />

              <label>
                Catatan Donasi
                <textarea
                  rows={5}
                  value={form.donationNote}
                  onChange={(e) =>
                    onChange("donationNote", e.target.value)
                  }
                />
              </label>

              <div className="admin-donasi__row">
                <label>
                  Teks Konfirmasi
                  <input
                    value={form.confirmationText}
                    onChange={(e) =>
                      onChange("confirmationText", e.target.value)
                    }
                  />
                </label>

                <label>
                  Link Konfirmasi
                  <input
                    value={form.confirmationLink}
                    onChange={(e) =>
                      onChange("confirmationLink", e.target.value)
                    }
                  />
                </label>
              </div>
            </div>
          </section>

          {/* ========================= */}
          {/* BUTTON */}
          {/* ========================= */}
          <div className="admin-actions admin-donasi__actions">
            <button
              className="admin-btn admin-btn-primary"
              type="submit"
              disabled={saving || loading}
            >
              {saving ? "Menyimpan..." : "Simpan Pengaturan Donasi"}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}