<template >
  <div class="d-flex justify-content-center align-items-center vh-100 bg-light" >
    <div class="card shadow-sm p-4" style="max-width: 400px; width: 100%;">
      <div class="text-center mb-4">
        <h2 class="card-title">Login</h2>
      </div>
      <form @submit.prevent="login">
        <div class="mb-3">
          <label class="form-label">Name</label>
          <input
            v-model="name"
            type="text"
            class="form-control"
            placeholder="Dein Name"
            required
          />
        </div>
        <div class="mb-3">
          <label class="form-label">Passwort</label>
          <input
            v-model="password"
            type="password"
            class="form-control"
            placeholder="Passwort"
            required
          />
        </div>
        <button type="submit" class="btn btn-primary w-100">Login</button>
        <p v-if="error" class="text-danger mt-3 text-center">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script>
import api from '../api'
import router from '../router'

export default {
  data() {
    return { name: '', password: '', error: null }
  },
  methods: {
    async login() {
      try {
        const res = await api.post('/login', { name: this.name, password: this.password })
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('user', JSON.stringify(res.data.user))
        router.push('/') // weiter zum Dashboard
      } catch (err) {
        this.error = err.response?.data?.error || 'Login fehlgeschlagen'
      }
    }
  }
}
</script>

<style scoped>
body {
  margin: 0;
  padding: 0;
}
</style>
