<template>
  <div class="container mt-4">

    <div v-if="loading" class="alert alert-info">Lade Fehlerprotokoll...</div>
    <div v-if="error" class="alert alert-danger">{{ error }}</div>

    <table v-if="logs.length > 0" class="table table-striped">
      <thead>
        <tr>
          <th>Benutzer</th>
          <th>Tag</th>
          <th>Nachricht</th>
          <th>Level</th>
          <th>Zeitpunkt</th>
          <th>Aktionen</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="log in logs" :key="log.id">
          <td>{{ log.user_id?.name || 'System' }}</td>
          <td>{{ log.violation_date || '-' }}</td>
          <td>{{ log.message }}</td>
          <td>
            <span :class="getLevelClass(log.level)">
              {{ log.level === 'ERROR' ? 'FEHLER' : log.level === 'WARN' ? 'WARNUNG' : 'INFO' }}
            </span>
          </td>
          <td>{{ formatDateTime(log.created_at) }}</td>
          <td>
            <button class="btn btn-sm btn-outline-primary" @click="openEditModal(log)">
              <i class="bi bi-pencil-square"></i> Bearbeiten / Eintragen
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-else-if="!loading" class="alert alert-warning">
      Keine Fehler gefunden ✅
    </div>

    <!-- Edit/Add Modal -->
    <div v-if="showModal" class="modal fade show d-block" style="background: rgba(0,0,0,0.5)">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Arbeitszeit bearbeiten / eintragen</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <p><strong>Benutzer:</strong> {{ selectedLog?.user_id?.name }}</p>
            <p><strong>Tag:</strong> {{ selectedLog?.violation_date }}</p>

            <form @submit.prevent="saveWorkSession">
              <div class="mb-3">
                <label class="form-label">Startzeit</label>
                <input type="time" v-model="form.start_time" class="form-control" required />
              </div>
              <div class="mb-3">
                <label class="form-label">Endzeit</label>
                <input type="time" v-model="form.end_time" class="form-control" required />
              </div>
              <div class="mb-3">
                <label class="form-label">Pause (HH:mm)</label>
                <input type="text" v-model="form.pause" class="form-control" placeholder="0:30" />
              </div>
              <div class="modal-footer px-0 pb-0">
                <button type="button" class="btn btn-secondary" @click="closeModal">Abbrechen</button>
                <button type="submit" class="btn btn-primary" :disabled="saving">
                  {{ saving ? 'Speichert...' : 'Speichern' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import api from "../api"

const logs = ref([])
const loading = ref(true)
const error = ref("")
const saving = ref(false)
const user = JSON.parse(localStorage.getItem("user") || "{}")
const isAdmin = user.role === 'admin'

const showModal = ref(false)
const selectedLog = ref(null)
const form = ref({
  start_time: "",
  end_time: "",
  pause: "0:30"
})

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

const openEditModal = async (log) => {
  selectedLog.value = log
  form.value = {
    start_time: "08:00",
    end_time: "17:00",
    pause: "0:30"
  }

  // Versuche bestehende Session zu laden falls vorhanden
  try {
    const res = await api.get(`/workSessions?userId=${log.user_id._id}&startDate=${log.violation_date}&endDate=${log.violation_date}`)
    if (res.data.length > 0) {
      const s = res.data[0]
      if (s.start) form.value.start_time = new Date(s.start).toTimeString().slice(0, 5)
      if (s.end) form.value.end_time = new Date(s.end).toTimeString().slice(0, 5)
    }
  } catch (err) {
    console.error("Fehler beim Laden der Session:", err)
  }

  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedLog.value = null
}

const saveWorkSession = async () => {
  saving.value = true
  try {
    const payload = {
      date: selectedLog.value.violation_date,
      start: form.value.start_time,
      end: form.value.end_time,
      pause: form.value.pause,
      userId: selectedLog.value.user_id._id // Admin kann für andere eintragen
    }

    // Wir nutzen einen neuen oder bestehenden Endpunkt, der auch userId akzeptiert
    await api.post("/workSessions/manual-time", payload)

    showModal.value = false
    await loadLogs() // Neu laden um behobene Fehler zu entfernen
  } catch (err) {
    alert("Fehler beim Speichern: " + (err.response?.data?.error || err.message))
  } finally {
    saving.value = false
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
