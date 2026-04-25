<template>
  <div class="container mt-5">
    <div class="card p-3 mb-4">
      <div class="row g-3 align-items-end">
        <div class="col-md-6">
          <label class="form-label">Neue Abteilung:</label>
          <input
            v-model="newDeptName"
            type="text"
            class="form-control"
            placeholder="Name der Abteilung"
          />
        </div>
        <div class="col-md-2">
          <button class="btn btn-success w-100" @click="addDepartment">
            Hinzufuegen
          </button>
        </div>
      </div>

      <div v-if="message.text" :class="['alert', message.type, 'mt-3']">
        {{ message.text }}
      </div>
    </div>

    <table class="table table-striped table-responsive">
      <thead>
        <tr>
          <th>Nr.</th>
          <th>Name</th>
          <th>Aktionen</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(dept, index) in departments" :key="dept.id">
          <td>{{ index + 1 }}</td>
          <td>
            <input
              v-if="editId === dept.id"
              v-model="editName"
              type="text"
              class="form-control"
              :title="dept.id"
            />
            <span v-else :title="dept.id">{{ dept.name }}</span>
          </td>
          <td>
            <button
              v-if="editId === dept.id"
              class="btn btn-primary btn-sm me-2"
              @click="updateDepartment(dept.id)"
            >
              Speichern
            </button>
            <button
              v-if="editId === dept.id"
              class="btn btn-secondary btn-sm me-2"
              @click="cancelEdit"
            >
              Abbrechen
            </button>
            <button
              v-else
              class="btn btn-warning btn-sm me-2"
              @click="startEdit(dept)"
            >
              Bearbeiten
            </button>
            <button
              class="btn btn-danger btn-sm"
              @click="openDeleteModal(dept)"
            >
              Loeschen
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <div
      class="modal fade"
      id="deleteModal"
      tabindex="-1"
      aria-labelledby="deleteModalLabel"
      aria-hidden="true"
      ref="deleteModal"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title" id="deleteModalLabel">Loeschen bestaetigen</h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Schliessen"
            ></button>
          </div>
          <div class="modal-body">
            Moechten Sie die Abteilung <strong>{{ selectedDept?.name }}</strong> wirklich loeschen?
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              Abbrechen
            </button>
            <button type="button" class="btn btn-danger" @click="confirmDelete">
              Ja, loeschen
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from "../api";
import * as bootstrap from "bootstrap";

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
        const response = await api.get("/departments");
        this.departments = response.data;
      } catch (error) {
        console.error("Fehler beim Laden:", error);
      }
    },
    async addDepartment() {
      if (!this.newDeptName) {
        this.showMessage("Bitte einen Namen eingeben!", "alert-warning");
        return;
      }
      try {
        const response = await api.post("/departments", { name: this.newDeptName });
        this.departments.push(response.data.department);
        this.newDeptName = "";
        this.showMessage("Abteilung erfolgreich angelegt!", "alert-success");
      } catch (error) {
        if (error.response?.status === 409) {
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
        const response = await api.put(`/departments/${id}`, { name: this.editName });
        const index = this.departments.findIndex((department) => department.id === id);
        this.departments[index] = response.data;
        this.cancelEdit();
        this.showMessage("Abteilung aktualisiert!", "alert-success");
      } catch {
        this.showMessage("Fehler beim Bearbeiten!", "alert-danger");
      }
    },
    openDeleteModal(dept) {
      this.selectedDept = dept;
      if (!this.modalInstance) {
        this.modalInstance = new bootstrap.Modal(this.$refs.deleteModal);
      }
      this.modalInstance.show();
    },
    async confirmDelete() {
      try {
        await api.delete(`/departments/${this.selectedDept.id}`);
        this.departments = this.departments.filter(
          (department) => department.id !== this.selectedDept.id,
        );
        this.showMessage("Abteilung geloescht!", "alert-secondary");
      } catch {
        this.showMessage("Fehler beim Loeschen!", "alert-danger");
      } finally {
        this.modalInstance.hide();
        this.selectedDept = null;
      }
    },
  },
};
</script>
