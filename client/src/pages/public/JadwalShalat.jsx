import { useEffect, useMemo, useState } from "react";
import "../../styles/pages/JadwalShalat.css";
import http from "../../api/http";
import PageHero from "../../components/common/PageHero";
import { heroConfig } from "../../config/heroConfig";

const EMPTY_DATA = {
  date: "",
  location: "Masjid Kagawa",
  timezone: "Asia/Tokyo",
  adzan: {
    subuh: "-",
    syuruq: "-",
    zuhur: "-",
    asar: "-",
    maghrib: "-",
    isya: "-",
  },
  iqamah: {
    subuh: "-",
    zuhur: "-",
    asar: "-",
    maghrib: "-",
    isya: "-",
  },
};

function getTodayLabel(dateString) {
  if (!dateString) return "Hari ini";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Hari ini";

  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function getPrayerIcon(key) {
  switch (key) {
    case "subuh":
      return "bi-brightness-alt-high";
    case "syuruq":
      return "bi-sunrise";
    case "zuhur":
      return "bi-sun";
    case "asar":
      return "bi-brightness-high";
    case "maghrib":
      return "bi-moon";
    case "isya":
      return "bi-stars";
    default:
      return "bi-clock";
  }
}

export default function JadwalShalat() {
  const [data, setData] = useState(EMPTY_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const hero = heroConfig.jadwal;

  const rows = useMemo(
    () => [
      {
        key: "subuh",
        name: "Subuh",
        adzan: data.adzan.subuh,
        iqamah: data.iqamah.subuh,
      },
      {
        key: "syuruq",
        name: "Syuruq",
        adzan: data.adzan.syuruq,
        iqamah: "-",
      },
      {
        key: "zuhur",
        name: "Dzuhur",
        adzan: data.adzan.zuhur,
        iqamah: data.iqamah.zuhur,
      },
      {
        key: "asar",
        name: "Ashar",
        adzan: data.adzan.asar,
        iqamah: data.iqamah.asar,
      },
      {
        key: "maghrib",
        name: "Maghrib",
        adzan: data.adzan.maghrib,
        iqamah: data.iqamah.maghrib,
      },
      {
        key: "isya",
        name: "Isya",
        adzan: data.adzan.isya,
        iqamah: data.iqamah.isya,
      },
    ],
    [data]
  );

  useEffect(() => {
    const fetchPrayerTimes = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await http.get("/api/prayer");
        const payload = res?.data || {};

        setData({
          date: payload.date || "",
          location: payload.location || "Masjid Kagawa",
          timezone: payload.timezone || "Asia/Tokyo",
          adzan: {
            subuh: payload?.adzan?.subuh || "-",
            syuruq: payload?.adzan?.syuruq || "-",
            zuhur: payload?.adzan?.zuhur || "-",
            asar: payload?.adzan?.asar || "-",
            maghrib: payload?.adzan?.maghrib || "-",
            isya: payload?.adzan?.isya || "-",
          },
          iqamah: {
            subuh: payload?.iqamah?.subuh || "-",
            zuhur: payload?.iqamah?.zuhur || "-",
            asar: payload?.iqamah?.asar || "-",
            maghrib: payload?.iqamah?.maghrib || "-",
            isya: payload?.iqamah?.isya || "-",
          },
        });
      } catch (err) {
        console.error("Gagal mengambil jadwal shalat:", err);
        setError("Jadwal shalat belum dapat dimuat. Silakan coba lagi sebentar.");
      } finally {
        setLoading(false);
      }
    };

    fetchPrayerTimes();
  }, []);

  return (
    <main className="jadwal-public-page">
      <PageHero
        backgroundImage={hero.image}
        eyebrow={hero.eyebrow}
        title={hero.title}
        subtitle={hero.subtitle}
      />

      <section className="jadwal-public-summary">
        <div className="site-shell">
          <div className="jadwal-public-summary__grid">
            <div className="jadwal-public-summary__item">
              <span className="jadwal-public-summary__label">Lokasi</span>
              <strong>{data.location}</strong>
            </div>

            <div className="jadwal-public-summary__item">
              <span className="jadwal-public-summary__label">Tanggal</span>
              <strong>{getTodayLabel(data.date)}</strong>
            </div>

            <div className="jadwal-public-summary__item">
              <span className="jadwal-public-summary__label">Zona Waktu</span>
              <strong>{data.timezone}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="jadwal-public-content">
        <div className="site-shell">
          <div className="jadwal-public-card">
            <div className="jadwal-public-card__head">
              <div>
                <span className="jadwal-public-card__eyebrow">
                  Jadwal Hari Ini
                </span>
                <h2>Waktu Shalat & Iqamah</h2>
                <p>
                  Kolom adzan menunjukkan masuknya waktu shalat. Kolom iqamah
                  menunjukkan waktu pelaksanaan jamaah di Masjid Kagawa.
                </p>
              </div>
            </div>

            {loading ? (
              <div className="jadwal-public-state">
                Memuat jadwal shalat...
              </div>
            ) : error ? (
              <div className="jadwal-public-state jadwal-public-state--error">
                {error}
              </div>
            ) : (
              <>
                <div className="jadwal-public-table-wrap">
                  <table className="jadwal-public-table">
                    <thead>
                      <tr>
                        <th>Shalat</th>
                        <th>Adzan</th>
                        <th>Iqamah</th>
                      </tr>
                    </thead>

                    <tbody>
                      {rows.map((row) => (
                        <tr key={row.key}>
                          <td className="jadwal-public-table__name">
                            <span className="jadwal-public-table__name-inner">
                              <i className={`bi ${getPrayerIcon(row.key)}`}></i>
                              <span>{row.name}</span>
                            </span>
                          </td>
                          <td className="jadwal-public-table__time">
                            {row.adzan}
                          </td>
                          <td>
                            <span
                              className={`jadwal-public-iqamah ${
                                row.iqamah === "-" ? "is-empty" : ""
                              }`}
                            >
                              {row.iqamah}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="jadwal-public-mobile-list">
                  {rows.map((row) => (
                    <article
                      className="jadwal-public-mobile-item"
                      key={row.key}
                    >
                      <div className="jadwal-public-mobile-item__top">
                        <div className="jadwal-public-mobile-item__title">
                          <i className={`bi ${getPrayerIcon(row.key)}`}></i>
                          <h3>{row.name}</h3>
                        </div>
                      </div>

                      <div className="jadwal-public-mobile-item__times">
                        <div>
                          <span>Adzan</span>
                          <strong>{row.adzan}</strong>
                        </div>

                        <div>
                          <span>Iqamah</span>
                          <strong
                            className={
                              row.iqamah === "-"
                                ? "jadwal-public-mobile-item__empty"
                                : ""
                            }
                          >
                            {row.iqamah}
                          </strong>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}