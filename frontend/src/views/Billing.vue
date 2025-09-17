<template>
    <div class="container mt-5">
        <h2>Abrechnungsliste</h2>

        <!-- Filterbereich -->
        <div class="card p-3 mb-4">
            <div class="row g-3">
                <div class="col-md-4">
                    <label class="form-label">Startdatum:</label>
                    <input type="date" class="form-control" v-model="startDate">
                </div>

                <div class="col-md-4">
                    <label class="form-label">Endedatum:</label>
                    <input type="date" class="form-control" v-model="endDate">
                </div>

                <div v-if="user?.role === 'admin'" class="col-md-4">
                    <label class="form-label">Mitarbeiter:</label>
                    <select class="form-select" v-model="employee">
                        <option value="">Alle</option>
                        <option v-for="name in usernames" :key="name" :value="name">
                            {{ name }}
                        </option>
                    </select>
                </div>
                <div v-if="user?.role === 'admin'" class="col-md-4">
                    <label class="form-label">Abteilung:</label>
                    <select class="form-select" v-model="department">
                        <option value="">Alle</option>
                        <option value="einkauf">Einkauf</option>
                        <option value="IT">IT</option>
                        <option value="HR">HR</option>
                    </select>
                </div>

                <div class="col-12 d-flex justify-content-end mt-3">
                    <button class="btn btn-primary me-2" @click="fetchData">Abfrage</button>
                    <button class="btn btn-secondary" @click="clearFilters">Clear</button>
                </div>
            </div>
        </div>

        <!-- Abrechnungstabelle -->
        <table class="table table-striped table-responsive">
            <thead>
                <tr>
                    <th>User ID</th>
                    <th>Name</th>
                    <th>Abteilung</th>
                    <th>Start</th>
                    <th>Ende</th>
                    <th>Datum</th>
                    <th>Stunden</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="item in filteredData" :key="item.id">
                    <td>{{ item.user_id }}</td>
                    <td>{{ item.name }}</td>
                    <td>{{ item.department }}</td>
                    <td>{{ item.start_time }}</td>
                    <td>{{ item.end_time }}</td>
                    <td>{{formatDateOnly(item.date_today) }}</td>
                    <td>{{ item.hours }}</td>
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

        const formatDate = (d) => {
            const dd = String(d.getDate()).padStart(2, '0');
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const yyyy = d.getFullYear();
            return `${yyyy}-${mm}-${dd}`;
        };

        return {
            startDate: formatDate(firstDay),
            endDate: formatDate(today),
            employee: "",
            department: "",
            filteredData: [],
            token: localStorage.getItem("token") || ""
        };
    },
    mounted() {
        this.fetchData(); // Korrekt aufrufen
    },
    methods: {
   formatDateOnly(dateStr) {
    if (!dateStr) return '-';
    // Falls es ein ISO-String mit Zeit ist, nur das Datum extrahieren
    const datePart = dateStr.split('T')[0]; // "2025-09-14"
    const parts = datePart.split('-');      // ["2025","09","14"]
    if (parts.length !== 3) return dateStr;
    return `${parts[0]}-${parts[1]}-${parts[2]}`; // DD-MM-YYYY
  },
        async fetchData() {
            try {

    // Beide Requests parallel starten
    const [usersRes, sessionsRes] = await Promise.all([
      axios.get("http://localhost:3000/api/users/names", {
        headers: { Authorization: `Bearer ${this.token}` }
      }),
      axios.get("http://localhost:3000/api/work-sessions", {
        params: {
          startDate: this.startDate,
          endDate: this.endDate,
          employeeName: this.employee,
          department: this.department,
        },
        headers: { Authorization: `Bearer ${this.token}` }
      })
    ]);

    // Usernamen speichern (z. B. für Filter oder Dropdown)
    this.usernames =usersRes.data ;

    // Arbeitszeiten verarbeiten
    this.filteredData = sessionsRes.data.map(item => {
      let hours = "00:00:00";

      if (item.start_time && item.end_time) {
        const [sh, sm, ss] = item.start_time.split(":").map(Number);
        const [eh, em, es] = item.end_time.split(":").map(Number);

        const startSec = sh * 3600 + sm * 60 + ss;
        const endSec = eh * 3600 + em * 60 + es;
        let diffSec = endSec - startSec;

        if (diffSec < 0) diffSec += 24 * 3600; // Über Mitternacht

        const h = String(Math.floor(diffSec / 3600)).padStart(2, "0");
        diffSec %= 3600;
        const m = String(Math.floor(diffSec / 60)).padStart(2, "0");
        const s = String(diffSec % 60).padStart(2, "0");

        hours = `${h}:${m}:${s}`;
      }

      return { ...item, hours };
    });
  } catch (err) {
    console.error(err);
    alert("Fehler beim Laden der Daten");
  }
},

        clearFilters() {
            const today = new Date();
            const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
            const formatDate = (d) => {
                const dd = String(d.getDate()).padStart(2, '0');
                const mm = String(d.getMonth() + 1).padStart(2, '0');
                const yyyy = d.getFullYear();
                return `${yyyy}-${mm}-${dd}`;
            };
            this.startDate = formatDate(firstDay);
            this.endDate = formatDate(today);
            this.employee = "";
            this.department = "";
            this.fetchData();
        }
    }
};
</script>
<script setup>
// Benutzer aus LocalStorage holen (Beispiel)
const user = JSON.parse(localStorage.getItem("user")) || null
</script>