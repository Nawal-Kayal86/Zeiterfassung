<template>
  <div class="container py-4">
    <!-- Filter Card -->
    <div class="card shadow-sm mb-4">
      <div class="card-body">
        <h5 class="mb-3">🔎 Filter & Zeitraum</h5>
        <div class="row g-3">
          <div class="col-md-3">
            <label class="form-label">Startdatum</label>
            <input type="date" class="form-control" v-model="startDate" />
          </div>
          <div class="col-md-3">
            <label class="form-label">Endedatum</label>
            <input type="date" class="form-control" v-model="endDate" />
          </div>
          <div v-if="user?.role === 'admin'" class="col-md-3">
            <label class="form-label">Mitarbeiter</label>
            <select class="form-select" v-model="employee">
              <option value="">Alle</option>
              <option v-for="u in usernames" :key="u.id" :value="u.name">
                {{ u.name }}
              </option>
            </select>
          </div>
          <div v-if="user?.role === 'admin'" class="col-md-3">
            <label class="form-label">Abteilung</label>
            <select class="form-select" v-model="department">
              <option value="">Alle</option>
              <option v-for="d in departments" :key="d.id" :value="d.name">
                {{ d.name }}
              </option>
            </select>
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
                <span v-if="group.expectedHours > 0">07:45 - 16:30</span>
                <span v-else>Frei</span>
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
    return {
      startDate: fmt(firstDay),
      endDate: fmt(today),
      usernames: [],
      departments: [],
      employee: "",
      department: "",
      filteredData: [],
      token: localStorage.getItem("token") || "",
      holidays: [],
      ferien: [],
      leaves: [],
      user: JSON.parse(localStorage.getItem("user")) || {},
    };
  },

  computed: {
    groupedData() {
      const grouped = {};
      if (!this.startDate || !this.endDate) return grouped;

      const start = new Date(this.startDate);
      const end = new Date(this.endDate);

      // Iterate through each day in range
      let current = new Date(start);
      // 07:45 to 16:30 = 8h 45m = 8.75 hours
      const STANDARD_HOURS = 8.75;

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
        let expected = STANDARD_HOURS;
        let infoText = "";

        if (isWeekend) {
          rowClass = "table-danger";
          expected = 0;
          infoText = "Wochenende";
        } else if (isHoliday) {
          rowClass = "table-danger";
          expected = 0;
          infoText = "Feiertag";
        } else if (isFerien) {
          rowClass = "table-danger";
          expected = 0;
          infoText = "Ferien";
        } else if (isLeave) {
          rowClass = "table-warning";
          expected = 0;
          infoText = "Urlaub";
        }

        grouped[key] = {
          dayDisplay,
          dateOnlyDisplay,
          intervals: [],
          totalHours: 0,
          expectedHours: expected,
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
  },
};
</script>
