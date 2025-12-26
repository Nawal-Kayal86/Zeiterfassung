<template>
  <div class="container py-4">
    <h2 class="mb-4 fw-bold text-primary">📅 Dienstplan</h2>

    <!-- إضافة / تعديل -->
    <div class="card shadow-sm mb-4">
      <div class="card-header fw-bold">
        {{ editingId ? "✏️ Schicht bearbeiten" : "➕ Neue Schicht" }}
      </div>
      <div class="card-body row g-3">

        <div class="col-md-3">
          <label class="form-label">Mitarbeiter</label>
          <input v-model="form.employee" class="form-control" />
        </div>

        <div class="col-md-3">
          <label class="form-label">Abteilung</label>
          <input v-model="form.department" class="form-control" />
        </div>

        <div class="col-md-3">
          <label class="form-label">Datum</label>
          <input type="date" v-model="form.date" class="form-control" />
        </div>

        <div class="col-md-3">
          <label class="form-label">Schicht</label>
          <select v-model="form.shift" class="form-select">
            <option value="">-- wählen --</option>
            <option>Frühschicht</option>
            <option>Spätschicht</option>
            <option>Nachtschicht</option>
          </select>
        </div>

        <div class="col-12 d-flex gap-2">
          <button class="btn btn-primary" @click="save">
            💾 Speichern
          </button>
          <button
            v-if="editingId"
            class="btn btn-secondary"
            @click="resetForm"
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>

    <!-- جدول -->
    <div class="card shadow-sm">
      <div class="card-header fw-bold">📋 Übersicht</div>

      <!-- Desktop -->
      <div class="table-responsive d-none d-md-block">
        <table class="table table-striped mb-0">
          <thead>
            <tr>
              <th>Mitarbeiter</th>
              <th>Abteilung</th>
              <th>Datum</th>
              <th>Schicht</th>
              <th class="text-end">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in schedules" :key="s._id">
              <td>{{ s.employee }}</td>
              <td>{{ s.department }}</td>
              <td>{{ formatDate(s.date) }}</td>
              <td>{{ s.shift }}</td>
              <td class="text-end">
                <button class="btn btn-sm btn-warning me-2" @click="edit(s)">
                  ✏️
                </button>
                <button class="btn btn-sm btn-danger" @click="remove(s._id)">
                  🗑
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile -->
      <div class="d-md-none">
        <div
          v-for="s in schedules"
          :key="s._id"
          class="border-bottom p-3"
        >
          <div><strong>{{ s.employee }}</strong></div>
          <div>{{ s.department }}</div>
          <div>{{ formatDate(s.date) }}</div>
          <div>{{ s.shift }}</div>
          <div class="mt-2">
            <button class="btn btn-sm btn-warning me-2" @click="edit(s)">
              ✏️
            </button>
            <button class="btn btn-sm btn-danger" @click="remove(s._id)">
              🗑
            </button>
          </div>
        </div>
      </div>

      <div v-if="!schedules.length" class="p-3 text-muted">
        Keine Einträge vorhanden.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import api from "@/api"

const schedules = ref([])

const form = ref({
  employee: "",
  department: "",
  date: "",
  shift: ""
})

const editingId = ref(null)

function resetForm() {
  form.value = { employee: "", department: "", date: "", shift: "" }
  editingId.value = null
}

async function load() {
  const res = await api.get("/schedule")
  schedules.value = res.data
}

async function save() {
  if (!form.value.employee || !form.value.date) return

  if (editingId.value) {
    await api.put(`/schedule/${editingId.value}`, form.value)
  } else {
    await api.post("/schedule", form.value)
  }

  resetForm()
  load()
}

function edit(s) {
  editingId.value = s._id
  form.value = {
    employee: s.employee,
    department: s.department,
    date: s.date.slice(0, 10),
    shift: s.shift
  }
}

async function remove(id) {
  if (!confirm("Eintrag löschen?")) return
  await api.delete(`/schedule/${id}`)
  load()
}

function formatDate(d) {
  return new Date(d).toLocaleDateString("de-DE")
}

onMounted(load)
</script>

<style scoped>
.card {
  border-radius: 12px;
}
</style>
