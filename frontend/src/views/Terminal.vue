<template>
  <div class="container mt-4">
    <h2 class="mb-4">💻 Terminal</h2>

    <!-- Ladeanzeige -->
    <div v-if="loading" class="alert alert-info">Logs werden geladen...</div>
    <div v-if="error" class="alert alert-danger">{{ error }}</div>

    <!-- Tabelle -->
    <table v-if="logs.length > 0" class="table table-striped table-hover">
      <thead>
        <tr>
          <th>Zeitstempel</th>
          <th>Level</th>
          <th>Nachricht</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="log in logs" :key="log.id">
          <td>{{ formatDateTime(log.created_at) }}</td>
          <td>
            <span v-if="log.level === 'info'">✅ info</span>
            <span v-else-if="log.level === 'warn'">⚠️ warn</span>
            <span v-else-if="log.level === 'error'">❌ error</span>
          </td>
          <td>{{ log.message }}</td>
        </tr>
      </tbody>

    </table>

    <!-- Keine Daten -->
    <div v-else-if="!loading" class="alert alert-warning">
      Keine Logs gefunden.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue"
import api from "../api"

const logs = ref([])
const loading = ref(true)
const error = ref("")
let intervalId = null

// Zeitstempel formatieren
const formatDateTime = (dt) => {
  if (!dt) return "-"
  return new Date(dt).toLocaleString("de-DE")
}

// Logs laden
const loadLogs = async () => {
  try {
    const res = await api.get("/logs")
    // Neueste zuerst, aber mit created_at statt timestamp
    logs.value = res.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  } catch (err) {
    error.value = "Fehler beim Laden: " + (err.response?.data?.error || err.message)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadLogs()
  intervalId = setInterval(loadLogs, 5000) // alle 5 Sek. aktualisieren
})

onUnmounted(() => {
  clearInterval(intervalId)
})
</script>

<style scoped>
h2 {
  font-weight: bold;
  color: #0d6efd;
}

.table {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.badge {
  font-size: 0.9rem;
  padding: 6px 10px;
}
</style>
