import Hero from "../../components/hero/Hero";
import PrayerTimesCard from "../../components/cards/PrayerTimesCard";
import AnnouncementCarousel from "../../components/carousel/AnnouncementCarousel";
import HomePengumuman from "../../components/common/HomePengumuman";
import HomeKegiatan from "../../components/common/HomeKegiatan";
import HomeKajian from "../../components/common/HomeKajian";
import "../../styles/pages/MasjidPages.css";
import { useEffect, useMemo, useState } from "react";

export default function Home() {
  const [jadwalApi, setJadwalApi] = useState({
    subuh: "-",
    zuhur: "-",
    asar: "-",
    maghrib: "-",
    isya: "-",
    syuruq: "-",
  });

  const [iqamahApi, setIqamahApi] = useState({
    subuh: "-",
    zuhur: "-",
    asar: "-",
    maghrib: "-",
    isya: "-",
  });

  const [prayerMeta, setPrayerMeta] = useState({
    location: "Masjid Kagawa",
    date: "",
    timezone: "Asia/Tokyo",
  });

  useEffect(() => {
    const controller = new AbortController();

    async function loadPrayerTimes() {
      try {
        const res = await fetch("/api/prayer", { signal: controller.signal });
        const data = await res.json().catch(() => ({}));

        if (res.ok) {
          setJadwalApi({
            subuh: data?.adzan?.subuh ?? "-",
            zuhur: data?.adzan?.zuhur ?? "-",
            asar: data?.adzan?.asar ?? "-",
            maghrib: data?.adzan?.maghrib ?? "-",
            isya: data?.adzan?.isya ?? "-",
            syuruq: data?.adzan?.syuruq ?? "-",
          });

          setIqamahApi({
            subuh: data?.iqamah?.subuh ?? "-",
            zuhur: data?.iqamah?.zuhur ?? "-",
            asar: data?.iqamah?.asar ?? "-",
            maghrib: data?.iqamah?.maghrib ?? "-",
            isya: data?.iqamah?.isya ?? "-",
          });

          setPrayerMeta({
            location: data?.location ?? "Masjid Kagawa",
            date: data?.date ?? "",
            timezone: data?.timezone ?? "Asia/Tokyo",
          });
        }
      } catch (err) {
        console.error("Gagal memuat jadwal shalat:", err);
      }
    }

    loadPrayerTimes();
    return () => controller.abort();
  }, []);

  const prayerTimes = useMemo(
    () => [
      { name: "Subuh", time: jadwalApi.subuh, iqamah: iqamahApi.subuh },
      { name: "Syuruq", time: jadwalApi.syuruq, iqamah: "-" },
      { name: "Dzuhur", time: jadwalApi.zuhur, iqamah: iqamahApi.zuhur },
      { name: "Ashar", time: jadwalApi.asar, iqamah: iqamahApi.asar },
      { name: "Maghrib", time: jadwalApi.maghrib, iqamah: iqamahApi.maghrib },
      { name: "Isya", time: jadwalApi.isya, iqamah: iqamahApi.isya },
    ],
    [jadwalApi, iqamahApi]
  );

  return (
    <>
      <Hero />

      <section className="home-section home-prayer-section home-prayer-section--simple">
        <div className="home-shell">
          <div className="home-prayer-simple">
            <div className="home-prayer-simple__head">
              <div className="home-prayer-simple__title-wrap">
                <h2 className="home-prayer-simple__title">Jadwal Shalat</h2>

                <div className="home-prayer-simple__meta">
                  <span>{prayerMeta.location}</span>
                  <span>{prayerMeta.timezone}</span>
                </div>
              </div>

              <a href="/jadwal" className="home-inline-link home-inline-link--soft">
                Lihat Jadwal Lengkap
              </a>
            </div>

            <div className="home-prayer-simple__grid">
              {prayerTimes.map((p, i) => (
                <div className="home-prayer-simple__item" key={i}>
                  <PrayerTimesCard
                    name={p.name}
                    time={p.time}
                    iqamah={p.iqamah}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="home-section home-announcement-section">
        <div className="home-shell">
          <div className="home-announcement-stack">
            <AnnouncementCarousel />
            <HomePengumuman />
            <HomeKegiatan />
            <HomeKajian />
          </div>
        </div>
      </section>
    </>
  );
}