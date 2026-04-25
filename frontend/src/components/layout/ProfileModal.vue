<template>
  <div v-if="open" class="profile-modal-backdrop" @click.self="$emit('close')">
    <div class="profile-modal card shadow-lg border-0">
      <div class="card-header bg-dark text-white d-flex align-items-center justify-content-between">
        <h5 class="mb-0">
          <i class="bi bi-person-gear me-2"></i>Profileinstellungen
        </h5>
        <button
          type="button"
          class="btn btn-link text-white p-0"
          aria-label="Schliessen"
          @click="$emit('close')"
        >
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <div class="card-body p-4">
        <form @submit.prevent="submitForm">
          <div class="mb-3">
            <label class="form-label small fw-bold text-muted">NAME</label>
            <input v-model="form.name" type="text" class="form-control" required />
          </div>

          <div class="mb-3">
            <label class="form-label small fw-bold text-muted">E-MAIL</label>
            <input v-model="form.email" type="email" class="form-control" required />
          </div>

          <div class="mb-4">
            <label class="form-label small fw-bold text-muted">
              NEUES PASSWORT
            </label>
            <input
              v-model="form.password"
              type="password"
              class="form-control"
              placeholder="Leer lassen, um das Passwort nicht zu aendern"
            />
          </div>

          <div class="d-flex gap-2 justify-content-end">
            <button type="button" class="btn btn-outline-secondary" @click="$emit('close')">
              Abbrechen
            </button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? "Speichert..." : "Speichern" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from "vue";

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  user: {
    type: Object,
    default: null,
  },
  saving: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "submit"]);

const form = reactive({
  name: "",
  email: "",
  password: "",
});

watch(
  () => props.user,
  (user) => {
    form.name = user?.name || "";
    form.email = user?.email || "";
    form.password = "";
  },
  { immediate: true },
);

function submitForm() {
  emit("submit", { ...form });
}
</script>

<style scoped>
.profile-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(3px);
}

.profile-modal {
  width: min(100%, 32rem);
  border-radius: 1rem;
  overflow: hidden;
}
</style>
