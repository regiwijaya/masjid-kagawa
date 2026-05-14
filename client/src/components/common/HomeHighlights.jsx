import { useEffect, useMemo, useState } from "react";
import http from "../../api/http";
import HomeNewsFeed from "./HomeNewsFeed";

function formatDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;

  return new Intl.DateTimeFormat("id-ID", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
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

export default function HomeHighlights() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("Semua");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        setError("");

        const [ann, act, kaj, post] = await Promise.allSettled([
          http.get("/api/announcements"),
          http.get("/api/activities"),
          http.get("/api/kajian"),
          http.get("/api/posts"),
        ]);

        const announcements =
          ann.status === "fulfilled"
            ? ann.value.data.map((item) => ({
                id: `ann-${item._id}`,
                title: item.title,
                date: item.date,
                category: item.category || "Umum",
                type: "Pengumuman",
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
                href: "/pengumuman",
              }))
            : [];

        const activities =
          act.status === "fulfilled"
            ? act.value.data.map((item) => ({
                id: `act-${item._id}`,
                title: item.title,
                date: item.date,
                category: item.category || "Kegiatan",
                type: "Kegiatan",
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
                href: `/kegiatan/${item._id}`,
              }))
            : [];

        const kajian =
          kaj.status === "fulfilled"
            ? kaj.value.data.map((item) => ({
                id: `kaj-${item._id}`,
                title: item.title,
                date: item.date,
                category: item.category || "Kajian",
                type: "Kajian",
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
                href: "/kajian",
              }))
            : [];

        const posts =
          post.status === "fulfilled"
            ? post.value.data.map((item) => ({
                id: `post-${item.id}`,
                title: item.title,
                date: item.createdAt,
                category: item.category || "Artikel",
                type: "Artikel",
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
                href: `/artikel/${item.slug}`,
              }))
            : [];

        const merged = [...announcements, ...activities, ...kajian, ...posts]
          .sort((a, b) => {
            const aTime = new Date(a.date || a.createdAt || 0).getTime();
            const bTime = new Date(b.date || b.createdAt || 0).getTime();
            return bTime - aTime;
          })
          .slice(0, 12);

        setItems(merged);
      } catch (err) {
        console.error(err);
        setError("Data belum dapat dimuat.");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const categories = ["Semua", "Pengumuman", "Kegiatan", "Kajian", "Artikel"];

  const normalized = useMemo(() => {
    const filtered =
      filter === "Semua"
        ? items
        : items.filter((item) => item.type === filter);

    return filtered.slice(0, 8).map((item) => ({
      id: item.id,
      title: item.title,
      dateLabel: formatDate(item.date),
      category: item.category,
      isNew: isNewItem(item),
      href: item.href,
    }));
  }, [items, filter]);

  return (
    <HomeNewsFeed
      kicker="Update Terbaru"
      title="Informasi & Kegiatan"
      moreHref="/pengumuman"
      categories={categories}
      filter={filter}
      onFilterChange={setFilter}
      loading={loading}
      error={error}
      items={normalized}
      emptyText="Belum ada data."
    />
  );
}