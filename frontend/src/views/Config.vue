<template>
  <div class="container-fluid py-4 px-md-5">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="fw-bold text-dark mb-1">Feiertage & Ferien</h2>
        <p class="text-muted">Verwalten Sie Feiertage und Betriebsferien für das System.</p>
      </div>
      <div class="bg-white p-2 rounded-3 shadow-sm d-flex align-items-center gap-3 border">
        <label class="mb-0 fw-bold small text-muted text-uppercase">Jahr wählen:</label>
        <select v-model="year" @change="loadData" class="form-select form-select-sm border-0 fw-bold"
          style="width: 100px; background: #f8fafc;">
          <option v-for="y in years" :key="y">{{ y }}</option>
        </select>
      </div>
    </div>

    <div class="row g-4">
      <!-- Feiertage Sektion -->
      <div class="col-lg-6">
        <div class="card shadow-sm border-0 h-100 bg-white">
          <div class="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">
            <h5 class="fw-bold mb-0 d-flex align-items-center gap-2">
              <i class="bi bi-calendar-event text-indigo"></i> Feiertage
            </h5>
            <button class="btn btn-sm btn-outline-indigo" @click="fetchFromInternet">
              <i class="bi bi-globe"></i> Aus Internet laden
            </button>
          </div>
          <div class="card-body">
            <div class="holiday-list custom-scrollbar pe-2" style="max-height: 500px; overflow-y: auto;">
              <div v-for="(h, index) in holidays" :key="index"
                class="holiday-item p-2 mb-2 rounded-3 border d-flex align-items-center gap-2 transition-all"
                :class="{ 'border-danger bg-danger-soft': changedHolidays.includes(h.date) }">
                <input v-model="h.date" type="date" class="form-control form-control-sm border-0 bg-light"
                  style="width: 140px;" />
                <input v-model="h.name"
                  class="form-control form-control-sm border-0 bg-transparent flex-grow-1 fw-semibold"
                  placeholder="Name des Feiertags" />
                <button class="btn btn-sm text-danger hover-bg-danger-soft border-0" @click="removeHoliday(index)">
                  <i class="bi bi-trash3"></i>
                </button>
              </div>
            </div>
            <button class="btn btn-indigo-soft w-100 mt-3 fw-bold" @click="addHoliday">
              <i class="bi bi-plus-lg"></i> Feiertag hinzufügen
            </button>
          </div>
        </div>
      </div>

      <!-- Ferien Sektion -->
      <div class="col-lg-6">
        <div class="card shadow-sm border-0 h-100 bg-white">
          <div class="card-header bg-white py-3 border-0">
            <h5 class="fw-bold mb-0 d-flex align-items-center gap-2">
              <i class="bi bi-calendar-range text-indigo"></i> Betriebsferien
            </h5>
          </div>
          <div class="card-body">
            <div class="ferien-list custom-scrollbar pe-2" style="max-height: 500px; overflow-y: auto;">
              <div v-for="(f, index) in ferien" :key="index"
                class="ferien-item p-3 mb-3 rounded-3 border bg-light-soft transition-all">
                <div class="d-flex justify-content-between mb-2">
                  <input v-model="f.name" class="form-control form-control-sm border-0 bg-transparent fw-bold fs-6 p-0"
                    placeholder="Ferien Bezeichnung" />
                  <button class="btn btn-sm text-danger border-0 p-0" @click="removeFerien(index)">
                    <i class="bi bi-trash3"></i>
                  </button>
                </div>
                <div class="d-flex align-items-center gap-2">
                  <input type="date" v-model="f.start" class="form-control form-control-sm border-0 shadow-sm" />
                  <i class="bi bi-arrow-right text-muted"></i>
                  <input type="date" v-model="f.end" class="form-control form-control-sm border-0 shadow-sm" />
                </div>
              </div>
            </div>
            <button class="btn btn-indigo-soft w-100 mt-3 fw-bold" @click="addFerien">
              <i class="bi bi-plus-lg"></i> Ferien hinzufügen
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Save Button Floating -->
    <div class="fixed-bottom p-4 d-flex justify-content-end pointer-events-none">
      <button class="btn btn-indigo shadow-lg px-5 py-3 rounded-pill fw-bold pointer-events-auto transition-3d"
        @click="saveData">
        <i class="bi bi-cloud-check-fill fs-5 me-2"></i> Alles Speichern / Updaten
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import api from "@/api"

const year = ref(new Date().getFullYear())
const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i)
const holidays = ref([])
const ferien = ref([])
const changedHolidays = ref([]) // Feiertage, die sich geändert haben

async function loadData() {
  try {
    const res = await api.get(`/calendar?year=${year.value}`)
    holidays.value = res.data.holidays || []
    ferien.value = res.data.ferien || []
    changedHolidays.value = []
  } catch (e) {
    holidays.value = []
    ferien.value = []
    changedHolidays.value = []
  }
}

async function saveData() {
  try {
    await api.post("/calendar", {
      year: year.value,
      holidays: holidays.value,
      ferien: ferien.value
    })
    changedHolidays.value = []
    alert("✅ Daten gespeichert")
  } catch (e) {
    console.error("Fehler beim Speichern:", e)
    alert("❌ Fehler beim Speichern")
  }
}

function addHoliday() {
  const newDate = new Date().toISOString().slice(0, 10)
  holidays.value.push({ date: newDate, name: "" })
}

function removeHoliday(index) {
  holidays.value.splice(index, 1)
}

function addFerien() {
  ferien.value.push({ name: "", start: new Date().toISOString().slice(0, 10), end: new Date().toISOString().slice(0, 10) })
}

function removeFerien(index) {
  ferien.value.splice(index, 1)
}

async function fetchFromInternet() {
  try {
    const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year.value}/AT`)
    const data = await res.json()

    // Vergleiche mit aktuellen lokalen Feiertagen
    const localDates = holidays.value.map(h => h.date)
    changedHolidays.value = []

    data.forEach(h => {
      if (!localDates.includes(h.date)) {
        holidays.value.push({ date: h.date, name: h.localName })
        changedHolidays.value.push(h.date)
      } else {
        // Prüfe, ob Name sich geändert hat
        const local = holidays.value.find(l => l.date === h.date)
        if (local.name !== h.localName) {
          local.name = h.localName
          changedHolidays.value.push(h.date)
        }
      }
    })

    if (changedHolidays.value.length) {
      alert(`ℹ️ Es gibt ${changedHolidays.value.length} neue oder geänderte Feiertage.`)
    } else {
      alert("✅ Alle Feiertage sind aktuell.")
    }
  } catch (e) {
    console.error(e)
    alert("❌ Fehler beim Laden der Feiertage vom Internet")
  }
}

onMounted(loadData)
</script>

<style scoped>
.text-indigo {
  color: #6366f1 !important;
}

.btn-indigo {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;
  border: none;
}

.btn-indigo-soft {
  background-color: rgba(99, 102, 241, 0.1);
  color: #6366f1;
  border: 1px dashed rgba(99, 102, 241, 0.4);
}

.btn-indigo-soft:hover {
  background-color: rgba(99, 102, 241, 0.15);
}

.bg-light-soft {
  background-color: #f8fafc;
}

.bg-danger-soft {
  background-color: rgba(220, 53, 69, 0.05);
}

.holiday-item:hover,
.ferien-item:hover {
  border-color: #6366f1 !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.transition-all {
  transition: all 0.2s ease-in-out;
}

.transition-3d:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(99, 102, 241, 0.3) !important;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}

.pointer-events-none {
  pointer-events: none;
}

.pointer-events-auto {
  pointer-events: auto;
}
</style>
