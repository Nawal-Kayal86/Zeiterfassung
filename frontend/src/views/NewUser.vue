<template>
  <div class="container-fluid py-4 px-md-5">
    <div class="row g-4">
      <!-- Formular Spalte -->
      <div class="col-lg-5">
        <div class="card shadow-sm p-4 border-0 bg-white" :class="{ 'sparkle-active': showSparkles }">
          <h4 class="fw-bold mb-4 d-flex align-items-center gap-2">
            <i class="bi bi-person-plus-fill text-indigo"></i>
            {{ user.id ? "Benutzer bearbeiten" : "Neuen Mitarbeiter anlegen" }}
          </h4>

          <form @submit.prevent="saveUser">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label fw-semibold text-muted small text-uppercase">Name</label>
                <input v-model="user.name" type="text" class="form-control custom-input" required
                  placeholder="Vorname Nachname" />
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold text-muted small text-uppercase">E-Mail</label>
                <input v-model="user.email" type="email" class="form-control custom-input"
                  placeholder="beispiel@firma.de" />
              </div>

              <div class="col-md-6">
                <label class="form-label fw-semibold text-muted small text-uppercase">Rolle</label>
                <select v-model="user.role" class="form-select custom-input" required>
                  <option value="" disabled>Rolle wählen</option>
                  <option value="user">Mitarbeiter (User)</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div class="col-md-6">
                <label class="form-label fw-semibold text-muted small text-uppercase">Abteilung</label>
                <select v-model="user.department" class="form-select custom-input">
                  <option value="" disabled>Abteilung wählen</option>
                  <option v-for="d in departments" :key="d.id" :value="d.name">
                    {{ d.name }}
                  </option>
                </select>
              </div>

              <div class="col-md-6">
                <label class="form-label fw-semibold text-muted small text-uppercase">NFC-Tag ID</label>
                <input v-model="user.nfc_tag" type="text" class="form-control custom-input" placeholder="Optional" />
              </div>

              <div class="col-md-6">
                <label class="form-label fw-semibold text-muted small text-uppercase">Eintrittsdatum</label>
                <input v-model="user.start_date" type="date" class="form-control custom-input" />
              </div>

              <div class="col-12">
                <label class="form-label fw-semibold text-muted small text-uppercase">Passwort</label>
                <input v-model="user.password" type="password" class="form-control custom-input" :required="!user.id"
                  :placeholder="user.id ? 'Leer lassen um nicht zu ändern' : 'Passwort festlegen'" />
              </div>

              <div class="col-12">
                <div class="form-check form-switch mt-2">
                  <input class="form-check-input" type="checkbox" id="isActive" v-model="user.is_active">
                  <label class="form-check-label fw-semibold text-muted" for="isActive">Benutzer ist aktiv und darf sich
                    einloggen</label>
                </div>
              </div>

              <div class="col-12 mt-4">
                <button
                  class="btn btn-indigo w-100 py-3 shadow-sm fw-bold d-flex align-items-center justify-content-center gap-2"
                  type="submit">
                  <i :class="user.id ? 'bi bi-check-circle-fill' : 'bi bi-magic'"></i>
                  {{ user.id ? "Änderungen speichern" : "Mitarbeiter erstellen & feiern" }}
                </button>
              </div>
            </div>

            <!-- 💬 Dynamische Meldung -->
            <transition name="fade">
              <div v-if="message.text"
                :class="['alert mt-4 shadow-sm border-0 d-flex align-items-center gap-2', message.type]" role="alert">
                <i
                  :class="message.type.includes('success') ? 'bi bi-check-circle-fill' : 'bi bi-exclamation-triangle-fill'"></i>
                {{ message.text }}
              </div>
            </transition>
          </form>

        </div>
      </div>

      <!-- Tabelle Spalte -->
      <div class="col-lg-7">
        <div class="card shadow-sm border-0 bg-white">
          <div class="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
            <h5 class="fw-bold mb-0">Mitarbeiterübersicht</h5>
            <span class="badge bg-indigo-soft text-indigo">{{ users.length }} Benutzer</span>
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
                    <span :class="['status-dot', u.is_active ? 'bg-success-custom' : 'bg-danger']"></span>
                    <span class="small fw-semibold ms-2">{{ u.is_active ? 'Aktiv' : 'Inaktiv' }}</span>
                  </td>
                  <td class="text-end pe-4">
                    <div class="d-flex justify-content-end gap-2">
                      <button class="btn btn-icon btn-outline-indigo" @click="editUser(u)" title="Bearbeiten">
                        <i class="bi bi-pencil-square"></i>
                      </button>
                      <button class="btn btn-icon btn-outline-danger" @click="deleteUser(u.id)" title="Löschen">
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
import { ref, onMounted } from "vue"
import api from "../api"

const user = ref({ id: null, name: "", email: "", role: "user", department: "", nfc_tag: "", start_date: "", is_active: true, password: "" })
const users = ref([])
const departments = ref([])

// 💬 Nachricht-Objekt (Text + Bootstrap-Klasse)
const message = ref({ text: "", type: "" })

const showMessage = (text, isSuccess = true, duration = 4000) => {
  message.value = { text, type: isSuccess ? "alert-success-custom" : "alert-danger" }
  setTimeout(() => (message.value.text = ""), duration)
}

// Abteilungen laden
const loadDepartments = async () => {
  try {
    const res = await api.get("/departments")
    departments.value = res.data
  } catch (err) {
    showMessage("Fehler beim Laden der Abteilungen!", "alert-danger")
  }
}

// User laden
const loadUsers = async () => {
  try {
    const res = await api.get("/users")
    users.value = res.data
  } catch {
    showMessage("Fehler beim Laden der User!", "alert-danger")
  }
}

// User speichern (neu oder Update)
const saveUser = async () => {
  try {
    const isNew = !user.value.id
    if (!isNew) {
      await api.put(`/users/${user.value.id}`, user.value)
      showMessage("Mitarbeiter erfolgreich aktualisiert!", true)
    } else {
      await api.post("/users", user.value)
      showMessage("Mitarbeiter erfolgreich angelegt! Willkommen im Team!", true)
    }
    await loadUsers()
    resetForm()
  } catch (err) {
    showMessage("Fehler: " + (err.response?.data?.error || err.message), false)
  }
}

const editUser = (u) => {
  // Nur wenn u ein Objekt ist
  if (!u || typeof u !== "object") return;

  user.value = {
    id: u.id,
    name: u.name || "",
    email: u.email || "",
    role: u.role || "",
    department: u.department || "",
    nfc_tag: u.nfc_tag || "",
    start_date: u.start_date ? u.start_date.split('T')[0] : "",
    is_active: u.is_active !== false,
    password: ""
  };
  window.scrollTo({ top: 0, behavior: "smooth" });
}


// Löschen mit Bootstrap confirm-Modal (einfacher Fallback mit confirm)
const deleteUser = async (id) => {
  if (!confirm("Wirklich löschen?")) return
  try {
    await api.delete(`/users/${id}`)
    await loadUsers()
    showMessage("User gelöscht!", "alert-secondary")
  } catch (err) {
    showMessage("Fehler beim Löschen: " + (err.response?.data?.error || err.message), "alert-danger")
  }
}

const resetForm = () => {
  user.value = { id: null, name: "", email: "", role: "user", department: "", nfc_tag: "", start_date: "", is_active: true, password: "" }
}

onMounted(() => {
  loadUsers()
  loadDepartments()
  resetForm()
})
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
