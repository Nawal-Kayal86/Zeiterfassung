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
  transition: left 0.3s ease;
  z-index: 1020;
  overflow: visible;
  /* Important for the toggle button */
}

.sidebar.collapsed {
  left: -250px;
}

.sidebar-toggle {
  position: absolute;
  top: 30%;
  right: -22px;
  width: 45px;
  height: 45px;
  background: #6366f1;
  /* Indigo */
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1030;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transform: translateY(-50%);
  font-size: 1.5rem;
  /* Larger arrow */
}

.sidebar-toggle:hover {
  background: #4f46e5;
  /* Darker Indigo */
  right: -30px;
  transform: translateY(-50%) scale(1.1);
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
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
  height: calc(100vh - 56px);
  /* Subtract Navbar height */
  overflow-y: auto;
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
  color: #6366f1;
  /* Indigo */
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
  transition:
    background 0.2s ease,
    color 0.2s ease,
    transform 0.1s ease;
  font-weight: 500;
  cursor: pointer;
}

.nav-item i {
  font-size: 1.4rem;
  color: #495057;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
}

/* Hover & Active States */
.nav-item:hover {
  background-color: #f0f7ff;
  color: #0d6efd;
  transform: translateX(5px);
}

.nav-item:hover i {
  color: #0d6efd;
  transform: scale(1.1);
}

.router-link-active {
  background: linear-gradient(90deg, #6366f1 0%, #4f46e5 100%) !important;
  color: #ffffff !important;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.router-link-active i {
  color: #ffffff !important;
}

/* ====== Logout-Link ====== */
.logout-link {
  color: #dc3545;
  font-weight: 600;
  transition:
    background-color 0.2s,
    color 0.2s;
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

/* ====== Page Title Section ====== */
.page-title-container {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 4px 12px;
}

.title-icon-wrapper {
  background: #6366f1;
  /* Indigo */
  color: #ffffff;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  font-size: 1.3rem;
  box-shadow: 0 0 15px rgba(99, 102, 241, 0.4);
}

.title-text-main {
  font-size: 1.3rem;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: 0.5px;
  text-transform: none;
  /* Back to normal case for cleaner look */
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
    <nav class="navbar navbar-dark bg-dark fixed-top">
      <div class="container-fluid d-flex align-items-center">
        <!-- Dashboard / Sidebar Toggle Group -->
        <div class="d-flex align-items-center" style="width: 250px">
          <a class="navbar-brand d-none d-md-block" href="/dashboard">Zeiterfassung</a>
        </div>

        <!-- Centered Page Title -->
        <div class="flex-grow-1 d-flex justify-content-center">
          <div class="page-title-container">
            <div v-if="route.meta.icon" class="title-icon-wrapper">
              <i :class="route.meta.icon"></i>
            </div>
            <span class="title-text-main">{{
              route.meta.title || "Zeiterfassung"
            }}</span>
          </div>
        </div>
      </div>
    </nav>

    <!-- Sidebar -->
    <div class="sidebar" :class="{ collapsed: isCollapsed }">
      <!-- Toggle Button (Chevron) -->
      <div class="sidebar-toggle shadow-sm" @click="toggleSidebar">
        <i
          :class="isCollapsed ? 'bi bi-chevron-right' : 'bi bi-chevron-left'"
        ></i>
      </div>

      <ul class="nav-list">
        <li class="user-info" @click="openProfileModal" style="cursor: pointer;" title="Mein Profil / Passwort ändern">
          <p class="mb-2">
            Willkommen, <strong>{{ currentuser?.name }}</strong>
            <i class="bi bi-pencil-square ms-2 small text-muted"></i>
          </p>
        </li>

        <li>
          <RouterLink
            to="/dashboard"
            class="nav-item"
            exact-active-class="router-link-exact-active"
          >
            <i class="bi bi-clock"></i> Dashboard
          </RouterLink>
        </li>

        <li>
          <RouterLink to="/kalender" class="nav-item">
            <i class="bi bi-calendar"></i> Kalender
          </RouterLink>
        </li>

        <li>
          <RouterLink to="/billing" class="nav-item">
            <i class="bi bi-file-text"></i> Abrechnungsliste
          </RouterLink>
        </li>

        <li v-if="currentuser?.role === 'admin'">
          <RouterLink to="/departments" class="nav-item">
            <i class="bi bi-building"></i> Abteilungen
          </RouterLink>
        </li>

        <li v-if="currentuser?.role === 'admin'">
          <RouterLink to="/newuser" class="nav-item">
            <i class="bi bi-person-plus"></i> Benutzer
          </RouterLink>
        </li>

        <li>
          <RouterLink to="/leave-request" class="nav-item">
            <i class="bi bi-sun"></i> Urlaubskonto
          </RouterLink>
        </li>

        <li v-if="currentuser?.role === 'admin'">
          <RouterLink to="/leave-approval" class="nav-item">
            <i class="bi bi-clipboard2-check"></i> Urlaubsfreigabe
          </RouterLink>
        </li>

        <li>
          <RouterLink to="/errors" class="nav-item">
            <i class="bi bi-bug"></i> Fehlerprotokoll
          </RouterLink>
        </li>

        <li>
          <RouterLink to="/terminal" class="nav-item">
            <i class="bi bi-pc-display"></i> Terminal
          </RouterLink>
        </li>

        <li>
          <RouterLink to="/workflow" class="nav-item">
            <i class="bi bi-hospital"></i> Arzttermine
          </RouterLink>
        </li>

        <li>
          <RouterLink to="/schedule" class="nav-item">
            <i class="bi bi-calendar-check"></i> Dienstplan
          </RouterLink>
        </li>

        <li>
          <RouterLink to="/reports" class="nav-item">
            <i class="bi bi-graph-up-arrow"></i> Berichte
          </RouterLink>
        </li>

        <li v-if="currentuser?.role === 'admin'">
          <RouterLink to="/config" class="nav-item">
            <i class="bi bi-calendar-heart"></i> Feiertage & Ferien
          </RouterLink>
        </li>

        <li v-if="currentuser?.role === 'admin'">
          <RouterLink to="/work-schedule" class="nav-item">
            <i class="bi bi-clock-history text-indigo"></i> Sollarbeitszeiten
          </RouterLink>
        </li>

        <li class="logout">
          <a @click="logout" class="nav-item logout-link">
            <i class="bi bi-box-arrow-right"></i> Abmelden
          </a>
        </li>
      </ul>
    </div>

    <!-- Content -->
    <div class="content" :class="{ expanded: isCollapsed }">
      <RouterView />
    </div>

    <!-- Profile Update Modal -->
    <div
      class="modal fade"
      id="profileModal"
      tabindex="-1"
      aria-labelledby="profileModalLabel"
      aria-hidden="true"
      ref="profileModalRef"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg" style="border-radius: 16px;">
          <div class="modal-header bg-indigo text-white" style="border-top-left-radius: 16px; border-top-right-radius: 16px;">
            <h5 class="modal-title" id="profileModalLabel">
              <i class="bi bi-person-gear"></i> Profileinstellungen
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body p-4">
            <form @submit.prevent="updateProfile">
              <div class="mb-3">
                <label class="form-label small fw-bold text-muted">NAME</label>
                <input v-model="profileForm.name" type="text" class="form-control" required />
              </div>
              <div class="mb-3">
                <label class="form-label small fw-bold text-muted">E-MAIL</label>
                <input v-model="profileForm.email" type="email" class="form-control" required />
              </div>
              <hr class="my-4">
              <div class="mb-3">
                <label class="form-label small fw-bold text-muted">NEUES PASSWORT (Optional)</label>
                <input v-model="profileForm.password" type="password" class="form-control" placeholder="Leer lassen um nicht zu ändern" />
              </div>
              <button type="submit" class="btn btn-indigo w-100 py-2 mt-2 fw-bold shadow-sm">
                Speichern
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRoute } from "vue-router";
import api from "../api";
import { toast } from "vue3-toastify";
import * as bootstrap from "bootstrap";

const route = useRoute();
const isCollapsed = ref(false);
const currentuser = JSON.parse(localStorage.getItem("user")) || null;

const profileModalRef = ref(null);
let modalInstance = null;

const profileForm = ref({
  name: currentuser?.name || "",
  email: currentuser?.email || "",
  password: ""
});

const openProfileModal = () => {
    if (!modalInstance) {
        modalInstance = new bootstrap.Modal(profileModalRef.value);
    }
    modalInstance.show();
};

const updateProfile = async () => {
    try {
        await api.put("/users/profile/update", profileForm.value);
        toast.success("Profil erfolgreich aktualisiert! ✨");
        
        // Lokale User-Daten im localStorage updaten
        const updatedUser = { ...currentuser, name: profileForm.name, email: profileForm.email };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        
        modalInstance.hide();
        // Evtl. Reload oder reaktives Update nötig
        window.location.reload(); 
    } catch (e) {
        // Fehler wird global behandelt
    }
};

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
};

const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login";
};
</script>
