<template>
  <div class="calendar">
    <div class="header">
      <button @click="prevMonth">&lt;</button>
      <select v-model="yearRef" @change="loadCalendarData">
        <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
      </select>
      {{ monthName }}
      <button @click="nextMonth">&gt;</button>
    </div>

    <div class="grid header">
      <div>KW</div>
      <div v-for="d in days" :key="d">{{ d }}</div>
    </div>

    <div v-for="week in calendar" :key="week.kw" class="grid week">
      <div class="kw">{{ week.kw }}</div>
      <div v-for="day in week.days" :key="day.date"
           :class="{
             weekend: day.isWeekend,
             holiday: day.holiday,
             ferien: day.ferien
           }">
        <div class="day-number">{{ day.day }}</div>
        <div v-if="day.holiday" class="label">{{ day.holiday }}</div>
        <div v-if="day.ferien" class="label">{{ day.ferien }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from "@/api"

const today = new Date()
const monthRef = ref(today.getMonth())
const yearRef = ref(today.getFullYear())
const years = Array.from({length:10},(_,i)=>today.getFullYear()-5+i)
const days = ["Mo","Di","Mi","Do","Fr","Sa","So"]

const monthName = computed(() => 
  new Date(yearRef.value, monthRef.value).toLocaleString('de-DE',{month:'long'})
)

const holidaysMap = ref({}) // { "YYYY-MM-DD": "Feiertagname" }
const ferienList = ref([]) // [{name, start, end}]

async function loadCalendarData() {
  try {
    const res = await api.get(`/calendar?year=${yearRef.value}`)
    holidaysMap.value = {}
    if(res.data.holidays) {
      res.data.holidays.forEach(h => holidaysMap.value[h.date] = h.name)
    }
    ferienList.value = res.data.ferien || []
  } catch(e) {
    holidaysMap.value = {}
    ferienList.value = []
    console.error(e)
  }
}

function getKW(d){
  const t = new Date(d)
  t.setHours(0,0,0)
  t.setDate(t.getDate() + 3 - (t.getDay()+6)%7)
  const kw1 = new Date(t.getFullYear(),0,4)
  return 1 + Math.round(((t - kw1)/86400000 -3 + (kw1.getDay()+6)%7)/7)
}

function isFerien(date){
  const key = date.toISOString().slice(0,10)
  for(const f of ferienList.value){
    if(key >= f.start && key <= f.end) return f.name
  }
  return null
}

const calendar = computed(() => {
  const firstDay = new Date(yearRef.value, monthRef.value,1)
  const lastDay = new Date(yearRef.value, monthRef.value+1,0)
  const start = new Date(firstDay)
  start.setDate(start.getDate() - ((start.getDay()+6)%7))

  const weeks = []
  let date = new Date(start)

  while(date <= lastDay || weeks.length<6){
    const week = { kw: getKW(date), days: [] }
    for(let i=0;i<7;i++){
      if(date.getMonth()===monthRef.value){
        const key = date.toISOString().slice(0,10)
        week.days.push({
          day: date.getDate(),
          date: new Date(date),
          isWeekend: [0,6].includes(date.getDay()),
          holiday: holidaysMap.value[key] || null,
          ferien: isFerien(date)
        })
      } else week.days.push({ day: '', date: new Date(date) })
      date.setDate(date.getDate()+1)
    }
    weeks.push(week)
  }
  return weeks
})

function prevMonth(){ monthRef.value = (monthRef.value+11)%12 }
function nextMonth(){ monthRef.value = (monthRef.value+1)%12 }

onMounted(loadCalendarData)
</script>

<style>
.calendar { width: 1000px; font-family: sans-serif }
.header { display:flex; justify-content:center; align-items:center; margin-bottom:12px; gap:12px; font-size:18px }
.grid { display:grid; grid-template-columns: 60px repeat(7,1fr); text-align:center; margin-bottom:4px }
.weekend { background:#f0f0f0 }
.holiday { background:#ffcccc }
.ferien { background:#cce0ff }
.kw { font-weight:bold; padding:6px }
.week .day-number { padding:10px; font-size:16px }
.label { font-size:12px; margin-top:2px }
</style>
