<template>
  <div>
    <h2>Dashboard</h2>
    <p>Willkommen, {{ user?.name }} ({{ user?.role }})</p>

    <button @click="start">Arbeitsbeginn</button>
    <button @click="stop">Arbeitsende</button>
    <button @click="logout">Logout</button>

    <div v-if="user?.role === 'admin'">
      <router-link to="/admin">Zur Admin-Seite</router-link>
    </div>
  </div>
</template>

<script>
import api from '../api'
import router from '../router'

export default {
  data() {
    return { user: null }
  },
  created() {
    this.user = JSON.parse(localStorage.getItem('user'))
    if (!this.user) router.push('/login')
  },
  methods: {
    async start() {
      await api.post('/start')
      alert('Arbeitsbeginn erfasst')
    },
    async stop() {
      await api.post('/stop')
      alert('Arbeitsende erfasst')
    },
    logout() {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      router.push('/login')
    }
  }
}
</script>
