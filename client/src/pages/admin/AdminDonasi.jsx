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

function getAdminToken() {
  return localStorage.getItem("adminToken") || localStorage.getItem("token") || "";
}

export default function AdminDonasi() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");

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

  const onChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // 🔥 FINAL SUBMIT FIX + DEBUG
  const submit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setErr("");
      setInfo("");

      const token = getAdminToken();

      // ❗ VALIDASI TOKEN
      if (!token) {
        setErr("Token admin tidak ditemukan. Silakan login ulang.");
        return;
      }

      const payload = {
        ...form,
        qrisImageUrl:
          typeof form.qrisImageUrl === "string"
            ? form.qrisImageUrl
            : form.qrisImageUrl?.imageUrl || "",
      };

      console.log("PAYLOAD SENT:", payload);

      const res = await http.put("/api/donation-settings", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("SUCCESS RESPONSE:", res.data);

      setInfo("Pengaturan donasi berhasil diperbarui.");
      await loadData();
    } catch (e) {
      console.error("SAVE DONATION ERROR FULL:", e);
      console.error("RESPONSE:", e?.response);

      // 🔥 DEBUG ERROR ASLI
      const backendMsg = e?.response?.data?.msg;

      if (e?.response?.status === 401) {
        setErr("Unauthorized. Login admin tidak valid.");
      } else {
        setErr(
          backendMsg ||
          "Gagal menyimpan pengaturan. Lihat console."
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
              Atur rekening donasi Jepang, Indonesia, QRIS, dan konfirmasi.
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

            <section className="admin-card">
              <div className="admin-card-header">
                <p className="admin-card-title">Rekening Jepang</p>
              </div>

              <div className="admin-card-body admin-donasi__form">
                <input value={form.bankJapanName} onChange={(e)=>onChange("bankJapanName",e.target.value)} placeholder="Nama Bank"/>
                <input value={form.bankJapanBranch} onChange={(e)=>onChange("bankJapanBranch",e.target.value)} placeholder="Cabang"/>
                <input value={form.bankJapanAccountNumber} onChange={(e)=>onChange("bankJapanAccountNumber",e.target.value)} placeholder="Nomor"/>
                <input value={form.bankJapanAccountName} onChange={(e)=>onChange("bankJapanAccountName",e.target.value)} placeholder="Atas Nama"/>
              </div>
            </section>

            <section className="admin-card">
              <div className="admin-card-header">
                <p className="admin-card-title">Rekening Indonesia</p>
              </div>

              <div className="admin-card-body admin-donasi__form">
                <input value={form.bankIndonesiaName} onChange={(e)=>onChange("bankIndonesiaName",e.target.value)} placeholder="Nama Bank"/>
                <input value={form.bankIndonesiaBranch} onChange={(e)=>onChange("bankIndonesiaBranch",e.target.value)} placeholder="Cabang"/>
                <input value={form.bankIndonesiaAccountNumber} onChange={(e)=>onChange("bankIndonesiaAccountNumber",e.target.value)} placeholder="Nomor"/>
                <input value={form.bankIndonesiaAccountName} onChange={(e)=>onChange("bankIndonesiaAccountName",e.target.value)} placeholder="Atas Nama"/>
              </div>
            </section>

          </div>

          <section className="admin-card admin-donasi__full">
            <div className="admin-card-header">
              <p className="admin-card-title">QRIS</p>
            </div>

            <div className="admin-card-body admin-donasi__form">
              <AdminImageUploader
                type="donation"
                label="QRIS"
                value={form.qrisImageUrl}
                onChange={(url)=>onChange("qrisImageUrl",url)}
              />

              <textarea
                value={form.donationNote}
                onChange={(e)=>onChange("donationNote",e.target.value)}
                placeholder="Catatan donasi"
              />

              <input
                value={form.confirmationText}
                onChange={(e)=>onChange("confirmationText",e.target.value)}
                placeholder="Teks konfirmasi"
              />

              <input
                value={form.confirmationLink}
                onChange={(e)=>onChange("confirmationLink",e.target.value)}
                placeholder="Link konfirmasi"
              />
            </div>
          </section>

          <div className="admin-actions admin-donasi__actions">
            <button className="admin-btn admin-btn-primary" type="submit">
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>

        </form>
      </div>
    </AdminLayout>
  );
}