<template>
  <div class="container py-5">
    <h2 class="fw-bold text-primary mb-4">📊 Berichte</h2>
    <p class="mb-4">Hier findest du eine Übersicht über alle wichtigen Statistiken deines Unternehmens.</p>

    <div class="row g-4">
      <div class="col-md-4">
        <div class="card shadow-sm text-center p-4">
          <h5>👥 Anzahl Benutzer</h5>
          <h2 class="text-primary">{{ stats.userCount ?? '-' }}</h2>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card shadow-sm text-center p-4">
          <h5>⏱️ Gesamtstunden (alle)</h5>
          <h2 class="text-success">{{ stats.totalHours ?? '-' }}</h2>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card shadow-sm text-center p-4">
          <h5>📅 Abteilungen</h5>
          <h2 class="text-warning">{{ stats.departments ?? '-' }}</h2>
        </div>
      </div>
    </div>

    <div class="card shadow-sm p-4 mt-5">
      <h5 class="mb-3">🔍 Detaillierte Anwesenheit nach Abteilung</h5>
      <table class="table table-striped">
        <thead>
          <tr>
            <th>Abteilung</th>
            <th>Anzahl Mitarbeiter</th>
            <th>Gesamtstunden</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="d in stats.byDepartment" :key="d.department">
            <td>{{ d.department }}</td>
            <td>{{ d.count }}</td>
            <td>{{ d.hours }}</td>
          </tr>
          <tr v-if="!stats.byDepartment || stats.byDepartment.length === 0">
            <td colspan="3" class="text-center text-muted">Keine Daten vorhanden</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const stats = ref({
  userCount: null,
  totalHours: null,
  departments: null,
  byDepartment: []
})

onMounted(async () => {
  try {
    const res = await axios.get('http://localhost:3000/api/reports')
    stats.value = res.data
  } catch (err) {
    console.error('Fehler beim Laden der Berichte:', err.message)
  }
})
</script>

<style scoped>
.table {
  font-size: 0.95rem;
}
.card h2 {
  font-weight: bold;
}
</style>
