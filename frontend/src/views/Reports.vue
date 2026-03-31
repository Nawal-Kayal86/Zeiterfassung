<template>
  <div class="container py-5">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <p class="text-muted mb-0">
          Übersicht über alle wichtigen Statistiken.
        </p>
      </div>
      <button
        v-if="!loading && !error"
        @click="exportCSV"
        class="btn btn-outline-success"
      >
        📥 als CSV exportieren
      </button>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Laden...</span>
      </div>
    </div>

    <div v-else-if="error" class="alert alert-danger">{{ error }}</div>

    <div v-else class="row g-4">
      <div class="col-md-4">
        <div class="card shadow-sm text-center p-4">
          <h5>👥 Anzahl Benutzer</h5>
          <h2 class="text-primary">{{ stats.userCount ?? "-" }}</h2>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card shadow-sm text-center p-4">
          <h5>⏱️ Gesamtstunden (alle)</h5>
          <h2 class="text-success">{{ formatHours(stats.totalHours) }}</h2>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card shadow-sm text-center p-4">
          <h5>📅 Abteilungen</h5>
          <h2 class="text-warning">{{ stats.departments ?? "-" }}</h2>
        </div>
      </div>
    </div>

    <div v-if="!loading && !error" class="card shadow-sm p-4 mt-5">
      <h5 class="mb-3">🔍 Detaillierte Anwesenheit nach Abteilung</h5>
      <table class="table table-striped">
        <thead>
          <tr>
            <th
              @click="sortTable('department')"
              style="cursor: pointer"
              class="user-select-none"
            >
              Abteilung
              <span v-if="sortColumn === 'department'">{{
                sortDirection === "asc" ? "⬆️" : "⬇️"
              }}</span>
            </th>
            <th
              @click="sortTable('count')"
              style="cursor: pointer"
              class="user-select-none"
            >
              Anzahl Mitarbeiter
              <span v-if="sortColumn === 'count'">{{
                sortDirection === "asc" ? "⬆️" : "⬇️"
              }}</span>
            </th>
            <th
              @click="sortTable('hours')"
              style="cursor: pointer"
              class="user-select-none"
            >
              Gesamtstunden
              <span v-if="sortColumn === 'hours'">{{
                sortDirection === "asc" ? "⬆️" : "⬇️"
              }}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="d in sortedDepartments" :key="d.department">
            <td>{{ d.department }}</td>
            <td>{{ d.count }}</td>
            <td>{{ formatHours(d.hours) }}</td>
          </tr>
          <tr v-if="!stats.byDepartment || stats.byDepartment.length === 0">
            <td colspan="3" class="text-center text-muted">
              Keine Daten vorhanden
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import api from "../api";

const stats = ref({
  userCount: null,
  totalHours: null,
  departments: null,
  byDepartment: [],
});
const loading = ref(true);
const error = ref(null);
const sortColumn = ref("hours"); // Standard: Nach Stunden sortieren
const sortDirection = ref("desc"); // Standard: Absteigend (Meiste zuerst)

// Formatierung für Stunden (z. B. 12,50 h)
const formatHours = (val) => {
  if (val === null || val === undefined) return "-";
  return (
    Number(val).toLocaleString("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + " h"
  );
};

// Sortierte Liste berechnen
const sortedDepartments = computed(() => {
  const list = stats.value.byDepartment || [];
  return [...list].sort((a, b) => {
    let valA = a[sortColumn.value];
    let valB = b[sortColumn.value];
    const modifier = sortDirection.value === "asc" ? 1 : -1;

    if (typeof valA === "string") return valA.localeCompare(valB) * modifier;
    return (valA - valB) * modifier;
  });
});

const sortTable = (col) => {
  if (sortColumn.value === col) {
    sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
  } else {
    sortColumn.value = col;
    sortDirection.value = "desc"; // Bei Spaltenwechsel standardmäßig absteigend
  }
};

// 📥 CSV Export Funktion
const exportCSV = () => {
  const headers = ["Abteilung", "Anzahl Mitarbeiter", "Gesamtstunden"];
  const rows = stats.value.byDepartment.map((d) => [
    d.department,
    d.count,
    Number(d.hours).toLocaleString("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }),
  ]);

  const csvContent = [headers.join(";"), ...rows.map((r) => r.join(";"))].join(
    "\n",
  );
  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  }); // \uFEFF für Excel-Kompatibilität
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `Bericht_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
};

onMounted(async () => {
  try {
    const res = await api.get("/reports");
    stats.value = res.data;
  } catch (err) {
    console.error("Fehler beim Laden der Berichte:", err.message);
    error.value =
      "Die Berichte konnten nicht geladen werden. Bitte prüfe deine Verbindung.";
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.table {
  font-size: 0.95rem;
}

.card h2 {
  font-weight: bold;
}
</style>
