<template>
  <div class="container mt-4">

    <!-- Formular -->
    <div class="card shadow-sm p-3 mb-4">
      <h5>📝 Neuen Antrag stellen</h5>

      <form @submit.prevent="submitRequest">
        <div class="row g-3">
          <div class="col-md-4">
            <label>Von</label>
            <input type="date" v-model="form.from" class="form-control" required />
          </div>

          <div class="col-md-4">
            <label>Bis</label>
            <input type="date" v-model="form.to" class="form-control" required />
          </div>

          <div class="col-md-4">
            <label>Urlaubsart</label>
            <select v-model="form.type" class="form-select">
              <option value="vacation">Jahresurlaub</option>
              <option value="sick">Krankheitsurlaub</option>
              <option value="other">Andere</option>
            </select>
          </div>

          <div class="col-12">
            <label>Grund</label>
            <textarea v-model="form.reason" class="form-control" required />
          </div>

          <div class="col-12">
            <button class="btn btn-primary w-100">➕ Antrag absenden</button>
          </div>
        </div>
      </form>
    </div>

    <!-- Meine Anträge -->
    <div class="card shadow-sm p-3">
      <h5>📋 Meine Anträge</h5>

      <table v-if="requests.length" class="table table-striped">
        <thead>
          <tr>
            <th>Von</th>
            <th>Bis</th>
            <th>Grund</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in requests" :key="r._id">
            <td>{{ format(r.from) }}</td>
            <td>{{ format(r.to) }}</td>
            <td>{{ translateType(r.type) }}</td>
            <td>
              <span class="badge bg-warning" v-if="r.status === 'pending'">In Bearbeitung</span>
              <span class="badge bg-success" v-if="r.status === 'approved'">Genehmigt</span>
              <span class="badge bg-danger" v-if="r.status === 'rejected'">Abgelehnt</span>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-else class="alert alert-secondary">Keine Anträge vorhanden</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import api from "../api"

const requests = ref([])
const form = ref({ from: "", to: "", type: "vacation", reason: "" })

const load = async () => {
  const res = await api.get("/leave-requests")
  requests.value = res.data
}

const submitRequest = async () => {
  await api.post("/leave-requests", form.value)
  form.value = { from: "", to: "", type: "vacation", reason: "" }
  load()
}

const format = d => new Date(d).toLocaleDateString()

const translateType = t =>
  t === "vacation" ? "Jahresurlaub" : t === "sick" ? "Krankheitsurlaub" : "Andere"

onMounted(load)
</script>
