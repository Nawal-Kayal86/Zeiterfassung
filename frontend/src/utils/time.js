const TIMEZONE = "Europe/Vienna";

// YYYY-MM-DD
export function formatDate(val) {
  if (!val) return "-";
  return new Date(val).toLocaleDateString("de-DE", {
    timeZone: TIMEZONE
  });
}

// HH:mm
export function formatTime(val) {
  if (!val) return "-";
  return new Date(val).toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TIMEZONE
  });
}

// Dauer aus zwei ISO Dates → HH:mm
export function calcDuration(start, end) {
  if (!start || !end) return "-";

  const s = new Date(start);
  const e = new Date(end);

  if (e <= s) return "00:00";

  const diffMin = Math.floor((e - s) / 60000);
  const h = String(Math.floor(diffMin / 60)).padStart(2, "0");
  const m = String(diffMin % 60).padStart(2, "0");

  return `${h}:${m}`;
}
