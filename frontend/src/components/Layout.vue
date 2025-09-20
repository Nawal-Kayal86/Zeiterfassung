<template>
  <div>
    <!-- Navbar -->
    <nav class="navbar navbar-dark bg-dark fixed-top d-flex">
      <div class="container-fluid  ">
        <a class="navbar-brand pe-3" href="/">Zeiterfassung</a>
        <!-- Burger Button rechts -->
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
        <li class="mb-1">
          Rolle, <strong>{{ user?.role }}</strong>
        </li>

        <!-- Nur Admin -->
        <!-- <li v-if="user?.role === 'admin'" class="mb-1">
          <RouterLink class="btn btn-outline-primary w-100 mb-1" to="/admin">
            Zur Admin-Seite
          </RouterLink>
        </li> -->
        <li class="mb-1">
          <RouterLink class="btn btn-outline-primary w-100 mb-1" to="/">
            Dashboard
          </RouterLink>
        </li>
        <li class="mb-1">
          <RouterLink class="btn btn-outline-primary w-100 mb-1" to="/billing">
            Abrechnungsliste
          </RouterLink>
        </li>
        <!-- Allgemeine Links -->
        <li class="mb-1" v-if="user?.role === 'admin'">
          <RouterLink class="btn btn-outline-secondary w-100 mb-1" to="/newuser">
            neu user anlagen
          </RouterLink>
        </li>
        <li class="mb-1">
          <RouterLink class="btn btn-outline-secondary w-100 mb-1" to="/calendar">
            Kalender
          </RouterLink>
        </li>
        <li class="mb-1">
          <RouterLink class="btn btn-outline-secondary w-100 mb-1" to="/errors">
            Fehlerprotokoll
          </RouterLink>
        </li>
        <li class="mb-1">
          <RouterLink class="btn btn-outline-secondary w-100 mb-1" to="/attendance">
            Anwesenheitsübersicht
          </RouterLink>
        </li>
        <li class="mb-1">
          <RouterLink class="btn btn-outline-secondary w-100 mb-1" to="/terminal">
            Terminal
          </RouterLink>
        </li>
        <li class="mb-1">
          <RouterLink class="btn btn-outline-secondary w-100 mb-1" to="/workflow">
            Workflow
          </RouterLink>
        </li>
        <li class="mb-1">
          <RouterLink class="btn btn-outline-secondary w-100 mb-1" to="/schedule">
            Dienstplan
          </RouterLink>
        </li>
        <li class="mb-1">
          <RouterLink class="btn btn-outline-secondary w-100 mb-1" to="/reports">
            Berichte
          </RouterLink>
        </li>

        <!-- Logout -->
        <li>
          <button class="btn btn-danger w-100" @click="logout">
            Logout
          </button>
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

// Benutzer aus LocalStorage holen (Beispiel)
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

<style scoped>
.sidebar {
  height: 100vh;
  width: 250px;
  position: fixed;
  top: 56px;
  left: 0;
  background-color: #f8f9fa;
  border-right: 1px solid #ddd;
  transition: transform 0.3s ease;
}

.sidebar.collapsed {
  transform: translateX(-100%);
}

.content {
  margin-left: 250px;
  margin-top: 56px;
  padding: 1rem;
  transition: margin-left 0.3s ease;
}

.content.expanded {
  margin-left: 0;
}

@media (max-width: 768px) {
  .sidebar {
    width: 200px;
  }
}
</style>
