<template>
  <div class="login-wrapper d-flex justify-content-center align-items-center min-vh-100 px-3">
    <div class="card login-card shadow-lg border-0 p-4 p-md-5">
      <div class="text-center mb-4">
        <div class="login-icon-box mx-auto mb-3">
          <i class="bi bi-clock-history fs-1 text-white"></i>
        </div>
        <h2 class="fw-bold text-dark mb-1">Willkommen zurueck</h2>
        <p class="text-muted mb-0">Melde dich mit Benutzername oder E-Mail an.</p>
      </div>

      <form @submit.prevent="login">
        <div class="mb-3">
          <label class="form-label fw-bold text-muted small ms-1">
            BENUTZERNAME ODER E-MAIL
          </label>
          <div class="input-group">
            <span class="input-group-text bg-light border-end-0">
              <i class="bi bi-person text-indigo"></i>
            </span>
            <input
              v-model="identifier"
              type="text"
              class="form-control bg-light border-start-0"
              placeholder="z. B. max oder max@firma.at"
              required
            />
          </div>
        </div>

        <div class="mb-4">
          <label class="form-label fw-bold text-muted small ms-1">PASSWORT</label>
          <div class="input-group">
            <span class="input-group-text bg-light border-end-0">
              <i class="bi bi-shield-lock text-indigo"></i>
            </span>
            <input
              v-model="password"
              type="password"
              class="form-control bg-light border-start-0"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <button type="submit" class="btn btn-indigo w-100 py-3 fw-bold shadow-sm" :disabled="loading">
          <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
          {{ loading ? "Anmeldung laeuft..." : "Anmelden" }}
        </button>
      </form>

      <hr />

      <div class="d-grid gap-2">
        <RouterLink to="/presentation" class="btn btn-outline-indigo w-100 py-2 fw-semibold">
          Projektpraesentation ansehen
        </RouterLink>
      </div>

      <div class="text-center mt-4 mb-1 fw-semibold text-slate">
        {{ currentTime }}
      </div>

      <div class="text-center mt-4 small text-muted">
        Zeiterfassung © {{ new Date().getFullYear() }}
      </div>
    </div>
  </div>
</template>

<script>
import { RouterLink } from "vue-router";
import { toast } from "vue3-toastify";
import api from "../api";
import { useAuth } from "../composables/useAuth";
import router from "../router";

export default {
  components: {
    RouterLink,
  },
  data() {
    return {
      identifier: "",
      password: "",
      currentTime: "",
      timer: null,
      loading: false,
    };
  },
  methods: {
    async login() {
      const auth = useAuth();
      this.loading = true;

      try {
        const response = await api.post("/login", {
          identifier: this.identifier,
          password: this.password,
        });

        auth.setSession({
          token: response.data.token,
          user: response.data.user,
        });

        toast.success(`Willkommen zurueck, ${response.data.user.name}!`);
        setTimeout(() => router.push("/dashboard"), 700);
      } catch {
        // Fehler-Toast kommt aus dem zentralen API-Interceptor.
      } finally {
        this.loading = false;
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
  background:
    radial-gradient(circle at top, rgba(129, 140, 248, 0.28), transparent 32%),
    linear-gradient(160deg, #eef2ff 0%, #e0e7ff 45%, #f8fafc 100%);
}

.login-card {
  width: min(100%, 29rem);
  border-radius: 1.5rem;
  animation: slide-up 0.6s ease-out;
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(10px);
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-icon-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: #6366f1;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
}

.text-indigo {
  color: #6366f1 !important;
}

.text-slate {
  color: #334155;
}

.btn-indigo {
  border: none;
  color: white;
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  transition: all 0.2s ease;
}

.btn-indigo:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.25);
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

.input-group-text,
.form-control {
  border: none;
}

.form-control {
  padding: 12px;
}

.form-control:focus {
  box-shadow: none;
  background-color: #fff !important;
}
</style>
