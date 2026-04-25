<template>
  <div class="container py-5">
    <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
      <div>
        <h2 class="fw-bold mb-1">Admin Uebersicht</h2>
        <p class="text-muted mb-0">
          Benutzer filtern und Arbeitszeiten manuell nachtragen.
        </p>
      </div>
      <div class="search-shell">
        <i class="bi bi-search"></i>
        <input
          v-model="filterText"
          type="text"
          class="form-control border-0"
          placeholder="Nach Name oder Datum filtern"
        />
      </div>
    </div>

    <UserOverviewTable :users="filteredUsers" :loading="isLoadingUsers" @userUpdated="loadUsers" />

    <div class="row g-4">
      <div class="col-lg-5">
        <ManualSessionForm
          v-model="manualSession"
          title="Arbeitszeit manuell eintragen"
          submit-label="Eintrag speichern"
          :saving="isSavingManualSession"
          @submit="saveManualTime"
        />
      </div>

      <div class="col-lg-7">
        <div class="card shadow-sm border-0 h-100">
          <div class="card-body p-4">
            <h5 class="fw-bold mb-3">Hinweise</h5>
            <div class="hint-list">
              <article class="hint-card">
                <strong>Saubere Eingabe</strong>
                <p class="mb-0">
                  Verwende Datum, Start und Ende fuer vollstaendige Nachtraege.
                </p>
              </article>
              <article class="hint-card">
                <strong>Wiederverwendbare Logik</strong>
                <p class="mb-0">
                  Das Formular nutzt dieselbe Payload-Logik wie das Dashboard und bleibt dadurch konsistent.
                </p>
              </article>
              <article class="hint-card">
                <strong>Schneller filtern</strong>
                <p class="mb-0">
                  Die Benutzerliste reagiert sofort auf Namen oder formatierte Startdaten.
                </p>
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
import { useRouter } from "vue-router";
import { toast } from "vue3-toastify";
import api from "../api";
import UserOverviewTable from "../components/admin/UserOverviewTable.vue";
import ManualSessionForm from "../components/workSessions/ManualSessionForm.vue";
import { useAuth } from "../composables/useAuth";
import { formatDate } from "../utils/time";
import {
  buildManualSessionPayload,
  createEmptyManualSession,
} from "../utils/workSessionForm";

const router = useRouter();
const auth = useAuth();

const users = ref([]);
const filterText = ref("");
const manualSession = ref(createEmptyManualSession());
const isLoadingUsers = ref(false);
const isSavingManualSession = ref(false);

const filteredUsers = computed(() => {
  const searchTerm = filterText.value.trim().toLowerCase();

  if (!searchTerm) {
    return users.value;
  }

  return users.value.filter((userEntry) => {
    const matchesName = userEntry.name.toLowerCase().includes(searchTerm);
    const matchesStartDate =
      userEntry.start_date &&
      formatDate(userEntry.start_date).toLowerCase().includes(searchTerm);

    return matchesName || matchesStartDate;
  });
});

onMounted(async () => {
  if (!auth.isAdmin.value) {
    router.push("/dashboard");
    return;
  }

  await loadUsers();
});

async function loadUsers() {
  isLoadingUsers.value = true;

  try {
    const response = await api.get("/users");
    users.value = response.data;
  } finally {
    isLoadingUsers.value = false;
  }
}

async function saveManualTime() {
  isSavingManualSession.value = true;

  try {
    const payload = buildManualSessionPayload(manualSession.value);
    await api.post("/workSessions/manual-time", payload);
    toast.success("Arbeitszeit wurde gespeichert.");
    manualSession.value = createEmptyManualSession();
    await loadUsers();
  } finally {
    isSavingManualSession.value = false;
  }
}
</script>

<style scoped>
.search-shell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: min(100%, 22rem);
  padding: 0.4rem 0.85rem;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  background: #fff;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);
}

.search-shell i {
  color: #64748b;
}

.search-shell input:focus {
  box-shadow: none;
}

.hint-list {
  display: grid;
  gap: 1rem;
}

.hint-card {
  padding: 1rem 1.1rem;
  border-radius: 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.hint-card strong {
  display: block;
  margin-bottom: 0.35rem;
}
</style>
