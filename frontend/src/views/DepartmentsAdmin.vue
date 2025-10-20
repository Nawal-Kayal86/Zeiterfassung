<template>
  <div class="container mt-5">
    <h2>Abteilungen verwalten</h2>

    <!-- Neue Abteilung hinzufügen -->
    <div class="card p-3 mb-4">
      <div class="row g-3 align-items-end">
        <div class="col-md-6">
          <label class="form-label">Neue Abteilung:</label>
          <input type="text" class="form-control" v-model="newDeptName" placeholder="Name der Abteilung">
        </div>
        <div class="col-md-2">
          <button class="btn btn-success w-100" @click="addDepartment">Hinzufügen</button>
        </div>
      </div>
    </div>

    <!-- Abteilungen Tabelle -->
    <table class="table table-striped table-responsive">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Aktionen</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="dept in departments" :key="dept.id">
          <td>{{ dept.id }}</td>
          <td>
            <input v-if="editId === dept.id" type="text" v-model="editName" class="form-control">
            <span v-else>{{ dept.name }}</span>
          </td>
          <td>
            <button v-if="editId === dept.id" class="btn btn-primary btn-sm me-2" @click="updateDepartment(dept.id)">Speichern</button>
            <button v-if="editId === dept.id" class="btn btn-secondary btn-sm me-2" @click="cancelEdit">Abbrechen</button>
            <button v-else class="btn btn-warning btn-sm me-2" @click="startEdit(dept)">Bearbeiten</button>
            <button class="btn btn-danger btn-sm" @click="deleteDepartment(dept.id)">Löschen</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      departments: [],
      newDeptName: "",
      editId: null,
      editName: "",
      token: localStorage.getItem("token") || "",
    };
  },
  mounted() {
    this.fetchDepartments();
  },
  methods: {
    async fetchDepartments() {
      try {
        const res = await axios.get("http://localhost:3000/api/departments", {
          headers: { Authorization: `Bearer ${this.token}` },
        });
        this.departments = res.data;
      } catch (err) {
        console.error("Fehler beim Laden der Abteilungen:", err);
      }
    },
    async addDepartment() {
      if (!this.newDeptName) return alert("Name eingeben!");
      try {
        const res = await axios.post("http://localhost:3000/api/departments", { name: this.newDeptName }, {
          headers: { Authorization: `Bearer ${this.token}` },
        });
        this.departments.push(res.data);
        this.newDeptName = "";
      } catch (err) {
        console.error("Fehler beim Anlegen:", err.response?.data || err.message);
      }
    },
    startEdit(dept) {
      this.editId = dept.id;
      this.editName = dept.name;
    },
    cancelEdit() {
      this.editId = null;
      this.editName = "";
    },
    async updateDepartment(id) {
      if (!this.editName) return alert("Name darf nicht leer sein!");
      try {
        const res = await axios.put(`http://localhost:3000/api/departments/${id}`, { name: this.editName }, {
          headers: { Authorization: `Bearer ${this.token}` },
        });
        const index = this.departments.findIndex(d => d.id === id);
        this.departments[index] = res.data;
        this.cancelEdit();
      } catch (err) {
        console.error("Fehler beim Bearbeiten:", err.response?.data || err.message);
      }
    },
    async deleteDepartment(id) {
      if (!confirm("Abteilung wirklich löschen?")) return;
      try {
        await axios.delete(`http://localhost:3000/api/departments/${id}`, {
          headers: { Authorization: `Bearer ${this.token}` },
        });
        this.departments = this.departments.filter(d => d.id !== id);
      } catch (err) {
        console.error("Fehler beim Löschen:", err.response?.data || err.message);
      }
    },
  },
};
</script>
