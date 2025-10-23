<template>
  <div class="container py-5">
    <h2 class="mb-4 fw-bold text-primary">📅 Kalender</h2>

    <div class="card shadow-sm p-4">
      <h5 class="mb-3">📝 Arbeitszeiten im Detail</h5>
      <!-- // todo -->
{{ events }}
      <div v-if="events.length === 0" class="alert alert-info">
        Keine Arbeitszeiten gefunden.
      </div>

      <table v-else class="table table-striped">
        <thead>
          <tr>
            <th>Name</th>
            <th>Abteilung</th>
            <th>Start</th>
            <th>Ende</th>
            <th>Dauer (h)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="e in events" :key="e.id">
           <td>{{ e.user_name || e.name || "-" }}</td>

            <td>{{ e.department || '-' }}</td>
            <td>{{ formatDateTime(e.date_today, e.start_time) }}</td>
            <td>{{ formatDateTime(e.date_today, e.end_time) }}</td>
            <td>{{ calcDuration(e.date_today, e.start_time, e.end_time) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import api from "../api";

export default {
  name: "Kalender",
  data() {
    return {
      events: [],
    };
  },
  methods: {
    // Baut ein gültiges Datum aus date_today + Uhrzeit
    combineDateTime(date, time) {
      if (!date || !time) return null;
      const day = new Date(date);
      // Nur yyyy-mm-dd extrahieren
      const datePart = day.toISOString().split("T")[0];
      return new Date(`${datePart}T${time}`);
    },

    formatDateTime(date, time) {
      const dt = this.combineDateTime(date, time);
      if (!dt) return "-";
      return dt.toLocaleString("de-DE");
    },

    calcDuration(date, start, end) {
      const s = this.combineDateTime(date, start);
      const e = this.combineDateTime(date, end);
      if (!s || !e) return "-";
      const diffMs = e - s;
      const diffHrs = diffMs / 1000 / 60 / 60;
      return diffHrs.toFixed(2);
    },
  },
  async created() {
    try {
      const res = await api.get("/workSessions");
      console.log("✅ Daten vom Backend:", res.data);
      this.events = res.data;
    } catch (err) {
      console.error("❌ Fehler beim Laden:", err);
    }
  },
};
</script>
