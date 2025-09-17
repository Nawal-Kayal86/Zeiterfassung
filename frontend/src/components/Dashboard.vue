<template>
  <div class="container mt-5">
    <h2 class="mb-4">Dashboard</h2>
    <p>Willkommen, <strong>{{ user?.name }}</strong> ({{ user?.role }})</p>

    <!-- Arbeitszeit Buttons -->
    <div class="mb-4 d-flex gap-2 flex-wrap">
      <button class="btn btn-success" @click="start">Arbeitsbeginn</button>
      <button class="btn btn-danger" @click="stop">Arbeitsende</button>
      <button class="btn btn-secondary" @click="logout">Logout</button>
    </div>

    <!-- Meldungen -->
    <div v-if="message.text" :class="`alert alert-${message.type}`" role="alert">
      {{ message.text }}
    </div>

    <!-- Manuelle Arbeitszeiterfassung -->
    <div class="card p-3 mb-4" style="max-width: 400px;">
      <h5 class="card-title mb-3">Arbeitszeit manuell eintragen</h5>
      <form @submit.prevent="addManualTime">
        <div class="mb-3">
          <label class="form-label">Datum</label>
          <input type="date" v-model="manual.date" class="form-control" required />
        </div>
        <div class="mb-3">
          <label class="form-label">Startzeit</label>
          <input type="time" v-model="manual.start" class="form-control" required />
        </div>
        <div class="mb-3">
          <label class="form-label">Endzeit</label>
          <input type="time" v-model="manual.end" class="form-control" required />
        </div>
        <button type="submit" class="btn btn-primary w-100">Speichern</button>
      </form>
    </div>



    <!-- Admin-Link -->
    <div v-if="user?.role === 'admin'">
      <router-link class="btn btn-outline-primary" to="/admin">Zur Admin-Seite</router-link>
    </div>

    <!-- Meine Arbeitszeiten Link -->
    <div class="mt-3">
      <router-link class="btn btn-outline-secondary" to="/MyWorkSessions">Meine Arbeitszeiten</router-link>
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
      workSessions: [],
      filter: ''
    }
  },
  async created() {
    this.user = JSON.parse(localStorage.getItem('user'))
    if (!this.user) router.push('/login')

    // Arbeitszeiten laden (nur eigene für Mitarbeiter)
    const res = await api.get('/work-sessions')
    this.workSessions = res.data
  },
  computed: {
    filteredWork() {
      const f = this.filter.toLowerCase()
      return this.workSessions.filter(w =>
        (w.start_time && this.formatDate(w.start_time).includes(f)) ||
        (w.start_time && this.formatTime(w.start_time).includes(f)) ||
        (w.end_time && this.formatTime(w.end_time).includes(f))
      )
    }
  },
  methods: {
    async start() {
      try {
        await api.post('/start')
        this.showMessage('Arbeitsbeginn erfasst', 'success')
        await this.loadWorkSessions()
      } catch {
        this.showMessage('Fehler beim Erfassen des Arbeitsbeginns', 'danger')
      }
    },
    async stop() {
      try {
        await api.post('/stop')
        this.showMessage('Arbeitsende erfasst', 'success')
        await this.loadWorkSessions()
      } catch {
        this.showMessage('Fehler beim Erfassen des Arbeitsendes', 'danger')
      }
    },
    async addManualTime() {
      try {
        await api.post('/manual-time', this.manual)
        this.showMessage('Arbeitszeit manuell eingetragen', 'success')
        this.manual = { date: '', start: '', end: '' }
        await this.loadWorkSessions()
      } catch {
        this.showMessage('Fehler beim Eintragen der Zeit', 'danger')
      }
    },
    async loadWorkSessions() {
      const res = await api.get('/work-sessions')
      this.workSessions = res.data
    },
    logout() {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      router.push('/login')
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
      return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  }
}
</script>

<style scoped>
.card {
  border-radius: 10px;
  background-color: #f8f9fa;
}
</style>
