<template>
  <div class="container mt-5">
    <h2>Abrechnungsliste</h2>

    <div class="card p-3 mb-4">
      <div class="row g-3">
        <div class="col-md-3">
          <label>Startdatum:</label>
          <input type="date" class="form-control" v-model="startDate" />
        </div>
        <div class="col-md-3">
          <label>Endedatum:</label>
          <input type="date" class="form-control" v-model="endDate" />
        </div>
        <div v-if="user?.role==='admin'" class="col-md-3">
          <label>Mitarbeiter:</label>
          <select class="form-select" v-model="employee">
            <option value="">Alle</option>
            <option v-for="u in usernames" :key="u.id" :value="u.name">{{ u.name }}</option>
          </select>
        </div>
        <div v-if="user?.role==='admin'" class="col-md-3">
          <label>Abteilung:</label>
          <select class="form-select" v-model="department">
            <option value="">Alle</option>
            <option v-for="d in departments" :key="d.id" :value="d.name">{{ d.name }}</option>
          </select>
        </div>
        <div class="col-12 d-flex justify-content-end mt-3">
          <button class="btn btn-primary me-2" @click="fetchData">Abfrage</button>
          <button class="btn btn-secondary" @click="clearFilters">Clear</button>
        </div>
      </div>
    </div>

    <table class="table table-striped table-responsive">
      <thead>
        <tr>
          <th>Mitarbeiter</th>
          <th>Datum</th>
          <th>Zeiten</th>
          <th>Summe Stunden</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(group, key) in groupedData" :key="key">
          <td>{{ group.name }}</td>
          <td>{{ group.date }}</td>
          <td>{{ group.intervals.join(', ') }}</td>
          <td>{{ group.totalHours.toFixed(2) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const fmt = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    return {
      startDate: fmt(firstDay),
      endDate: fmt(today),
      usernames: [],
      departments: [],
      employee: "",
      department: "",
      filteredData: [],
      token: localStorage.getItem("token") || "",
    };
  },

  computed: {
    groupedData() {
      const grouped = {};
      this.filteredData.forEach(item => {
        const dateObj = new Date(item.date_today);
        const dateStr = dateObj.toLocaleDateString("de-AT");
        const key = `${item.name}_${dateStr}`;

        if (!grouped[key]) grouped[key] = { name: item.name, date: dateStr, intervals: [], totalHours: 0 };

        // Zeit-Intervalle
        const start = item.start_time ? this.toViennaTime(item.start_time) : "-";
        const end = item.end_time ? this.toViennaTime(item.end_time) : start;
        grouped[key].intervals.push(`${start}-${end}`);

        // Stunden berechnen
        grouped[key].totalHours += this.calcHours(item.start_time, item.end_time);
      });
      return grouped;
    }
  },

  mounted() {
    this.fetchDepartments();
    this.fetchData();
  },

  methods: {
    toViennaTime(isoStr) {
      if (!isoStr) return "-";
      const dt = new Date(isoStr);
      return dt.toLocaleTimeString("de-AT",{ hour:"2-digit", minute:"2-digit" });
    },

    async fetchDepartments() {
      try {
        const res = await axios.get("http://localhost:3000/api/departments", { headers: { Authorization: `Bearer ${this.token}` } });
        this.departments = res.data;
      } catch { this.departments = []; }
    },

    async fetchData() {
      try {
        const [usersRes, sessionsRes] = await Promise.allSettled([
          axios.get("http://localhost:3000/api/users", { headers: { Authorization: `Bearer ${this.token}` } }),
          axios.get("http://localhost:3000/api/workSessions", { params: { startDate:this.startDate,endDate:this.endDate }, headers:{ Authorization:`Bearer ${this.token}` } }),
        ]);

        if(usersRes.status==="fulfilled") this.usernames = usersRes.value.data.map(u=>({id:u.id,name:u.name,department:u.department||""}));

        if(sessionsRes.status==="fulfilled") {
          let sessions = sessionsRes.value.data.map(s => ({
            ...s,
            name: s.name || "–",
            department: s.department || "–"
          }));
          if(this.employee) sessions = sessions.filter(s=>s.name===this.employee);
          if(this.department) sessions = sessions.filter(s=>s.department===this.department);
          this.filteredData = sessions;
        }
      } catch(err){ console.error(err); }
    },

    calcHours(startISO, endISO) {
      if (!startISO) return 0;
      const s = new Date(startISO);
      const e = endISO ? new Date(endISO) : new Date(startISO);
      if(e < s) e.setDate(e.getDate()+1);
      return (e - s)/3600000;
    },

    clearFilters(){
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const fmt = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      this.startDate = fmt(firstDay);
      this.endDate = fmt(today);
      this.employee = "";
      this.department = "";
      this.fetchData();
    }
  }
};
</script>

<script setup>
const user = JSON.parse(localStorage.getItem("user")) || null;
</script>
