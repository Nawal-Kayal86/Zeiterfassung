<template>
  <div class="container-fluid py-4 px-md-5">
    <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
      <div>
        <h2 class="fw-bold mb-1">Dienstplan</h2>
        <p class="text-muted mb-0">
          Dein aktueller Wochenplan mit Sollarbeitszeiten.
        </p>
      </div>

      <RouterLink
        v-if="isAdmin"
        to="/work-schedule"
        class="btn btn-primary"
      >
        <i class="bi bi-sliders me-2"></i> Sollarbeitszeiten verwalten
      </RouterLink>
    </div>

    <div v-if="loading" class="alert alert-info">
      Dienstplan wird geladen...
    </div>

    <div v-else class="row g-4">
      <div class="col-lg-4">
        <div class="card shadow-sm border-0 h-100">
          <div class="card-body p-4">
            <h5 class="fw-bold mb-3">Wochenuebersicht</h5>

            <div class="summary-box">
              <span class="summary-label">Wochenstunden</span>
              <strong class="summary-value">{{ formattedWeeklyHours }}</strong>
            </div>

            <div class="summary-box">
              <span class="summary-label">Aktive Arbeitstage</span>
              <strong class="summary-value">{{ activeDayCount }}</strong>
            </div>

            <div class="alert alert-light border mt-4 mb-0">
              <strong>Hinweis:</strong>
              Dieser Plan wird fuer Urlaubsberechnung, Sollzeiten und Monatsauswertungen verwendet.
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-8">
        <div class="card shadow-sm border-0">
          <div class="card-header bg-white border-0 py-3 px-4">
            <h5 class="fw-bold mb-0">Wochentage</h5>
          </div>

          <div class="card-body p-4">
            <div class="schedule-list">
              <article
                v-for="day in scheduleRows"
                :key="day.key"
                class="schedule-row"
                :class="{ inactive: !day.active }"
              >
                <div>
                  <strong class="d-block">{{ day.label }}</strong>
                  <span class="small text-muted">
                    {{ day.active ? "Arbeitstag" : "Frei" }}
                  </span>
                </div>

                <div class="schedule-time">
                  <template v-if="day.active">
                    <span>{{ day.from }}</span>
                    <i class="bi bi-arrow-right"></i>
                    <span>{{ day.to }}</span>
                  </template>
                  <template v-else>
                    <span class="text-muted">Keine Arbeitszeit</span>
                  </template>
                </div>
              </article>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import api from "../api";
import { useAuth } from "../composables/useAuth";

const auth = useAuth();
const currentUser = auth.state.user;

const loading = ref(true);
const scheduleData = ref({
  weekly_hours: 40,
  schedule: {
    mon: { from: "08:00", to: "16:00", active: true },
    tue: { from: "08:00", to: "16:00", active: true },
    wed: { from: "08:00", to: "16:00", active: true },
    thu: { from: "08:00", to: "16:00", active: true },
    fri: { from: "08:00", to: "16:00", active: true },
    sat: { from: "08:00", to: "16:00", active: false },
    sun: { from: "08:00", to: "16:00", active: false },
  },
});

const isAdmin = computed(() => auth.isAdmin.value);

const dayLabels = {
  mon: "Montag",
  tue: "Dienstag",
  wed: "Mittwoch",
  thu: "Donnerstag",
  fri: "Freitag",
  sat: "Samstag",
  sun: "Sonntag",
};

const scheduleRows = computed(() =>
  Object.entries(dayLabels).map(([key, label]) => ({
    key,
    label,
    ...scheduleData.value.schedule[key],
  })),
);

const activeDayCount = computed(
  () => scheduleRows.value.filter((day) => day.active).length,
);

const formattedWeeklyHours = computed(() => {
  const hours = Number(scheduleData.value.weekly_hours || 0);
  return `${hours.toFixed(hours % 1 === 0 ? 0 : 2)} Std.`;
});

onMounted(loadSchedule);

async function loadSchedule() {
  if (!currentUser?.id) {
    loading.value = false;
    return;
  }

  try {
    const response = await api.get(`/schedule/${currentUser.id}`);
    scheduleData.value = {
      weekly_hours: response.data.weekly_hours || 40,
      schedule: response.data.schedule || scheduleData.value.schedule,
    };
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.summary-box {
  padding: 1rem 1.1rem;
  border-radius: 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  margin-bottom: 1rem;
}

.summary-label {
  display: block;
  font-size: 0.8rem;
  text-transform: uppercase;
  color: #64748b;
  margin-bottom: 0.35rem;
}

.summary-value {
  font-size: 1.4rem;
  color: #0f172a;
}

.schedule-list {
  display: grid;
  gap: 0.9rem;
}

.schedule-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.1rem;
  border-radius: 1rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
}

.schedule-row.inactive {
  background: #f8fafc;
}

.schedule-time {
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
  font-weight: 600;
}
</style>
