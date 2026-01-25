<template>
  <div class="container mt-4">

    <div v-if="loading" class="alert alert-info">Lade Fehlerprotokoll...</div>
    <div v-if="error" class="alert alert-danger">{{ error }}</div>

    <table v-if="logs.length > 0" class="table table-striped">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nachricht</th>
          <th>Level</th>
          <th>Zeitpunkt</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="log in logs" :key="log.id">
          <td>{{ log.id }}</td>
          <td>{{ log.message }}</td>
          <td>
            <span :class="getLevelClass(log.level)">
              {{ log.level === 'ERROR' ? 'FEHLER' : log.level === 'WARN' ? 'WARNUNG' : 'INFO' }}
            </span>
          </td>
          <td>{{ formatDateTime(log.created_at) }}</td>
        </tr>
      </tbody>
    </table>

    <div v-else-if="!loading" class="alert alert-warning">
      Keine Fehler gefunden ✅
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import api from "../api"

const logs = ref([])
const loading = ref(true)
const error = ref("")

const formatDateTime = (dt) => {
  if (!dt) return "-"
  return new Date(dt).toLocaleString("de-DE")
}

const getLevelClass = (level) => {
  switch (level) {
    case "ERROR": return "badge bg-danger"
    case "WARN": return "badge bg-warning text-dark"
    case "INFO": return "badge bg-info text-dark"
    default: return "badge bg-secondary"
  }
}

const loadLogs = async () => {
  try {
    const res = await api.get("/logs")
    logs.value = res.data
  } catch (err) {
    error.value = "Fehler beim Laden: " + (err.response?.data?.error || err.message)
  } finally {
    loading.value = false
  }
}

onMounted(loadLogs)
</script>
