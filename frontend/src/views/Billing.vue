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


                <!-- Mitarbeiter Filter -->
                <div v-if="user?.role === 'admin'" class="col-md-4">
                    <label class="form-label">Mitarbeiter:</label>
                    <select class="form-select" v-model="employee">
                        <option value="">Alle</option>
                        <option v-for="u in usernames" :key="u.id" :value="u.name">
                            {{ u.name }}
                        </option>
                    </select>
                </div>


                <!-- Dynamische Abteilungen -->
                <div v-if="user?.role === 'admin'" class="col-md-4">
                    <label class="form-label">Abteilung:</label>
                    <select class="form-select" v-model="department">
                        <option value="">Alle</option>
                        <option v-for="dep in departments" :key="dep" :value="dep">
                            {{ dep.name }}
                        </option>
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
                    <td>{{ formatDateOnly(item.date_today) }}</td>
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
            const dd = String(d.getDate()).padStart(2, "0");
            const mm = String(d.getMonth() + 1).padStart(2, "0");
            const yyyy = d.getFullYear();
            return `${yyyy}-${mm}-${dd}`;
        };

        return {
            startDate: formatDate(firstDay),
            endDate: formatDate(today),
            usernames: [],        // Array von Objekten {id, name, department}
            departments: [],      // reactive Daten jetzt korrekt
            employee: "",
            department: "",
            filteredData: [],
            token: localStorage.getItem("token") || "",
        };
    },

    mounted() {
        this.fetchDepartments();
        this.fetchData();
    },

    methods: {
        formatDateOnly(dateStr) {
            if (!dateStr) return "-";
            const datePart = dateStr.split("T")[0];
            const parts = datePart.split("-");
            if (parts.length !== 3) return dateStr;
            return `${parts[0]}-${parts[1]}-${parts[2]}`;
        },

        async fetchDepartments() {
            try {
                const res = await axios.get("http://localhost:3000/api/departments", {
                    headers: { Authorization: `Bearer ${this.token}` },
                });
                this.departments = res.data; // [{id, name}]
            } catch (err) {
                console.error("Fehler beim Laden der Abteilungen:", err.response?.data || err.message);
                this.departments = [];
            }
        },

        async fetchData() {
            try {
                if (!this.token) throw new Error("Kein Token vorhanden");

                const [usersRes, sessionsRes] = await Promise.allSettled([
                    axios.get("http://localhost:3000/api/users", {
                        headers: { Authorization: `Bearer ${this.token}` },
                    }),
                    axios.get("http://localhost:3000/api/work-sessions", {
                        params: {
                            startDate: this.startDate,
                            endDate: this.endDate,
                            employeeName: this.employee,
                            department: this.department,
                        },
                        headers: { Authorization: `Bearer ${this.token}` },
                    }),
                ]);

                // 🧑 Userliste
                if (usersRes.status === "fulfilled") {
                    this.usernames = usersRes.value.data.map(u => ({
                        id: u.id,
                        name: u.name,
                        department: u.department || ""
                    }));
                } else {
                    console.error(
                        "Fehler beim Laden der Usernamen:",
                        usersRes.reason.response?.data || usersRes.reason.message
                    );
                    this.usernames = [];
                }

                // 🕒 Arbeitszeiten
                if (sessionsRes.status === "fulfilled") {
                    this.filteredData = sessionsRes.value.data.map(item => {
                        let hours = "00:00:00";

                        if (item.start_time && item.end_time) {
                            const [sh, sm, ss] = item.start_time.split(":").map(Number);
                            const [eh, em, es] = item.end_time.split(":").map(Number);

                            let diffSec = eh * 3600 + em * 60 + es - (sh * 3600 + sm * 60 + ss);
                            if (diffSec < 0) diffSec += 24 * 3600;

                            const h = String(Math.floor(diffSec / 3600)).padStart(2, "0");
                            diffSec %= 3600;
                            const m = String(Math.floor(diffSec / 60)).padStart(2, "0");
                            const s = String(diffSec % 60).padStart(2, "0");
                            hours = `${h}:${m}:${s}`;
                        }

                        return {
                            ...item,
                            hours,
                            name: item.name || "–",
                            department: item.department || "–"
                        };
                    });
                } else {
                    console.error(
                        "Fehler beim Laden der Sessions:",
                        sessionsRes.reason.response?.data || sessionsRes.reason.message
                    );
                    this.filteredData = [];
                }
            } catch (err) {
                console.error("FetchData Fehler:", err.message);
                alert("Fehler beim Laden der Daten");
            }
        },

        clearFilters() {
            const today = new Date();
            const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

            const formatDate = (d) => {
                const dd = String(d.getDate()).padStart(2, "0");
                const mm = String(d.getMonth() + 1).padStart(2, "0");
                const yyyy = d.getFullYear();
                return `${yyyy}-${mm}-${dd}`;
            };

            this.startDate = formatDate(firstDay);
            this.endDate = formatDate(today);
            this.employee = "";
            this.department = "";
            this.fetchData();
        },
    },
};
</script>

<script setup>
const user = JSON.parse(localStorage.getItem("user")) || null;
</script>
