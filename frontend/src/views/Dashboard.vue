<template>
  <div class="container-fluid py-4 px-md-5">
    <div class="hero-shell mb-4">
      <div>
        <h1 class="hero-title">Digitales Stempel-Terminal</h1>
        <p class="hero-copy mb-0">
          Arbeitszeit starten, live verfolgen und Eintraege ohne Medienbruch korrigieren.
        </p>
      </div>

      <div class="view-toggle-container shadow-sm p-1 rounded-pill bg-light border">
        <button
          @click="activeView = 'terminal'"
          :class="[
            'btn rounded-pill px-4 py-2 transition-all border-0',
            activeView === 'terminal' ? 'btn-indigo shadow-sm' : 'text-muted',
          ]"
        >
          <i class="bi bi-pc-display-horizontal me-2"></i> Stempel-Terminal
        </button>
        <button
          @click="activeView = 'manual'"
          :class="[
            'btn rounded-pill px-4 py-2 transition-all border-0',
            activeView === 'manual' ? 'btn-indigo shadow-sm' : 'text-muted',
          ]"
        >
          <i class="bi bi-pencil-square me-2"></i> Manuelle Erfassung
        </button>
      </div>
    </div>

    <div class="row g-4 justify-content-center">
      <div v-if="activeView === 'manual'" class="col-lg-6">
        <ManualSessionForm
          v-model="workSessionStore.manualSession.value"
          title="Manuelle Erfassung"
          :editing="workSessionStore.isEditingManualSession.value"
          :saving="workSessionStore.saving.value"
          :submit-label="
            workSessionStore.isEditingManualSession.value
              ? 'Aenderungen speichern'
              : 'Jetzt speichern'
          "
          @submit="workSessionStore.saveManualSession"
          @cancel-edit="workSessionStore.resetManualSession"
        />
      </div>

      <div v-if="activeView === 'terminal'" class="col-lg-9">
        <div class="text-center mb-5">
          <div v-if="workSessionStore.activeSession.value" class="live-session-hero mb-4">
            <div class="live-pulse mb-2">
              <span class="pulse-dot"></span>
              LIVE SITZUNG
            </div>
            <div class="display-time">{{ workSessionStore.liveDuration.value }}</div>
            <div class="text-muted mt-2 fw-semibold">
              Begonnen am: {{ formatDate(workSessionStore.activeSession.value.start) }} um
              {{ formatTime(workSessionStore.activeSession.value.start) }}
            </div>
          </div>

          <div class="d-flex justify-content-center gap-3 flex-wrap mt-2">
            <button
              class="btn btn-success-custom action-btn shadow-lg fw-bold py-3 px-4 transition-3d"
              @click="workSessionStore.startWorkday"
              :disabled="workSessionStore.activeSession.value"
            >
              <i class="bi bi-play-circle-fill fs-5"></i> Arbeitsbeginn
            </button>
            <button
              v-if="workSessionStore.activeSession.value"
              :class="[
                'btn action-btn shadow-lg fw-bold py-3 px-4 transition-3d',
                workSessionStore.isPauseActive.value ? 'btn-warning' : 'btn-outline-warning',
              ]"
              @click="workSessionStore.togglePause"
            >
              <i
                :class="
                  workSessionStore.isPauseActive.value
                    ? 'bi bi-pause-btn-fill'
                    : 'bi bi-pause-btn'
                "
              ></i>
              {{ workSessionStore.isPauseActive.value ? "Pause beenden" : "Pause machen" }}
            </button>
            <button
              class="btn btn-outline-indigo action-btn shadow-lg fw-bold py-3 px-4 transition-3d"
              @click="router.push('/workflow')"
            >
              <i class="bi bi-hospital fs-5"></i> Arzttermin
            </button>
            <button
              class="btn btn-danger action-btn shadow-lg fw-bold py-3 px-4 transition-3d"
              @click="workSessionStore.stopWorkday"
              :disabled="!workSessionStore.activeSession.value"
            >
              <i class="bi bi-stop-circle-fill fs-5"></i> Arbeitsende
            </button>
          </div>
        </div>

        <SessionSummaryCards
          :summary="workSessionStore.summary.value"
          :active-session="workSessionStore.activeSession.value"
        />
      </div>
    </div>

    <SessionTable
      :sessions="workSessionStore.workSessions.value"
      :loading="workSessionStore.loading.value"
      :show-user-column="auth.isAdmin.value"
      @edit="handleEdit"
      @delete="handleDelete"
    />
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { toast } from "vue3-toastify";
import SessionSummaryCards from "../components/workSessions/SessionSummaryCards.vue";
import SessionTable from "../components/workSessions/SessionTable.vue";
import ManualSessionForm from "../components/workSessions/ManualSessionForm.vue";
import { useAuth } from "../composables/useAuth";
import { useWorkSessions } from "../composables/useWorkSessions";
import { formatDate, formatTime } from "../utils/time";

const router = useRouter();
const auth = useAuth();
const activeView = ref("terminal");
const currentUser = ref(auth.state.user);
const workSessionStore = useWorkSessions(currentUser);

onMounted(async () => {
  if (!auth.isAuthenticated.value) {
    router.push("/login");
    return;
  }

  currentUser.value = auth.state.user;
  await workSessionStore.refresh();
});

function handleEdit(session) {
  workSessionStore.beginEdit(session);
  activeView.value = "manual";
  toast.info("Eintrag wurde in die Bearbeitung uebernommen.");
}

async function handleDelete(sessionId) {
  if (!confirm("Diesen Eintrag wirklich loeschen?")) {
    return;
  }

  await workSessionStore.deleteSession(sessionId);
}
</script>

<style scoped>
.hero-shell {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.hero-title {
  margin: 0 0 0.4rem;
  font-size: clamp(1.8rem, 3vw, 2.6rem);
  font-weight: 800;
  color: #0f172a;
}

.hero-copy {
  color: #64748b;
  max-width: 42rem;
}

.btn-indigo {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: #ffffff;
  border: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-indigo:hover {
  background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(99, 102, 241, 0.4);
  color: #ffffff;
}

.action-btn {
  min-width: 160px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-size: 0.95rem;
}

.btn-outline-indigo {
  color: #6366f1;
  border: 2px solid #6366f1;
  background: transparent;
  font-weight: 600;
}

.btn-outline-indigo:hover {
  background: #6366f1;
  color: #ffffff;
}

.btn-success-custom {
  background-color: #70ae91 !important;
  border-color: #70ae91 !important;
  color: #ffffff !important;
}

.btn-success-custom:hover:not(:disabled) {
  background-color: #5f9a7f !important;
  border-color: #5f9a7f !important;
}

.live-session-hero {
  background: white;
  padding: 2.5rem;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(112, 174, 145, 0.2);
  display: inline-block;
  min-width: 450px;
}

.display-time {
  font-family: "JetBrains Mono", "Courier New", monospace;
  font-size: 4rem;
  font-weight: 800;
  color: #1a1a1a;
  letter-spacing: -2px;
  line-height: 1;
}

.live-pulse {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(112, 174, 145, 0.1);
  color: #70ae91;
  padding: 6px 16px;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 1px;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background-color: #70ae91;
  border-radius: 50%;
  animation: pulse-animation 1.5s infinite;
}

.transition-3d {
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.transition-3d:hover:not(:disabled) {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1) !important;
}

.view-toggle-container {
  display: inline-flex;
  gap: 5px;
  background: #f1f5f9;
}

.transition-all {
  transition: all 0.3s ease;
}

.btn-indigo.shadow-sm {
  box-shadow: 0 4px 10px rgba(99, 102, 241, 0.2) !important;
}

@keyframes pulse-animation {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(112, 174, 145, 0.7);
  }

  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(112, 174, 145, 0);
  }

  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(112, 174, 145, 0);
  }
}

@media (max-width: 768px) {
  .live-session-hero {
    min-width: 100%;
    padding: 1.75rem;
  }

  .display-time {
    font-size: 2.6rem;
  }
}
</style>
