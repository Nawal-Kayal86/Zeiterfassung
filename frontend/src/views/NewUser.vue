<template>
  <div class="container mt-4">
    <h2>Neuen User anlegen</h2>
    <form @submit.prevent="createUser">
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
          <option value="employee">Employee</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div class="mb-3">
        <label class="form-label">NFC-Tag</label>
        <input v-model="user.nfc_tag" type="text" class="form-control" />
      </div>

      <div class="mb-3">
        <label class="form-label">Passwort</label>
        <input v-model="user.password" type="password" class="form-control" required />
      </div>

      <button class="btn btn-primary w-100" type="submit">User erstellen</button>
    </form>

    <div v-if="message" class="alert alert-info mt-3">
      {{ message }}
    </div>

    <!-- Tabelle aller User -->
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
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import axios from "axios"

const user = ref({
  name: "",
  email: "",
  role: "employee",
  nfc_tag: "",
  password: ""
})

const message = ref("")
const users = ref([])

// User erstellen
const createUser = async () => {
  try {
    await axios.post("http://localhost:3000/api/users", user.value)
    message.value = "User erfolgreich angelegt!"
    user.value = { name: "", email: "", role: "employee", nfc_tag: "", password: "" }
    await loadUsers() // nach Erstellung neu laden
  } catch (err) {
    message.value = "Fehler beim Anlegen: " + (err.response?.data?.error || err.message)
  }
}

// Userliste laden
const loadUsers = async () => {
  try {
    const res = await axios.get("http://localhost:3000/api/users")
    users.value = res.data
  } catch (err) {
    console.error("Fehler beim Laden der User", err)
  }
}

// beim Laden der Seite User holen
onMounted(loadUsers)
</script>
