import { useEffect, useMemo, useState } from "react";
import http from "../../api/http";
import HomeNewsFeed from "./HomeNewsFeed";

const ORDERED_CATEGORIES = ["Semua", "Umum", "Layanan", "Lainnya"];

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

export default function HomePengumuman() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("Semua");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await http.get("/api/announcements");
        setItems(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Gagal memuat pengumuman home:", err);
        setError("Pengumuman belum dapat dimuat.");
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const categories = useMemo(() => {
    const available = new Set(items.map((item) => item.category).filter(Boolean));
    return ORDERED_CATEGORIES.filter((cat) => cat === "Semua" || available.has(cat));
  }, [items]);

  const normalized = useMemo(() => {
    const filtered =
      filter === "Semua"
        ? items
        : items.filter((item) => item.category === filter);

    return filtered.slice(0, 8).map((item) => ({
      id: item._id,
      title: item.title,
      dateLabel: formatDate(item.date),
      category: item.category || "Umum",
      isNew: isNewItem(item),
      href: "/pengumuman",
    }));
  }, [items, filter]);

  return (
    <HomeNewsFeed
      kicker="Informasi"
      title="Pengumuman Terbaru"
      moreHref="/pengumuman"
      categories={categories}
      filter={filter}
      onFilterChange={setFilter}
      loading={loading}
      error={error}
      items={normalized}
      emptyText="Belum ada pengumuman."
    />
  );
}