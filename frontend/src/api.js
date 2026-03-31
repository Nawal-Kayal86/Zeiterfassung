import axios from "axios";
import { toast } from "vue3-toastify";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
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
    
    // Status-spezifische Meldungen
    if (error.response?.status === 401) {
        toast.error("Sitzung abgelaufen. Bitte neu anmelden.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setTimeout(() => window.location.href = "/login", 2000);
    } else {
        toast.error(message);
    }

    console.error("API error:", message);
    return Promise.reject(error);
  },
);

export default api;
