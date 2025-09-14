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
      message: { text: '', type: 'success' } // für Meldungen
    }
  },
  created() {
    this.user = JSON.parse(localStorage.getItem('user'))
    if (!this.user) router.push('/login')
  },
  methods: {
    async start() {
      try {
        await api.post('/start')
        this.showMessage('Arbeitsbeginn erfasst', 'success')
      } catch {
        this.showMessage('Fehler beim Erfassen des Arbeitsbeginns', 'danger')
      }
    },
    async stop() {
      try {
        await api.post('/stop')
        this.showMessage('Arbeitsende erfasst', 'success')
      } catch {
        this.showMessage('Fehler beim Erfassen des Arbeitsendes', 'danger')
      }
    },
    async addManualTime() {
      try {
        await api.post('/manual-time', this.manual)
        this.showMessage('Arbeitszeit manuell eingetragen', 'success')
        this.manual = { date: '', start: '', end: '' }
      } catch {
        this.showMessage('Fehler beim Eintragen der Zeit', 'danger')
      }
    },
    logout() {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      router.push('/login')
    },
    showMessage(text, type = 'success') {
      this.message = { text, type }
      setTimeout(() => {
        this.message.text = ''
      }, 4000) // nach 4 Sekunden verschwindet die Meldung
    }
  }
}
</script>

<style scoped>
body {
  margin: 0;
}

h2 {
  color: #333;
}

.card {
  background-color: #f8f9fa;
  border-radius: 10px;
}

.btn {
  min-width: 120px;
}

.alert {
  max-width: 400px;
}
</style>
