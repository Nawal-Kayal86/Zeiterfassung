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
    <div v-if="message.text" :class="`alert alert-${message.type} shadow-sm`" role="alert">
      {{ message.text }}
    </div>

    <!-- Statuskarten -->
    <div class="row mb-4">
      <div class="col-md-4 mb-3">
        <div class="card shadow-sm h-100 text-center p-3">
          <h6 class="text-muted">Letzter Beginn</h6>
          <p class="fw-bold fs-5">
            {{ summary.lastStart?.date_today ? formatDate(summary.lastStart.date_today) : '-' }}<br>
            {{ summary.lastStart?.start_time ? formatTime(summary.lastStart.start_time) : '-' }}
          </p>
        </div>
      </div>

      <div class="col-md-4 mb-3">
        <div class="card shadow-sm h-100 text-center p-3">
          <h6 class="text-muted">Letztes Ende</h6>
          <p class="fw-bold fs-5">
            {{ summary.lastEnd?.date_today ? formatDate(summary.lastEnd.date_today) : '-' }}<br>
            {{ summary.lastEnd?.end_time ? formatTime(summary.lastEnd.end_time) : '-' }}
          </p>
        </div>
      </div>

      <div class="col-md-4 mb-3">
        <div class="card shadow-sm h-100 text-center p-3">
          <h6 class="text-muted">Gesamteinträge</h6>
          <p class="fw-bold fs-4 text-primary">{{ summary.totalEntries }}</p>
        </div>
      </div>
    </div>

    <!-- Manuelle Arbeitszeiterfassung -->
    <div class="card shadow-sm p-4 mb-5" style="max-width: 500px;">
      <h5 class="card-title mb-3">⏱ Arbeitszeit manuell eintragen</h5>
      <form @submit.prevent="addManualTime">
        <div class="mb-3">
          <label class="form-label">📅 Datum</label>
          <input type="date" v-model="manual.date" class="form-control shadow-sm" required />
        </div>
        <div class="mb-3">
          <label class="form-label">🟢 Startzeit</label>
          <input type="time" v-model="manual.start" class="form-control shadow-sm" required />
        </div>
        <div class="mb-3">
          <label class="form-label">🔴 Endzeit</label>
          <input type="time" v-model="manual.end" class="form-control shadow-sm" required />
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
              <td>{{ formatDate(s.date_today) }}</td>
              <td>{{ formatTime(s.start_time) }}</td>
              <td>{{ formatTime(s.end_time) }}</td>
              <td>{{ s.end_time ? calcDuration(s.start_time, s.end_time) : "-" }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../api'
import router from '../router'

export default {
  data() {
    return {
      user: null,
      manual: { date: '', start: '', end: '' },
      message: { text: '', type: 'success' },
      summary: { lastStart: null, lastEnd: null, totalEntries: 0 },
      workSessions: [] // 🟢 Wichtig für Tabelle
    }
  },

  async created() {
    this.user = JSON.parse(localStorage.getItem('user'))
    if (!this.user) router.push('/login')

    await this.loadWorkSessions()
    await this.loadSummary()
  },

  methods: {
    async loadSummary() {
      try {
        const res = await api.get('/work-sessions/summary')
        console.log("Summary vom Backend:", res.data)
        this.summary = res.data
      } catch (err) {
        console.error("Fehler beim Laden der Summary:", err)
        this.summary = { lastStart: null, lastEnd: null, totalEntries: 0 }
      }
    },

    async loadWorkSessions() {
      try {
        const res = await api.get('/work-sessions')
        this.workSessions = res.data
      } catch (err) {
        console.error("Fehler beim Laden der Work-Sessions:", err)
        this.workSessions = []
      }
    },

    async start() {
      try {
        await api.post('/start')
        this.showMessage('Arbeitsbeginn erfasst ✅', 'success')
        await this.loadWorkSessions()
        await this.loadSummary()
      } catch {
        this.showMessage('Fehler beim Arbeitsbeginn ❌', 'danger')
      }
    },

    async stop() {
      try {
        await api.post('/stop')
        this.showMessage('Arbeitsende erfasst ✅', 'success')
        await this.loadWorkSessions()
        await this.loadSummary()
      } catch {
        this.showMessage('Fehler beim Arbeitsende ❌', 'danger')
      }
    },

    async addManualTime() {
      try {
        await api.post('/manual-time', this.manual)
        this.showMessage('Manuell eingetragen ✅', 'success')
        this.manual = { date: '', start: '', end: '' }
        await this.loadWorkSessions()
        await this.loadSummary()
      } catch {
        this.showMessage('Fehler beim Eintragen ❌', 'danger')
      }
    },

    showMessage(text, type = 'success') {
      this.message = { text, type }
      setTimeout(() => { this.message.text = '' }, 4000)
    },

    formatDate(val) {
      if (!val) return '-'
      if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
        const [y, m, d] = val.split('-')
        return `${d}.${m}.${y}`
      }
      return new Date(val).toLocaleDateString()
    },

    formatTime(val) {
      if (!val) return '-'
      return String(val).slice(0, 5)
    },

    calcDuration(start, end) {
      if (!start || !end) return "-"
      const [sh, sm, ss] = String(start).split(":").map(Number)
      const [eh, em, es] = String(end).split(":").map(Number)
      let startSec = sh * 3600 + sm * 60 + (ss || 0)
      let endSec = eh * 3600 + em * 60 + (es || 0)
      if (endSec < startSec) endSec += 24 * 3600
      const diff = endSec - startSec
      const h = String(Math.floor(diff / 3600)).padStart(2, "0")
      const m = String(Math.floor((diff % 3600) / 60)).padStart(2, "0")
      return `${h}:${m}`
    }
  }
}
</script>

<style scoped>
.table-hover tbody tr:hover {
  background-color: #f9f9f9;
}
.card {
  border-radius: 12px;
}
</style>
