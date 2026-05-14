import { useEffect, useMemo, useRef, useState } from "react";
import "../../styles/components/AnnouncementCarousel.css";
import http from "../../api/http";
import placeholder from "../../assets/images/placeholder.svg";

function getVisibleSlides(width) {
  if (width <= 640) return 1;
  if (width <= 900) return 2;
  if (width <= 1200) return 3;
  return 4;
}

function getInitialVisible() {
  if (typeof window === "undefined") return 4;
  return getVisibleSlides(window.innerWidth);
}

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function isNewItem(item) {
  const ref = item.createdAt || item.updatedAt || item.date;
  if (!ref) return false;

  const date = new Date(ref);
  if (Number.isNaN(date.getTime())) return false;

  const diff = Date.now() - date.getTime();
  return diff <= 7 * 24 * 60 * 60 * 1000;
}

export default function AnnouncementCarousel() {
  const [visible, setVisible] = useState(getInitialVisible);
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [items, setItems] = useState([]);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    const fetchHighlights = async () => {
      try {
        const [annRes, actRes, kajRes, postRes] = await Promise.allSettled([
          http.get("/api/announcements"),
          http.get("/api/activities"),
          http.get("/api/kajian"),
          http.get("/api/posts"), // ✅ TAMBAHAN
        ]);

        const announcements =
          annRes.status === "fulfilled" && Array.isArray(annRes.value.data)
            ? annRes.value.data.map((item) => ({
                id: `announcement-${item._id}`,
                title: item.title,
                category: item.category || "Umum",
                source: "Pengumuman",
                imageUrl: item.imageUrl || "",
                date: item.date || "",
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
                isFeatured: !!item.isFeatured,
                href: "/pengumuman",
              }))
            : [];

        const activities =
          actRes.status === "fulfilled" && Array.isArray(actRes.value.data)
            ? actRes.value.data.map((item) => ({
                id: `activity-${item._id}`,
                title: item.title,
                category: item.category || "Kegiatan",
                source: "Kegiatan",
                imageUrl: item.imageUrl || "",
                date: item.date || "",
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
                isFeatured: !!item.isFeatured,
                href: `/kegiatan/${item._id}`,
              }))
            : [];

        const kajian =
          kajRes.status === "fulfilled" && Array.isArray(kajRes.value.data)
            ? kajRes.value.data.map((item) => ({
                id: `kajian-${item._id}`,
                title: item.title,
                category: item.category || "Kajian",
                source: "Kajian",
                imageUrl: item.imageUrl || "",
                date: item.date || "",
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
                isFeatured: !!item.isFeatured,
                href: "/kajian",
              }))
            : [];

        // ✅ ARTIKEL (INI KUNCI FIX)
        const posts =
          postRes.status === "fulfilled" && Array.isArray(postRes.value.data)
            ? postRes.value.data
                .filter((item) => item.isPublished && item.isFeatured)
                .map((item) => ({
                  id: `post-${item.id}`,
                  title: item.title,
                  category: item.category || "Artikel",
                  source: "Artikel",
                  imageUrl: item.imageUrl || "",
                  date: item.createdAt,
                  createdAt: item.createdAt,
                  updatedAt: item.updatedAt,
                  isFeatured: true,
                  href: `/artikel/${item.slug}`,
                }))
            : [];

        const merged = [
          ...announcements,
          ...activities,
          ...kajian,
          ...posts, // ✅ MASUKKAN KE FLOW YANG SAMA
        ]
          .sort((a, b) => {
            if (a.isFeatured !== b.isFeatured) {
              return Number(b.isFeatured) - Number(a.isFeatured);
            }

            const aTime = new Date(a.date || a.createdAt || 0).getTime() || 0;
            const bTime = new Date(b.date || b.createdAt || 0).getTime() || 0;
            return bTime - aTime;
          })
          .slice(0, 10);

        setItems(merged);
      } catch (err) {
        console.error("Gagal memuat carousel homepage:", err);
        setItems([]);
      }
    };

    fetchHighlights();
  }, []);

  useEffect(() => {
    const onResize = () => {
      setVisible(getVisibleSlides(window.innerWidth));
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const maxIndex = Math.max(0, items.length - visible);

  useEffect(() => {
    setIndex((prev) => Math.min(prev, maxIndex));
  }, [maxIndex]);

  const nextSlide = () => {
    setIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  useEffect(() => {
    if (isPaused || items.length <= visible) return;

    const timer = setInterval(() => {
      nextSlide();
    }, 4500);

    return () => clearInterval(timer);
  }, [isPaused, items.length, visible, maxIndex]);

  const handleImgError = (e) => {
    if (e.currentTarget.dataset.fallback === "1") return;
    e.currentTarget.dataset.fallback = "1";
    e.currentTarget.src = placeholder;
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const distance = touchStartX.current - touchEndX.current;

    if (Math.abs(distance) < 50) return;

    if (distance > 0) nextSlide();
    else prevSlide();
  };

  return (
    <section
      className="announcement-strip"
      aria-label="Sorotan pilihan homepage"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="announcement-strip__head">
        <div className="announcement-strip__heading">
          <span className="announcement-strip__eyebrow">Pilihan Utama</span>
          <h2 className="announcement-strip__title">Sorotan Komunitas</h2>
        </div>

        <div className="announcement-strip__nav">
          <button
            type="button"
            className="announcement-strip__nav-btn"
            onClick={prevSlide}
          >
            <i className="bi bi-chevron-left"></i>
          </button>

          <button
            type="button"
            className="announcement-strip__nav-btn"
            onClick={nextSlide}
          >
            <i className="bi bi-chevron-right"></i>
          </button>
        </div>
      </div>

      <div
        className="announcement-strip__viewport"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="announcement-strip__track"
          style={{
            transform: `translateX(calc(-${index * (100 / visible)}% - ${
              index * 4.5
            }px))`,
          }}
        >
          {items.map((item) => (
            <article className="announcement-strip__item" key={item.id}>
              <a href={item.href} className="announcement-strip__card">
                <div className="announcement-strip__image-wrap">
                  <img
                    src={item.imageUrl || placeholder}
                    alt={item.title}
                    className="announcement-strip__image"
                    onError={handleImgError}
                  />

                  <span className="announcement-strip__tag">
                    {item.source}
                  </span>

                  {isNewItem(item) && (
                    <span className="announcement-strip__new-badge">NEW</span>
                  )}
                </div>

                <div className="announcement-strip__body">
                  <div className="announcement-strip__meta-row">
                    <span className="announcement-strip__category">
                      {item.category}
                    </span>
                    <span className="announcement-strip__date">
                      {formatDate(item.date)}
                    </span>
                  </div>

                  <h3 className="announcement-strip__item-title">
                    {item.title}
                  </h3>
                </div>
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}