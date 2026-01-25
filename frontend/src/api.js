import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api"
});

// Request: Token automatisch setzen
api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response: Fehler zentral loggen
api.interceptors.response.use(
  response => response,
  error => {
    console.error("API error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
