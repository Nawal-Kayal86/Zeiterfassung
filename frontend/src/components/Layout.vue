<template>
  <div>
    <!-- Navbar -->
    <nav class="navbar navbar-dark bg-dark fixed-top d-flex justify-content-between">
      <div class="container-fluid">
        <a class="navbar-brand" href="#">Zeiterfassung</a>
        <!-- Burger Button rechts -->
        <button class="btn btn-outline-light me-3" @click="toggleSidebar">
          ☰
        </button>
      </div>
    </nav>

    <!-- Sidebar -->
    <div class="sidebar" :class="{ collapsed: isCollapsed }">
      <ul class="nav flex-column p-3">
        <!-- Nur Admin -->
        <li v-if="user?.role === 'admin'" class="mb-2">
          <RouterLink class="btn btn-outline-primary w-100" to="/admin">
            Zur Admin-Seite
          </RouterLink>
        </li>

        <li class="mb-2">
          <RouterLink class="btn btn-outline-secondary w-100" to="/myworksessions">
            Meine Arbeitszeiten
          </RouterLink>
        </li>

        <li>
          <button class="btn btn-secondary w-100" @click="logout">
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
