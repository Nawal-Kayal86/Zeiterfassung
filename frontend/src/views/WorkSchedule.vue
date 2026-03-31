<template>
  <div class="container-fluid py-4 px-md-5">
    <div class="row g-4">
      <!-- User Sidebar -->
      <div class="col-lg-4">
        <div class="card shadow-sm border-0 h-100">
          <div class="card-header bg-white border-0 py-3">
            <h5 class="fw-bold mb-0 text-indigo">
              <i class="bi bi-people-fill me-2"></i>Mitarbeiter wählen
            </h5>
          </div>
          <div class="list-group list-group-flush overflow-auto" style="max-height: 70vh;">
            <button
              v-for="u in users"
              :key="u.id"
              @click="selectUser(u)"
              class="list-group-item list-group-item-action border-0 py-3 d-flex align-items-center justify-content-between"
              :class="{ 'bg-indigo-soft active-user': selectedUser?.id === u.id }"
            >
              <div>
                <div class="fw-bold">{{ u.name }}</div>
                <small class="text-muted">{{ u.department || 'Keine Abteilung' }}</small>
              </div>
              <i class="bi bi-chevron-right text-muted"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Schedule Content -->
      <div class="col-lg-8" v-if="selectedUser">
        <div class="card shadow-sm border-0 animate__animated animate__fadeInRight">
          <div class="card-header bg-indigo text-white border-0 py-4 px-4 d-flex justify-content-between align-items-center">
            <div>
              <h4 class="fw-bold mb-0">{{ selectedUser.name }}</h4>
              <p class="mb-0 small opacity-75">Individuellen Arbeitszeitplan festlegen</p>
            </div>
            <button @click="saveSchedule" class="btn btn-light fw-bold px-4 rounded-pill shadow">
               <i class="bi bi-save-fill me-2"></i>Speichern
            </button>
          </div>

          <div class="card-body p-4">
            <!-- Weekly Summary & Utils -->
            <div class="row g-3 mb-4">
              <div class="col-md-6">
                <div class="alert alert-info h-100 py-3 mb-0 border-0 d-flex align-items-center gap-3">
                  <div class="display-6"><i class="bi bi-clock-history"></i></div>
                  <div>
                      <h5 class="mb-1 fw-bold">Wochenstunden (Soll)</h5>
                      <div class="input-group" style="max-width: 150px;">
                        <input v-model="scheduleData.weekly_hours" type="number" class="form-control fw-bold border-0" placeholder="40">
                        <span class="input-group-text bg-white border-0">Std.</span>
                      </div>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="card h-100 border-dashed border-2 d-flex align-items-center justify-content-center p-3 text-center bg-light">
                   <p class="small text-muted mb-2">Zeiten von Montag auf Di-Fr kopieren?</p>
                   <button @click="copyMondayToWeek" class="btn btn-outline-indigo btn-sm rounded-pill px-3">
                      <i class="bi bi-copy me-2"></i>Montag kopieren
                   </button>
                </div>
              </div>
            </div>

            <!-- Daily Schedule -->
            <div class="schedule-grid">
               <div v-for="(day, key) in dayLabels" :key="key" class="day-row p-3 mb-2 rounded-3 border d-flex align-items-center gap-4 transition-3d" :class="{ 'bg-light opacity-50': !scheduleData.schedule[key].active }">
                  <div class="day-label fw-bold d-flex align-items-center gap-2" style="width: 120px;">
                    <span v-if="scheduleData.schedule[key].active" class="status-dot-xs bg-success"></span>
                    <span v-else class="status-dot-xs bg-secondary"></span>
                    {{ day }}
                  </div>
                  
                  <div class="form-check form-switch m-0">
                    <input class="form-check-input" type="checkbox" v-model="scheduleData.schedule[key].active">
                  </div>

                  <div class="d-flex align-items-center gap-3 flex-grow-1" v-if="scheduleData.schedule[key].active">
                     <div class="input-group">
                        <span class="input-group-text bg-white border-0 small text-muted text-uppercase">Von</span>
                        <input type="time" v-model="scheduleData.schedule[key].from" class="form-control border-light-subtle rounded-3 fw-bold px-2 py-1" style="max-width: 120px;">
                     </div>
                     <i class="bi bi-arrow-right text-muted"></i>
                     <div class="input-group">
                        <span class="input-group-text bg-white border-0 small text-muted text-uppercase">Bis</span>
                        <input type="time" v-model="scheduleData.schedule[key].to" class="form-control border-light-subtle rounded-3 fw-bold px-2 py-1" style="max-width: 120px;">
                     </div>
                  </div>
                  <div class="flex-grow-1 text-center text-muted italic small bg-light-soft py-2 rounded" v-else>
                     <i class="bi bi-moon-stars me-2"></i>Keine Arbeitszeit an diesem Tag
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-8 text-center py-5" v-else>
         <div class="py-5 bg-white shadow-sm rounded-4 border-dashed border-2">
            <i class="bi bi-calendar2-range display-1 text-indigo-soft mb-4 d-block"></i>
            <h3 class="fw-bold text-dark mb-2">Mitarbeiter-Planung</h3>
            <p class="text-muted">Bitte wähle links einen Mitarbeiter aus, um seinen <br>individuellen Arbeitszeitplan zu konfigurieren.</p>
         </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import api from "../api";
import { toast } from "vue3-toastify";

const users = ref([]);
const selectedUser = ref(null);
const scheduleData = ref({
  user_id: "",
  weekly_hours: 40,
  schedule: {
    mon: { from: "08:00", to: "16:00", active: true },
    tue: { from: "08:00", to: "16:00", active: true },
    wed: { from: "08:00", to: "16:00", active: true },
    thu: { from: "08:00", to: "16:00", active: true },
    fri: { from: "08:00", to: "16:00", active: true },
    sat: { from: "08:00", to: "16:00", active: false },
    sun: { from: "08:00", to: "16:00", active: false },
  }
});

// Automatische Berechnung der Wochenstunden bei Änderungen
watch(() => scheduleData.value.schedule, (newSchedule) => {
  if (!newSchedule) return;
  let total = 0;
  Object.values(newSchedule).forEach(day => {
    if (day.active && day.from && day.to) {
        const [fH, fM] = day.from.split(':').map(Number);
        const [tH, tM] = day.to.split(':').map(Number);
        const diff = (tH + tM/60) - (fH + fM/60);
        if (diff > 0) total += diff;
    }
  });
  // Runde auf 2 Dezimalstellen
  scheduleData.value.weekly_hours = Number(total.toFixed(2));
}, { deep: true });

const dayLabels = {
  mon: "Montag",
  tue: "Dienstag",
  wed: "Mittwoch",
  thu: "Donnerstag",
  fri: "Freitag",
  sat: "Samstag",
  sun: "Sonntag"
};

const loadUsers = async () => {
  try {
    const res = await api.get("/users");
    users.value = res.data.sort((a, b) => a.name.localeCompare(b.name));
  } catch (e) { console.error(e); }
};

const selectUser = async (u) => {
  selectedUser.value = u;
  try {
    const res = await api.get(`/schedule/${u.id}`);
    scheduleData.value = {
      user_id: u.id,
      weekly_hours: res.data.weekly_hours || 40,
      schedule: res.data.schedule
    };
  } catch (e) {
    console.error("Fehler beim Laden des Plans", e);
    toast.error("Dienstplan konnte nicht geladen werden.");
  }
};

const copyMondayToWeek = () => {
    if (!scheduleData.value) return;
    const mon = scheduleData.value.schedule.mon;
    const targets = ['tue', 'wed', 'thu', 'fri'];
    targets.forEach(t => {
        scheduleData.value.schedule[t].from = mon.from;
        scheduleData.value.schedule[t].to = mon.to;
        scheduleData.value.schedule[t].active = mon.active;
    });
    toast.success("Zeiten von Montag wurden übernommen! 📋");
};

const saveSchedule = async () => {
  try {
    await api.post("/schedule", scheduleData.value);
    toast.success(`${selectedUser.value.name} Dienstplan gespeichert! ✅`);
  } catch (e) {
    toast.error("Fehler beim Speichern des Dienstplans.");
  }
};

onMounted(loadUsers);
</script>

<style scoped>
.text-indigo { color: #6366f1; }
.text-indigo-soft { color: #818cf8; }
.bg-indigo { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); }
.bg-indigo-soft { background-color: rgba(99, 102, 241, 0.08); color: #6366f1; }
.bg-light-soft { background-color: #f1f5f9; }
.border-dashed { border-style: dashed !important; }

.active-user {
  border-left: 6px solid #6366f1 !important;
  font-weight: 600;
}

.day-row {
  transition: all 0.3s ease;
  background: white;
  border-color: #f1f5f9 !important;
}

.day-row:hover {
  border-color: #6366f1 !important;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.status-dot-xs {
    width: 8px;
    height: 8px;
    border-radius: 50%;
}

.transition-3d {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.btn-outline-indigo {
    color: #4f46e5;
    border-color: #cbd5e1;
}

.btn-outline-indigo:hover {
    background-color: #4f46e5;
    color: white;
    border-color: #4f46e5;
}

.input-group-text {
  font-size: 0.65rem;
  letter-spacing: 0.5px;
}
</style>
