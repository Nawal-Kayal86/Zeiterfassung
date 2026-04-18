<template>
  <div class="login-wrapper d-flex justify-content-center align-items-center vh-100">
    <div
      class="card login-card shadow-lg border-0 p-5"
      style="max-width: 450px; width: 100%; border-radius: 24px;"
    >
      <!-- Logo/Icon Section -->
      <div class="text-center mb-4">
        <div class="login-icon-box mx-auto mb-3">
          <i class="bi bi-clock-history fs-1 text-white"></i>
        </div>
        <h2 class="fw-bold text-dark mb-1">Willkommen zurück</h2>
        <p class="text-muted">Bitte melde dich an, um fortzufahren</p>
      </div>

      <!-- Formular -->
      <form @submit.prevent="login">
        <div class="mb-3">
          <label class="form-label fw-bold text-muted small ms-1">BENUTZERNAME</label>
          <div class="input-group">
            <span class="input-group-text bg-light border-end-0"><i class="bi bi-person text-indigo"></i></span>
            <input
              v-model="name"
              type="text"
              class="form-control bg-light border-start-0"
              placeholder="Dein Name"
              required
            />
          </div>
        </div>

        <div class="mb-4">
          <label class="form-label fw-bold text-muted small ms-1">PASSWORT</label>
          <div class="input-group">
            <span class="input-group-text bg-light border-end-0"><i class="bi bi-shield-lock text-indigo"></i></span>
            <input
              v-model="password"
              type="password"
              class="form-control bg-light border-start-0"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <button type="submit" class="btn btn-indigo w-100 py-3 fw-bold shadow-sm" style="border-radius: 12px;">
          Anmelden
        </button>

        <p v-if="error" class="text-danger mt-3 text-center">
          {{ error }}
        </p>
      </form>
      <hr />
      <div class="d-grid gap-2">
        <RouterLink to="/" class="btn btn-outline-indigo w-100 py-2 fw-semibold">
          Projektpraesentation ansehen
        </RouterLink>
      </div>

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
import api from "../api";
import router from "../router";
import { RouterLink } from "vue-router";
import { toast } from "vue3-toastify";

export default {
  data() {
    return {
      name: "",
      password: "",
      currentTime: "",
      timer: null,
    };
  },
  methods: {
    async login() {
      try {
        const res = await api.post("/login", {
          name: this.name,
          password: this.password,
        });
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        toast.success(`Willkommen zurück, ${res.data.user.name}! 👋`);
        setTimeout(() => router.push("/dashboard"), 1000);
      } catch (err) {
          // Toast wird bereits durch globalen Interceptor in api.js ausgelöst
      }
    },
    updateTime() {
      const now = new Date();
      const options = {
        weekday: "long",
        day: "numeric",
        month: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      };
      this.currentTime = now.toLocaleDateString("de-DE", options);
    },
  },
  mounted() {
    this.updateTime();
    this.timer = setInterval(this.updateTime, 1000);
  },
  beforeUnmount() {
    clearInterval(this.timer);
  },
};
</script>

<style scoped>
.login-wrapper {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
}

.login-card {
  animation: slide-up 0.6s ease-out;
}

@keyframes slide-up {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.login-icon-box {
  width: 80px;
  height: 80px;
  background: #6366f1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
}

.text-indigo {
    color: #6366f1 !important;
}

.btn-indigo {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;
  border: none;
  transition: all 0.3s;
}

.btn-indigo:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
}

.btn-outline-indigo {
  border: 1px solid rgba(79, 70, 229, 0.18);
  color: #4f46e5;
  background: rgba(99, 102, 241, 0.06);
}

.btn-outline-indigo:hover {
  background: rgba(99, 102, 241, 0.12);
  color: #3730a3;
}

.input-group-text {
    border: none;
}

.form-control {
    border: none;
    padding: 12px;
}

.form-control:focus {
    box-shadow: none;
    background-color: #fff !important;
}
</style>
