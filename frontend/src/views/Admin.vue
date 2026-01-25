<template>
  <div class="container py-5">

    <!-- Zurück zum Dashboard -->
    <router-link class="btn btn-outline-secondary mb-4" to="/">⬅️ Zurück zum Dashboard</router-link>

    <!-- Filter -->
    <div class="mb-4">
      <input v-model="filter" type="text" class="form-control shadow-sm" placeholder="🔎 Filtern nach Name oder Datum">
    </div>

    <!-- User-Tabelle -->
    <div class="card shadow-sm mb-5">
      <div class="card-header bg-dark text-white fw-bold">
        Benutzerübersicht
      </div>
      <div class="card-body p-0">
        <table class="table table-hover mb-0">
          <thead class="table-light">
            <tr>
              <th>Name</th>
              <th>Rolle</th>
              <th>Datum</th>
              <th>Uhrzeit</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in filteredUsers" :key="u.user_id + u.start_time">
              <td>{{ u.name }}</td>
              <td>
                <span class="badge" :class="u.role === 'admin' ? 'bg-danger' : 'bg-secondary'">
                  {{ u.role }}
                </span>
              </td>
              <td>{{ formatDate(u.start_time) }}</td>
              <td>{{ formatTime(u.start_time) }} - {{ formatTime(u.end_time) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Neues Formular: Arbeitszeit manuell eintragen -->
    <div class="card shadow-sm">
      <div class="card-header bg-primary text-white fw-bold">
        ⏱ Arbeitszeit manuell eintragen
      </div>
      <div class="card-body">
        <form @submit.prevent="saveManualTime">
          <div class="row mb-3">
            <div class="col-md-4">
              <label for="date" class="form-label">📅 Datum</label>
              <input id="date" v-model="date" type="date" class="form-control shadow-sm" required />
            </div>
            <div class="col-md-4">
              <label for="start" class="form-label">🟢 Startzeit</label>
              <input id="start" v-model="start" type="time" class="form-control shadow-sm" required />
            </div>
            <div class="col-md-4">
              <label for="end" class="form-label">🔴 Endzeit</label>
              <input id="end" v-model="end" type="time" class="form-control shadow-sm" required />
            </div>
          </div>
          <button type="submit" class="btn btn-success px-4 shadow">
            💾 Speichern
          </button>
        </form>
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
      users: [],
      filter: '',
      // für das Formular
      date: '',
      start: '',
      end: ''
    }
  },
  async created() {
    const user = JSON.parse(localStorage.getItem('user'))
    if (!user || user.role !== 'admin') {
      router.push('/')
      return
    }
    const res = await api.get('/api/users')
    this.users = res.data
  },
  computed: {
    filteredUsers() {
      const f = this.filter.toLowerCase()
      return this.users.filter(u =>
        u.name.toLowerCase().includes(f) ||
        (u.start_time && this.formatDate(u.start_time).includes(f)) ||
        (u.end_time && this.formatDate(u.end_time).includes(f))
      )
    }
  },
  methods: {
    formatDate(iso) {
      if (!iso) return '-'
      const d = new Date(iso)
      return d.toLocaleDateString()
    },
    formatTime(iso) {
      if (!iso) return '-'
      const d = new Date(iso)
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
    async saveManualTime() {
      try {
        let formattedDate = this.date
        if (this.date.includes('.')) {
          const [day, month, year] = this.date.split('.')
          formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
        }

        const payload = {
          date: formattedDate,
          start: this.start,
          end: this.end
        }

        await api.post('/manual-time', payload)
        alert('Gespeichert! ✅')

        // Felder zurücksetzen
        this.date = ''
        this.start = ''
        this.end = ''

        // Liste aktualisieren
        const res = await api.get('/api/users')
        this.users = res.data

      } catch (err) {
        console.error(err)
        alert('Fehler beim Speichern! ❌')
      }
    }
  }
}
</script>

<style scoped>
h2 {
  letter-spacing: 1px;
}

.table-hover tbody tr:hover {
  background-color: #f1f1f1;
}

.card {
  border-radius: 12px;
}
</style>
