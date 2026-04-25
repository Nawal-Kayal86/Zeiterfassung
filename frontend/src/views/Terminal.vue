<template>
  <div class="container-fluid py-4 px-md-5">
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div>
        <h2 class="fw-bold mb-1">Terminal</h2>
        <p class="text-muted mb-0">
          Sicherheits-, Anmelde- und Validierungsprotokolle der Anwendung.
        </p>
      </div>
      <span class="badge rounded-pill text-bg-light border px-3 py-2">
        {{ logs.length }} Eintraege
      </span>
    </div>

    <div v-if="loading" class="panel text-center">
      <div class="spinner-border text-primary mb-3" role="status">
        <span class="visually-hidden">Laden...</span>
      </div>
      <p class="text-muted mb-0">Protokolle werden geladen...</p>
    </div>

    <div v-else-if="error" class="alert alert-danger border-0 shadow-sm">
      {{ error }}
    </div>

    <div v-else class="panel">
      <div v-if="logs.length === 0" class="empty-state">
        <i class="bi bi-journal-text empty-icon"></i>
        <h5 class="fw-bold mb-2">Noch keine Protokolle vorhanden</h5>
        <p class="text-muted mb-0">
          Hier erscheinen unter anderem fehlgeschlagene Anmeldungen, Passwortaenderungen
          und Validierungshinweise.
        </p>
      </div>

      <div v-else class="table-responsive">
        <table class="table align-middle mb-0">
          <thead>
            <tr>
              <th>Zeit</th>
              <th>Level</th>
              <th>Meldung</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in logs" :key="log._id || log.id">
              <td class="text-nowrap">{{ formatDateTime(log.created_at) }}</td>
              <td>
                <span class="badge" :class="badgeClass(log.level)">
                  {{ levelLabel(log.level) }}
                </span>
              </td>
              <td>{{ log.message }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import api from "../api";

const logs = ref([]);
const loading = ref(true);
const error = ref("");
let intervalId = null;

onMounted(() => {
  loadLogs();
  intervalId = window.setInterval(loadLogs, 5000);
});

onUnmounted(() => {
  window.clearInterval(intervalId);
});

async function loadLogs() {
  try {
    const response = await api.get("/logs");
    logs.value = [...response.data].sort(
      (left, right) => new Date(right.created_at) - new Date(left.created_at),
    );
    error.value = "";
  } catch (err) {
    error.value = `Fehler beim Laden: ${err.response?.data?.error || err.message}`;
  } finally {
    loading.value = false;
  }
}

function formatDateTime(value) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString("de-DE");
}

function normalizeLevel(level) {
  return String(level || "").toUpperCase();
}

function levelLabel(level) {
  const normalized = normalizeLevel(level);

  if (normalized === "ERROR") return "Fehler";
  if (normalized === "WARN" || normalized === "WARNING") return "Warnung";
  if (normalized === "INFO") return "Info";
  return normalized || "-";
}

function badgeClass(level) {
  const normalized = normalizeLevel(level);

  if (normalized === "ERROR") return "bg-danger";
  if (normalized === "WARN" || normalized === "WARNING") return "bg-warning text-dark";
  if (normalized === "INFO") return "bg-info text-dark";
  return "bg-secondary";
}
</script>

<style scoped>
.panel {
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  background: #fff;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
}

.empty-state {
  padding: 2rem 1rem;
  text-align: center;
}

.empty-icon {
  font-size: 2rem;
  color: #6366f1;
}

thead th {
  font-size: 0.8rem;
  text-transform: uppercase;
  color: #64748b;
}
</style>
