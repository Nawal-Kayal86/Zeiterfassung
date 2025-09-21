<template>
  <div class="container py-5">
    <h2 class="mb-4 fw-bold text-primary">📅 Kalender</h2>

    <!-- FullCalendar -->
    <div class="card shadow-sm p-3 mb-4">
      <FullCalendar
        class="calendar"
        :plugins="[dayGridPlugin]"
        initial-view="dayGridMonth"
        :events="calendarEvents"
        height="auto"
      />
    </div>

    <!-- Tabelle mit allen Sessions -->
    <div class="card shadow-sm p-4">
      <h5 class="mb-3">📋 Arbeitszeiten im Detail</h5>
      <div v-if="!events.length" class="alert alert-info">
        Keine Arbeitszeiten gefunden.
      </div>
      <table v-else class="table table-hover">
        <thead>
          <tr>
            <th>Datum</th>
            <th>Start</th>
            <th>Ende</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(e, index) in events" :key="index">
            <td>{{ formatDate(e.start_time) }}</td>
            <td>{{ formatTime(e.start_time) }}</td>
            <td>{{ formatTime(e.end_time) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import api from '../api'

export default {
  name: "Kalender",
  components: { FullCalendar },
  data() {
    return {
      events: [],
      calendarEvents: []
    }
  },
  async created() {
    try {
      // ✅ Korrekt, weil baseURL = http://localhost:3000/api
      const res = await api.get('/work-sessions')
      this.events = res.data

      // Events für FullCalendar vorbereiten
      this.calendarEvents = this.events.map(e => ({
        title: `🕒 ${this.formatTime(e.start_time)} - ${this.formatTime(e.end_time)}`,
        start: e.start_time,
        end: e.end_time
      }))
    } catch (err) {
      console.error('❌ Fehler beim Laden der Work-Sessions:', err)
    }
  },
  methods: {
    formatDate(iso) {
      if (!iso) return '-'
      return new Date(iso).toLocaleDateString()
    },
    formatTime(iso) {
      if (!iso) return '-'
      return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  }
}
</script>

<style scoped>
.calendar {
  font-family: Arial, sans-serif;
}
.fc .fc-daygrid-event {
  background-color: #0d6efd;
  border: none;
  color: white;
  padding: 2px 6px;
  border-radius: 6px;
  font-size: 0.85rem;
}
.card {
  border-radius: 12px;
}
</style>
