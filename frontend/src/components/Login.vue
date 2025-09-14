<template>
  <div class="login">
    <h2>Login</h2>
    <form @submit.prevent="login">
      <input v-model="name" placeholder="Name" required />
      <input v-model="password" type="password" placeholder="Passwort" required />
      <button type="submit">Login</button>
    </form>
    <p v-if="error" style="color:red">{{ error }}</p>
  </div>

<template>
  <div class="container mt-5">
    <h2 class="mb-4">Login</h2>
    <form @submit.prevent="login">
      <div class="mb-3">
        <label class="form-label">Name</label>
        <input v-model="name" class="form-control" placeholder="Name" required />
      </div>
      <div class="mb-3">
        <label class="form-label">Passwort</label>
        <input v-model="password" type="password" class="form-control" placeholder="Passwort" />
      </div>
      <button type="submit" class="btn btn-primary">Login</button>
      <p v-if="error" class="text-danger mt-2">{{ error }}</p>
    </form>
  </div>
</template>


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
