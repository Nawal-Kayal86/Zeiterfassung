<template>
  <div class="container mt-5">
    <h2>Abteilungen verwalten</h2>

    <!-- Neue Abteilung hinzufügen -->
    <div class="card p-3 mb-4">
      <div class="row g-3 align-items-end">
        <div class="col-md-6">
          <label class="form-label">Neue Abteilung:</label>
          <input type="text" class="form-control" v-model="newDeptName" placeholder="Name der Abteilung" />
        </div>
        <div class="col-md-2">
          <button class="btn btn-success w-100" @click="addDepartment">
            Hinzufügen
          </button>
        </div>
      </div>

      <!-- 🔔 Meldung -->
      <div v-if="message.text" :class="['alert', message.type, 'mt-3']">
        {{ message.text }}
      </div>
    </div>

    <!-- Tabelle -->
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
            <input v-if="editId === dept.id" type="text" v-model="editName" class="form-control" />
            <span v-else>{{ dept.name }}</span>
          </td>
          <td>
            <button v-if="editId === dept.id" class="btn btn-primary btn-sm me-2" @click="updateDepartment(dept.id)">
              Speichern
            </button>
            <button v-if="editId === dept.id" class="btn btn-secondary btn-sm me-2" @click="cancelEdit">
              Abbrechen
            </button>
            <button v-else class="btn btn-warning btn-sm me-2" @click="startEdit(dept)">
              Bearbeiten
            </button>
            <button class="btn btn-danger btn-sm" @click="openDeleteModal(dept)">
              Löschen
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- 🧨 Bootstrap Modal für Löschbestätigung -->
    <div class="modal fade" id="deleteModal" tabindex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true"
      ref="deleteModal">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title" id="deleteModalLabel">Löschen bestätigen</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Schließen"></button>
          </div>
          <div class="modal-body">
            Möchten Sie die Abteilung
            <strong>{{ selectedDept?.name }}</strong> wirklich löschen?
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              Abbrechen
            </button>
            <button type="button" class="btn btn-danger" @click="confirmDelete">
              Ja, löschen
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from "../api";
import * as bootstrap from "bootstrap"; // Wichtig für das Modal

export default {
  data() {
    return {
      departments: [],
      newDeptName: "",
      editId: null,
      editName: "",
      message: { text: "", type: "" },
      selectedDept: null,
      modalInstance: null,
      token: localStorage.getItem("token") || "",
    };
  },
  mounted() {
    this.fetchDepartments();
  },
  methods: {
    showMessage(text, type = "alert-info", duration = 3000) {
      this.message = { text, type };
      setTimeout(() => (this.message.text = ""), duration);
    },
    async fetchDepartments() {
      try {
        const res = await api.get("/departments");
        this.departments = res.data;
      } catch (err) {
        console.error("Fehler beim Laden:", err);
      }
    },
    async addDepartment() {
      if (!this.newDeptName) {
        this.showMessage("Bitte einen Namen eingeben!", "alert-warning");
        return;
      }
      try {
        const res = await api.post(
          "/departments",
          { name: this.newDeptName }
        );

        this.departments.push(res.data.department);
        this.newDeptName = "";
        this.showMessage("Abteilung erfolgreich angelegt!", "alert-success");
      } catch (err) {
        if (err.response?.status === 409) {
          this.showMessage("Abteilung existiert bereits!", "alert-warning");
        } else {
          this.showMessage("Fehler beim Anlegen!", "alert-danger");
        }
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
      if (!this.editName) {
        this.showMessage("Name darf nicht leer sein!", "alert-warning");
        return;
      }
      try {
        const res = await api.put(
          `/departments/${id}`,
          { name: this.editName }
        );
        const index = this.departments.findIndex((d) => d.id === id);
        this.departments[index] = res.data;
        this.cancelEdit();
        this.showMessage("Abteilung aktualisiert!", "alert-success");
      } catch (err) {
        this.showMessage("Fehler beim Bearbeiten!", "alert-danger");
      }
    },

    // 🔥 Modal öffnen
    openDeleteModal(dept) {
      this.selectedDept = dept;
      if (!this.modalInstance) {
        this.modalInstance = new bootstrap.Modal(this.$refs.deleteModal);
      }
      this.modalInstance.show();
    },

    // ✅ Löschen bestätigen
    async confirmDelete() {
      try {
        await api.delete(
          `/departments/${this.selectedDept.id}`
        );
        this.departments = this.departments.filter(
          (d) => d.id !== this.selectedDept.id
        );
        this.showMessage("Abteilung gelöscht!", "alert-secondary");
      } catch (err) {
        this.showMessage("Fehler beim Löschen!", "alert-danger");
      } finally {
        this.modalInstance.hide();
        this.selectedDept = null;
      }
    },
  },
};
</script>
