<template>
  <div class="container mt-4">
    <h2 class="mb-4">📋 Anwesenheitsübersicht</h2>

    <div v-if="loading" class="alert alert-info">Daten werden geladen...</div>
    <div v-if="error" class="alert alert-danger">{{ error }}</div>

    <table v-if="attendance.length > 0" class="table table-striped">
      <thead>
        <tr>
          <th>Name</th>
          <th>Rolle</th>
          <th>Abteilung</th>
          <th>Start</th>
          <th>Ende</th>
          <th>Dauer (h)</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="a in attendance" :key="a.id">
          <td>{{ a.name }}</td>
          <td>{{ a.role }}</td>
          <td>{{ a.department || '-' }}</td>
          <td>{{ formatDateTime(a.start_time) }}</td>
          <td>{{ formatDateTime(a.end_time) }}</td>
          <td>{{ calcDuration(a.start_time, a.end_time) }}</td>
        </tr>
      </tbody>
    </table>

    <div v-else-if="!loading" class="alert alert-warning">
      Keine Anwesenheitsdaten gefunden.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import axios from "axios"

const attendance = ref([])
const loading = ref(true)
const error = ref("")

const formatDateTime = (dt) => {
  if (!dt) return "-"
  return new Date(dt).toLocaleString("de-DE")
}

const calcDuration = (start, end) => {
  if (!start || !end) return "-"
  const s = new Date(start)
  const e = new Date(end)
  let diff = (e - s) / 1000 / 60 / 60
  return diff.toFixed(2)
}

const loadData = async () => {
  try {
    const token = localStorage.getItem("token")   // 👈 Token holen
    if (!token) {
      error.value = "Nicht eingeloggt"
      loading.value = false
      return
    }

    const res = await axios.get("http://localhost:3000/api/attendance", {
      headers: {
        Authorization: `Bearer ${token}`   // 👈 Token mitschicken
      }
    })

    attendance.value = res.data
  } catch (err) {
    error.value = "Fehler beim Laden: " + (err.response?.data?.error || err.message)
  } finally {
    loading.value = false
  }
}

onMounted(loadData)

</script>
