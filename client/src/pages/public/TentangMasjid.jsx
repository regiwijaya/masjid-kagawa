import { useEffect, useMemo, useState } from "react";
import PageHero from "../../components/common/PageHero";
import "../../styles/pages/TentangMasjid.css";
import http from "../../api/http";
import { heroConfig } from "../../config/heroConfig";

import sejarahFallback from "../../assets/images/masjid.jpeg";
import personFallback from "../../assets/images/placeholder.svg";

const YOUTUBE_EMBED_URL = "https://www.youtube.com/embed/fU9AQ7EmCIA";

const EMPTY_DATA = {
  heroTitle: "Tentang Masjid Kagawa",
  heroSubtitle: "Sejarah • Visi Misi • Struktur Pengurus",
  heroImageUrl: "",
  historyTitle: "Sejarah Masjid",
  historyText: "",
  historyImageUrl: "",
  visionTitle: "Visi",
  visionText: "",
  missionTitle: "Misi",
  missionItems: [],
  leaders: [],
};

function normalizeText(value = "") {
  return String(value).toLowerCase();
}

function groupLeaders(leaders) {
  const ketua = [];
  const pengurusHarian = [];
  const praktikAktif = [];
  const praktikPurna = [];
  const lainnya = [];

  leaders.forEach((leader) => {
    const role = normalizeText(leader.role);
    const note = normalizeText(leader.note);
    const combined = `${role} ${note}`;

    if (combined.includes("ketua")) {
      ketua.push(leader);
      return;
    }

    if (combined.includes("pengurus harian") || combined.includes("harian")) {
      pengurusHarian.push(leader);
      return;
    }

    const isPraktik =
      combined.includes("praktik") ||
      combined.includes("praktek") ||
      combined.includes("magang");

    const isPurna =
      combined.includes("purna") ||
      combined.includes("purnabakti") ||
      combined.includes("purna bakti") ||
      combined.includes("selesai") ||
      combined.includes("mantan") ||
      combined.includes("alumni");

    if (isPraktik && isPurna) {
      praktikPurna.push(leader);
      return;
    }

    if (isPraktik) {
      praktikAktif.push(leader);
      return;
    }

    lainnya.push(leader);
  });

  return { ketua, pengurusHarian, praktikAktif, praktikPurna, lainnya };
}

function LeaderCard({ leader }) {
  return (
    <article className="tentang-leader-card">
      <div className="tentang-leader-card__media">
        <img
          src={leader.imageUrl || personFallback}
          alt={leader.name || leader.role || "Pengurus"}
          className="tentang-leader-card__image"
          onError={(e) => {
            e.currentTarget.src = personFallback;
          }}
        />
      </div>

      <div className="tentang-leader-card__body">
        <span className="tentang-leader-card__role">
          {leader.role || "Pengurus"}
        </span>
        <h3>{leader.name || "-"}</h3>

        {leader.note ? (
          <p className="tentang-leader-card__note">{leader.note}</p>
        ) : (
          <p className="tentang-leader-card__note is-empty"> </p>
        )}
      </div>
    </article>
  );
}

function LeaderSection({ title, subtitle, items }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="tentang-leader-group">
      <div className="tentang-leader-group__head">
        <h3>{title}</h3>
        {subtitle && <p>{subtitle}</p>}
      </div>

      <div className="tentang-leader-list">
        {items.map((leader, index) => (
          <LeaderCard key={`${title}-${index}`} leader={leader} />
        ))}
      </div>
    </div>
  );
}

export default function TentangMasjid() {
  const [data, setData] = useState(EMPTY_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const hero = heroConfig.tentang;

  useEffect(() => {
    let alive = true;

    const fetchAbout = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await http.get("/api/about-settings");
        const payload = res?.data || {};

        if (!alive) return;

        setData({
          heroTitle: payload.heroTitle || EMPTY_DATA.heroTitle,
          heroSubtitle: payload.heroSubtitle || EMPTY_DATA.heroSubtitle,
          heroImageUrl: payload.heroImageUrl || "",
          historyTitle: payload.historyTitle || EMPTY_DATA.historyTitle,
          historyText: payload.historyText || "",
          historyImageUrl: payload.historyImageUrl || "",
          visionTitle: payload.visionTitle || EMPTY_DATA.visionTitle,
          visionText: payload.visionText || "",
          missionTitle: payload.missionTitle || EMPTY_DATA.missionTitle,
          missionItems: Array.isArray(payload.missionItems)
            ? payload.missionItems
            : [],
          leaders: Array.isArray(payload.leaders) ? payload.leaders : [],
        });
      } catch (err) {
        console.error("Gagal memuat about settings:", err);
        if (!alive) return;
        setError("Informasi Tentang Masjid belum dapat dimuat.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    };

    fetchAbout();

    return () => {
      alive = false;
    };
  }, []);

  const leaders = useMemo(
    () =>
      (Array.isArray(data.leaders) ? data.leaders : []).filter(
        (item) => item?.role || item?.name || item?.imageUrl || item?.note
      ),
    [data.leaders]
  );

  const leaderGroups = useMemo(() => groupLeaders(leaders), [leaders]);

  return (
    <div className="tentang-page">
      <PageHero
        backgroundImage={data.heroImageUrl || hero.image}
        overlay={hero.overlay}
        eyebrow={hero.eyebrow}
        title={data.heroTitle || hero.title}
        subtitle={data.heroSubtitle || hero.subtitle}
      />

      <section className="tentang-section">
        <div className="site-shell">
          {loading ? (
            <div className="tentang-state">Memuat informasi masjid...</div>
          ) : error ? (
            <div className="tentang-state tentang-state--error">{error}</div>
          ) : (
            <div className="tentang-stack">
              <section className="tentang-block">
                <div className="tentang-block__head">
                  <span className="tentang-block__eyebrow">Sejarah</span>
                  <h2 className="tentang-block__title">{data.historyTitle}</h2>
                </div>

                <div className="tentang-history">
                  <div className="tentang-history__media">
                    <img
                      src={data.historyImageUrl || sejarahFallback}
                      alt={data.historyTitle}
                      className="tentang-history__image"
                      onError={(e) => {
                        e.currentTarget.src = sejarahFallback;
                      }}
                    />
                  </div>

<div className="tentang-history__content">
  {data.historyText ? (
    <div
      className="tentang-richtext"
      dangerouslySetInnerHTML={{ __html: data.historyText }}
    />
  ) : (
    <p>Informasi sejarah masjid belum diisi.</p>
  )}
</div>
                </div>
              </section>

              <section className="tentang-block tentang-video-block">
                <div className="tentang-video-card">
                  <div className="tentang-video-card__content">
                    <span className="tentang-block__eyebrow">Video Profil</span>
                    <h2 className="tentang-block__title">
                      Mengenal Masjid Kagawa Lebih Dekat
                    </h2>
                    <p>
                      Saksikan bagaimana perjuangan pembangunan Masjid Kagawa
                      melalui video singkat berikut.
                    </p>
                  </div>

                  <div className="tentang-video-card__frame">
                    <iframe
                      src={YOUTUBE_EMBED_URL}
                      title="Video Masjid Kagawa"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                </div>
              </section>

              <section className="tentang-block">
                <div className="tentang-block__head">
                  <span className="tentang-block__eyebrow">Arah & Nilai</span>
                  <h2 className="tentang-block__title">Visi & Misi</h2>
                </div>

                <div className="tentang-vision-grid">
                  <article className="tentang-info-card">
                    <h3>{data.visionTitle}</h3>
                    <p>{data.visionText || "Visi belum diisi."}</p>
                  </article>

                  <article className="tentang-info-card tentang-info-card--accent">
                    <h3>{data.missionTitle}</h3>

                    {Array.isArray(data.missionItems) &&
                    data.missionItems.length > 0 ? (
                      <ul className="tentang-mission-list">
                        {data.missionItems.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>Misi belum diisi.</p>
                    )}
                  </article>
                </div>
              </section>

              <section className="tentang-block">
                <div className="tentang-block__head">
                  <span className="tentang-block__eyebrow">Struktur</span>
                  <h2 className="tentang-block__title">Pengurus</h2>
                </div>

                {leaders.length === 0 ? (
                  <div className="tentang-state">
                    Data pengurus belum tersedia.
                  </div>
                ) : (
                  <div className="tentang-leader-stack">
                    <LeaderSection title="Ketua" items={leaderGroups.ketua} />

                    <LeaderSection
                      title="Pengurus Harian"
                      items={leaderGroups.pengurusHarian}
                    />

                    <LeaderSection
                      title="Pengurus Praktik Aktif"
                      subtitle="Pengurus praktik yang sedang bertugas pada periode berjalan."
                      items={leaderGroups.praktikAktif}
                    />

                    <LeaderSection
                      title="Pengurus Praktik Purna Tugas"
                      subtitle="Arsip pengurus praktik yang telah menyelesaikan masa tugas."
                      items={leaderGroups.praktikPurna}
                    />

                    <LeaderSection
                      title="Pengurus Lainnya"
                      items={leaderGroups.lainnya}
                    />
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}