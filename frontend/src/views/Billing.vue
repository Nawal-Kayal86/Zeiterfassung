<template>
  <div class="container py-4">
    <!-- Filter Card -->
    <div class="card shadow-sm mb-4">
      <div class="card-body">
        <h5 class="mb-3">🔎 Filter & Zeitraum</h5>
        <div class="row g-3">
          <div class="col-md-5">
            <label class="form-label text-muted small fw-bold text-uppercase">Zeitraum wählen</label>
            <div class="input-group">
              <button class="btn btn-outline-secondary" @click="prevMonth">
                <i class="bi bi-chevron-left"></i>
              </button>
              <input type="date" class="form-control" v-model="startDate" />
              <span class="input-group-text bg-white border-start-0 border-end-0">bis</span>
              <input type="date" class="form-control" v-model="endDate" />
              <button class="btn btn-outline-secondary" @click="nextMonth">
                <i class="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>
          <div v-if="user?.role === 'admin'" class="col-md-4">
            <label class="form-label text-muted small fw-bold text-uppercase">Mitarbeiter</label>
            <select class="form-select" v-model="employee">
              <option v-for="u in usernames" :key="u.id" :value="u.name">
                {{ u.name }}
              </option>
            </select>
          </div>
          <div v-if="user?.role === 'admin'" class="col-md-3">
            <label class="form-label text-muted small fw-bold text-uppercase">Abteilung</label>
            <div class="form-control bg-light border-0 fw-bold py-2">
              <i class="bi bi-diagram-3 me-2 text-primary"></i>
              {{ currentEmployeeDept || 'Keine Abteilung' }}
            </div>
          </div>
          <div class="col-12 d-flex justify-content-end mt-3">
            <button class="btn btn-primary me-2" @click="fetchData">
              <i class="bi bi-search me-1"></i> Abfrage
            </button>
            <button class="btn btn-secondary" @click="clearFilters">
              <i class="bi bi-arrow-counterclockwise me-1"></i> Zurücksetzen
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Table Card -->
    <div class="card shadow-sm">
      <div class="card-header fw-bold">📋 Abrechnungsübersicht</div>
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead class="table-light">
            <tr>
              <th>Tag</th>
              <th>Datum</th>
              <th>Info</th>
              <th>Stempelungen</th>
              <th>Bewertung (Soll)</th>
              <th>Tatsächliche Arbeit</th>
              <th>Erwartete Arbeit</th>
              <th>1:1 Mehr/Weniger</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(group, key) in groupedData"
              :key="key"
              :class="group.rowClass"
            >
              <td class="fw-bold">{{ group.dayDisplay }}</td>
              <td>{{ group.dateOnlyDisplay }}</td>
              <td>
                <span v-if="group.infoText" class="badge bg-secondary">{{
                  group.infoText
                }}</span>
              </td>
              <td>
                <span v-if="group.intervals.length">
                  {{ group.intervals.join(", ") }}
                </span>
                <span v-else class="text-muted">–</span>
              </td>
              <td>
                <span v-if="group.expectedHours > 0">{{ group.sollDisplay }}</span>
                <span v-else class="text-muted small italic">Frei / Abwesend</span>
              </td>
              <td :class="{ 'text-success fw-bold': group.totalHours > 0 }">
                {{ formatHoursToTime(group.totalHours) }}
              </td>
              <td>{{ formatHoursToTime(group.expectedHours) }}</td>
              <td :class="group.diff >= 0 ? 'text-success' : 'text-danger'">
                {{ group.diff >= 0 ? "+" : ""
                }}{{ formatHoursToTime(group.diff) }}
              </td>
            </tr>
          </tbody>
          <tfoot class="table-group-divider fw-bold">
            <tr class="table-primary">
              <td colspan="4">Gesamt</td>
              <td>{{ formatHoursToTime(totals.expected) }}</td>
              <td>{{ formatHoursToTime(totals.actual) }}</td>
              <td>{{ formatHoursToTime(totals.expected) }}</td>
              <td :class="totals.diff >= 0 ? 'text-success' : 'text-danger'">
                {{ totals.diff >= 0 ? "+" : ""
                }}{{ formatHoursToTime(totals.diff) }}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import api from "../api";
import { toViennaTime, calcHours, formatDate } from "@/utils/time";

function formatHoursToTime(decimal) {
  const sign = decimal < 0 ? "-" : "";
  const abs = Math.abs(decimal);
  const hours = Math.floor(abs);
  const minutes = Math.round((abs - hours) * 60);
  return `${sign}${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export default {
  data() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const fmt = (d) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    
    const loggedUser = JSON.parse(localStorage.getItem("user")) || {};

    return {
      startDate: fmt(firstDay),
      endDate: fmt(today),
      usernames: [],
      departments: [],
      employee: loggedUser.name || "",
      department: loggedUser.department || "",
      filteredData: [],
      token: localStorage.getItem("token") || "",
      holidays: [],
      ferien: [],
      leaves: [],
      currentSchedule: null,
      user: loggedUser,
    };
  },

  computed: {
    currentEmployeeDept() {
      if (!this.employee) return "";
      const u = this.usernames.find(x => x.name === this.employee);
      return u ? u.department : "";
    },

    groupedData() {
      const grouped = {};
      if (!this.startDate || !this.endDate || !this.employee) return grouped;

      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
      let current = new Date(start);
      const schedule = this.currentSchedule?.schedule || null;

      const dayMap = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

      while (current <= end) {
        const d = new Date(current);
        const key = d.toISOString().split("T")[0]; // YYYY-MM-DD
        const dateOnlyDisplay = d.toLocaleDateString("de-DE", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
        const dayDisplay = d.toLocaleDateString("de-DE", { weekday: "long" });

        const dayOfWeek = d.getDay(); // 0=Sun, 6=Sat
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        // Check Holiday
        const isHoliday = this.holidays.some((h) => h.date === key);
        // Check Ferien
        const isFerien = this.ferien.some((f) => key >= f.from && key <= f.to);

        // Check Leave
        const isLeave = this.leaves.some((l) => {
          const from = l.from.split("T")[0];
          const to = l.to.split("T")[0];
          return key >= from && key <= to;
        });

        let rowClass = "";
        let expected = 0;
        let sollDisplay = "–";
        let infoText = "";

        // Standard logic from schedule if not weekend/holiday
        if (!isWeekend && schedule) {
            const dayKey = dayMap[dayOfWeek];
            const dayPlan = schedule[dayKey];
            if (dayPlan && dayPlan.active) {
                sollDisplay = `${dayPlan.from} - ${dayPlan.to}`;
                // Calculate hours from HH:mm strings
                const [fH, fM] = dayPlan.from.split(':').map(Number);
                const [tH, tM] = dayPlan.to.split(':').map(Number);
                expected = (tH + tM/60) - (fH + fM/60);
            }
        } else if (!isWeekend && !schedule) {
            // Fallback to 8h if no schedule
            expected = 8.0;
            sollDisplay = "08:00 - 16:00";
        }

        if (isWeekend) {
          rowClass = "table-danger";
          expected = 0;
          sollDisplay = "Wochenende";
          infoText = "Wochenende";
        } else if (isHoliday) {
          rowClass = "table-danger";
          expected = 0;
          sollDisplay = "Feiertag";
          infoText = "Feiertag";
        } else if (isFerien) {
          rowClass = "table-danger";
          expected = 0;
          sollDisplay = "Ferien";
          infoText = "Ferien";
        } else if (isLeave) {
          rowClass = "table-warning";
          expected = 0;
          sollDisplay = "Beurlaubt";
          infoText = "Urlaub";
        }

        grouped[key] = {
          dayDisplay,
          dateOnlyDisplay,
          intervals: [],
          totalHours: 0,
          expectedHours: expected,
          sollDisplay,
          diff: -expected,
          rowClass,
          infoText,
        };
        current.setDate(current.getDate() + 1);
      }

      // Fill in actual data
      this.filteredData.forEach((item) => {
        // use item.date_today if available, else derive from start
        const dateKey =
          item.date_today || new Date(item.start).toISOString().split("T")[0];

        if (grouped[dateKey]) {
          const sTime = toViennaTime(item.start);
          const eTime = item.end ? toViennaTime(item.end) : sTime;
          grouped[dateKey].intervals.push(`${sTime}-${eTime}`);
          // Add hours
          grouped[dateKey].totalHours += calcHours(item.start, item.end);
        }
      });

      // Recalculate diff
      Object.keys(grouped).forEach((k) => {
        grouped[k].diff = grouped[k].totalHours - grouped[k].expectedHours;
      });

      return grouped;
    },

    totals() {
      const data = Object.values(this.groupedData);
      const actual = data.reduce((sum, g) => sum + g.totalHours, 0);
      const expected = data.reduce((sum, g) => sum + g.expectedHours, 0);
      return {
        actual,
        expected,
        diff: actual - expected,
      };
    },
  },

  mounted() {
    this.fetchDepartments();
    this.fetchData();
  },

  methods: {
    formatHoursToTime,
    async fetchDepartments() {
      try {
        const res = await api.get("/departments");
        this.departments = res.data;
      } catch {
        this.departments = [];
      }
    },

    async fetchData() {
      try {
        const queryParams = {
          startDate: this.startDate,
          endDate: this.endDate,
        };
        if (this.employee && this.user?.role === "admin")
          queryParams.userId = this.usernames.find(
            (u) => u.name === this.employee,
          )?.id;

        const [usersRes, sessionsRes, calendarRes, leavesRes] =
          await Promise.allSettled([
            api.get("/users"),
            api.get("/workSessions", { params: queryParams }),
            api.get(`/calendar?year=${new Date(this.startDate).getFullYear()}`),
            api.get("/leave-requests/calendar", { params: queryParams }), // Using calendar endpoint as it seems available or similar
          ]);

        if (usersRes.status === "fulfilled")
          this.usernames = usersRes.value.data.map((u) => ({
            id: u.id,
            name: u.name,
            department: u.department || "",
          }));

        // Load Schedule for the correct target user
        this.currentSchedule = null;
        let targetId = null;

        if (this.employee) {
          targetId = this.usernames.find(u => u.name === this.employee)?.id;
        } else if (this.user?.role !== 'admin') {
          targetId = this.user.id;
        }

        if (targetId) {
          try {
            const sRes = await api.get(`/schedule/${targetId}`);
            if (sRes.data) this.currentSchedule = sRes.data;
          } catch (e) {
             console.error("Dienstplan laden fehlgeschlagen", e);
          }
        }

        // Store external data for computation
        this.holidays = [];
        this.ferien = [];
        if (calendarRes.status === "fulfilled") {
          this.holidays = calendarRes.value.data.holidays || [];
          this.ferien = calendarRes.value.data.ferien || [];
        }

        this.leaves = [];
        if (leavesRes.status === "fulfilled") {
          // Filter only approved leaves for the selected user if filtering is active
          let allLeaves = leavesRes.value.data;
          // Simple client side filter if needed, though backend filter is better
          if (this.employee) {
            // Assuming leaves structure has user name or id
            allLeaves = allLeaves.filter(
              (l) => l.user_id?.name === this.employee,
            );
          }
          this.leaves = allLeaves;
        }

        if (sessionsRes.status === "fulfilled") {
          let sessions = sessionsRes.value.data.map((s) => ({
            ...s,
            name: s.name || "–",
            department: s.department || "–",
          }));
          if (this.employee)
            sessions = sessions.filter((s) => s.name === this.employee);
          if (this.department)
            sessions = sessions.filter((s) => s.department === this.department);
          this.filteredData = sessions;
        }
      } catch (err) {
        console.error(err);
      }
    },

    clearFilters() {
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const fmt = (d) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      this.startDate = fmt(firstDay);
      this.endDate = fmt(today);
      this.employee = "";
      this.department = "";
      this.fetchData();
    },

    prevMonth() {
      const d = new Date(this.startDate);
      // Den ersten Tag des VORHERIGEN Monats setzen
      d.setMonth(d.getMonth() - 1);
      d.setDate(1);

      const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0);

      this.startDate = this.formatToDateString(d);
      this.endDate = this.formatToDateString(lastDay);
      this.fetchData();
    },

    nextMonth() {
      const d = new Date(this.startDate);
      // Den ersten Tag des NÄCHSTEN Monats setzen
      d.setMonth(d.getMonth() + 1);
      d.setDate(1);

      const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0);

      this.startDate = this.formatToDateString(d);
      this.endDate = this.formatToDateString(lastDay);
      this.fetchData();
    },

    formatToDateString(d) {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    }
  },
};
</script>
