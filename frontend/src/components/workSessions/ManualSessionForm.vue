<template>
  <div class="card shadow-sm p-4 border-0 bg-white">
    <div class="d-flex align-items-center justify-content-between mb-4">
      <h5 class="card-title mb-0 d-flex align-items-center gap-2">
        <i class="bi bi-clock-history text-indigo"></i>
        {{ title }}
      </h5>
      <span v-if="editing" class="badge bg-warning-subtle text-warning-emphasis">
        Bearbeitung
      </span>
    </div>

    <form @submit.prevent="$emit('submit')">
      <div class="mb-3">
        <label class="form-label fw-semibold text-muted small text-uppercase">Datum</label>
        <input v-model="model.date" type="date" class="form-control custom-input" required />
      </div>

      <div class="mb-3">
        <label class="form-label fw-semibold text-muted small text-uppercase">Startzeit</label>
        <input v-model="model.start" type="time" class="form-control custom-input" />
      </div>

      <div class="mb-3">
        <label class="form-label fw-semibold text-muted small text-uppercase">Endzeit</label>
        <input v-model="model.end" type="time" class="form-control custom-input" />
      </div>

      <div class="mb-4">
        <label class="form-label fw-semibold text-muted small text-uppercase">Pause (HH:MM)</label>
        <input
          v-model="model.pause"
          type="text"
          class="form-control custom-input"
          placeholder="0:30"
        />
      </div>

      <div class="d-flex gap-2">
        <button type="submit" class="btn btn-indigo flex-grow-1 py-2 fw-bold" :disabled="saving">
          {{ saving ? "Speichert..." : submitLabel }}
        </button>
        <button
          v-if="editing"
          type="button"
          class="btn btn-outline-secondary py-2"
          @click="$emit('cancel-edit')"
        >
          Zuruecksetzen
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
const model = defineModel({
  type: Object,
  required: true,
});

defineProps({
  title: {
    type: String,
    default: "Manuelle Erfassung",
  },
  submitLabel: {
    type: String,
    default: "Speichern",
  },
  editing: {
    type: Boolean,
    default: false,
  },
  saving: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["submit", "cancel-edit"]);
</script>

<style scoped>
.text-indigo {
  color: #6366f1 !important;
}

.btn-indigo {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: #fff;
  border: none;
}

.custom-input {
  border: 1px solid #e2e8f0;
  border-radius: 0.8rem;
  padding: 0.75rem 0.85rem;
  background: #f8fafc;
}

.custom-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
  background: #fff;
}
</style>
