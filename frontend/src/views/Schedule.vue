<template>
  <div class="container py-4">
    <!-- Formular -->
    <div class="card shadow-sm mb-4">
      <div class="card-body">
        <h5 class="mb-3">
          {{ editId ? "✏️ Schicht bearbeiten" : "➕ Neue Schicht" }}
        </h5>

        <form @submit.prevent="save">
          <div class="row g-3">
            <div class="col-md-3">
              <label class="form-label">Mitarbeiter</label>
              <input v-model="form.name" class="form-control" required />
            </div>

            <div class="col-md-3">
              <label class="form-label">Abteilung</label>
              <select v-model="form.department" class="form-select" required>
                <option value="">–Abteilung wählen –</option>
                <option>IT</option>
                <option>HR</option>
                <option>Einauf</option>
                <option>Trainer</option>
                <option>Öko Bosoter</option>
              </select>
            </div>

            <div class="col-md-3">
              <label class="form-label">Datum</label>
              <input
                type="date"
                v-model="form.date"
                class="form-control"
                required
              />
            </div>

            <div class="col-md-3">
              <label class="form-label">Schicht</label>
              <select v-model="form.shift" class="form-select" required>
                <option value="">–Schicht wählen –</option>
                <option>Frühschicht</option>
                <option>Spätschicht</option>
                <option>Nachtschicht</option>
              </select>
            </div>
          </div>

          <div class="mt-3 d-flex gap-2">
            <button class="btn btn-primary">💾 Speichern</button>
            <button
              v-if="editId"
              type="button"
              class="btn btn-secondary"
              @click="reset"
            >
              Abbrechen
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Tabelle -->
    <div class="card shadow-sm">
      <div class="card-header fw-bold">📋 Übersicht</div>
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead class="table-light">
            <tr>
              <th>Mitarbeiter</th>
              <th>Abteilung</th>
              <th>Datum</th>
              <th>Schicht</th>
              <th class="text-end">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="schedules.length === 0">
              <td colspan="5" class="text-center text-muted py-3">
                Keine Einträge
              </td>
            </tr>

            <tr v-for="s in schedules" :key="s._id">
              <td>{{ s.name }}</td>
              <td>{{ s.department }}</td>
              <td>{{ formatDate(s.date) }}</td>
              <td>
                <span :class="badgeClass(s.shift)">
                  {{ s.shift }}
                </span>
              </td>
              <td class="text-end">
                <button
                  class="btn btn-sm btn-outline-primary me-2"
                  @click="edit(s)"
                >
                  ✏️
                </button>
                <button
                  class="btn btn-sm btn-outline-danger"
                  @click="remove(s._id)"
                >
                  🗑
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "@/api";

const schedules = ref([]);
const editId = ref(null);

const form = ref({
  name: "",
  department: "",
  date: "",
  shift: "",
});

async function load() {
  const res = await api.get("/schedule");
  schedules.value = res.data;
}

async function save() {
  if (editId.value) {
    await api.put(`/schedule/${editId.value}`, form.value);
  } else {
    await api.post("/schedule", form.value);
  }
  reset();
  load();
}

function edit(s) {
  editId.value = s._id;
  form.value = {
    name: s.name,
    department: s.department,
    date: s.date.slice(0, 10),
    shift: s.shift,
  };
}

async function remove(id) {
  if (!confirm("Eintrag löschen?")) return;
  await api.delete(`/schedule/${id}`);
  load();
}

function reset() {
  editId.value = null;
  form.value = { name: "", department: "", date: "", shift: "" };
}

function formatDate(d) {
  return new Date(d).toLocaleDateString("de-DE");
}

function badgeClass(shift) {
  return {
    "badge bg-success": shift === "Frühschicht",
    "badge bg-warning text-dark": shift === "Spätschicht",
    "badge bg-dark": shift === "Nachtschicht",
  };
}

onMounted(load);
</script>
