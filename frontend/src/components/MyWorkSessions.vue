<router-link class="btn btn-outline-primary mt-3" to="/my-work-sessions">
  Meine Arbeitszeiten
</router-link>
<template>
  <div class="container mt-5">
    <h2 class="mb-4">Meine Arbeitszeiten</h2>

    <!-- Filter -->
    <div class="mb-3">
      <input
        v-model="filter"
        type="text"
        class="form-control"
        placeholder="Filtern nach Datum oder Zeit"
      />
    </div>

    <!-- Tabelle der Arbeitszeiten -->
    <div class="card shadow-sm p-3 mb-3">
      <table class="table table-striped table-hover">
        <thead class="table-dark">
          <tr>
            <th>Datum</th>
            <th>Startzeit</th>
            <th>Endzeit</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="w in filteredWork" :key="w.start_time">
            <td>{{ formatDate(w.start_time) }}</td>
            <td>{{ formatTime(w.start_time) }}</td>
            <td>{{ formatTime(w.end_time) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Zurück zum Dashboard -->
    <router-link class="btn btn-outline-secondary" to="/">Zurück zum Dashboard</router-link>
  </div>
</template>

<script>
import api from '../api'
import router from '../router'

export default {
  data() {
    return {
      user: null,
      workSessions: [],
      filter: ''
    }
  },
  async created() {
    // User prüfen
    this.user = JSON.parse(localStorage.getItem('user'))
    if (!this.user) router.push('/login')

    // Arbeitszeiten nur für aktuellen User laden
    const res = await api.get('/api/work-sessions')
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
