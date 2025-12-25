<template>
  <div class="calendar container py-4">
    <h2 class="mb-4 fw-bold text-primary">📅 Kalender</h2>

    <!-- Header -->
    <div class="d-flex justify-content-center align-items-center gap-3 mb-3">
      <button class="btn btn-outline-secondary" @click="prevMonth">&lt;</button>

      <select v-model="yearRef" class="form-select w-auto" @change="loadCalendarData">
        <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
      </select>

      <strong class="fs-5">{{ monthName }}</strong>

      <button class="btn btn-outline-secondary" @click="nextMonth">&gt;</button>
    </div>

    <!-- Days header -->
    <div class="grid header">
      <div>KW</div>
      <div v-for="d in days" :key="d">{{ d }}</div>
    </div>

    <!-- Calendar -->
    <div v-for="week in calendar" :key="week.kw" class="grid week">
      <div class="kw">{{ week.kw }}</div>

      <div
  v-for="day in week.days"
  :key="day.key"
  class="day"
  :class="{
    weekend: day.isWeekend,
    holiday: day.holiday,
    selected: selectedDate === day.key,
    hasOpen: day.hasOpen,
    hasClosed: day.hasClosed && !day.hasOpen
  }"
  @click="day.day && selectDay(day)"
>

        <div class="day-number">{{ day.day }}</div>

        <!-- ● indicator -->
        <div v-if="day.hasOpen" class="dot red"></div>
        <div v-else-if="day.hasClosed" class="dot green"></div>

        <div v-if="day.holiday" class="label">{{ day.holiday }}</div>
      </div>
    </div>

    <!-- Day details -->
    <div v-if="selectedDate" class="card shadow-sm p-3 mt-4">
      <h5 class="mb-3">📌Details{{ selectedDate }}</h5>

      <table class="table table-sm">
        <thead>
          <tr>
            <th>Mitarbeiter</th>
            <th>Start</th>
            <th>Ende</th>
            <th>Dauer</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="s in daySessions"
            :key="s._id"
            :class="{ 'table-warning': !s.end }"
          >
            <td>{{ s.name }}</td>
            <td>{{ formatTime(s.start) }}</td>
            <td>{{ s.end ? formatTime(s.end) : '-----' }}</td>
            <td>{{ s.end ? calcDuration(s.start, s.end) : liveDuration }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue"
import api from "@/api"
import { formatTime, calcDuration } from "@/utils/time"

const today = new Date()
const monthRef = ref(today.getMonth())
const yearRef = ref(today.getFullYear())
const years = Array.from({ length: 10 }, (_, i) => today.getFullYear() - 5 + i)
const days = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]

const workSessions = ref([])
const selectedDate = ref(null)
const daySessions = ref([])

const timer = ref(null)
const liveDuration = ref("00:00:00")

const monthName = computed(() =>
  new Date(yearRef.value, monthRef.value).toLocaleString("de-DE", { month: "long" })
)

async function loadCalendarData() {
  const res = await api.get("/workSessions")
  workSessions.value = res.data
}

function selectDay(day) {
  selectedDate.value = day.key
  daySessions.value = workSessions.value.filter(
    s => s.start?.slice(0, 10) === day.key
  )
  startLiveTimer()
}

function startLiveTimer() {
  if (timer.value) clearInterval(timer.value)

  const open = daySessions.value.find(s => !s.end)
  if (!open) return

  timer.value = setInterval(() => {
    const diff = new Date() - new Date(open.start)
    const sec = Math.floor(diff / 1000)
    const h = String(Math.floor(sec / 3600)).padStart(2, "0")
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0")
    const s = String(sec % 60).padStart(2, "0")
    liveDuration.value = `${h}:${m}:${s}`
  }, 1000)
}

watch(daySessions, startLiveTimer)

function getKW(d) {
  const t = new Date(d)
  t.setDate(t.getDate() + 3 - ((t.getDay() + 6) % 7))
  const w1 = new Date(t.getFullYear(), 0, 4)
  return 1 + Math.round(((t - w1) / 86400000 - 3 + ((w1.getDay() + 6) % 7)) / 7)
}

const calendar = computed(() => {
  const first = new Date(yearRef.value, monthRef.value, 1)
  const start = new Date(first)
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7))

  const weeks = []
  let date = new Date(start)

  for (let w = 0; w < 6; w++) {
    const week = { kw: getKW(date), days: [] }

    for (let i = 0; i < 7; i++) {
      const key = date.toISOString().slice(0, 10)
      const sessions = workSessions.value.filter(s => s.start?.slice(0, 10) === key)

      week.days.push({
        key,
        day: date.getMonth() === monthRef.value ? date.getDate() : "",
        isWeekend: [0, 6].includes(date.getDay()),
        hasOpen: sessions.some(s => !s.end),
        hasClosed: sessions.some(s => s.end)
      })

      date.setDate(date.getDate() + 1)
    }
    weeks.push(week)
  }
  return weeks
})

function prevMonth() {
  if (monthRef.value === 0) {
    monthRef.value = 11
    yearRef.value--
  } else monthRef.value--
}

function nextMonth() {
  if (monthRef.value === 11) {
    monthRef.value = 0
    yearRef.value++
  } else monthRef.value++
}

onMounted(loadCalendarData)
</script>

<style scoped>
.calendar { max-width: 1100px }
.grid { display: grid; grid-template-columns: 60px repeat(7, 1fr); gap: 4px }
.weekend { background: #daf107 }
.day { border: 1px solid #e24242; min-height: 90px; padding: 4px; cursor: pointer }
.day:hover { background: #eef5ff }
.selected { outline: 2px solid #0dfd69 }
.day-number { font-weight: bold }
.dot { width: 8px; height: 8px; border-radius: 50%; margin: 4px auto }


.day.hasClosed {
  background-color: #e9482cbe; 
}


.day.hasOpen {
  background-color: #0af33c; 
}


.day.selected {
  outline: 2px solid #0d6efd;
  background-color: #dbeafe !important;
}


.day {
  transition: background-color 0.2s ease;
}

</style>
