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
            <th>Dauer (h)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="e in events" :key="e.id">
            <td>{{ e.name || '-' }}</td>
            <td>{{ e.department || '-' }}</td>
            <td>{{ formatDate(e.date_today) }}</td>
            <td>{{ e.start_time || '-' }}</td>
            <td>{{ e.end_time || '-' }}</td>
            <td>{{ calcDuration(e.date_today, e.start_time, e.end_time) }}</td>
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

export default {
  name: "Kalender",

  data() {
    return {
      events: []
    };
  },

  async created() {
    try {
      const res = await api.get("/workSessions");
      this.events = res.data; // الترتيب يأتي جاهز من الـ backend
    } catch (err) {
      console.error("Fehler beim Laden der Kalender-Daten:", err);
      this.events = [];
    }
  },

  methods: {
    formatDate(date) {
      if (!date) return "-";
      return new Date(date).toLocaleDateString("de-DE");
    },

    // ✅ حساب المدة بشكل صحيح وبسيط
    calcDuration(date, start, end) {
      if (!date || !start || !end) return "-";

      try {
        const startDate = new Date(`${date}T${start}`);
        let endDate = new Date(`${date}T${end}`);

        // إذا انتهى بعد منتصف الليل
        if (endDate < startDate) {
          endDate.setDate(endDate.getDate() + 1);
        }

        const diffMs = endDate - startDate;
        if (diffMs <= 0) return "-";

        const hours = diffMs / 1000 / 60 / 60;
        return hours.toFixed(2);
      } catch (e) {
        return "-";
      }
    }
  }
};
</script>

<style scoped>
.card {
  border-radius: 12px;
}
</style>
