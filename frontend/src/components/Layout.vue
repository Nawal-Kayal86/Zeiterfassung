<style scoped>
/* ====== Layout Grundstruktur ====== */
.sidebar {
  height: 100vh;
  width: 250px;
  position: fixed;
  top: 56px;
  left: 0;
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  box-shadow: 2px 0 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  overflow-y: auto;
  z-index: 1020;
}

.sidebar.collapsed {
  transform: translateX(-100%);
  box-shadow: none;
}

/* ====== Inhalt ====== */
.content {
  margin-left: 250px;
  margin-top: 56px;
  /* padding: 2rem; */
  background-color: #f9fafb;
  min-height: calc(100vh - 56px);
  transition: margin-left 0.3s ease;
}

.content.expanded {
  margin-left: 0;
}

/* ====== Navbar ====== */
.navbar {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  font-weight: 500;
}

.navbar-brand {
  font-size: 1.3rem;
  letter-spacing: 0.5px;
}

/* ====== Sidebar Navigation ====== */
.nav-list {
  list-style: none;
  margin: 0;
  padding: 0.1rem;
  display: flex;
  flex-direction: column;
  /* gap: 0.4rem; */
}

/* ====== Benutzerinfo ====== */
.user-info {
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 12px;
  margin-bottom: 1.2rem;
  color: #444;
  font-size: 0.9rem;
  box-shadow: inset 0 0 4px rgba(0, 0, 0, 0.05);
}

.user-info strong {
  color: #0d6efd;
}

/* ====== Navigationselemente ====== */
.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.1rem 1rem;
  color: #333;
  text-decoration: none;
  border-radius: 8px;
  transition: background 0.2s ease, color 0.2s ease, transform 0.1s ease;
  font-weight: 500;
  cursor: pointer;
}

.nav-item i {
  font-size: 1.2rem;
  color: #6c757d;
  transition: color 0.2s ease;
}

/* Hover & Active States */
.nav-item:hover {
  background-color: #eef4ff;
  color: #0d6efd;
  transform: translateX(2px);
}

.nav-item:hover i {
  color: #0d6efd;
}

.router-link-active {
  background-color: #0d6efd !important;
  color: #fff !important;
  box-shadow: 0 2px 8px rgba(13, 110, 253, 0.2);
}

.router-link-active i {
  color: #fff !important;
}

/* ====== Logout-Link ====== */
.logout-link {
  color: #dc3545;
  font-weight: 600;
  transition: background-color 0.2s, color 0.2s;
}

.logout-link:hover {
  background-color: #ffe5e5;
  color: #b02a37;
}

/* ====== Scrollbar Styling (optional schön) ====== */
.sidebar::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-thumb {
  background-color: #cfd4da;
  border-radius: 10px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background-color: #adb5bd;
}
/* Nur exakt aktive Links (z. B. Dashboard auf /) */
.router-link-exact-active {
  background-color: #0d6efd !important;
  color: #fff !important;
  box-shadow: 0 2px 8px rgba(13, 110, 253, 0.2);
}

.router-link-exact-active i {
  color: #fff !important;
}

/* ====== Responsive ====== */
@media (max-width: 768px) {
  .sidebar {
    width: 220px;
  }

  .content {
    margin-left: 0;
    padding: 1rem;
  }
}

</style>

<template>
  <div>
    <!-- Navbar -->
    <nav class="navbar navbar-dark bg-dark fixed-top d-flex">
      <div class="container-fluid">
        <a class="navbar-brand pe-3" href="/">Zeiterfassung</a>
        <!-- Burger Button -->
        <button class="btn btn-outline-light me-3" @click="toggleSidebar">
          ☰
        </button>
      </div>
    </nav>

    <!-- Sidebar -->
    <div class="sidebar" :class="{ collapsed: isCollapsed }">
  <ul class="nav-list">
    <li class="user-info">
      <p>Willkommen, <strong>{{ user?.name }}</strong></p>
      <p>Rolle: <strong>{{ user?.role }}</strong></p>
    </li>

    <li>
<RouterLink 
  to="/dashboard" 
  class="nav-item" 
  exact-active-class="router-link-exact-active"
>
  <i class="bi bi-speedometer2"></i> Dashboard
</RouterLink>
    </li>
    <li>
      <RouterLink to="/billing" class="nav-item">
        <i class="bi bi-receipt"></i> Abrechnungsliste
      </RouterLink>
    </li>
    <li v-if="user?.role === 'admin'">
      <RouterLink to="/newuser" class="nav-item">
        <i class="bi bi-person-plus"></i> Neuen User anlegen
      </RouterLink>
    </li>
    <li>
      <RouterLink to="/kalender" class="nav-item">
        <i class="bi bi-calendar-event"></i> Kalender
      </RouterLink>
    </li>
    <li>
      <RouterLink to="/errors" class="nav-item">
        <i class="bi bi-bug"></i> Fehlerprotokoll
      </RouterLink>
    </li>
    <li>
      <RouterLink to="/attendance" class="nav-item">
        <i class="bi bi-people"></i> Anwesenheitsübersicht
      </RouterLink>
    </li>
    <li>
      <RouterLink to="/terminal" class="nav-item">
        <i class="bi bi-pc-display"></i> Terminal
      </RouterLink>
    </li>
    <li>
      <RouterLink to="/workflow" class="nav-item">
        <i class="bi bi-diagram-3"></i> Workflow
      </RouterLink>
    </li>
    <li>
      <RouterLink to="/schedule" class="nav-item">
        <i class="bi bi-calendar-check"></i> Dienstplan
      </RouterLink>
    </li>
    <li>
      <RouterLink to="/reports" class="nav-item">
        <i class="bi bi-bar-chart"></i> Berichte
      </RouterLink>
    </li>

    <li class="logout">
      <a @click="logout" class="nav-item logout-link">
        <i class="bi bi-box-arrow-right"></i> Logout
      </a>
    </li>
  </ul>
</div>

    <!-- Content -->
    <div class="content" :class="{ expanded: isCollapsed }">
      <RouterView />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"

const isCollapsed = ref(false)
const user = JSON.parse(localStorage.getItem("user")) || null

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}

const logout = () => {
  localStorage.removeItem("token")
  localStorage.removeItem("user")
  window.location.href = "/login"
}

</script>
