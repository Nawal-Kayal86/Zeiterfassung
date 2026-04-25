<template>
  <div class="container-fluid py-4 px-md-5">
    <div class="page-header">
      <div>
        <h2 class="fw-bold mb-1">Berichte</h2>
        <p class="text-muted mb-0">
          Zentrale Kennzahlen fuer Team, Zeiten und Abteilungen.
        </p>
      </div>

      <button
        v-if="canExport"
        type="button"
        class="btn btn-success"
        @click="exportCsv"
      >
        <i class="bi bi-download me-2"></i>CSV exportieren
      </button>
    </div>

    <div v-if="loading" class="state-card text-center">
      <div class="spinner-border text-primary mb-3" role="status">
        <span class="visually-hidden">Laden...</span>
      </div>
      <p class="text-muted mb-0">Berichte werden geladen...</p>
    </div>

    <div v-else-if="error" class="alert alert-danger border-0 shadow-sm">
      <strong>Berichte konnten nicht geladen werden.</strong>
      <div class="small mt-1">{{ error }}</div>
    </div>

    <template v-else>
      <div class="row g-4">
        <div class="col-md-4" v-for="card in summaryCards" :key="card.label">
          <section class="metric-card shadow-sm">
            <span class="metric-icon">
              <i :class="card.icon"></i>
            </span>
            <div>
              <p class="metric-label">{{ card.label }}</p>
              <h3 class="metric-value mb-0">{{ card.value }}</h3>
            </div>
          </section>
        </div>
      </div>

      <section class="report-card shadow-sm mt-4">
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
          <div>
            <h5 class="fw-bold mb-1">Anwesenheit nach Abteilung</h5>
            <p class="text-muted small mb-0">
              Sortierbare Uebersicht ueber Mitarbeiterzahl und Stunden.
            </p>
          </div>
        </div>

        <div class="table-responsive">
          <table class="table align-middle mb-0">
            <thead>
              <tr>
                <th class="sortable" @click="sortTable('department')">
                  Abteilung
                  <span v-if="sortColumn === 'department'">{{ sortIndicator }}</span>
                </th>
                <th class="sortable text-end" @click="sortTable('count')">
                  Mitarbeiter
                  <span v-if="sortColumn === 'count'">{{ sortIndicator }}</span>
                </th>
                <th class="sortable text-end" @click="sortTable('hours')">
                  Gesamtstunden
                  <span v-if="sortColumn === 'hours'">{{ sortIndicator }}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="entry in sortedDepartments" :key="entry.department">
                <td>{{ entry.department }}</td>
                <td class="text-end">{{ entry.count }}</td>
                <td class="text-end fw-semibold">{{ formatHours(entry.hours) }}</td>
              </tr>
              <tr v-if="sortedDepartments.length === 0">
                <td colspan="3" class="text-center text-muted py-4">
                  Noch keine Berichtsdaten vorhanden.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import api from "../api";

const stats = ref({
  userCount: 0,
  totalHours: 0,
  departments: 0,
  byDepartment: [],
});
const loading = ref(true);
const error = ref("");
const sortColumn = ref("hours");
const sortDirection = ref("desc");

const canExport = computed(() => !loading.value && !error.value && stats.value.byDepartment.length > 0);

const sortIndicator = computed(() => (sortDirection.value === "asc" ? "↑" : "↓"));

const summaryCards = computed(() => [
  {
    label: "Benutzer",
    value: stats.value.userCount ?? "-",
    icon: "bi bi-people-fill",
  },
  {
    label: "Gesamtstunden",
    value: formatHours(stats.value.totalHours),
    icon: "bi bi-clock-history",
  },
  {
    label: "Abteilungen",
    value: stats.value.departments ?? "-",
    icon: "bi bi-building-fill",
  },
]);

const sortedDepartments = computed(() => {
  return [...(stats.value.byDepartment || [])].sort((left, right) => {
    const leftValue = left[sortColumn.value];
    const rightValue = right[sortColumn.value];
    const modifier = sortDirection.value === "asc" ? 1 : -1;

    if (typeof leftValue === "string") {
      return leftValue.localeCompare(rightValue) * modifier;
    }

    return (leftValue - rightValue) * modifier;
  });
});

onMounted(loadReports);

async function loadReports() {
  loading.value = true;
  error.value = "";

  try {
    const response = await api.get("/reports");
    stats.value = response.data;
  } catch (err) {
    error.value =
      err.response?.status === 403
        ? "Zugriff verweigert. Berichte sind nur fuer Administratoren verfuegbar."
        : "Bitte pruefe deine Verbindung und versuche es erneut.";
  } finally {
    loading.value = false;
  }
}

function sortTable(column) {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
    return;
  }

  sortColumn.value = column;
  sortDirection.value = column === "department" ? "asc" : "desc";
}

function formatHours(value) {
  if (value === null || value === undefined) {
    return "-";
  }

  return `${Number(value).toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} h`;
}

function exportCsv() {
  const headers = ["Abteilung", "Anzahl Mitarbeiter", "Gesamtstunden"];
  const rows = stats.value.byDepartment.map((entry) => [
    entry.department,
    entry.count,
    Number(entry.hours).toLocaleString("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }),
  ]);

  const csvContent = [headers.join(";"), ...rows.map((row) => row.join(";"))].join("\n");
  const blob = new Blob([`\uFEFF${csvContent}`], {
    type: "text/csv;charset=utf-8;",
  });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `Berichte_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}
</script>

<style scoped>
.page-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.state-card,
.report-card,
.metric-card {
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  background: #fff;
}

.state-card,
.report-card {
  padding: 1.5rem;
}

.metric-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.4rem;
}

.metric-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 0.9rem;
  background: #eef2ff;
  color: #4338ca;
  font-size: 1.25rem;
}

.metric-label {
  margin-bottom: 0.2rem;
  font-size: 0.85rem;
  text-transform: uppercase;
  color: #64748b;
}

.metric-value {
  color: #0f172a;
}

.sortable {
  cursor: pointer;
  user-select: none;
}
</style>
