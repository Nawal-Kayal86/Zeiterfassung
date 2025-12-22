<template>
  <div class="container py-5">
    <h2 class="mb-4 fw-bold text-primary">📊 Dashboard</h2>

    <!-- Arbeitszeit Buttons -->
    <div class="mb-4 d-flex gap-3 flex-wrap">
      <button class="btn btn-success shadow" @click="start">
        🟢 Arbeitsbeginn
      </button>
      <button class="btn btn-danger shadow" @click="stop">
        🔴 Arbeitsende
      </button>
    </div>

    <!-- Meldungen -->
    <div
      v-if="message.text"
      :class="`alert alert-${message.type} shadow-sm`"
      role="alert"
    >
      {{ message.text }}
    </div>

    <!-- Statuskarten -->
    <div class="row mb-4">
      <div class="col-md-4 mb-3">
        <div class="card shadow-sm h-100 text-center p-3">
          <h6 class="text-muted">Letzter Beginn</h6>
          <p class="fw-bold fs-5">
            {{ summary.lastStart ? formatDate(summary.lastStart) : "-" }}<br />
            {{ summary.lastStart ? formatTime(summary.lastStart) : "-" }}
          </p>
        </div>
      </div>

      <div class="col-md-4 mb-3">
        <div class="card shadow-sm h-100 text-center p-3">
          <h6 class="text-muted">Letztes Ende</h6>
          <p class="fw-bold fs-5">
            {{ summary.lastEnd ? formatDate(summary.lastEnd) : "-" }}<br />
            {{ summary.lastEnd ? formatTime(summary.lastEnd) : "-" }}
          </p>
        </div>
      </div>

      <div class="col-md-4 mb-3">
        <div class="card shadow-sm h-100 text-center p-3">
          <h6 class="text-muted">Gesamteinträge</h6>
          <p class="fw-bold fs-4 text-primary">
            {{ summary.totalEntries }}
          </p>
        </div>
      </div>
    </div>

    <!-- Manuelle Arbeitszeiterfassung -->
    <div class="card shadow-sm p-4 mb-5" style="max-width: 500px;">
      <h5 class="card-title mb-3">⏱ Arbeitszeit manuell eintragen</h5>
      <form @submit.prevent="addManualTime">
        <div class="mb-3">
          <label class="form-label">📅 Datum</label>
          <input
            type="date"
            v-model="manual.date"
            class="form-control shadow-sm"
            required
          />
        </div>

        <div class="mb-3">
          <label class="form-label">🟢 Startzeit</label>
          <input
            type="time"
            v-model="manual.start"
            class="form-control shadow-sm"
          />
        </div>

        <div class="mb-3">
          <label class="form-label">🔴 Endzeit</label>
          <input
            type="time"
            v-model="manual.end"
            class="form-control shadow-sm"
          />
        </div>

        <button type="submit" class="btn btn-primary w-100 shadow">
          💾 Speichern
        </button>
      </form>
    </div>

    <!-- Übersicht aller Einträge -->
    <div class="card shadow-sm mt-4">
      <div class="card-header bg-light fw-bold">
        📜 Alle Einträge
      </div>
      <div class="card-body p-0">
        <table class="table table-hover mb-0">
          <thead class="table-light">
            <tr>
              <th v-if="user && user.role === 'admin'">Mitarbeiter</th>
              <th>Abteilung</th>
              <th>Datum</th>
              <th>Start</th>
              <th>Ende</th>
              <th>Dauer</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="workSessions.length === 0">
              <td colspan="6" class="text-center py-3 text-muted">
                Keine Einträge gefunden
              </td>
            </tr>

            <tr v-for="s in workSessions" :key="s.id">
              <td v-if="user && user.role === 'admin'">{{ s.name }}</td>
              <td>{{ s.department || '-' }}</td>
              <td>{{ formatDate(s.start) }}</td>
              <td>{{ formatTime(s.start) }}</td>
              <td>{{ formatTime(s.end) }}</td>
              <td>{{ calcDuration(s.start, s.end) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import api from "../api";
import router from "../router";
import { formatDate, formatTime, calcDuration } from "../utils/time";

export default {
  name: "Dashboard",

  data() {
    return {
      user: null,
      manual: { date: "", start: "", end: "" },
      message: { text: "", type: "success" },
      summary: { lastStart: null, lastEnd: null, totalEntries: 0 },
      workSessions: []
    };
  },

  async created() {
    this.user = JSON.parse(localStorage.getItem("user"));
    if (!this.user) router.push("/login");

    await this.loadWorkSessions();
    await this.loadSummary();
  },

  methods: {
    formatDate,
    formatTime,
    calcDuration,

    async loadSummary() {
      try {
        const res = await api.get("/workSessions/summary");
        this.summary = res.data;
      } catch {
        this.summary = { lastStart: null, lastEnd: null, totalEntries: 0 };
      }
    },

  async loadWorkSessions() {
  try {
    const res = await api.get('/workSessions')
    this.workSessions = res.data
  } catch {
    this.workSessions = []
  }
},

    async start() {
      try {
        const res = await api.post("/workSessions/start");
        this.showMessage(res.data.message, "success");
        await this.loadWorkSessions();
        await this.loadSummary();
      } catch (err) {
        const text =
          err.response?.data?.error || "Fehler beim Arbeitsbeginn ❌";
        this.showMessage(text, "danger");
      }
    },

    async stop() {
      try {
        const res = await api.post("/workSessions/stop");
        this.showMessage(res.data.message, "success");
        await this.loadWorkSessions();
        await this.loadSummary();
      } catch (err) {
        const text =
          err.response?.data?.error || "Fehler beim Arbeitsende ❌";
        this.showMessage(text, "danger");
      }
    },

    async addManualTime() {
      try {
        const res = await api.post("/workSessions/manual-time", this.manual);
        this.showMessage(res.data.message, "success");
        this.manual = { date: "", start: "", end: "" };
        await this.loadWorkSessions();
        await this.loadSummary();
      } catch (err) {
        const text =
          err.response?.data?.error || "Fehler beim Eintragen ❌";
        this.showMessage(text, "danger");
      }
    },

    showMessage(text, type = "success") {
      this.message = { text, type };
      setTimeout(() => {
        this.message.text = "";
      }, 4000);
    }
  }
};
</script>

<style scoped>
.table-hover tbody tr:hover {
  background-color: #f9f9f9;
}

.card {
  border-radius: 12px;
}
</style>
