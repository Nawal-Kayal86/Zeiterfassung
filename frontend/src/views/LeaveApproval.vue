<template>
  <div class="container mt-4">
    <h2>✅ موافقة الإجازات</h2>

    <div v-if="loading" class="alert alert-info">جاري التحميل...</div>

    <table v-else class="table table-striped">
      <thead>
        <tr>
          <th>الموظف</th>
          <th>القسم</th>
          <th>من</th>
          <th>إلى</th>
          <th>النوع</th>
          <th>الحالة</th>
          <th>الإجراء</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="r in requests" :key="r._id">
          <td>{{ r.user_id.name }}</td>
          <td>{{ r.user_id.department }}</td>
          <td>{{ format(r.from) }}</td>
          <td>{{ format(r.to) }}</td>
          <td>{{ r.type }}</td>

          <td>
            <span
              :class="{
                'badge bg-warning': r.status === 'pending',
                'badge bg-success': r.status === 'approved',
                'badge bg-danger': r.status === 'rejected'
              }"
            >
              {{ r.status }}
            </span>
          </td>

          <td v-if="r.status === 'pending'">
            <button class="btn btn-success btn-sm me-2" @click="approve(r._id)">
              ✔️ موافقة
            </button>
            <button class="btn btn-danger btn-sm" @click="reject(r._id)">
              ❌ رفض
            </button>
          </td>

          <td v-else>-</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "../api";

const requests = ref([]);
const loading = ref(true);

const load = async () => {
  const res = await api.get("/leave-requests/admin");
  requests.value = res.data;
  loading.value = false;
};

const approve = async (id) => {
  await api.put(`/leave-requests/${id}/approve`);
  load();
};

const reject = async (id) => {
  await api.put(`/leave-requests/${id}/reject`);
  load();
};

const format = (d) => new Date(d).toLocaleDateString();

onMounted(load);
</script>
