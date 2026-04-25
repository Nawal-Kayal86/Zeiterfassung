<template>
  <div>
    <AppHeader
      :icon="route.meta.icon"
      :title="route.meta.title || 'Zeiterfassung'"
      @toggle-sidebar="toggleSidebar"
    />

    <AppSidebar
      :collapsed="isCollapsed"
      :user="auth.state.user"
      @toggle="toggleSidebar"
      @logout="handleLogout"
      @open-profile="isProfileModalOpen = true"
      @navigate="closeSidebarOnMobile"
    />

    <main class="content" :class="{ expanded: isCollapsed }">
      <RouterView />
    </main>

    <ProfileModal
      :open="isProfileModalOpen"
      :user="auth.state.user"
      :saving="isSavingProfile"
      @close="isProfileModalOpen = false"
      @submit="handleProfileUpdate"
    />
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { toast } from "vue3-toastify";
import { useAuth } from "../composables/useAuth";
import AppHeader from "./layout/AppHeader.vue";
import AppSidebar from "./layout/AppSidebar.vue";
import ProfileModal from "./layout/ProfileModal.vue";

const route = useRoute();
const router = useRouter();
const auth = useAuth();

const isCollapsed = ref(false);
const isProfileModalOpen = ref(false);
const isSavingProfile = ref(false);

function toggleSidebar() {
  isCollapsed.value = !isCollapsed.value;
}

function closeSidebarOnMobile() {
  if (window.innerWidth <= 768) {
    isCollapsed.value = true;
  }
}

async function handleProfileUpdate(profileData) {
  isSavingProfile.value = true;

  try {
    await auth.updateProfile(profileData);
    toast.success("Profil erfolgreich aktualisiert.");
    isProfileModalOpen.value = false;
  } finally {
    isSavingProfile.value = false;
  }
}

function handleLogout() {
  auth.logout();
  router.push("/login");
}
</script>

<style scoped>
.content {
  margin-top: 56px;
  margin-left: 252px;
  min-height: calc(100vh - 56px);
  background: #f8fafc;
  transition: margin-left 0.3s ease;
}

.content.expanded {
  margin-left: 0;
}

@media (max-width: 768px) {
  .content {
    margin-left: 0;
  }
}
</style>
