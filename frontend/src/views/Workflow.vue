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
          <div class="col-md-6">
            <label class="form-label small fw-bold text-muted">BEZEICHNUNG / GRUND</label>
            <input v-model="newTask" type="text" class="form-control" placeholder="z.B. Zahnarzt, Vorsorge..."
              required />
          </div>
          <div class="col-md-3">
            <label class="form-label small fw-bold text-muted">STATUS</label>
            <select v-model="newStatus" class="form-select">
              <option value="open">Geplant</option>
              <option value="done">Wahrgenommen</option>
            </select>
          </div>
          <div class="col-md-3 d-flex align-items-end">
            <button class="btn btn-indigo w-100 py-2 shadow-sm fw-bold" type="submit">
              <i class="bi bi-calendar-plus"></i> Termin speichern
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
                Wahrgenommen
              </span>
              <span v-else class="badge bg-warning-soft text-warning border border-warning-subtle px-3 rounded-pill">
                Geplant
              </span>
            </td>
            <td class="text-end pe-4">
              <button v-if="t.status !== 'done'" class="btn btn-sm btn-outline-success me-2" @click="markDone(t.id)">
                Wahrgenommen
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
const newTask = ref("")
const newStatus = ref("open")

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
    await api.post("/workflow", {
      task: newTask.value,
      status: newStatus.value
    })

    newTask.value = ""
    newStatus.value = "open"
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
</style>
