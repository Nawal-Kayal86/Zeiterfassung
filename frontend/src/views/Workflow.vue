<template>
  <div class="container mt-4">
    <p class="text-muted">Hier können Sie Ihre Arzttermine und Sondertermine erfassen.</p>

    <!-- Formular -->
    <div class="card p-4 mb-4 shadow-sm border-0 bg-white">
      <h5 class="fw-bold mb-3 d-flex align-items-center gap-2">
        <i class="bi bi-hospital text-danger"></i>
        Neun Arzttermin / Sondertermin erfassen
      </h5>
      <form @submit.prevent="addTask">
        <div class="row g-3">
          <div class="col-md-3">
            <div class="input-group">
              <span class="input-group-text bg-light text-muted small fw-bold">GRUND</span>
              <input v-model="newTask" type="text" class="form-control" placeholder="Termin" required />
            </div>
          </div>
          <div class="col-md-3">
            <div class="input-group">
              <span class="input-group-text bg-light text-muted small fw-bold">VON</span>
              <input v-model="startTime" type="time" class="form-control" required />
            </div>
          </div>
          <div class="col-md-3">
            <div class="input-group">
              <span class="input-group-text bg-light text-muted small fw-bold">BIS</span>
              <input v-model="endTime" type="time" class="form-control" required />
            </div>
          </div>
          <div class="col-md-3 d-flex align-items-end">
            <button class="btn btn-indigo w-100 py-2 shadow-sm fw-bold" type="submit">
              <i class="bi bi-calendar-plus"></i> Speichern
            </button>
          </div>
        </div>
      </form>
    </div>

    <!-- Ladeanzeige -->
    <div v-if="loading" class="alert alert-info">Daten werden geladen...</div>
    <div v-if="error" class="alert alert-danger">{{ error }}</div>

    <!-- Terminliste -->
    <div v-if="tasks.length > 0" class="card shadow-sm border-0 bg-white p-0">
      <div class="card-header bg-white py-3 border-0">
        <h5 class="fw-bold mb-0">Meine Termine</h5>
      </div>
      <table class="table table-hover align-middle mb-0">
        <thead class="table-light">
          <tr>
            <th class="ps-4">Mitarbeiter</th>
            <th>Termin / Grund</th>
            <th>Status</th>
            <th class="text-end pe-4">Aktionen</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="t in tasks" :key="t.id">
            <td>{{ t.user?.name || "-" }}</td>
            <td>{{ t.task }}</td>
            <td>
              <span v-if="t.status === 'done'"
                class="badge bg-success-soft text-success border border-success-subtle px-3 rounded-pill">
                Ja
              </span>
              <span v-else class="badge bg-warning-soft text-warning border border-warning-subtle px-3 rounded-pill">
                Nein
              </span>
            </td>
            <td class="text-end pe-4">
              <button v-if="t.status !== 'done'" class="btn btn-sm btn-outline-success me-2" @click="markDone(t.id)">
                Ja
              </button>
              <button class="btn btn-sm btn-outline-danger" @click="deleteTask(t.id)">
                Löschen
              </button>
            </td>
          </tr>
        </tbody>

      </table>

    </div>
    <div v-else-if="!loading" class="alert alert-secondary">
      Keine Aufgaben vorhanden. Fügen Sie eine neue Aufgabe hinzu!
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import api from "../api"

// state
const tasks = ref([])
const loading = ref(true)
const error = ref("")
const newTask = ref("Termin")
// Removed newStatus
const startTime = ref("")
const endTime = ref("")

// user
const user = JSON.parse(localStorage.getItem("user"))

// 🔄 Aufgaben laden
const loadWorkflow = async () => {
  try {
    const res = await api.get("/workflow")
    tasks.value = res.data
  } catch (err) {
    error.value =
      "Fehler beim Laden: " +
      (err.response?.data?.error || err.message)
  } finally {
    loading.value = false
  }
}

// ➕ Neue Aufgabe hinzufügen
const addTask = async () => {
  try {
    if (!startTime.value || !endTime.value) {
      alert("Bitte Start- und Endzeit angeben!")
      return
    }

    // 2-Stunden-Validierung
    const startParts = startTime.value.split(":").map(Number)
    const endParts = endTime.value.split(":").map(Number)

    // Convert to minutes since midnight
    const startMins = startParts[0] * 60 + startParts[1]
    const endMins = endParts[0] * 60 + endParts[1]

    let duration = endMins - startMins
    if (duration < 0) duration += 24 * 60 // Handle overnight if needed, though usually same day

    if (duration > 180) {
      alert("Der Termin darf maximal 3 Stunden dauern!")
      return
    }

    if (duration <= 0) {
      alert("Endzeit muss nach der Startzeit liegen!")
      return
    }

    const taskWithTime = `${newTask.value} (${startTime.value} - ${endTime.value})`

    await api.post("/workflow", {
      task: taskWithTime,
      status: "open" // Default to open
    })

    newTask.value = "Termin"
    // Removed newStatus reset
    startTime.value = ""
    endTime.value = ""
    await loadWorkflow()
  } catch (err) {
    alert(
      "Fehler beim Hinzufügen: " +
      (err.response?.data?.error || err.message)
    )
  }
}


// ✅ Task als erledigt markieren
const markDone = async (id) => {
  try {
    await api.put(`/workflow/${id}/done`)
    await loadWorkflow()
  } catch (err) {
    alert("Fehler beim Abschließen")
  }
}

// ❌ Task löschen
const deleteTask = async (id) => {
  try {
    await api.delete(`/workflow/${id}`)
    await loadWorkflow()
  } catch (err) {
    alert("Fehler beim Löschen")
  }
}

onMounted(loadWorkflow)
</script>

<style scoped>
.btn-indigo {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;
  border: none;
}

.btn-indigo:hover {
  background: linear-gradient(135deg, #818cf8 0%, #6366f1 100%);
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
}

.bg-success-soft {
  background-color: rgba(112, 174, 145, 0.1);
}

.bg-warning-soft {
  background-color: rgba(255, 193, 7, 0.1);
}

.text-success {
  color: #70ae91 !important;
}

.border-success-subtle {
  border-color: rgba(112, 174, 145, 0.3) !important;
}

.btn {
  transition: all 0.2s ease-in-out;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>
