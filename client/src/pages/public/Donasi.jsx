import { useEffect, useState } from "react";
import "../../styles/pages/Donasi.css";
import PageHero from "../../components/common/PageHero";
import http from "../../api/http";
import { heroConfig } from "../../config/heroConfig";

import placeholder from "../../assets/images/placeholder.svg";

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

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
              Donasi Anda membantu keberlangsungan ibadah, pendidikan, pembinaan,
              dan kegiatan sosial Masjid Kagawa.
            </p>
          </div>

          {loading ? (
            <div className="donasi-state">Memuat informasi donasi...</div>
          ) : error ? (
            <div className="donasi-state donasi-state--error">{error}</div>
          ) : (
            <>
              {/* ================= BANK ================= */}
              <div className="donasi-grid">
                {hasJapanBank && (
                  <section className="donasi-card">
                    <div className="donasi-card__head">
                      <span className="donasi-card__badge">Jepang</span>
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
                      <span className="donasi-card__badge">Indonesia</span>
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

              {/* ================= QRIS ================= */}
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
                        src={data.qrisImageUrl || placeholder}
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

              {/* ================= CTA ================= */}
              {(data.confirmationText || data.confirmationLink) && (
                <section className="donasi-cta">
                  <div className="donasi-cta-card">
                    <h3>Konfirmasi Donasi</h3>
                    <p>
                      Setelah melakukan donasi, silakan konfirmasi agar dapat kami
                      catat dan doakan.
                    </p>

                    {data.confirmationLink && (
                      <a
                        href={data.confirmationLink}
                        target="_blank"
                        rel="noreferrer"
                        className="donasi-confirm-btn"
                      >
                        {data.confirmationText || "Konfirmasi Donasi"}
                      </a>
                    )}
                  </div>
                </section>
              )}

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