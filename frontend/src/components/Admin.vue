<template>
  <div class="container mt-5">
    <h2 class="mb-4">Admin-Bereich</h2>

    <!-- Zurück zum Dashboard -->
    <router-link class="btn btn-outline-secondary" to="/">Zurück zum Dashboard</router-link>
    
    <!-- Filter -->
    <div class="mb-3">
      <input v-model="filter" type="text" class="form-control" placeholder="Filtern nach Name oder Datum">
    </div>

    <div class="card shadow-sm p-3">
      <table class="table table-striped table-hover">
        <thead class="table-dark">
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
            <td>{{ u.role }}</td>
            <td>{{ formatDate(u.start_time) }}</td>
            <td>{{ formatTime(u.start_time) }} - {{ formatTime(u.end_time) }}</td>
          </tr>
        </tbody>
      </table>
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
      filter: ''
    }
  },
  async created() {
    const user = JSON.parse(localStorage.getItem('user'))
    if (!user || user.role !== 'admin') {
      router.push('/')
      return
    }
    const res = await api.get('/admin/users')
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
      return d.toLocaleDateString() // z.B. 14.09.2025
    },
    formatTime(iso) {
      if (!iso) return '-'
      const d = new Date(iso)
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) // z.B. 11:40
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
