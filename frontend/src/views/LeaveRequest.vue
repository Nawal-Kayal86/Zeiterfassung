<template>
  <div class="container-fluid py-4 px-md-5">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="fw-bold m-0"><i class="bi bi-sun text-warning me-2"></i>Urlaubsantrag & Konto</h2>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-secondary" @click="$router.push('/dashboard')">
          <i class="bi bi-arrow-left"></i> Zurück
        </button>
      </div>
    </div>

    <div class="row g-4">
      <!-- Left Column: Urlaubskonto Info -->
      <div class="col-lg-5">
        <div class="card shadow-sm border-0 h-100">
          <div class="card-header bg-white border-0 pt-4 px-4 pb-0">
            <h5 class="fw-bold d-flex align-items-center gap-2 text-indigo">
              <i class="bi bi-info-circle-fill"></i> Informationen / Urlaubskonto
            </h5>
          </div>
          <div class="card-body px-4">
            <!-- Info Table -->
            <div class="table-responsive rounded-3 border">
              <table class="table table-striped mb-0">
                <tbody>
                  <tr class="table-primary border-bottom border-indigo">
                    <td colspan="2" class="fw-bold text-indigo">
                      Urlaubsperiode: {{ vacationPeriod }}
                    </td>
                  </tr>
                  <tr class="table-light border-bottom">
                    <td colspan="2" class="fw-bold text-muted">
                      Stichtag: {{ todayFormatted }}
                    </td>
                  </tr>
                  <tr>
                    <td>Urlaubsanspruch</td>
                    <td class="text-end fw-bold">25 Tage</td>
                  </tr>
                  <tr>
                    <td>Urlaub Aliquot Gesamt</td>
                    <td class="text-end fw-bold">12,5 Tage</td>
                  </tr>
                  <tr>
                    <td>Neuer Urlaubsanspruch</td>
                    <td class="text-end fw-bold">25 Tage</td>
                  </tr>
                  <tr>
                    <td>Urlaub verbraucht Periode</td>
                    <td class="text-end fw-bold text-danger">5 Tage</td>
                  </tr>
                  <tr>
                    <td>Urlaub verplant</td>
                    <td class="text-end fw-bold text-warning">2 Tage</td>
                  </tr>
                  <tr>
                    <td>Urlaub verplant gesamt</td>
                    <td class="text-end fw-bold">7 Tage</td>
                  </tr>
                  <tr class="table-success border-top border-success">
                    <td class="fw-bold text-success">Restl. Urlaubsanspruch</td>
                    <td class="text-end fw-bold text-success">18 Tage</td>
                  </tr>
                  <tr>
                    <td>Restl. aliquoter Urlaubsanspruch</td>
                    <td class="text-end fw-bold">5,5 Tage</td>
                  </tr>
                  <!-- Time Balances (Mock) -->
                  <tr>
                    <td>1:1 (Überstunden)</td>
                    <td class="text-end fw-mono">9:09 h</td>
                  </tr>
                  <tr>
                    <td>ZGÜ (Zeitguthaben)</td>
                    <td class="text-end fw-mono">0:00 h</td>
                  </tr>
                  <tr class="fw-bold">
                    <td>SGes (Saldo Gesamt)</td>
                    <td class="text-end fw-mono text-primary">9:09 h</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="mt-3 text-center">
              <a href="#" class="text-decoration-none text-indigo fw-bold">
                <i class="bi bi-file-earmark-pdf"></i> Als PDF ausgeben
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Request Form -->
      <div class="col-lg-7">
        <div class="card shadow-sm border-0 mb-4">
          <div class="card-header bg-white border-0 pt-4 px-4 pb-0">
            <h5 class="fw-bold d-flex align-items-center gap-2 text-indigo">
              <i class="bi bi-pencil-square"></i> Neuen Antrag stellen
            </h5>
          </div>
          <div class="card-body p-4">
            <form @submit.prevent="submitRequest">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label small fw-bold text-muted">VON</label>
                  <input type="date" v-model="form.from" class="form-control" required />
                </div>

                <div class="col-md-6">
                  <label class="form-label small fw-bold text-muted">BIS</label>
                  <input type="date" v-model="form.to" class="form-control" required />
                </div>

                <div class="col-md-12">
                  <label class="form-label small fw-bold text-muted">URLAUBSART</label>
                  <select v-model="form.type" class="form-select">
                    <option value="vacation">Jahresurlaub</option>
                    <option value="sick">Krankheitsurlaub</option>
                    <option value="other">Andere / Sonderurlaub</option>
                  </select>
                </div>

                <div class="col-12">
                  <label class="form-label small fw-bold text-muted">GRUND / BEMERKUNG</label>
                  <textarea v-model="form.reason" class="form-control" rows="3" placeholder="Grund für den Antrag..."
                    required></textarea>
                </div>

                <div class="col-12 mt-4">
                  <button class="btn btn-indigo w-100 py-2 shadow-sm fw-bold">
                    <i class="bi bi-send-plus-fill"></i> Antrag absenden
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        <!-- My Requests List -->
        <div class="card shadow-sm border-0">
          <div class="card-header bg-white border-0 pt-4 px-4 pb-0">
            <h5 class="fw-bold mb-0 text-indigo"><i class="bi bi-clock-history"></i> Meine Anträge</h5>
          </div>
          <div class="card-body p-4">
            <div class="table-responsive">
              <table v-if="requests.length" class="table table-hover align-middle">
                <thead class="table-light">
                  <tr>
                    <th>Von</th>
                    <th>Bis</th>
                    <th>Grund</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="r in requests" :key="r._id">
                    <td>{{ format(r.from) }}</td>
                    <td>{{ format(r.to) }}</td>
                    <td><small>{{ r.reason }}</small><br><span class="badge bg-light text-dark border">{{
                        translateType(r.type) }}</span></td>
                    <td>
                      <span class="badge bg-warning-soft text-warning border border-warning-subtle px-2 rounded-pill"
                        v-if="r.status === 'pending'">In Bearbeitung</span>
                      <span class="badge bg-success-soft text-success border border-success-subtle px-2 rounded-pill"
                        v-if="r.status === 'approved'">Genehmigt</span>
                      <span class="badge bg-danger-soft text-danger border border-danger-subtle px-2 rounded-pill"
                        v-if="r.status === 'rejected'">Abgelehnt</span>
                    </td>
                  </tr>
                </tbody>
              </table>

              <div v-else class="text-center py-4 text-muted bg-light rounded-3">
                <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                Keine Anträge vorhanden
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"
import api from "../api"

const requests = ref([])
const form = ref({ from: "", to: "", type: "vacation", reason: "" })

// Date formatting for info panel
const today = new Date()
const todayFormatted = today.toLocaleDateString("de-DE")
const currentYear = today.getFullYear()
// Logic for vacation period (e.g., 01.01 - 31.12 or fiscal)
const vacationPeriod = `01.01.${currentYear} - 31.12.${currentYear}`

const load = async () => {
  try {
    const res = await api.get("/leave-requests")
    requests.value = res.data
  } catch (e) {
    console.error("Error loading requests", e)
  }
}

const submitRequest = async () => {
  try {
    await api.post("/leave-requests", form.value)
    form.value = { from: "", to: "", type: "vacation", reason: "" }
    await load()
  } catch (e) {
    alert("Fehler beim Senden")
  }
}

const format = d => new Date(d).toLocaleDateString("de-DE")

const translateType = t =>
  t === "vacation" ? "Jahresurlaub" : t === "sick" ? "Krank" : "Andere"

onMounted(load)
</script>

<style scoped>
.text-indigo {
  color: #6366f1;
}

.border-indigo {
  border-color: #6366f1 !important;
}

.bg-indigo {
  background-color: #6366f1;
}

.btn-indigo {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;
  border: none;
  transition: all 0.2s;
}

.btn-indigo:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.bg-warning-soft {
  background-color: rgba(255, 193, 7, 0.1);
}

.bg-success-soft {
  background-color: rgba(25, 135, 84, 0.1);
}

.bg-danger-soft {
  background-color: rgba(220, 53, 69, 0.1);
}

.fw-mono {
  font-family: 'Courier New', monospace;
  font-weight: 600;
}
</style>
