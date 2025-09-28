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
      <ul class="nav flex-column p-3">
        <li class="mb-1">
          Willkommen, <strong>{{ user?.name }}</strong>
        </li>
        <li class="mb-3">
          Rolle: <strong>{{ user?.role }}</strong>
        </li>

        <!-- Links -->
        <li><RouterLink class="sidebar-btn" to="/">Dashboard</RouterLink></li>
        <li><RouterLink class="sidebar-btn" to="/billing">Abrechnungsliste</RouterLink></li>
        <li v-if="user?.role === 'admin'">
          <RouterLink class="sidebar-btn" to="/newuser">Neuen User anlegen</RouterLink>
        </li>
        <li><RouterLink class="sidebar-btn" to="/kalender">Kalender</RouterLink></li>
        <li><RouterLink class="sidebar-btn" to="/errors">Fehlerprotokoll</RouterLink></li>
        <li><RouterLink class="sidebar-btn" to="/attendance">Anwesenheitsübersicht</RouterLink></li>
        <li><RouterLink class="sidebar-btn" to="/terminal">Terminal</RouterLink></li>
        <li><RouterLink class="sidebar-btn" to="/workflow">Workflow</RouterLink></li>
        <li><RouterLink class="sidebar-btn" to="/schedule">Dienstplan</RouterLink></li>
        <li><RouterLink class="sidebar-btn" to="/reports">Berichte</RouterLink></li>

        <!-- Logout -->
        <li>
          <button class="btn-logout" @click="logout">Logout</button>
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
