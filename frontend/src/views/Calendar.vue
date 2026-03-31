<template>
  <div class="calendar-container">
    <!-- Page Title -->
    <div class="page-title-container">
      <div class="title-icon-wrapper">
        <i class="bi bi-calendar-check-fill"></i>
      </div>
      <span class="title-text-main">Kalender</span>
    </div>

    <!-- Header Navigation -->
    <div class="calendar-header">
      <!-- Search Input - Stylish -->
      <div class="position-relative me-3 search-wrapper">
        <i
          class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-primary opacity-75"
        ></i>
        <input
          type="text"
          class="form-control rounded-pill ps-5 border-0 shadow-sm bg-white search-input"
          placeholder="Suchen..."
          v-model="searchQuery"
        />
      </div>

      <button @click="prevMonth" class="nav-btn">‹</button>
      <select v-model="yearRef" @change="loadData" class="year-select">
        <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
      </select>
      <strong class="month-label">{{ monthName }}</strong>
      <button @click="nextMonth" class="nav-btn">›</button>
    </div>

    <!-- Calendar Wrapper -->
    <div class="calendar-scroll">
      <div class="grid header">
        <div class="kw-col">KW</div>
        <div v-for="d in days" :key="d">{{ d }}</div>
      </div>

      <div v-for="week in calendar" :key="week.kw" class="grid week">
        <div class="kw-col">{{ week.kw }}</div>

        <div
          v-for="day in week.days"
          :key="day.key"
          class="day"
          :class="{
            today: day.isToday,
            holiday: day.holiday || day.isFerien || day.isWeekend,
            leave:
              day.hasLeave && !day.holiday && !day.isFerien && !day.isWeekend,
            work:
              day.hasWork && !day.holiday && !day.isFerien && !day.isWeekend,
            selected: selectedDate === day.key,
            'search-match': day.isMatch,
            'other-month': !day.isCurrentMonth,
          }"
          :title="day.tooltip"
          @click="selectDay(day)"
        >
          <div class="day-number">{{ day.day }}</div>

          <div v-if="day.holiday" class="status-label holiday-label">
            Feiertag
          </div>
          <div v-else-if="day.isFerien" class="status-label holiday-label">
            Ferien
          </div>
          <div v-else-if="day.isWeekend" class="status-label holiday-label">
            Wochenende
          </div>
          <div v-else-if="day.hasLeave" class="status-label leave-label">
            Urlaub
          </div>
          <div v-else-if="day.hasWork" class="status-label work-label">
            Arbeit
          </div>

          <div v-if="day.holiday" class="holiday-name">{{ day.holiday }}</div>
        </div>
      </div>
    </div>

    <!-- Legend -->
    <div class="legend">
      <div class="legend-item">
        <span class="box work"></span> Arbeit (Grün)
      </div>
      <div class="legend-item">
        <span class="box leave"></span> Urlaub (Gelb)
      </div>
      <div class="legend-item">
        <span class="box holiday"></span> Feiertag/Ferien/Wochenende (Rot)
      </div>
    </div>

    <!-- Details Modal -->
    <div
      class="modal fade"
      id="detailsModal"
      tabindex="-1"
      aria-labelledby="detailsModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content shadow-lg">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title" id="detailsModalLabel">
              📌 Details für {{ selectedDate }}
            </h5>
            <button
              type="button"
              class="btn-close btn-close-white"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <div v-if="dayLeaves.length" class="mb-4">
              <h5 class="border-bottom pb-2 text-dark">Urlaube:</h5>
              <div class="list-group">
                <div
                  v-for="l in dayLeaves"
                  :key="l._id"
                  class="list-group-item list-group-item-warning mb-2 border-0 shadow-sm rounded"
                >
                  <div class="d-flex w-100 justify-content-between">
                    <h6 class="mb-1 fw-bold">
                      {{ l.user_id?.name || "Mitarbeiter" }}
                    </h6>
                    <small class="badge bg-warning text-dark">{{
                      l.type
                    }}</small>
                  </div>
                  <p class="mb-1 text-muted">
                    {{ l.reason || "Kein Grund angegeben" }}
                  </p>
                </div>
              </div>
            </div>

            <div v-if="dayDetails.length">
              <h5 class="border-bottom pb-2 text-dark">Arbeitszeiten:</h5>
              <div class="table-responsive">
                <table class="table table-hover align-middle">
                  <thead class="table-light">
                    <tr>
                      <th>Mitarbeiter</th>
                      <th>Start</th>
                      <th>Ende</th>
                      <th>Dauer</th>
                      <th v-if="isAdmin" class="text-end">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="s in dayDetails" :key="s.id">
                      <td>{{ s.name }}</td>
                      <td>
                        <input
                          v-if="editingId === s.id"
                          type="datetime-local"
                          v-model="editForm.start"
                          class="form-control form-control-sm"
                        />
                        <span v-else>{{ formatTime(s.start) }}</span>
                      </td>
                      <td>
                        <input
                          v-if="editingId === s.id"
                          type="datetime-local"
                          v-model="editForm.end"
                          class="form-control form-control-sm"
                        />
                        <span v-else>{{
                          s.end ? formatTime(s.end) : "---"
                        }}</span>
                      </td>
                      <td>{{ calcDuration(s.start, s.end) }}</td>
                      <td v-if="isAdmin" class="text-end">
                        <template v-if="editingId === s.id">
                          <button
                            class="btn btn-sm btn-success me-1"
                            @click="saveEdit(s.id)"
                          >
                            💾
                          </button>
                          <button
                            class="btn btn-sm btn-secondary"
                            @click="cancelEdit"
                          >
                            ✖
                          </button>
                        </template>
                        <template v-else>
                          <button
                            class="btn btn-sm btn-outline-primary me-1"
                            @click="startEdit(s)"
                          >
                            ✏️
                          </button>
                          <button
                            class="btn btn-sm btn-outline-danger"
                            @click="deleteSession(s.id)"
                          >
                            🗑️
                          </button>
                        </template>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div
              v-if="!dayLeaves.length && !dayDetails.length"
              class="text-center py-4"
            >
              <p class="text-muted">Keine Einträge für diesen Tag gefunden.</p>
            </div>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              Schließen
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import api from "@/api";
import { formatTime, calcDuration } from "@/utils/time";
import * as bootstrap from "bootstrap";

/* ------------------ helpers ------------------ */
function toLocalKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getKW(d) {
  const date = new Date(d);
  date.setHours(0, 0, 0);
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const kw1 = new Date(date.getFullYear(), 0, 4);
  return (
    1 + Math.round(((date - kw1) / 86400000 - 3 + ((kw1.getDay() + 6) % 7)) / 7)
  );
}

/* ------------------ state ------------------ */
const currentUser = JSON.parse(localStorage.getItem("user")) || {};
const isAdmin = currentUser.role === "admin";

const today = new Date();
const monthRef = ref(today.getMonth());
const yearRef = ref(today.getFullYear());
const years = Array.from({ length: 11 }, (_, i) => today.getFullYear() - 5 + i);

const days = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

const workSessions = ref([]);
const leaveRequests = ref([]);
const holidays = ref({});
const ferienItems = ref([]); // Added for Ferien
const users = ref([]);

const selectedDate = ref(null);
const dayDetails = ref([]);
const dayLeaves = ref([]);
const searchQuery = ref("");

const editingId = ref(null);
const editForm = ref({ start: "", end: "" });

// Auto-navigate to date when typing in search
// Auto-navigate to date when typing in search
watch(searchQuery, (newVal) => {
  if (!newVal) return;

  // Remove potential day names (e.g. "Di ", "Montag ") to find the date part
  // Format: (optional text) + D.M.YYYY (or similar separators)
  const clean = newVal.replace(/^[a-zA-ZäöüÄÖÜß]{2,}\s+/, "").trim();

  // Regex for D.M.YYYY or D/M/YYYY or D-M-YYYY
  const datePattern = /(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})/;
  const match = clean.match(datePattern) || newVal.match(datePattern);

  if (match) {
    const d = parseInt(match[1]);
    const m = parseInt(match[2]);
    const y = parseInt(match[3]);

    if (m >= 1 && m <= 12) {
      // Only reload if month/year actually changes
      if (monthRef.value !== m - 1 || yearRef.value !== y) {
        monthRef.value = m - 1;
        yearRef.value = y;
        loadData();
      }
    }
  }
});

/* ------------------ computed ------------------ */
const monthName = computed(() =>
  new Date(yearRef.value, monthRef.value).toLocaleString("de-DE", {
    month: "long",
  }),
);

const calendar = computed(() => {
  const first = new Date(yearRef.value, monthRef.value, 1);
  const start = new Date(first);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));

  const weeks = [];
  let date = new Date(start);
  const todayKey = toLocalKey(today);

  for (let w = 0; w < 6; w++) {
    const week = { kw: getKW(date), days: [] };

    for (let i = 0; i < 7; i++) {
      const key = toLocalKey(date);

      // Filter by Search Query first
      const term = searchQuery.value.toLowerCase();

      // Formatted date strings for search
      const dateStr = date.toLocaleDateString("de-DE"); // e.g. "15.2.2026"
      const dayName = date.toLocaleDateString("de-DE", { weekday: "long" }); // e.g. "Montag"
      const matchDay =
        !term || dateStr.includes(term) || dayName.toLowerCase().includes(term);

      const sessions = workSessions.value.filter((s) => {
        const sDate = s.start ? s.start.split("T")[0] : s.date_today;
        if (sDate !== key) return false;
        if (matchDay) return true;
        const name = s.name || s.user_id?.name || "";
        return name.toLowerCase().includes(term);
      });

      const leaves = leaveRequests.value.filter((l) => {
        const from = l.from.split("T")[0];
        const to = l.to.split("T")[0];
        const inRange = key >= from && key <= to;
        if (!inRange) return false;
        if (matchDay) return true;
        const name = l.user_id?.name || "";
        return name.toLowerCase().includes(term);
      });

      // Check for Ferien (Red)
      const isFerien = ferienItems.value.some((f) => {
        return key >= f.from && key <= f.to;
      });

      const isWeekend = [0, 6].includes(date.getDay());

      // Determine if this day matches the search criteria directly
      const isMatch =
        !!term &&
        (dateStr.includes(term) || dayName.toLowerCase().includes(term));

      week.days.push({
        key,
        day: date.getDate(),
        dayName,
        fullDate: dateStr,
        isMatch,
        isCurrentMonth: date.getMonth() === monthRef.value,
        isToday: key === todayKey,
        hasWork: sessions.length > 0,
        hasLeave: leaves.length > 0,
        isFerien,
        isWeekend,
        holiday: holidays.value[key] || null,
        tooltip: `${sessions.length} Arbeit, ${leaves.length} Urlaub, ${isFerien ? "Ferien" : ""}${isWeekend ? " Wochenende" : ""}`,
      });

      date.setDate(date.getDate() + 1);
    }
    weeks.push(week);
  }

  return weeks;
});

/* ------------------ actions ------------------ */
async function loadData() {
  try {
    const params = {};

    // Work Sessions
    const resWork = await api.get("/workSessions", { params });
    workSessions.value = resWork.data;

    // Leave Requests
    const resLeave = await api.get("/leave-requests/calendar", { params });
    leaveRequests.value = resLeave.data;

    // Holidays
    const resHolidays = await api.get(`/calendar?year=${yearRef.value}`);
    holidays.value = {};
    ferienItems.value = resHolidays.data?.ferien || []; // Store Ferien
    resHolidays.data?.holidays?.forEach(
      (x) => (holidays.value[x.date] = x.name),
    );

    // Users (if admin)
    if (isAdmin && users.value.length === 0) {
      const resUsers = await api.get("/users");
      users.value = resUsers.data;
    }
  } catch (err) {
    console.error("Error loading calendar data:", err);
  }
}

function selectDay(day) {
  selectedDate.value = day.key;

  dayDetails.value = workSessions.value.filter((s) => {
    const sDate = s.start ? s.start.split("T")[0] : s.date_today;
    return sDate === day.key;
  });

  dayLeaves.value = leaveRequests.value.filter((l) => {
    const from = l.from.split("T")[0];
    const to = l.to.split("T")[0];
    return day.key >= from && day.key <= to;
  });

  const modal = new bootstrap.Modal(document.getElementById("detailsModal"));
  modal.show();
}

function startEdit(s) {
  editingId.value = s.id;
  // Convert to local datetime string for input
  editForm.value = {
    start: s.start ? new Date(s.start).toISOString().slice(0, 16) : "",
    end: s.end ? new Date(s.end).toISOString().slice(0, 16) : "",
  };
}

function cancelEdit() {
  editingId.value = null;
}

async function saveEdit(id) {
  try {
    await api.put(`/workSessions/${id}`, editForm.value);
    editingId.value = null;
    await loadData();
    // Refresh dayDetails
    dayDetails.value = workSessions.value.filter((s) => {
      const sDate = s.start ? s.start.split("T")[0] : s.date_today;
      return sDate === selectedDate.value;
    });
  } catch (err) {
    alert(
      "Fehler beim Speichern: " + (err.response?.data?.error || err.message),
    );
  }
}

async function deleteSession(id) {
  if (!confirm("Möchten Sie diesen Eintrag wirklich löschen?")) return;
  try {
    await api.delete(`/workSessions/${id}`);
    await loadData();
    // Refresh dayDetails
    dayDetails.value = workSessions.value.filter((s) => {
      const sDate = s.start ? s.start.split("T")[0] : s.date_today;
      return sDate === selectedDate.value;
    });
  } catch (err) {
    alert("Fehler beim Löschen: " + (err.response?.data?.error || err.message));
  }
}

function prevMonth() {
  if (monthRef.value === 0) {
    monthRef.value = 11;
    yearRef.value--;
  } else {
    monthRef.value--;
  }
  loadData();
}

function nextMonth() {
  if (monthRef.value === 11) {
    monthRef.value = 0;
    yearRef.value++;
  } else {
    monthRef.value++;
  }
  loadData();
}

onMounted(loadData);
</script>

<style scoped>
.calendar-container {
  max-width: 1200px;
  margin: auto;
  padding: 20px;
  background: #fdfdfd;
}

.title {
  text-align: center;
  margin-bottom: 25px;
  font-weight: 700;
  color: #333;
}

/* Header Navigation */
.calendar-header {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.nav-btn {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.5rem;
  transition: all 0.2s;
}

.nav-btn:hover {
  background: #f0f0f0;
  border-color: #ccc;
}

.month-label {
  font-size: 1.4rem;
  min-width: 150px;
  text-align: center;
}

.year-select {
  padding: 5px 10px;
  border-radius: 6px;
  border: 1px solid #ddd;
  font-weight: 600;
}

/* Grid */
.calendar-scroll {
  overflow-x: auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.grid {
  display: grid;
  grid-template-columns: 50px repeat(7, minmax(120px, 1fr));
}

.header {
  background: #f8f9fa;
  border-bottom: 2px solid #eee;
  font-weight: bold;
}

.header div {
  padding: 12px;
  text-align: center;
  color: #555;
}

.kw-col {
  border-right: 1px solid #eee;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f3f5;
  color: #888;
  font-size: 0.8rem;
}

.day {
  border: 0.5px solid #f0f0f0;
  min-height: 100px;
  padding: 8px;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.day:hover {
  background: #fcfcfc;
}

.day.other-month {
  color: #ccc;
  background: #fafafa;
}

.day.today {
  box-shadow: inset 0 0 0 2px #0d6efd;
}

.day.selected {
  background: #eef4ff;
}

.day-number {
  font-weight: 600;
  font-size: 1rem;
}

/* Status Labels */
.status-label {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  text-align: center;
  text-transform: uppercase;
}

.work-label {
  background: #d1e7dd;
  color: #0f5132;
}

.leave-label {
  background: #fff3cd;
  color: #664d03;
}

.holiday-label {
  background: #f8d7da;
  color: #842029;
}

/* Day Coloring */
.day.work {
  background-color: #f0fff4;
}

.day.leave {
  background-color: #fffbef;
}

.day.holiday {
  background-color: #fff5f5;
}

.holiday-name {
  font-size: 0.7rem;
  color: #c53030;
  font-style: italic;
  margin-top: auto;
}

/* Legend */
.legend {
  display: flex;
  justify-content: center;
  gap: 25px;
  margin-top: 20px;
  padding: 15px;
  background: #fff;
  border-radius: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  font-weight: 500;
}

.box {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

.box.work {
  background: #d1e7dd;
  border: 1px solid #0f5132;
}

.box.leave {
  background: #fff3cd;
  border: 1px solid #664d03;
}

.box.holiday {
  background: #f8d7da;
  border: 1px solid #842029;
}

/* Details */
.details {
  margin-top: 30px;
  padding: 25px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.details h4 {
  margin-bottom: 20px;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 10px;
}

.leaves-info,
.work-info {
  margin-bottom: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  background: #f8f9fa;
  padding: 12px;
  text-align: left;
  font-size: 0.85rem;
  color: #666;
}

td {
  padding: 12px;
  border-bottom: 1px solid #eee;
  font-size: 0.9rem;
}

/* Responsive */
@media (max-width: 768px) {
  .filters-card {
    flex-direction: column;
    align-items: stretch;
  }

  .grid {
    grid-template-columns: 40px repeat(7, 100px);
  }
}

/* Page Title Styles - Copied & Adapted */
.page-title-container {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 25px;
  /* Added spacing */
}

.title-icon-wrapper {
  background: #6366f1;
  color: #ffffff;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  font-size: 1.3rem;
  box-shadow: 0 0 15px rgba(99, 102, 241, 0.4);
}

.title-text-main {
  font-size: 1.5rem;
  /* Slightly larger for page heading */
  font-weight: 800;
  color: #333;
  /* Dark color for light background */
  letter-spacing: 0.5px;
}

.day.search-match {
  background-color: #e0e7ff !important;
  color: #312e81;
}

.day-match-info {
  font-size: 0.8rem;
  text-align: center;
  color: #4338ca;
  background: rgba(255, 255, 255, 0.6);
  padding: 2px;
  border-radius: 4px;
}
</style>
