<template>
  <div class="config">
    <h2>Kalender-Konfiguration</h2>

    <label>
      Jahr:
      <select v-model="year" @change="loadData">
        <option v-for="y in years" :key="y">{{ y }}</option>
      </select>
    </label>

    <button class="fetch-btn" @click="fetchFromInternet">🌐 Feiertage vom Internet laden</button>

    <section>
      <h3>Feiertage</h3>
      <ul>
        <li v-for="h in holidays" :key="h.date" :style="{color: changedHolidays.includes(h.date) ? 'red' : 'black'}">
          <input v-model="h.name" /> - {{ h.date }}
          <button @click="removeHoliday(h.date)">✖</button>
          <span v-if="changedHolidays.includes(h.date)"> (neu/geändert)</span>
        </li>
      </ul>
      <button @click="addHoliday">+ Feiertag hinzufügen</button>
    </section>

    <section>
      <h3>Ferien</h3>
      <ul>
        <li v-for="f in ferien" :key="f.name">
          <input v-model="f.name" />: 
          <input type="date" v-model="f.start" /> → 
          <input type="date" v-model="f.end" />
          <button @click="removeFerien(f.name)">✖</button>
        </li>
      </ul>
      <button @click="addFerien">+ Ferien hinzufügen</button>
    </section>

    <button class="save-btn" @click="saveData">Speichern / Updaten</button>
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

function removeHoliday(date) {
  holidays.value = holidays.value.filter(h => h.date !== date)
  changedHolidays.value = changedHolidays.value.filter(d => d !== date)
}

function addFerien() {
  ferien.value.push({ name: "", start: new Date().toISOString().slice(0, 10), end: new Date().toISOString().slice(0, 10) })
}

function removeFerien(name) {
  ferien.value = ferien.value.filter(f => f.name !== name)
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
.config { padding: 20px; max-width: 700px; border: 1px solid #ccc; }
label { display:block; margin-bottom: 12px; font-weight: bold; }
h3 { margin-top: 16px; }
ul { list-style:none; padding:0; }
li { margin-bottom: 6px; }
input[type="text"], input[type="date"] { margin-right: 6px; }
button { margin-left: 6px; }
.save-btn, .fetch-btn { margin-top: 20px; padding: 8px 16px; font-weight: bold; }
.fetch-btn { background-color:#eef; }
</style>
