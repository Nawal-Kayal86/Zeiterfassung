<template>
  <div class="container-fluid py-4 px-md-5">
    <!-- Toggle Switch -->
    <div class="d-flex justify-content-center mb-5">
      <div
        class="view-toggle-container shadow-sm p-1 rounded-pill bg-light border"
      >
        <button
          @click="activeView = 'terminal'"
          :class="[
            'btn rounded-pill px-4 py-2 transition-all border-0',
            activeView === 'terminal' ? 'btn-indigo shadow-sm' : 'text-muted',
          ]"
        >
          <i class="bi bi-pc-display-horizontal me-2"></i> Stempel-Terminal
        </button>
        <button
          @click="activeView = 'manual'"
          :class="[
            'btn rounded-pill px-4 py-2 transition-all border-0',
            activeView === 'manual' ? 'btn-indigo shadow-sm' : 'text-muted',
          ]"
        >
          <i class="bi bi-pencil-square me-2"></i> Manuelle Erfassung
        </button>
      </div>
    </div>

    <div class="row g-4 justify-content-center">
      <!-- Manuelle Erfassung (Full Width when active) -->
      <div v-if="activeView === 'manual'" class="col-lg-6">
        <div class="card shadow-sm p-4 border-0 bg-white">
          <h5 class="card-title mb-4 d-flex align-items-center gap-2">
            <i class="bi bi-clock-history text-indigo"></i>
            Manuelle Erfassung
          </h5>
          <form @submit.prevent="addManualTime">
            <div class="mb-3">
              <label
                class="form-label d-flex align-items-center fw-semibold text-muted small text-uppercase"
              >
                <i class="bi bi-calendar-event me-2 text-indigo"></i> Datum
              </label>
              <input
                type="date"
                v-model="manual.date"
                class="form-control custom-input"
                required
              />
            </div>

            <div class="mb-3">
              <label
                class="form-label d-flex align-items-center fw-semibold text-muted small text-uppercase"
              >
                <i class="bi bi-play-circle-fill me-2 text-success-custom"></i>
                Startzeit
              </label>
              <input
                type="time"
                v-model="manual.start"
                class="form-control custom-input"
              />
            </div>

            <div class="mb-3">
              <label
                class="form-label d-flex align-items-center fw-semibold text-muted small text-uppercase"
              >
                <i class="bi bi-stop-circle-fill me-2 text-danger"></i> Endzeit
              </label>
              <input
                type="time"
                v-model="manual.end"
                class="form-control custom-input"
              />
            </div>

            <div class="mb-4">
              <label
                class="form-label d-flex align-items-center fw-semibold text-muted small text-uppercase"
              >
                <i class="bi bi-coffee-spent me-2 text-warning"></i> Pause
                (HH:MM)
              </label>
              <input
                type="text"
                v-model="manual.pause"
                class="form-control custom-input"
                placeholder="0:30"
              />
            </div>

            <button
              type="submit"
              class="btn btn-indigo w-100 py-2 shadow-sm d-flex align-items-center justify-content-center gap-2 fw-bold"
            >
              <i class="bi bi-save-fill"></i> Jetzt Speichern
            </button>
          </form>
        </div>
      </div>

      <!-- Stempel-Aktion & Status (Full Width when active) -->
      <div v-if="activeView === 'terminal'" class="col-lg-9">
        <!-- Main Action Section (Centered) -->
        <div class="text-center mb-5">
          <h2 class="fw-bold mb-4 text-dark letter-spacing-1">
            Digitales Stempel-Terminal
          </h2>

          <div v-if="activeSession" class="live-session-hero mb-4">
            <div class="live-pulse mb-2">
              <span class="pulse-dot"></span>
              LIVE SITZUNG
            </div>
            <div class="display-time">{{ liveDuration }}</div>
            <div class="text-muted mt-2 fw-semibold">
              Begonnen am: {{ formatDate(activeSession.start) }} um
              {{ formatTime(activeSession.start) }}
            </div>
          </div>

          <div class="d-flex justify-content-center gap-3 flex-wrap mt-2">
            <button
              class="btn btn-success-custom action-btn shadow-lg fw-bold py-3 px-4 transition-3d"
              @click="start"
              :disabled="activeSession"
            >
              <i class="bi bi-play-circle-fill fs-5"></i> Arbeitsbeginn
            </button>
            <button
              v-if="activeSession"
              :class="[
                'btn action-btn shadow-lg fw-bold py-3 px-4 transition-3d',
                isPaused ? 'btn-warning' : 'btn-outline-warning',
              ]"
              @click="togglePause"
            >
              <i
                :class="isPaused ? 'bi bi-pause-btn-fill' : 'bi bi-pause-btn'"
              ></i>
              {{ isPaused ? "Pause beenden" : "Pause machen" }}
            </button>
            <button
              class="btn btn-outline-indigo action-btn shadow-lg fw-bold py-3 px-4 transition-3d"
              @click="$router.push('/workflow')"
            >
              <i class="bi bi-hospital fs-5"></i> Arzttermin
            </button>
            <button
              class="btn btn-danger action-btn shadow-lg fw-bold py-3 px-4 transition-3d"
              @click="stop"
              :disabled="!activeSession"
            >
              <i class="bi bi-stop-circle-fill fs-5"></i> Arbeitsende
            </button>
          </div>
        </div>

        <div
          v-if="message.text"
          :class="`alert alert-${message.type} mx-auto mb-4 shadow-sm d-flex align-items-center justify-content-center gap-2 border-0`"
          style="max-width: 600px"
          :style="
            message.type === 'success'
              ? 'background: #d4edda; border-left: 5px solid #28a745 !important;'
              : 'background: #f8d7da; border-left: 5px solid #dc3545 !important;'
          "
        >
          <i
            :class="[
              message.type === 'success'
                ? 'bi bi-check-circle-fill'
                : 'bi bi-exclamation-circle-fill',
              `text-${message.type}`,
            ]"
          ></i>
          {{ message.text }}
        </div>

        <!-- Statuskarten -->
        <div class="row mb-4">
          <!-- Letzter Beginn -->
          <div class="col-md-6 mb-3">
            <div
              class="card shadow-sm h-100 border-0 bg-white shadow-hover p-4"
            >
              <div class="d-flex align-items-center gap-4">
                <div class="stat-icon-box bg-success-soft text-success-custom">
                  <i class="bi bi-box-arrow-in-right fs-2"></i>
                </div>
                <div>
                  <h6 class="text-muted text-uppercase smaller fw-bold mb-1">
                    Letzter Beginn
                  </h6>
                  <p class="fw-bold fs-5 mb-0 text-dark">
                    <template v-if="summary.lastStart">
                      <span class="d-block">{{
                        formatDate(summary.lastStart)
                      }}</span>
                      <span class="text-success-custom font-monospace">{{
                        formatTime(summary.lastStart)
                      }}</span>
                    </template>
                    <template v-else>-----</template>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Letztes Ende -->
          <div class="col-md-6 mb-3">
            <div
              class="card shadow-sm h-100 border-0 bg-white shadow-hover p-4"
            >
              <div class="d-flex align-items-center gap-4">
                <div class="stat-icon-box bg-danger-soft text-danger">
                  <i class="bi bi-box-arrow-right fs-2"></i>
                </div>
                <div>
                  <h6 class="text-muted text-uppercase smaller fw-bold mb-1">
                    Letztes Ende
                  </h6>
                  <p class="fw-bold fs-5 mb-0 text-dark">
                    <template v-if="!activeSession && summary.lastEnd">
                      <span class="d-block">{{
                        formatDate(summary.lastEnd)
                      }}</span>
                      <span class="text-danger font-monospace">{{
                        formatTime(summary.lastEnd)
                      }}</span>
                    </template>
                    <template v-else>-----</template>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Übersicht aller Einträge -->
    <div class="card shadow-sm mt-4">
      <div class="card-header bg-light fw-bold d-flex align-items-center gap-2">
        <i class="bi bi-list-columns-reverse text-secondary"></i>
        Alle Einträge
      </div>
      <div class="card-body p-0">
        <table class="table table-hover mb-0">
          <thead class="table-light">
            <tr>
              <th v-if="user && user.role === 'admin'">Mitarbeiter</th>
              <th>Datum</th>
              <th>Start</th>
              <th>Ende</th>
              <th>Pause</th>
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
              <td>{{ formatDate(s.start) }}</td>
              <td>{{ formatTime(s.start) }}</td>
              <td>{{ formatTime(s.end) }}</td>
              <td>
                <span class="badge bg-light text-dark font-monospace">{{
                  s.pause || "0:00"
                }}</span>
              </td>
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
      manual: { date: "", start: "", end: "", pause: "0:00" },
      message: { text: "", type: "success" },
      summary: { lastStart: null, lastEnd: null, totalEntries: 0 },
      workSessions: [],
      liveDuration: "00:00:00",
      timer: null,
      isPaused: false,
      pauseTime: 0, // in seconds
      activeView: "terminal", // 'terminal' or 'manual'
    };
  },

  async created() {
    this.user = JSON.parse(localStorage.getItem("user"));
    if (!this.user) router.push("/login");

    await this.loadWorkSessions();
    await this.loadSummary();
  },
  computed: {
    activeSession() {
      if (!this.user) return null;
      return (
        this.workSessions.find((s) => {
          // Verhindern, dass fremde Sessions beim Admin als eigene aktive Session erkannt werden
          if (s.user_id && s.user_id !== this.user.id) return false;

          if (!s.start) return false;
          if (!s.end) return true;

          const start = new Date(s.start);
          const end = new Date(s.end);

          return end <= start;
        }) || null
      );
    },
  },
  watch: {
    activeSession(newSession, oldSession) {
      if (newSession) {
        this.startLiveTimer();
      } else {
        this.stopLiveTimer();
      }
    },
  },

  methods: {
    formatDate,
    formatTime,
    calcDuration,

    /**
     * @method loadSummary
     * @description Lädt die aggregierten Zusammenfassungsdaten (letzter Start, letztes Ende) für den Dashboard-Header.
     */
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
        const res = await api.get("/workSessions");
        this.workSessions = res.data;
      } catch {
        this.workSessions = [];
      }
    },

    async start() {
      try {
        this.isPaused = false;
        this.pauseTime = 0;
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
        const h = Math.floor(this.pauseTime / 3600);
        const m = Math.floor((this.pauseTime % 3600) / 60);
        const pauseStr = `${h}:${String(m).padStart(2, "0")}`;

        const res = await api.post("/workSessions/stop", { pause: pauseStr });
        this.showMessage(res.data.message, "success");
        this.isPaused = false;
        this.pauseTime = 0;
        await this.loadWorkSessions();
        await this.loadSummary();
      } catch (err) {
        const text = err.response?.data?.error || "Fehler beim Arbeitsende ❌";
        this.showMessage(text, "danger");
      }
    },

    async addManualTime() {
      try {
        const res = await api.post("/workSessions/manual-time", this.manual);
        this.showMessage(res.data.message, "success");
        this.manual = { date: "", start: "", end: "", pause: "0:00" };
        await this.loadWorkSessions();
        await this.loadSummary();
      } catch (err) {
        const text = err.response?.data?.error || "Fehler beim Eintragen ❌";
        this.showMessage(text, "danger");
      }
    },

    startLiveTimer() {
      if (!this.activeSession) return;

      if (this.timer) clearInterval(this.timer);

      this.timer = setInterval(() => {
        if (this.isPaused) {
          this.pauseTime++;
          return;
        }

        const start = new Date(this.activeSession.start);
        const now = new Date();

        let diffMs = now - start;
        if (diffMs < 0) return;

        // Subtrahiere die Pausenzeit (in ms)
        diffMs -= this.pauseTime * 1000;

        if (diffMs < 0) diffMs = 0;

        const totalSeconds = Math.floor(diffMs / 1000);
        const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
        const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(
          2,
          "0",
        );
        const s = String(totalSeconds % 60).padStart(2, "0");

        this.liveDuration = `${h}:${m}:${s}`;
      }, 1000);
    },
    togglePause() {
      this.isPaused = !this.isPaused;
      if (this.isPaused) {
        this.showMessage("Pause gestartet", "warning");
      } else {
        this.showMessage("Pause beendet", "success");
      }
    },
    stopLiveTimer() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
        this.liveDuration = "00:00:00";
      }
    },

    showMessage(text, type = "success") {
      this.message = { text, type };
      setTimeout(() => {
        this.message.text = "";
      }, 4000);
    },
  },
};
</script>

<style scoped>
.table-hover tbody tr:hover {
  background-color: #f9f9f9;
}

.card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05) !important;
}

.text-indigo {
  color: #6366f1 !important;
}

.text-slate {
  color: #475569 !important;
}

.btn-indigo {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: #ffffff;
  border: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-indigo:hover {
  background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(99, 102, 241, 0.4);
  color: #ffffff;
}

.btn-slate {
  background: #475569;
  color: #ffffff;
  border: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-slate:hover {
  background: #334155;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(71, 85, 105, 0.2);
  color: #ffffff;
}

.custom-input {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px 12px;
  transition: all 0.3s ease;
  background-color: #f8fafc;
}

.custom-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
  background-color: #fff;
  outline: none;
}

.form-label {
  letter-spacing: 0.3px;
  margin-bottom: 0.5rem;
}

.action-btn {
  min-width: 160px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-size: 0.95rem;
}

.btn-outline-indigo {
  color: #6366f1;
  border: 2px solid #6366f1;
  background: transparent;
  font-weight: 600;
}

.btn-outline-indigo:hover {
  background: #6366f1;
  color: #ffffff;
}

.action-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  filter: brightness(1.05);
}

.stat-icon-box {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  flex-shrink: 0;
}

.text-success-custom {
  color: #70ae91 !important;
}

.btn-success-custom {
  background-color: #70ae91 !important;
  border-color: #70ae91 !important;
  color: #ffffff !important;
}

.btn-success-custom:hover:not(:disabled) {
  background-color: #5f9a7f !important;
  border-color: #5f9a7f !important;
}

.bg-success-soft {
  background-color: rgba(112, 174, 145, 0.15) !important;
}

.bg-danger-soft {
  background-color: rgba(220, 53, 69, 0.1);
}

.smaller {
  font-size: 0.75rem;
}

/* ====== Premium Hero Components ====== */
.live-session-hero {
  background: white;
  padding: 2.5rem;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(112, 174, 145, 0.2);
  display: inline-block;
  min-width: 450px;
}

.display-time {
  font-family: "JetBrains Mono", "Courier New", monospace;
  font-size: 4rem;
  font-weight: 800;
  color: #1a1a1a;
  letter-spacing: -2px;
  line-height: 1;
}

.live-pulse {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(112, 174, 145, 0.1);
  color: #70ae91;
  padding: 6px 16px;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 1px;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background-color: #70ae91;
  border-radius: 50%;
  animation: pulse-animation 1.5s infinite;
}

@keyframes pulse-animation {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(112, 174, 145, 0.7);
  }

  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(112, 174, 145, 0);
  }

  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(112, 174, 145, 0);
  }
}

.transition-3d {
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.transition-3d:hover:not(:disabled) {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1) !important;
}

.letter-spacing-1 {
  letter-spacing: 1px;
}

/* ====== View Toggle Styles ====== */
.view-toggle-container {
  display: inline-flex;
  gap: 5px;
  background: #f1f5f9;
}

.transition-all {
  transition: all 0.3s ease;
}

.btn-indigo.shadow-sm {
  box-shadow: 0 4px 10px rgba(99, 102, 241, 0.2) !important;
}
</style>
