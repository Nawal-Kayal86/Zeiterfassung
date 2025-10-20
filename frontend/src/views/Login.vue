<template>
  <div class="d-flex justify-content-center align-items-center vh-100 bg-light">
    <div class="card shadow-lg border-0 p-4" style="max-width: 400px; width: 100%;">
      <!-- Titel -->
      <div class="text-center mb-4">
        <h3 class="fw-bold text-dark">Benutzeranmeldung</h3>
      </div>
      <!-- Meldungen -->
      <div v-if="message.text" :class="`alert alert-${message.type}`" role="alert">
        {{ message.text }}
      </div>

      <!-- Formular -->
      <form @submit.prevent="login">
        <div class="mb-3">
          <label class="form-label">Benutzername</label>
          <input v-model="name" type="text" class="form-control" placeholder="z. B. MaxMuster" required />
        </div>

        <div class="mb-3">
          <label class="form-label">Passwort</label>
          <input v-model="password" type="password" class="form-control" placeholder="••••••••" required />
        </div>

        <button type="submit" class="btn btn-primary w-100">
          Anmelden
        </button>

        <p v-if="error" class="text-danger mt-3 text-center">
          {{ error }}
        </p>
      </form>
      <hr>
      <!-- Uhrzeit -->
      <div class="text-center mb-1 fw-semibold">
        {{ currentTime }}
      </div>

      <!-- Footer -->
      <div class="text-center mt-4 small text-muted">
        ⏱ Zeiterfassung © {{ new Date().getFullYear() }}
      </div>
    </div>
  </div>
</template>

<script>
import api from "../api"
import router from "../router"

export default {
  data() {
    return {
      name: "",
      password: "",
      error: null,
      currentTime: "",
      timer: null,
      message: { text: "", type: "" }, // Bootstrap Alert
    }
  },
  methods: {
    async login() {
      try {
        const res = await api.post("/login", {
          name: this.name,
          password: this.password,
        })
        localStorage.setItem("token", res.data.token)
        localStorage.setItem("user", JSON.stringify(res.data.user))
        router.push("/dashboard")
      } catch (err) {
        this.message = {
          text: err.response?.data?.error || "Login fehlgeschlagen",
          type: "danger",
        }
      }
      setTimeout(() => {
        this.message = { text: "", type: "" }
      }, 3000)
    },
    updateTime() {
      const now = new Date()
      const options = {
        weekday: "long",
        day: "numeric",
        month: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }
      this.currentTime = now.toLocaleDateString("de-DE", options)
    },
  },
  mounted() {
    this.updateTime()
    this.timer = setInterval(this.updateTime, 1000)
  },
  beforeUnmount() {
    clearInterval(this.timer)
  },
}
</script>
