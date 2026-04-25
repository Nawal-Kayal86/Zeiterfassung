<template>
  <nav class="navbar navbar-dark bg-dark fixed-top app-navbar">
    <div class="container-fluid d-flex align-items-center">
      <button
        type="button"
        class="btn btn-link text-white d-md-none me-2"
        @click="$emit('toggle-sidebar')"
        aria-label="Navigation umschalten"
      >
        <i class="bi bi-list fs-4"></i>
      </button>

      <RouterLink class="navbar-brand d-flex align-items-center gap-2" to="/dashboard">
        <span class="brand-mark">Z</span>
        <span>Zeiterfassung</span>
      </RouterLink>

      <div class="page-title-container">
        <div v-if="icon" class="title-icon-wrapper">
          <i :class="icon"></i>
        </div>
        <span class="title-text-main">{{ title }}</span>
      </div>
    </div>
  </nav>
</template>

<script setup>
defineProps({
  icon: {
    type: String,
    default: "",
  },
  title: {
    type: String,
    default: "Zeiterfassung",
  },
});

defineEmits(["toggle-sidebar"]);
</script>

<style scoped>
.app-navbar {
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.18);
}

.navbar-brand {
  color: #fff;
  font-size: 1.05rem;
  font-weight: 700;
  text-decoration: none;
}

.brand-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.7rem;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.35);
}

.page-title-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-left: auto;
}

.title-icon-wrapper {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.8rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
}

.title-text-main {
  color: #fff;
  font-size: 1.05rem;
  font-weight: 700;
}

@media (max-width: 768px) {
  .page-title-container {
    gap: 0.5rem;
  }

  .title-text-main {
    font-size: 0.95rem;
  }
}
</style>
