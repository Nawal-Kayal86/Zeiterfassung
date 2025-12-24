<template>
  <div class="container py-5">
    <h2 class="mb-4 fw-bold text-primary">📅 Kalender</h2>

    <div class="card shadow-sm p-4">
      <h5 class="mb-3">📝 Arbeitszeiten im Detail</h5>

      <table class="table table-striped" v-if="events.length">
        <thead>
          <tr>
            <th>Name</th>
            <th>Abteilung</th>
            <th>Datum</th>
            <th>Start</th>
            <th>Ende</th>
            <th>Dauer</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="e in events" :key="e.id">
            <td>{{ e.name }}</td>
            <td>{{ e.department || "-" }}</td>
            <td>{{ formatDate(e.start) }}</td>
            <td>{{ formatTime(e.start) }}</td>
            <td>{{ formatTime(e.end) }}</td>
            <td>{{ calcDuration(e.start, e.end) }}</td>
          </tr>
        </tbody>
      </table>

      <div v-else class="alert alert-info">
        Keine Arbeitszeiten gefunden.
      </div>
    </div>
  </div>
</template>

<script>
import api from "../api";
import { formatDate, formatTime, calcDuration } from "../utils/time";

export default {
  name: "Kalender",
  data() {
    return { events: [] };
  },
  async created() {
    const res = await api.get("/workSessions");
    this.events = res.data;
  },
  methods: {
    formatDate,
    formatTime,
    calcDuration
  }
};
</script>
