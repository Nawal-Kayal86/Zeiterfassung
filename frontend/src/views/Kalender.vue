<template>
  <div class="calendar-container">
    <h2 class="title">📅 Kalender</h2>

    <!-- Header -->
    <div class="calendar-header">
      <button @click="prevMonth">‹</button>

      <select v-model="yearRef" @change="loadData">
        <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
      </select>

      <strong>{{ monthName }}</strong>

      <button @click="nextMonth">›</button>
    </div>

    <!-- Calendar Wrapper (scroll on mobile) -->
    <div class="calendar-scroll">
      <div class="grid header">
        <div class="kw-col">KW</div>
        <div v-for="d in days" :key="d">{{ d }}</div>
      </div>

      <div
        v-for="week in calendar"
        :key="week.kw"
        class="grid week"
      >
        <div class="kw-col">{{ week.kw }}</div>

        <div
          v-for="day in week.days"
          :key="day.key"
          class="day"
          :class="{
            weekend: day.isWeekend,
            holiday: day.holiday,
            open: day.hasOpen,
            closed: day.hasClosed && !day.hasOpen,
            selected: selectedDate === day.key
          }"
          :title="day.tooltip"
          @click="selectDay(day)"
        >
          <div class="day-number">{{ day.day }}</div>

          <div v-if="day.hasOpen" class="dot red"></div>
          <div v-else-if="day.hasClosed" class="dot green"></div>

          <div v-if="day.holiday" class="label">{{ day.holiday }}</div>
        </div>
      </div>
    </div>

    <!-- Details -->
    <div v-if="dayDetails.length" class="details">
      <h4>📌 Details {{ selectedDate }}</h4>

      <div class="details-scroll">
        <table>
          <thead>
            <tr>
              <th>Mitarbeiter</th>
              <th>Start</th>
              <th>Ende</th>
              <th>Dauer</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in dayDetails" :key="s._id">
              <td>{{ s.name }}</td>
              <td>{{ formatTime(s.start) }}</td>
              <td>{{ s.end ? formatTime(s.end) : '-----' }}</td>
              <td>{{ calcDuration(s.start, s.end) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, computed, onMounted } from "vue"
import api from "@/api"
import { formatTime, calcDuration } from "@/utils/time"

/* ------------------ helpers ------------------ */
function toLocalKey(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function getKW(d) {
  const date = new Date(d)
  date.setHours(0, 0, 0)
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7))
  const kw1 = new Date(date.getFullYear(), 0, 4)
  return (
    1 +
    Math.round(
      ((date - kw1) / 86400000 - 3 + ((kw1.getDay() + 6) % 7)) / 7
    )
  )
}

/* ------------------ state ------------------ */
const today = new Date()
const monthRef = ref(today.getMonth())
const yearRef = ref(today.getFullYear())
const years = Array.from({ length: 10 }, (_, i) => today.getFullYear() - 5 + i)

const days = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]

const workSessions = ref([])
const holidays = ref({})
const selectedDate = ref(null)
const dayDetails = ref([])

/* ------------------ computed ------------------ */
const monthName = computed(() =>
  new Date(yearRef.value, monthRef.value).toLocaleString("de-DE", {
    month: "long"
  })
)

const calendar = computed(() => {
  const first = new Date(yearRef.value, monthRef.value, 1)
  const start = new Date(first)
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7))

  const weeks = []
  let date = new Date(start)

  for (let w = 0; w < 6; w++) {
    const week = { kw: getKW(date), days: [] }

    for (let i = 0; i < 7; i++) {
      const key = toLocalKey(date)
      const sessions = workSessions.value.filter(
        s => toLocalKey(new Date(s.start)) === key
      )

      week.days.push({
        key,
        day: date.getMonth() === monthRef.value ? date.getDate() : "",
        isWeekend: [0, 6].includes(date.getDay()),
        hasOpen: sessions.some(s => !s.end),
        hasClosed: sessions.some(s => s.end),
        holiday: holidays.value[key] || null,
        tooltip: sessions.length
          ? `${sessions.length} Sitzung(en)`
          : ""
      })

      date.setDate(date.getDate() + 1)
    }

    weeks.push(week)
  }

  return weeks
})

/* ------------------ actions ------------------ */
async function loadData() {
  const res = await api.get("/workSessions")
  workSessions.value = res.data

  const h = await api.get(`/calendar?year=${yearRef.value}`)
  holidays.value = {}
  h.data?.holidays?.forEach(x => (holidays.value[x.date] = x.name))
}

function selectDay(day) {
  selectedDate.value = day.key
  dayDetails.value = workSessions.value.filter(
    s => toLocalKey(new Date(s.start)) === day.key
  )
}

function prevMonth() {
  if (monthRef.value === 0) {
    monthRef.value = 11
    yearRef.value--
    loadData()
  } else monthRef.value--
}

function nextMonth() {
  if (monthRef.value === 11) {
    monthRef.value = 0
    yearRef.value++
    loadData()
  } else monthRef.value++
}

onMounted(loadData)
</script>

<style scoped>
.calendar-container {
  max-width: 1100px;
  margin: auto;
  padding: 10px;
}

.title {
  text-align: center;
  margin-bottom: 15px;
}

/* Header */
.calendar-header {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

/* Horizontal scroll on small screens */
.calendar-scroll {
  overflow-x: auto;
}

/* Grid */
.grid {
  display: grid;
  grid-template-columns: 50px repeat(7, minmax(80px, 1fr));
  min-width: 700px;
}

.header {
  font-weight: bold;
  background: #f8f8f8;
}

.week {
  margin-bottom: 4px;
}

/* KW column */
.kw-col {
  font-weight: bold;
  text-align: center;
  padding: 6px;
}

/* Day cell */
.day {
  border: 1px solid #ddd;
  min-height: 70px;
  position: relative;
  cursor: pointer;
  padding: 4px;
}

/* Colors */
.weekend {
  background: #e7dd1d;
}

.holiday {
  background: #d15d5d;
}

.open {
  background: #ffe6e6;
}

.closed {
  background: #729772;
}

.selected {
  outline: 2px solid #007bff;
}

/* Content */
.day-number {
  font-weight: bold;
  font-size: 14px;
}

.label {
  font-size: 11px;
  margin-top: 2px;
}

/* Dot */
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  position: absolute;
  bottom: 6px;
  right: 6px;
}

.red {
  background: red;
}

.green {
  background: green;
}

/* Details */
.details {
  margin-top: 20px;
}

.details-scroll {
  overflow-x: auto;
}

/* Table */
table {
  width: 100%;
  border-collapse: collapse;
  min-width: 400px;
}

th,
td {
  border: 1px solid #ddd;
  padding: 6px;
  text-align: center;
  font-size: 14px;
}

/* 📱 Mobile tweaks */
@media (max-width: 768px) {
  .grid {
    grid-template-columns: 40px repeat(7, 90px);
  }

  .day {
    min-height: 90px;
  }

  .day-number {
    font-size: 16px;
  }

  .label {
    font-size: 12px;
  }
}

</style>
