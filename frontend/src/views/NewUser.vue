<template>
  <div class="container-fluid py-4 px-md-5">
    <div class="row g-4">
      <!-- Formular Spalte -->
      <div class="col-lg-5">
        <div
          class="card shadow-sm p-4 border-0 bg-white"
          :class="{ 'sparkle-active': showSparkles }"
        >
          <h4 class="fw-bold mb-4 d-flex align-items-center gap-2">
            <i class="bi bi-person-plus-fill text-indigo"></i>
            {{ user.id ? "Benutzer bearbeiten" : "Neuen Mitarbeiter anlegen" }}
          </h4>

          <form @submit.prevent="saveUser">
            <div class="row g-3">
              <div class="col-md-6">
                <label
                  class="form-label fw-semibold text-muted small text-uppercase"
                  >Name</label
                >
                <input
                  v-model="user.name"
                  type="text"
                  class="form-control custom-input"
                  required
                  placeholder="Vorname Nachname"
                />
              </div>
              <div class="col-md-6">
                <label
                  class="form-label fw-semibold text-muted small text-uppercase"
                  >E-Mail</label
                >
                <input
                  v-model="user.email"
                  type="email"
                  class="form-control custom-input"
                  placeholder="beispiel@firma.de"
                />
              </div>

              <div class="col-md-6">
                <label
                  class="form-label fw-semibold text-muted small text-uppercase"
                  >Rolle</label
                >
                <select
                  v-model="user.role"
                  class="form-select custom-input"
                  required
                >
                  <option value="" disabled>Rolle wählen</option>
                  <option value="user">Mitarbeiter (User)</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div class="col-md-6">
                <label
                  class="form-label fw-semibold text-muted small text-uppercase"
                  >Abteilung</label
                >
                <select
                  v-model="user.department"
                  class="form-select custom-input"
                >
                  <option value="" disabled>Abteilung wählen</option>
                  <option v-for="d in departments" :key="d.id" :value="d.name">
                    {{ d.name }}
                  </option>
                </select>
              </div>

              <div class="col-md-6">
                <label
                  class="form-label fw-semibold text-muted small text-uppercase"
                  >NFC-Tag ID</label
                >
                <input
                  v-model="user.nfc_tag"
                  type="text"
                  class="form-control custom-input"
                  placeholder="Optional"
                />
              </div>

              <div class="col-md-6">
                <label
                  class="form-label fw-semibold text-muted small text-uppercase"
                  >Eintrittsdatum</label
                >
                <input
                  v-model="user.start_date"
                  type="date"
                  class="form-control custom-input"
                />
              </div>

              <div class="col-md-6">
                <label
                  class="form-label fw-semibold text-muted small text-uppercase"
                  >Austrittsdatum</label
                >
                <input
                  v-model="user.end_date"
                  type="date"
                  class="form-control custom-input"
                />
              </div>

              <div class="col-md-6">
                <label
                  class="form-label fw-semibold text-muted small text-uppercase"
                  >Passwort</label
                >
                <input
                  v-model="user.password"
                  type="password"
                  class="form-control custom-input"
                  :required="!user.id"
                  :placeholder="
                    user.id
                      ? 'Leer lassen um nicht zu ändern'
                      : 'Passwort festlegen'
                  "
                />
              </div>
              <div class="col-md-12">
                <label
                  class="form-label fw-semibold text-muted small text-uppercase"
                  >Urlaubsanspruch (automatisch berechnet)</label
                >
                <input
                  :value="calculatedVacationDays"
                  type="text"
                  class="form-control custom-input"
                  readonly
                />
              </div>

              <div class="col-12">
                <div class="form-check form-switch mt-2">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="isActive"
                    v-model="user.is_active"
                  />
                  <label
                    class="form-check-label fw-semibold text-muted"
                    for="isActive"
                    >Benutzer ist aktiv und darf sich einloggen</label
                  >
                </div>
              </div>

              <div class="col-12 mt-4">
                <button
                  class="btn btn-indigo w-100 py-3 shadow-sm fw-bold d-flex align-items-center justify-content-center gap-2"
                  type="submit"
                >
                  <i
                    :class="user.id ? 'bi bi-check-circle-fill' : 'bi bi-magic'"
                  ></i>
                  {{
                    user.id
                      ? "Änderungen speichern"
                      : "Mitarbeiter erstellen & feiern"
                  }}
                </button>
              </div>
            </div>

          </form>
        </div>
      </div>

      <!-- Tabelle Spalte -->
      <div class="col-lg-7">
        <div class="card shadow-sm border-0 bg-white">
          <div
            class="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center"
          >
            <h5 class="fw-bold mb-0">Mitarbeiterübersicht</h5>
            <span class="badge bg-indigo-soft text-indigo"
              >{{ users.length }} Benutzer</span
            >
          </div>
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="bg-light">
                <tr>
                  <th class="ps-4">Name</th>
                  <th class="text-center">Status</th>
                  <th class="text-end pe-4">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="u in users" :key="u.id" class="transition-all">
                  <td class="ps-4">
                    <div class="fw-bold">{{ u.name }}</div>
                  </td>
                  <td class="text-center">
                    <span
                      :class="[
                        'status-dot',
                        u.is_active ? 'bg-success-custom' : 'bg-danger',
                      ]"
                    ></span>
                    <span class="small fw-semibold ms-2">{{
                      u.is_active ? "Aktiv" : "Inaktiv"
                    }}</span>
                  </td>
                  <td class="text-end pe-4">
                    <div class="d-flex justify-content-end gap-2">
                      <button
                        class="btn btn-icon btn-outline-indigo"
                        @click="editUser(u)"
                        title="Bearbeiten"
                      >
                        <i class="bi bi-pencil-square"></i>
                      </button>
                      <button
                        class="btn btn-icon btn-outline-danger"
                        @click="deleteUser(u.id)"
                        title="Löschen"
                      >
                        <i class="bi bi-trash3"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from "vue";
import api from "../api";
import { toast } from "vue3-toastify";

const FULL_YEAR_VACATION_DAYS = 25;
const showSparkles = ref(false);

const user = ref({
  id: null,
  name: "",
  email: "",
  role: "user",
  department: "",
  nfc_tag: "",
  start_date: "",
  end_date: "",
  is_active: true,
  password: "",
  vacation_days_per_year: 25,
});
const users = ref([]);
const departments = ref([]);

const calculateVacationDaysForCurrentYear = (startDate, endDate = "") => {
  if (!startDate) return FULL_YEAR_VACATION_DAYS.toFixed(2);

  const today = new Date();
  const year = today.getFullYear();
  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year, 11, 31);
  const employmentStart = new Date(startDate);
  const employmentEnd = endDate ? new Date(endDate) : yearEnd;

  if (Number.isNaN(employmentStart.getTime()) || Number.isNaN(employmentEnd.getTime())) {
    return FULL_YEAR_VACATION_DAYS.toFixed(2);
  }

  const activeStart = employmentStart > yearStart ? employmentStart : yearStart;
  const activeEnd = employmentEnd < yearEnd ? employmentEnd : yearEnd;

  if (activeEnd < activeStart) return "0.00";

  const msPerDay = 1000 * 60 * 60 * 24;
  const activeDays = Math.floor((activeEnd - activeStart) / msPerDay) + 1;
  const totalDaysInYear = Math.floor((yearEnd - yearStart) / msPerDay) + 1;
  const days = (activeDays / totalDaysInYear) * FULL_YEAR_VACATION_DAYS;

  return days.toFixed(2);
};

const calculatedVacationDays = computed(() =>
  calculateVacationDaysForCurrentYear(user.value.start_date, user.value.end_date),
);

// Abteilungen laden
const loadDepartments = async () => {
  try {
    const res = await api.get("/departments");
    departments.value = res.data;
  } catch (err) {
    // Fehler wird global behandelt
  }
};

// User laden
const loadUsers = async () => {
  try {
    const res = await api.get("/users");
    users.value = res.data;
  } catch (err) {
    // Fehler wird global behandelt
  }
};

// User speichern (neu oder Update)
const saveUser = async () => {
  try {
    const isNew = !user.value.id;
    if (!isNew) {
      showSparkles.value = false;
      await api.put(`/users/${user.value.id}`, user.value);
      toast.success("Mitarbeiter erfolgreich aktualisiert! 📝");
    } else {
      await api.post("/users", user.value);
      showSparkles.value = true;
      toast.success("Mitarbeiter erfolgreich angelegt! Willkommen im Team! 🎉");
    }
    await loadUsers();
    if (isNew) {
      setTimeout(() => {
        showSparkles.value = false;
      }, 1800);
    }
    resetForm();
  } catch (err) {
    // Fehler wird global behandelt
  }
};

const editUser = (u) => {
  // Nur wenn u ein Objekt ist
  if (!u || typeof u !== "object") return;

  showSparkles.value = false;

  user.value = {
    id: u.id,
    name: u.name || "",
    email: u.email || "",
    role: u.role || "",
    department: u.department || "",
    nfc_tag: u.nfc_tag || "",
    start_date: u.start_date ? u.start_date.split("T")[0] : "",
    end_date: u.end_date ? u.end_date.split("T")[0] : "",
    is_active: u.is_active !== false,
    password: "",
    vacation_days_per_year: u.vacation_days_per_year || 25,
    work_schedule: u.work_schedule || null,
  };
  window.scrollTo({ top: 0, behavior: "smooth" });
};

// Löschen mit Bootstrap confirm-Modal (einfacher Fallback mit confirm)
const deleteUser = async (id) => {
  if (!confirm("Wirklich löschen?")) return;
  try {
    await api.delete(`/users/${id}`);
    await loadUsers();
    toast.info("Mitarbeiter wurde entfernt. 🗑️");
  } catch (err) {
    // Fehler wird global behandelt
  }
};

const resetForm = () => {
  showSparkles.value = false;
  user.value = {
    id: null,
    name: "",
    email: "",
    role: "user",
    department: "",
    nfc_tag: "",
    start_date: "",
    end_date: "",
    is_active: true,
    password: "",
    vacation_days_per_year: 25,
  };
};

onMounted(() => {
  loadUsers();
  loadDepartments();
  resetForm();
});
</script>

<style scoped>
.text-indigo {
  color: #6366f1 !important;
}

.bg-indigo {
  background-color: #6366f1 !important;
  color: #fff !important;
}

.bg-indigo-soft {
  background-color: rgba(99, 102, 241, 0.1) !important;
  color: #6366f1 !important;
}

.bg-slate {
  background-color: #475569 !important;
  color: #fff !important;
}

.text-success-custom {
  color: #70ae91 !important;
}

.bg-success-custom {
  background-color: #70ae91 !important;
}

.btn-indigo {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: #fff;
  border: none;
}

.btn-indigo:hover {
  background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(99, 102, 241, 0.4);
}

.alert-success-custom {
  background: #f0fdf4;
  border-left: 5px solid #70ae91 !important;
  color: #166534;
}

.custom-input {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px 12px;
  transition: all 0.3s ease;
  background-color: #f8fafc;
}

.custom-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
  background-color: #fff;
  outline: none;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.btn-icon {
  width: 34px;
  height: 34px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s;
}

.btn-outline-indigo {
  color: #6366f1;
  border-color: #6366f1;
  background: transparent;
}

.btn-outline-indigo:hover {
  background: #6366f1;
  color: #fff;
}

.transition-all {
  transition: all 0.2s ease;
}

.table-hover tbody tr:hover {
  background-color: #f8fafc;
  transform: scale(1.002);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
