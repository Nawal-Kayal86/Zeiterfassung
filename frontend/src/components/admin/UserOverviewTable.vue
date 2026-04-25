<template>
  <div class="card shadow-sm mb-5">
    <div class="card-header bg-dark text-white fw-bold d-flex align-items-center justify-content-between">
      <span>Benutzeruebersicht</span>
      <span class="badge bg-light text-dark">{{ users.length }}</span>
    </div>

    <div class="card-body p-0">
      <table class="table table-hover mb-0">
        <thead class="table-light">
          <tr>
            <th>Name</th>
            <th>Rolle</th>
            <th>Abteilung</th>
            <th>Urlaubsanspruch</th>
            <th>Erster Tag</th>
            <th>Status</th>
            <th>Aktionen</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="7" class="text-center py-4 text-muted">Lade Benutzer...</td>
          </tr>
          <tr v-else-if="users.length === 0">
            <td colspan="7" class="text-center py-4 text-muted">Keine Benutzer gefunden</td>
          </tr>
          <tr v-for="userEntry in users" :key="userEntry.id">
            <td>{{ userEntry.name }}</td>
            <td>
              <span
                class="badge"
                :class="userEntry.role === 'admin' ? 'bg-danger' : userEntry.role === 'department_leader' ? 'bg-warning' : 'bg-secondary'"
              >
                {{ userEntry.role === "admin" ? "Administrator" : userEntry.role === "department_leader" ? "Abteilungsleiter" : "Mitarbeiter" }}
              </span>
            </td>
            <td>{{ userEntry.department || "-" }}</td>
            <td>{{ userEntry.vacation_days_per_year }}</td>
            <td>{{ formatDate(userEntry.start_date) || "-" }}</td>
            <td>
              <span :class="['badge', userEntry.is_active ? 'bg-success' : 'bg-danger']">
                {{ userEntry.is_active ? "Aktiv" : "Inaktiv" }}
              </span>
            </td>
            <td>
              <button class="btn btn-sm btn-primary" @click="editUser(userEntry)">Bearbeiten</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Edit User Modal -->
    <div class="modal fade" ref="editModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Benutzer bearbeiten</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body" v-if="editingUser">
            <div class="mb-3">
              <label class="form-label">Name</label>
              <input v-model="editingUser.name" type="text" class="form-control">
            </div>
            <div class="mb-3">
              <label class="form-label">E-Mail</label>
              <input v-model="editingUser.email" type="email" class="form-control">
            </div>
            <div class="mb-3">
              <label class="form-label">Rolle</label>
              <select v-model="editingUser.role" class="form-select">
                <option value="user">Mitarbeiter</option>
                <option value="employee">Mitarbeiter (alt)</option>
                <option value="department_leader">Abteilungsleiter</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Abteilung</label>
              <input v-model="editingUser.department" type="text" class="form-control">
            </div>
            <div class="mb-3">
              <label class="form-label">Urlaubsanspruch (Tage/Jahr)</label>
              <input v-model.number="editingUser.vacation_days_per_year" type="number" class="form-control">
            </div>
            <div class="mb-3">
              <label class="form-label">Wöchentliche Stunden</label>
              <input v-model.number="editingUser.weekly_hours" type="number" class="form-control">
            </div>
            <div class="mb-3">
              <label class="form-label">Startdatum</label>
              <input v-model="editingUser.start_date" type="date" class="form-control">
            </div>
            <div class="mb-3">
              <label class="form-label">Enddatum</label>
              <input v-model="editingUser.end_date" type="date" class="form-control">
            </div>
            <div class="mb-3 form-check">
              <input v-model="editingUser.is_active" type="checkbox" class="form-check-input">
              <label class="form-check-label">Aktiv</label>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Abbrechen</button>
            <button type="button" class="btn btn-primary" @click="saveUser">Speichern</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { toast } from "vue3-toastify";
import api from "../../api";
import { formatDate } from "../../utils/time";

const emit = defineEmits(['userUpdated']);

const props = defineProps({
  users: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const editingUser = ref(null);
const editModal = ref(null);
let modalInstance = null;

onMounted(() => {
  if (editModal.value) {
    modalInstance = new bootstrap.Modal(editModal.value);
  }
});

const editUser = (user) => {
  editingUser.value = { ...user };
  if (modalInstance) {
    modalInstance.show();
  }
};

const saveUser = async () => {
  try {
    await api.put(`/users/${editingUser.value.id}`, editingUser.value);
    toast.success("Benutzer aktualisiert");
    emit('userUpdated');
    modalInstance.hide();
  } catch (error) {
    toast.error("Fehler beim Aktualisieren: " + error.response?.data?.error || error.message);
  }
};
</script>
