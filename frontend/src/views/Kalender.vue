<template>
  <div class="container py-5">
    <h2 class="mb-4 fw-bold text-primary">📅 Kalender</h2>

    <div class="card shadow-sm p-4">
      <h5 class="mb-3">📝 Arbeitszeiten im Detail</h5>
      <table class="table table-striped" v-if="events.length">
        <thead>
          <tr>
            <th>DATUM,TAG</th>
            <th>ZEITMODELL_</th>
            <th>STEMPELUNGEN___</th>
            <th>BEWERTUNG_</th>
            <th>IST_</th>
            <th>SOLL</th>
            <th>Ü/TAG</th>
            <th>1:1/TAG</th>
            <th>1:1 GES.</th>
            <th>ZGÜ_</th>
            <th>SAL./GES.</th>
            <th>davon ER</th>
            <th>SAB</th>
            <th>PAUSCH</th>
            <th>BF Verpl</th>
            <th>BF Rest</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(e, i) in events" :key="i">
            <td>{{ formatDateWithWeekday(e.date) }}</td>
            <td>{{ e.zeitmodell }}</td>
            <td>{{ e.stempelungen }}</td>
            <td>{{ e.bewertung || '-' }}</td>
            <td>{{ e.ist }}</td>
            <td>{{ e.soll }}</td>
            <td>{{ e.uebertrag }}</td>
            <td>{{ e.oneToOneTag }}</td>
            <td>{{ e.oneToOneGes }}</td>
            <td>{{ e.zgu }}</td>
            <td>{{ e.salG }}</td>
            <td>{{ e.davonER }}</td>
            <td>{{ e.sab }}</td>
            <td>{{ e.pausch }}</td>
            <td>{{ e.bfVerpl }}</td>
            <td>{{ e.bfRest }}</td>
          </tr>
        </tbody>
      </table>

      <div v-else class="alert alert-info">Keine Arbeitszeiten gefunden.</div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      events: []
    };
  },
  async created() {
    try {
      const res = await axios.get("http://localhost:3000/workSessions");
      this.events = res.data;
    } catch (err) {
      console.error(err);
    }
  },
  methods: {
    formatDateWithWeekday(date) {
      if (!date) return "-";
      const d = new Date(date);
      const weekday = ["So","Mo","Di","Mi","Do","Fr","Sa"][d.getDay()];
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${day}.${month}.${year}, ${weekday}`;
    }
  }
};
</script>

<style scoped>
.card { border-radius: 12px; }
</style>
