import { computed, reactive, readonly } from "vue";
import api from "../api";

const authState = reactive({
  token: localStorage.getItem("token") || "",
  user: parseStoredUser(),
});

export function useAuth() {
  const isAuthenticated = computed(() => Boolean(authState.token && authState.user));
  const isAdmin = computed(() => authState.user?.role === "admin");

  function setSession({ token = authState.token, user = authState.user } = {}) {
    authState.token = token || "";
    authState.user = user || null;

    if (authState.token) {
      localStorage.setItem("token", authState.token);
    } else {
      localStorage.removeItem("token");
    }

    if (authState.user) {
      localStorage.setItem("user", JSON.stringify(authState.user));
    } else {
      localStorage.removeItem("user");
    }
  }

  async function refreshCurrentUser() {
    if (!authState.token) {
      return null;
    }

    const response = await api.get("/me");
    const nextUser = response.data?.user || null;
    setSession({ token: authState.token, user: nextUser });
    return nextUser;
  }

  async function updateProfile(profileData) {
    await api.put("/users/profile/update", profileData);
    const nextUser = {
      ...authState.user,
      name: profileData.name,
      email: profileData.email,
    };
    setSession({ token: authState.token, user: nextUser });
    return nextUser;
  }

  function logout() {
    setSession({ token: "", user: null });
  }

  return {
    state: readonly(authState),
    isAuthenticated,
    isAdmin,
    setSession,
    refreshCurrentUser,
    updateProfile,
    logout,
  };
}

export function getStoredToken() {
  return authState.token;
}

export function getStoredUser() {
  return authState.user;
}

export function isStoredTokenExpired(token = authState.token) {
  if (!token) {
    return true;
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return Boolean(payload.exp && payload.exp < Date.now() / 1000);
  } catch {
    return true;
  }
}

function parseStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}
