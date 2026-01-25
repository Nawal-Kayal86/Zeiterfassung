<template>
  <div class="container mt-4">
    <p>Hier können Admins und User ihre Arbeitsabläufe verfolgen.</p>

    <!-- Formular -->
    <div class="card p-3 mb-4 shadow-sm">
      <h5 class="mb-3">🆕 Neue Aufgabe hinzufügen</h5>
      <form @submit.prevent="addTask">
        <div class="row g-2 align-items-center">
          <div class="col-md-6">
            <input v-model="newTask" type="text" class="form-control" placeholder="Aufgabe eingeben..." required />
          </div>
          <div class="col-md-3">
            <select v-model="newStatus" class="form-select">
              <option value="open">Offen</option>
              <option value="done">Erledigt</option>
            </select>
          </div>
          <div class="col-md-3">
            <button class="btn btn-primary w-100" type="submit">
              ➕ Hinzufügen
            </button>
          </div>
        </div>
      </form>
    </div>

    <!-- Ladeanzeige -->
    <div v-if="loading" class="alert alert-info">Daten werden geladen...</div>
    <div v-if="error" class="alert alert-danger">{{ error }}</div>

    <!-- Aufgabenliste -->
    <div v-if="tasks.length > 0" class="card shadow-sm p-3">
      <h5 class="mb-3">Aktuelle Aufgaben</h5>
      <table class="table table-striped align-middle">
        <thead>
          <tr>
            <th>Mitarbeiter</th>
            <th>Aufgabe</th>
            <th>Status</th>
            <th>Aktionen</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="t in tasks" :key="t.id">
            <td>{{ t.user?.name || "-" }}</td>
            <td>{{ t.task }}</td>
            <td>
              <span v-if="t.status === 'done'" class="badge bg-success">✅ Erledigt</span>
              <span v-else class="badge bg-warning text-dark">⚠️ Offen</span>
            </td>
            <td>
              <button v-if="t.status !== 'done'" class="btn btn-success btn-sm me-2" @click="markDone(t.id)">
                ✅ Fertig
              </button>
              <button class="btn btn-danger btn-sm" @click="deleteTask(t.id)">
                ❌ Löschen
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
