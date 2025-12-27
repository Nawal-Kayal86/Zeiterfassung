<template>
  <div class="container mt-4">
    <h2 class="mb-4">🌴 طلب إجازة</h2>

    <!-- نموذج -->
    <div class="card shadow-sm p-3 mb-4">
      <h5>📝 تقديم طلب جديد</h5>

      <form @submit.prevent="submitRequest">
        <div class="row g-3">
          <div class="col-md-4">
            <label>من</label>
            <input type="date" v-model="form.from" class="form-control" required />
          </div>

          <div class="col-md-4">
            <label>إلى</label>
            <input type="date" v-model="form.to" class="form-control" required />
          </div>

          <div class="col-md-4">
            <label>نوع الإجازة</label>
            <select v-model="form.type" class="form-select">
              <option value="vacation">إجازة سنوية</option>
              <option value="sick">إجازة مرضية</option>
              <option value="other">أخرى</option>
            </select>
          </div>

          <div class="col-12">
            <label>السبب</label>
            <textarea v-model="form.reason" class="form-control" required />
          </div>

          <div class="col-12">
            <button class="btn btn-primary w-100">➕ إرسال الطلب</button>
          </div>
        </div>
      </form>
    </div>

    <!-- طلباتي -->
    <div class="card shadow-sm p-3">
      <h5>📋 طلباتي</h5>

      <table v-if="requests.length" class="table table-striped">
        <thead>
          <tr>
            <th>من</th>
            <th>إلى</th>
            <th>النوع</th>
            <th>الحالة</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in requests" :key="r._id">
            <td>{{ format(r.from) }}</td>
            <td>{{ format(r.to) }}</td>
            <td>{{ translateType(r.type) }}</td>
            <td>
              <span class="badge bg-warning" v-if="r.status==='pending'">قيد المراجعة</span>
              <span class="badge bg-success" v-if="r.status==='approved'">مقبول</span>
              <span class="badge bg-danger" v-if="r.status==='rejected'">مرفوض</span>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-else class="alert alert-secondary">لا توجد طلبات</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import api from "../api"

const requests = ref([])
const form = ref({ from:"", to:"", type:"vacation", reason:"" })

const load = async () => {
  const res = await api.get("/leave-requests/my")
  requests.value = res.data
}

const submitRequest = async () => {
  await api.post("/leave-requests", form.value)
  form.value = { from:"", to:"", type:"vacation", reason:"" }
  load()
}

const format = d => new Date(d).toLocaleDateString()

const translateType = t =>
  t === "vacation" ? "سنوية" : t === "sick" ? "مرضية" : "أخرى"

onMounted(load)
</script>
