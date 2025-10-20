<template>
  <div class="container mt-4">
    <h2>User Verwaltung</h2>

    <!-- Formular zum Anlegen / Bearbeiten -->
    <form @submit.prevent="saveUser">
      <div class="mb-3">
        <label class="form-label">Name</label>
        <input v-model="user.name" type="text" class="form-control" required />
      </div>

      <div class="mb-3">
        <label class="form-label">E-Mail</label>
        <input v-model="user.email" type="email" class="form-control" required />
      </div>

      <div class="mb-3">
        <label class="form-label">Rolle</label>
        <select v-model="user.role" class="form-select" required>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div class="mb-3">
        <label class="form-label">NFC-Tag</label>
        <input v-model="user.nfc_tag" type="text" class="form-control" />
      </div>

      <div class="mb-3">
        <label class="form-label">Passwort</label>
        <input v-model="user.password" type="password" class="form-control" :required="!user.id" />
      </div>

      <button class="btn btn-primary w-100" type="submit">
        {{ user.id ? "Änderungen speichern" : "User erstellen" }}
      </button>
    </form>

    <div v-if="message" class="alert alert-info mt-3">
      {{ message }}
    </div>

    <!-- Tabelle -->
    <h3 class="mt-5">Alle User</h3>
    <table class="table table-striped">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>E-Mail</th>
          <th>Rolle</th>
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
          <td>{{ u.nfc_tag }}</td>
          <td>{{ new Date(u.created_at).toLocaleString() }}</td>
          <td>
            <button class="btn btn-sm btn-warning me-2" @click="editUser(u)">Bearbeiten</button>
            <button class="btn btn-sm btn-danger" @click="deleteUser(u.id)">Löschen</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import axios from "axios"

const user = ref({
  id: null,
  name: "",
  email: "",
  role: "user",
  nfc_tag: "",
  password: ""
})
const message = ref("")
const users = ref([])

const token = localStorage.getItem("token")
const axiosConfig = { headers: { Authorization: `Bearer ${token}` } }

// User speichern (neu oder Update)
const saveUser = async () => {
  try {
    if (user.value.id) {
      // Update
      await axios.put(`http://localhost:3000/api/users/${user.value.id}`, user.value, axiosConfig)
      message.value = "User erfolgreich aktualisiert!"
    } else {
      // Neu
      await axios.post("http://localhost:3000/api/users", user.value, axiosConfig)
      message.value = "User erfolgreich angelegt!"
    }
    await loadUsers()
    resetForm()
  } catch (err) {
    message.value = "Fehler: " + (err.response?.data?.error || err.message)
  }
}

// User bearbeiten
const editUser = (u) => {
  user.value = { ...u, password: "" }
  window.scrollTo({ top: 0, behavior: "smooth" })
}

// User löschen
const deleteUser = async (id) => {
  if (!confirm("Wirklich löschen?")) return
  try {
    await axios.delete(`http://localhost:3000/api/users/${id}`, axiosConfig)
    message.value = "User gelöscht!"
    await loadUsers()
  } catch (err) {
    message.value = "Fehler beim Löschen: " + (err.response?.data?.error || err.message)
  }
}

// Userliste laden
const loadUsers = async () => {
  try {
    const res = await axios.get("http://localhost:3000/api/users", axiosConfig)
    users.value = res.data
  } catch (err) {
    message.value = "Fehler beim Laden der User."
  }
}

// Formular leeren
const resetForm = () => {
  user.value = { id: null, name: "", email: "", role: "user", nfc_tag: "", password: "" }
}

onMounted(loadUsers)
</script>
