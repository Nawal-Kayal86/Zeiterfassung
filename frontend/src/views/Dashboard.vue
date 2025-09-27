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
      <!-- Letzter Beginn -->
      <div class="col-md-4 mb-3">
        <div class="card shadow-sm h-100 text-center p-3">
          <h6 class="text-muted">Letzter Beginn</h6>
          <p class="fw-bold fs-5">
            {{ summary.lastStart?.date_today ? formatDate(summary.lastStart.date_today) : '-' }}<br>
            {{ summary.lastStart?.start_time ? formatTime(summary.lastStart.start_time) : '-' }}
          </p>
        </div>
      </div>

      <!-- Letztes Ende -->
      <div class="col-md-4 mb-3">
        <div class="card shadow-sm h-100 text-center p-3">
          <h6 class="text-muted">Letztes Ende</h6>
          <p class="fw-bold fs-5">
            {{ summary.lastEnd?.date_today ? formatDate(summary.lastEnd.date_today) : '-' }}<br>
            {{ summary.lastEnd?.end_time ? formatTime(summary.lastEnd.end_time) : '-' }}
          </p>
        </div>
      </div>

      <!-- Gesamteinträge -->
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
      summary: { lastStart: null, lastEnd: null, totalEntries: 0 }
    }
  },

  async created() {
    this.user = JSON.parse(localStorage.getItem('user'))
    if (!this.user) router.push('/login')

    await this.loadWorkSessions()
    await this.loadSummary() // 🟢 Summary beim Laden holen
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

    async loadWorkSessions() {
      const res = await api.get('/work-sessions')
      this.workSessions = res.data
    },

    showMessage(text, type = 'success') {
      this.message = { text, type }
      setTimeout(() => { this.message.text = '' }, 4000)
    },

    formatDate(iso) {
      if (!iso) return '-'
      return new Date(iso).toLocaleDateString()
    },

    formatTime(iso) {
      if (!iso) return '-'
      return iso.slice(0, 5) // HH:MM
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
