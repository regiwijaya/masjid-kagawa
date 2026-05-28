import { useMemo, useState } from "react";
import Calendar from "react-calendar";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import "../../styles/components/KegiatanCalendar.css";

export default function KegiatanCalendar({ kegiatan = [] }) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const grouped = useMemo(() => {
    const map = {};
    kegiatan.forEach((k) => {
      const key = format(new Date(k.date), "yyyy-MM-dd");
      if (!map[key]) map[key] = [];
      map[key].push(k);
    });
    return map;
  }, [kegiatan]);

  const selectedKey = format(selectedDate, "yyyy-MM-dd");
  const selectedActivities = grouped[selectedKey] || [];

  const getCategoryColor = (cat) => {
    if (!cat) return "#16a34a";
    if (cat.includes("Anak")) return "#f59e0b";
    if (cat.includes("Remaja")) return "#3b82f6";
    if (cat.includes("Sosial")) return "#ef4444";
    return "#16a34a";
  };

  return (
    <div className="calendar-enterprise">
      <Calendar
        value={selectedDate}
        onChange={setSelectedDate}
        tileContent={({ date }) => {
          const key = format(date, "yyyy-MM-dd");
          if (!grouped[key]) return null;

          return (
            <div className="calendar-dots">
              {grouped[key].slice(0, 3).map((k, i) => (
                <span
                  key={i}
                  style={{
                    background: getCategoryColor(k.category),
                  }}
                />
              ))}
            </div>
          );
        }}
      />

      <div className="calendar-panel">
        <h3>{format(selectedDate, "dd MMMM yyyy")}</h3>

        {selectedActivities.length === 0 && (
          <p className="calendar-empty">Tidak ada kegiatan</p>
        )}

        {selectedActivities.map((k) => (
          <Link
            key={k._id}
            to={`/kegiatan/${k._id}`}
            className="calendar-item"
          >
            <div className="calendar-item-title">{k.title}</div>
            <div className="calendar-item-meta">
              {k.startTime || "-"} {k.endTime && `– ${k.endTime}`}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}