<template>
  <aside class="sidebar" :class="{ collapsed }">
    <div class="sidebar-toggle shadow-sm d-none d-md-flex" @click="$emit('toggle')">
      <i :class="collapsed ? 'bi bi-chevron-right' : 'bi bi-chevron-left'"></i>
    </div>

    <div class="sidebar-inner">
      <button
        type="button"
        class="user-card btn btn-light text-start w-100"
        @click="$emit('open-profile')"
      >
        <span class="small text-muted d-block">Angemeldet als</span>
        <strong class="d-block">{{ user?.name || "Unbekannt" }}</strong>
        <span class="small text-muted">{{ userRoleLabel }}</span>
      </button>

      <nav class="nav-list">
        <RouterLink
          v-for="item in visibleItems"
          :key="item.to"
          :to="item.to"
          class="nav-item"
          @click="$emit('navigate')"
        >
          <i :class="item.icon"></i>
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>

      <button type="button" class="nav-item logout-link btn btn-link text-start" @click="$emit('logout')">
        <i class="bi bi-box-arrow-right"></i>
        <span>Abmelden</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  collapsed: {
    type: Boolean,
    default: false,
  },
  user: {
    type: Object,
    default: null,
  },
});

defineEmits(["toggle", "logout", "open-profile", "navigate"]);

const navigationItems = [
  { to: "/dashboard", label: "Dashboard", icon: "bi bi-clock-history" },
  { to: "/kalender", label: "Kalender", icon: "bi bi-calendar3-event-fill" },
  { to: "/billing", label: "Abrechnung", icon: "bi bi-receipt-cutoff" },
  { to: "/leave-request", label: "Urlaubskonto", icon: "bi bi-sun-fill" },
  { to: "/errors", label: "Fehlerprotokoll", icon: "bi bi-exclamation-triangle-fill" },
  // { to: "/terminal", label: "Terminal", icon: "bi bi-pc-display-horizontal" },
  { to: "/workflow", label: "Arzttermine", icon: "bi bi-hospital" },
  { to: "/schedule", label: "Dienstplan", icon: "bi bi-calendar-date-fill" },
  { to: "/reports", label: "Berichte", icon: "bi bi-graph-up-arrow", adminOnly: true },
  { to: "/departments", label: "Abteilungen", icon: "bi bi-building-fill", adminOnly: true },
  { to: "/newuser", label: "Benutzer", icon: "bi bi-people-fill", adminOnly: true },
  { to: "/leave-approval", label: "Urlaubsfreigabe", icon: "bi bi-clipboard2-check", adminOnly: true },
  { to: "/config", label: "Feiertage & Ferien", icon: "bi bi-calendar-range", adminOnly: true },
  { to: "/work-schedule", label: "Sollarbeitszeiten", icon: "bi bi-clock-fill", adminOnly: true },
];

const visibleItems = computed(() =>
  navigationItems.filter((item) => !item.adminOnly || props.user?.role === "admin"),
);

const userRoleLabel = computed(() =>
  props.user?.role === "admin" ? "Administrator" : "Mitarbeiter",
);
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 56px;
  left: 0;
  z-index: 1020;
  width: 252px;
  height: calc(100vh - 56px);
  background: #fff;
  border-right: 1px solid #e5e7eb;
  box-shadow: 2px 0 6px rgba(15, 23, 42, 0.06);
  transition: transform 0.3s ease;
}

.sidebar.collapsed {
  transform: translateX(-100%);
}

.sidebar-inner {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  height: 100%;
  padding: 0.75rem;
  overflow: hidden;
}

.sidebar-toggle {
  position: absolute;
  top: 25%;
  right: -22px;
  width: 44px;
  height: 44px;
  border-radius: 999px;
  align-items: center;
  justify-content: center;
  background: #6366f1;
  color: #fff;
  cursor: pointer;
}

.user-card {
  border: 1px solid #e5e7eb;
  border-radius: 0.65rem;
  padding: 0.62rem 0.75rem;
  background: linear-gradient(180deg, #f8fafc, #ffffff);
  line-height: 1.25;
}

.user-card strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nav-list {
  display: flex;
  flex: 1;
  min-height: 0;
  flex-direction: column;
  gap: 0.22rem;
  overflow-y: auto;
  padding-right: 0.15rem;
  scrollbar-width: thin;
  scrollbar-color: #c7d2fe transparent;
}

.nav-list::-webkit-scrollbar {
  width: 5px;
}

.nav-list::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: #c7d2fe;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.62rem;
  min-height: 38px;
  padding: 0.5rem 0.68rem;
  color: #334155;
  border-radius: 0.55rem;
  text-decoration: none;
  font-size: 0.92rem;
  line-height: 1.2;
  transition: all 0.2s ease;
}

.nav-item i {
  width: 1.15rem;
  flex: 0 0 1.15rem;
  text-align: center;
  font-size: 1rem;
}

.nav-item span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nav-item:hover {
  background: #eef2ff;
  color: #4338ca;
}

.router-link-active {
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: #fff;
  box-shadow: 0 10px 24px rgba(99, 102, 241, 0.22);
}

.router-link-active i {
  color: #fff;
}

.logout-link {
  flex: 0 0 auto;
  margin-top: 0.15rem;
  color: #dc2626;
}

.logout-link:hover {
  background: #fee2e2;
  color: #b91c1c;
}

@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    max-width: 320px;
  }
}
</style>
