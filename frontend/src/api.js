import axios from "axios";
import { toast } from "vue3-toastify";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 15000,
});

// Request: Token automatisch setzen
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response: Fehler zentral loggen & Toast anzeigen
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || error.message || "Ein unbekannter Fehler ist aufgetreten";

    if (error.response?.status === 401) {
        if (!window.location.pathname.startsWith("/login")) {
          toast.error("Sitzung abgelaufen. Bitte neu anmelden.");
        }
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        if (!window.location.pathname.startsWith("/login")) {
          setTimeout(() => window.location.href = "/login", 800);
        }
    } else if (error.response?.status === 403) {
        toast.error("Zugriff verweigert.");
    } else {
        toast.error(message);
    }

    console.error("API error:", message);
    return Promise.reject(error);
  },
);

export default api;
