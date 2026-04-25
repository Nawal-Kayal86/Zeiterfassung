<template>
  <div class="row mb-4">
    <div class="col-md-6 mb-3">
      <div class="card shadow-sm h-100 border-0 bg-white p-4">
        <div class="d-flex align-items-center gap-4">
          <div class="stat-icon-box bg-success-soft text-success-custom">
            <i class="bi bi-box-arrow-in-right fs-2"></i>
          </div>
          <div>
            <h6 class="text-muted text-uppercase smaller fw-bold mb-1">Letzter Beginn</h6>
            <p class="fw-bold fs-5 mb-0 text-dark">
              <template v-if="summary.lastStart">
                <span class="d-block">{{ formatDate(summary.lastStart) }}</span>
                <span class="text-success-custom font-monospace">
                  {{ formatTime(summary.lastStart) }}
                </span>
              </template>
              <template v-else>-----</template>
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="col-md-6 mb-3">
      <div class="card shadow-sm h-100 border-0 bg-white p-4">
        <div class="d-flex align-items-center gap-4">
          <div class="stat-icon-box bg-danger-soft text-danger">
            <i class="bi bi-box-arrow-right fs-2"></i>
          </div>
          <div>
            <h6 class="text-muted text-uppercase smaller fw-bold mb-1">Letztes Ende</h6>
            <p class="fw-bold fs-5 mb-0 text-dark">
              <template v-if="!activeSession && summary.lastEnd">
                <span class="d-block">{{ formatDate(summary.lastEnd) }}</span>
                <span class="text-danger font-monospace">{{ formatTime(summary.lastEnd) }}</span>
              </template>
              <template v-else>-----</template>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatDate, formatTime } from "../../utils/time";

defineProps({
  summary: {
    type: Object,
    required: true,
  },
  activeSession: {
    type: Object,
    default: null,
  },
});
</script>

<style scoped>
.stat-icon-box {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  flex-shrink: 0;
}

.bg-success-soft {
  background-color: rgba(112, 174, 145, 0.15) !important;
}

.bg-danger-soft {
  background-color: rgba(220, 53, 69, 0.1);
}

.text-success-custom {
  color: #70ae91 !important;
}

.smaller {
  font-size: 0.75rem;
}
</style>
