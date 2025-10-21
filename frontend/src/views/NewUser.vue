<template>
  <div class="container mt-4">
    <h2>User Verwaltung</h2>

    <!-- Formular -->
    <form @submit.prevent="saveUser">
      <div class="card p-3 mb-4">
        <div class="mb-3">
          <label class="form-label">Name</label>
          <input v-model="user.name" type="text" class="form-control" required />
        </div>

        <div class="mb-3">
          <label class="form-label">E-Mail</label>
          <input v-model="user.email" type="email" class="form-control" />
        </div>

        <div class="mb-3">
          <label class="form-label">Rolle</label>
          <select v-model="user.role" class="form-select" required>
            <option value="" disabled>Rolle wählen</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div class="mb-3">
          <label class="form-label">Abteilung</label>
          <select v-model="user.department" class="form-select">
            <option value="" disabled>Abteilung wählen</option>
            <option v-for="d in departments" :key="d.id" :value="d.name">
              {{ d.name }}
            </option>
          </select>
        </div>

        <div class="mb-3">
          <label class="form-label">NFC-Tag</label>
          <input v-model="user.nfc_tag" type="text" class="form-control" />
        </div>

        <div class="mb-3">
          <label class="form-label">Passwort</label>
          <input
            v-model="user.password"
            type="password"
            class="form-control"
            :required="!user.id"
          />
        </div>

        <button class="btn btn-primary w-100" type="submit">
          {{ user.id ? "Änderungen speichern" : "User erstellen" }}
        </button>

        <!-- 💬 Dynamische Meldung -->
        <div
          v-if="message.text"
          :class="['alert', message.type, 'mt-3', 'fade', 'show']"
          role="alert"
        >
          {{ message.text }}
        </div>
      </div>
    </form>

    <!-- Tabelle -->
    <h3 class="mt-5">Alle User</h3>
    <table class="table table-striped align-middle">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>E-Mail</th>
          <th>Rolle</th>
          <th>Abteilung</th>
          <th>NFC-Tag</th>
          <th>Erstellt am</th>
          <th>Aktionen</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="u in users" :key="u.id">
          <td>{{ u.id }}</td>
          <td>{{ u.name }}</td>
          <td>{{ u.email }}</td>
          <td>{{ u.role }}</td>
          <td>{{ u.department }}</td>
          <td>{{ u.nfc_tag }}</td>
          <td>{{ new Date(u.created_at).toLocaleString() }}</td>
          <td>
            <button class="btn btn-sm btn-warning me-2" @click="editUser(u)">
              Bearbeiten
            </button>
            <button class="btn btn-sm btn-danger" @click="deleteUser(u.id)">
              Löschen
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import axios from "axios"

const user = ref({ id: null, name: "", email: "", role: "", department: "", nfc_tag: "", password: "" })
const users = ref([])
const departments = ref([])

// 💬 Nachricht-Objekt (Text + Bootstrap-Klasse)
const message = ref({ text: "", type: "" })

const token = localStorage.getItem("token")
const axiosConfig = { headers: { Authorization: `Bearer ${token}` } }

// 🔔 Meldung anzeigen mit Farbe + Auto-Close
const showMessage = (text, type = "alert-info", duration = 3000) => {
  message.value = { text, type }
  setTimeout(() => (message.value.text = ""), duration)
}

// Abteilungen laden
const loadDepartments = async () => {
  try {
    const res = await axios.get("http://localhost:3000/api/departments", axiosConfig)
    departments.value = res.data
  } catch (err) {
    showMessage("Fehler beim Laden der Abteilungen!", "alert-danger")
  }
}

// User laden
const loadUsers = async () => {
  try {
    const res = await axios.get("http://localhost:3000/api/users", axiosConfig)
    users.value = res.data
  } catch {
    showMessage("Fehler beim Laden der User!", "alert-danger")
  }
}

// User speichern (neu oder Update)
const saveUser = async () => {
  try {
    if (user.value.id) {
      await axios.put(`http://localhost:3000/api/users/${user.value.id}`, user.value, axiosConfig)
      showMessage("User erfolgreich aktualisiert!", "alert-success")
    } else {
      await axios.post("http://localhost:3000/api/users", user.value, axiosConfig)
      showMessage("User erfolgreich angelegt!", "alert-success")
    }
    await loadUsers()
    resetForm()
  } catch (err) {
    showMessage("Fehler: " + (err.response?.data?.error || err.message), "alert-danger")
  }
}

const editUser = (u) => {
  // Nur wenn u ein Objekt ist
  if (!u || typeof u !== "object") return;

  user.value = {
    id: u.id,
    name: u.name || "",
    email: u.email || "",
    role: u.role || "",
    department: u.department || "",
    nfc_tag: u.nfc_tag || "",
    password: ""
  };
  window.scrollTo({ top: 0, behavior: "smooth" });
}


// Löschen mit Bootstrap confirm-Modal (einfacher Fallback mit confirm)
const deleteUser = async (id) => {
  if (!confirm("Wirklich löschen?")) return
  try {
    await axios.delete(`http://localhost:3000/api/users/${id}`, axiosConfig)
    await loadUsers()
    showMessage("User gelöscht!", "alert-secondary")
  } catch (err) {
    showMessage("Fehler beim Löschen: " + (err.response?.data?.error || err.message), "alert-danger")
  }
}

const resetForm = () => {
  user.value = { id: null, name: "", email: "", role: "", department: "", nfc_tag: "", password: "" }
}

onMounted(() => {
  loadUsers()
  loadDepartments()
  resetForm()
})
</script>
