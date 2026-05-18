import { useEffect, useMemo, useState } from "react";
import "../../styles/components/Hero.css";
import http from "../../api/http";

import ButtonPrimary from "../common/buttons/ButtonPrimary";
import ButtonSecondary from "../common/buttons/ButtonSecondary";

import hero1 from "../../assets/images/hero-1.jpg";
import hero2 from "../../assets/images/hero-2.jpg";
import hero3 from "../../assets/images/hero-3.jpg";
import hero4 from "../../assets/images/hero-4.jpg";
import hero5 from "../../assets/images/hero-5.jpg";
import hero6 from "../../assets/images/hero-6.jpg";

function pad2(n) {
  return String(n).padStart(2, "0");
}

function parseHHMMToDateToday(hhmm) {
  if (!hhmm || hhmm === "-") return null;

  const match = hhmm.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;

  const h = Number(match[1]);
  const m = Number(match[2]);

  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

function formatCountdown(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;

  if (h > 0) return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
  return `${pad2(m)}:${pad2(s)}`;
}

export default function Hero() {
  const heroImages = useMemo(
    () => [hero1, hero2, hero3, hero4, hero5, hero6],
    []
  );

  const [currentIdx, setCurrentIdx] = useState(0);
  const [prevIdx, setPrevIdx] = useState(0);
  const [isFading, setIsFading] = useState(false);

  const [adzan, setAdzan] = useState({
    subuh: "-",
    syuruq: "-",
    zuhur: "-",
    asar: "-",
    maghrib: "-",
    isya: "-",
  });

  const [prayerMeta, setPrayerMeta] = useState({
    location: "Masjid Kagawa",
    date: "",
  });

  const [prayerLoading, setPrayerLoading] = useState(true);

  const intervalMs = 6500;
  const durationMs = 1400;

  useEffect(() => {
    const timer = setTimeout(() => {
      const next = (currentIdx + 1) % heroImages.length;

      setPrevIdx(currentIdx);
      setCurrentIdx(next);
      setIsFading(true);

      const fadeTimer = setTimeout(() => {
        setIsFading(false);
      }, durationMs);

      return () => clearTimeout(fadeTimer);
    }, intervalMs);

    return () => clearTimeout(timer);
  }, [currentIdx, heroImages.length]);

  useEffect(() => {
    const fetchPrayerData = async () => {
      try {
        const res = await http.get("/api/prayer");

        setAdzan(res?.data?.adzan || {});
        setPrayerMeta({
          location: res?.data?.location || "Masjid Kagawa",
          date: res?.data?.date || "",
        });
      } catch (error) {
        console.error("Gagal mengambil jadwal shalat:", error);
      } finally {
        setPrayerLoading(false);
      }
    };

    fetchPrayerData();
  }, []);

  const prev = heroImages[prevIdx];
  const current = heroImages[currentIdx];

  const schedule = useMemo(
    () =>
      [
        { name: "Subuh", time: adzan.subuh },
        { name: "Dzuhur", time: adzan.zuhur },
        { name: "Ashar", time: adzan.asar },
        { name: "Maghrib", time: adzan.maghrib },
        { name: "Isya", time: adzan.isya },
      ].filter((item) => item.time && item.time !== "-"),
    [adzan]
  );

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const nextPrayer = useMemo(() => {
    const nowMs = now.getTime();

    for (const p of schedule) {
      const dtObj = parseHHMMToDateToday(p.time);
      if (!dtObj) continue;

      const dt = dtObj.getTime();
      if (dt > nowMs) {
        return {
          name: p.name,
          time: p.time,
          target: dt,
        };
      }
    }

    const tomorrowSubuh = parseHHMMToDateToday(adzan.subuh);

    if (tomorrowSubuh) {
      tomorrowSubuh.setDate(tomorrowSubuh.getDate() + 1);
      return {
        name: "Subuh",
        time: adzan.subuh,
        target: tomorrowSubuh.getTime(),
      };
    }

    return {
      name: "-",
      time: "--:--",
      target: nowMs,
    };
  }, [now, schedule, adzan.subuh]);

  const countdown = formatCountdown(nextPrayer.target - now.getTime());

  return (
    <header id="home-hero" className="hero-section hero-rotating">
      <div
        className="hero-bg hero-bg--prev"
        style={{ backgroundImage: `url(${prev})` }}
      />

      <div
        className={`hero-bg hero-bg--current ${isFading ? "is-fading" : ""}`}
        style={{ backgroundImage: `url(${current})` }}
      />

      <div className="hero-overlay" />

      <div className="site-shell">
        <div className="hero-content">
          <span className="hero-badge">
            Keluarga Muslim Indonesia Kagawa
          </span>

          <h1 className="hero-title">
            Masjid Kagawa
            <span className="hero-title-sub">
              Pusat Ibadah, Pembinaan, dan Ukhuwah Muslim di Kagawa
            </span>
          </h1>

          <div className="hero-buttons">
            <ButtonPrimary href="/jadwal">
              Lihat Jadwal Shalat
            </ButtonPrimary>

            <ButtonSecondary href="/kegiatan">
              Kegiatan Minggu Ini
            </ButtonSecondary>
          </div>

          <div className="hero-next">
            <div className="hero-next-title">
              {prayerLoading
                ? "Memuat jadwal shalat..."
                : `Menuju Adzan Berikutnya • ${prayerMeta.location}`}
            </div>

            <div className="hero-next-card">
              <div className="hero-next-main">
                <div className="hero-next-label">{nextPrayer.name}</div>
                <div className="hero-next-time">{nextPrayer.time}</div>
              </div>

              <div className="hero-next-divider" />

              <div className="hero-next-countdown">
                <div className="hero-next-countdown-label">
                  Adzan dalam
                </div>
                <div className="hero-next-countdown-value">
                  {countdown}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}