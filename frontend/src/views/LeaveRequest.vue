<template>
  <div class="container-fluid py-4 px-md-5">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="fw-bold m-0">
        <i class="bi bi-sun text-warning me-2"></i>Urlaubsantrag & Konto
      </h2>
      <div class="d-flex gap-2">
        <button
          class="btn btn-outline-secondary"
          @click="$router.push('/dashboard')"
        >
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
              <i class="bi bi-info-circle-fill"></i> Informationen /
              Urlaubskonto
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
                    <td class="text-end fw-bold">{{ totalVacation }} Tage</td>
                  </tr>
                  <tr>
                    <td>Urlaub verbraucht Periode</td>
                    <td class="text-end fw-bold text-danger">{{ usedVacation }} Tage</td>
                  </tr>
                  <tr>
                    <td>Urlaub verplant</td>
                    <td class="text-end fw-bold text-warning">{{ plannedVacation }} Tage</td>
                  </tr>
                  <tr class="table-success border-top border-success">
                    <td class="fw-bold text-success">Restl. Urlaubsanspruch</td>
                    <td class="text-end fw-bold text-success">{{ remainingVacation }} Tage</td>
                  </tr>
                  <!-- Time Balances -->
                  <tr class="border-top">
                    <td class="text-muted small">1:1 (Überstunden)</td>
                    <td class="text-end fw-mono">{{ overtimeSaldo }} h</td>
                  </tr>
                  <tr>
                    <td class="text-muted small">ZGÜ (Zeitguthaben)</td>
                    <td class="text-end fw-mono">0:00 h</td>
                  </tr>
                  <tr class="fw-bold bg-light">
                    <td class="text-indigo">SGes (Saldo Gesamt)</td>
                    <td class="text-end fw-mono text-indigo">{{ overtimeSaldo }} h</td>
                  </tr>
                </tbody>
              </table>
              <div class="p-3">
                 <div class="progress" style="height: 10px;">
                    <div class="progress-bar bg-success" :style="{ width: (usedVacation / totalVacation * 100) + '%' }"></div>
                    <div class="progress-bar bg-warning" :style="{ width: (plannedVacation / totalVacation * 100) + '%' }"></div>
                 </div>
                 <div class="d-flex justify-content-between mt-1 small text-muted">
                    <span>Verbraucht: {{ usedVacation }}</span>
                    <span>Geplant: {{ plannedVacation }}</span>
                    <span>Gesamt: {{ totalVacation }}</span>
                 </div>
              </div>
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
                  <input
                    type="date"
                    v-model="form.from"
                    class="form-control"
                    required
                  />
                </div>

                <div class="col-md-6">
                  <label class="form-label small fw-bold text-muted">BIS</label>
                  <input
                    type="date"
                    v-model="form.to"
                    class="form-control"
                    required
                  />
                </div>

                <div class="col-md-12">
                  <label class="form-label small fw-bold text-muted"
                    >URLAUBSART</label
                  >
                  <select v-model="form.type" class="form-select">
                    <option value="vacation">Jahresurlaub</option>
                    <option value="sick">Krankheitsurlaub</option>
                    <option value="overtime">Zeitausgleich (1:1)</option>
                    <option value="other">Andere / Sonderurlaub</option>
                  </select>
                </div>

                <div class="col-12">
                  <label class="form-label small fw-bold text-muted"
                    >GRUND / BEMERKUNG</label
                  >
                  <textarea
                    v-model="form.reason"
                    class="form-control"
                    rows="3"
                    placeholder="Grund für den Antrag..."
                    required
                  ></textarea>
                </div>

                <div class="col-12 mt-4" v-if="previewDays > 0">
                  <div class="alert alert-info py-2 mb-3 border-0 shadow-sm d-flex justify-content-between align-items-center">
                    <span><i class="bi bi-calculator"></i> Vorschau Berechnung:</span>
                    <span class="fw-bold fs-5">{{ previewDays }} {{ previewDays === 1 ? 'Tag' : 'Tage' }}</span>
                  </div>
                </div>

                <div class="col-12 mt-2">
                  <button class="btn btn-indigo w-100 py-3 shadow-sm fw-bold border-0">
                    <i class="bi bi-send-plus-fill me-2"></i> Antrag jetzt absenden
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        <!-- My Requests List -->
        <div class="card shadow-sm border-0">
          <div class="card-header bg-white border-0 pt-4 px-4 pb-0">
            <h5 class="fw-bold mb-0 text-indigo">
              <i class="bi bi-clock-history"></i> Meine Anträge
            </h5>
          </div>
          <div class="card-body p-4">
            <div class="table-responsive">
              <table
                v-if="requests.length"
                class="table table-hover align-middle"
              >
                <thead class="table-light">
                  <tr>
                    <th>Von</th>
                    <th>Bis</th>
                    <th>Grund</th>
                    <th>Status</th>
                    <th class="text-end">Aktion</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="r in requests" :key="r._id">
                    <td>{{ format(r.from) }}</td>
                    <td>{{ format(r.to) }}</td>
                    <td>
                      <small>{{ r.reason }}</small
                      ><br /><span class="badge bg-light text-dark border">{{
                        translateType(r.type)
                      }}</span>
                    </td>
                    <td>
                      <span
                        class="badge bg-warning-soft text-warning border border-warning-subtle px-2 rounded-pill"
                        v-if="r.status === 'pending'"
                        >In Bearbeitung</span
                      >
                      <span
                        class="badge bg-success-soft text-success border border-success-subtle px-2 rounded-pill"
                        v-if="r.status === 'approved'"
                        >Genehmigt</span
                      >
                      <span
                        class="badge bg-danger-soft text-danger border border-danger-subtle px-2 rounded-pill"
                        v-if="r.status === 'rejected'"
                        >Abgelehnt</span
                      >
                    </td>
                    <td class="text-end">
                      <button
                        v-if="r.status === 'pending'"
                        class="btn btn-sm btn-outline-danger"
                        @click="deleteRequest(r._id)"
                        title="Antrag zurückziehen"
                      >
                        <i class="bi bi-trash3"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>

              <!-- PDF Actions -->
              <div class="mt-4 pt-3 border-top text-center">
                <button
                  class="btn btn-outline-danger btn-sm fw-bold px-4 rounded-pill shadow-sm"
                  @click="exportPDF"
                >
                  <i class="bi bi-file-earmark-pdf-fill me-2"></i>
                  Offizielles Urlaubskonto (PDF)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- PDF-HIDDEN-TEMPLATE (Wird für den Export genutzt) -->
    <div id="vacation-report" style="opacity: 0; pointer-events: none; position: fixed; top: 0; left: 0; z-index: -1; width: 800px; padding: 40px; background: white; font-family: sans-serif; color: #1a1a1a;">
        <div style="border-bottom: 3px solid #6366f1; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center;">
            <div style="flex: 1;">
                <h1 style="margin: 0; font-size: 28px; color: #6366f1;">Urlaubskonto {{ currentYear }}</h1>
                <p style="margin: 5px 0 0; color: #64748b; font-weight: 600;">Offizieller Auszug - Zeiterfassung System</p>
            </div>
            <div style="text-align: right; flex: 1;">
                <h2 style="margin: 0; font-size: 20px;">{{ currentUser.name }}</h2>
                <p style="margin: 5px 0 0; color: #64748b;">Zeitraum: {{ vacationPeriod }}</p>
            </div>
        </div>

        <div style="display: flex; gap: 20px; margin-bottom: 40px;">
            <div style="flex: 1; background: #f0fdf4; padding: 25px; border-radius: 12px; border: 1px solid #bbf7d0; text-align: center;">
                <span style="font-size: 12px; text-transform: uppercase; color: #166534; font-weight: 800; letter-spacing: 1px;">Restanspruch</span>
                <div style="font-size: 42px; font-weight: 900; color: #166534; margin: 10px 0;">{{ remainingVacation }} Tage</div>
                <p style="margin: 0; color: #166534; font-size: 14px;">von {{ totalVacation }} Tagen Gesamtanspruch</p>
            </div>
            <div style="flex: 1; background: #f8fafc; padding: 25px; border-radius: 12px; border: 1px solid #e2e8f0;">
                <h4 style="margin: 0 0 15px 0; font-size: 14px; text-transform: uppercase; color: #475569;">Kontodetails</h4>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="color: #64748b;">Genommener Urlaub:</span>
                    <span style="font-weight: 700; color: #ef4444;">{{ usedVacation }} Tage</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: #64748b;">Geplanter Urlaub:</span>
                    <span style="font-weight: 700; color: #f59e0b;">{{ plannedVacation }} Tage</span>
                </div>
            </div>
        </div>

        <h3 style="font-size: 18px; color: #1e293b; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; margin-bottom: 20px;">Detaillierter Verlauf der Anträge</h3>
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="background: #f8fafc; text-align: left; color: #475569; font-size: 12px; text-transform: uppercase;">
                    <th style="padding: 12px; border-bottom: 2px solid #e2e8f0;">Zeitraum</th>
                    <th style="padding: 12px; border-bottom: 2px solid #e2e8f0;">Art des Urlaubs</th>
                    <th style="padding: 12px; border-bottom: 2px solid #e2e8f0;">Status</th>
                    <th style="padding: 12px; border-bottom: 2px solid #e2e8f0; text-align: right;">Netto-Tage</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="r in requests.filter(x => x.type === 'vacation')" :key="r._id" style="border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #334155;">
                    <td style="padding: 12px;">{{ format(r.from) }} - {{ format(r.to) }}</td>
                    <td style="padding: 12px;">{{ translateType(r.type) }}</td>
                    <td style="padding: 12px;">
                        <span :style="{
                            padding: '4px 10px',
                            borderRadius: '50px',
                            fontSize: '11px',
                            fontWeight: '700',
                            background: r.status === 'approved' ? '#dcfce7' : r.status === 'rejected' ? '#fee2e2' : '#fef3c7',
                            color: r.status === 'approved' ? '#166534' : r.status === 'rejected' ? '#991b1b' : '#92400e',
                            border: '1px solid currentColor'
                        }">
                            {{ r.status === 'approved' ? 'GENEHMIGT' : r.status === 'rejected' ? 'ABGELEHNT' : 'IN BEARBEITUNG' }}
                        </span>
                    </td>
                    <td style="padding: 12px; font-weight: 700; text-align: right;">{{ calculateWorkDays(r.from, r.to) }}</td>
                </tr>
            </tbody>
        </table>

        <div style="margin-top: 80px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 11px;">
            Dieser Auszug wurde am {{ todayFormatted }} maschinell erstellt. <br>
            Er dient zur Information des Arbeitnehmers über seinen aktuellen Urlaubsstatus.
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import api from "../api";
import { toast } from "vue3-toastify";
import html2pdf from "html2pdf.js";

/**
 * @module LeaveRequest
 * @description Vue 3 Composition API Komponente für das Einreichen von Abwesenheitsanträgen.
 */

const requests = ref([]);
const sessions = ref([]); // Neu: für Überstunden-Berechnung
const holidaysMap = ref({});
const form = ref({ from: "", to: "", type: "vacation", reason: "" });

// Nutzerdaten (inkl. Urlaubsanspruch) laden
const currentUser = JSON.parse(localStorage.getItem("user")) || {};
const totalVacation = ref(currentUser.vacation_days_per_year || 25);
const weeklyHours = ref(currentUser.weekly_hours || 40);

// Datumsformatierung für das Info-Panel
const today = new Date();
const todayFormatted = today.toLocaleDateString("de-DE");
const currentYear = today.getFullYear();
const vacationPeriod = `01.01.${currentYear} - 31.12.${currentYear}`;

// Berechnet Arbeitstage zwischen zwei Daten (ohne Wochenenden UND Feiertage)
const calculateWorkDays = (startStr, endStr) => {
  if (!startStr || !endStr) return 0;
  const start = new Date(startStr);
  const end = new Date(endStr);
  let days = 0;
  let cur = new Date(start);
  while (cur <= end) {
    const day = cur.getDay();
    const key = cur.toISOString().split("T")[0];
    const isHoliday = !!holidaysMap.value[key];

    if (day !== 0 && day !== 6 && !isHoliday) { // Kein Wochenende & kein Feiertag
      days++;
    }
    cur.setDate(cur.getDate() + 1);
  }
  return days;
};

// Vorschau für den aktuellen Antrag im Formular
const previewDays = computed(() => {
    if (form.value.from && form.value.to && form.value.type === 'vacation') {
        return calculateWorkDays(form.value.from, form.value.to);
    }
    return 0;
});

// Dynamische Berechnung des Urlaubs
const usedVacation = computed(() => {
  return requests.value.reduce((sum, r) => {
    if (r.status === 'approved' && r.type === 'vacation') {
      return sum + calculateWorkDays(r.from, r.to);
    }
    return sum;
  }, 0);
});

const plannedVacation = computed(() => {
  return requests.value.reduce((sum, r) => {
    if (r.status === 'pending' && r.type === 'vacation') {
      return sum + calculateWorkDays(r.from, r.to);
    }
    return sum;
  }, 0);
});

const remainingVacation = computed(() => totalVacation.value - usedVacation.value - plannedVacation.value);

// Neu: Echtzeit-Überstunden-Berechnung
const overtimeSaldo = computed(() => {
  if (sessions.value.length === 0) return "0:00";

  const dailySollMinutes = (weeklyHours.value / 5) * 60;

  // 1. Summe der tatsächlich gearbeiteten Minuten (IST)
  let totalIstMinutes = 0;
  sessions.value.forEach(s => {
    if (s.start && s.end) {
      const diffMs = new Date(s.end) - new Date(s.start);
      if (diffMs > 0) {
          totalIstMinutes += Math.floor(diffMs / 60000);
          
          if (s.pause) {
            const [h, m] = s.pause.split(":").map(Number);
            totalIstMinutes -= (h * 60 + m);
          }
      }
    }
  });

  // 2. Sollarbeitszeit berechnen (SOLL)
  const first = new Date(sessions.value[sessions.value.length - 1].start);
  const today = new Date();
  let workDaysCount = 0;
  let cur = new Date(first);
  while (cur <= today) {
    if (cur.getDay() !== 0 && cur.getDay() !== 6) workDaysCount++;
    cur.setDate(cur.getDate() + 1);
  }
  const totalSollMinutes = workDaysCount * dailySollMinutes;

  // 3. ABZUG durch genehmigten Zeitausgleich (1:1)
  const totalOvertimeDeductionMinutes = requests.value.reduce((sum, r) => {
    if (r.status === 'approved' && r.type === 'overtime') {
      const days = calculateWorkDays(r.from, r.to);
      return sum + (days * dailySollMinutes);
    }
    return sum;
  }, 0);
  
  const diff = (totalIstMinutes - totalSollMinutes) - totalOvertimeDeductionMinutes;
  const sign = diff < 0 ? "-" : "";
  const absDiff = Math.abs(diff);
  const h = Math.floor(absDiff / 60);
  const m = String(absDiff % 60).padStart(2, "0");
  
  return `${sign}${h}:${m}`;
});

/**
 * @function load
 * @description Lädt asynchron alle bisherigen Anträge des Nutzers vom Backend ("/leave-requests").
 */
const load = async () => {
  try {
    // Aktuelle Nutzerdaten laden, um Urlaubsanspruch zu aktualisieren
    const meRes = await api.get("/me");
    if (meRes.data?.user) {
        totalVacation.value = meRes.data.user.vacation_days_per_year || 25;
        // Dienstplan für Wochenstunden laden
        try {
            const sRes = await api.get(`/schedule/${meRes.data.user.id}`);
            if (sRes.data) weeklyHours.value = sRes.data.weekly_hours || 40;
        } catch (e) { console.warn("Plan-Load fail", e); }
    }

    const res = await api.get("/leave-requests");
    requests.value = res.data;

    // sessions laden für Überstunden
    const resSessions = await api.get("/workSessions");
    sessions.value = resSessions.data;

    // Feiertage laden für die Berechnung
    const resCal = await api.get(`/calendar?year=${currentYear}`);
    const map = {};
    resCal.data?.holidays?.forEach(h => map[h.date] = h.name);
    holidaysMap.value = map;
  } catch (e) {
    console.error("Error loading requests", e);
  }
};

/**
 * @function submitRequest
 * @description Sendet unser "form"-Objekt an das Backend, um einen neuen Antrag zu erstellen.
 * Setzt anschließend die Eingabefelder ("form") zurück und triggert `load()`, um die Tabelle zu aktualisieren.
 */
const submitRequest = async () => {
  try {
    await api.post("/leave-requests", form.value);
    toast.success("Dein Urlaubsantrag wurde erfolgreich übermittelt! 🌴");
    form.value = { from: "", to: "", type: "vacation", reason: "" };
    await load();
  } catch (e) {
    // Fehler wird global behandelt
  }
};

const deleteRequest = async (id) => {
  if (!confirm("Möchtest du diesen Antrag wirklich zurückziehen?")) return;
  try {
    await api.delete(`/leave-requests/${id}`);
    toast.info("Antrag erfolgreich gelöscht. ❌");
    await load();
  } catch (e) {
    // Fehler wird global behandelt
  }
};

const format = (d) => new Date(d).toLocaleDateString("de-DE");

const exportPDF = () => {
    const element = document.getElementById("vacation-report");
    const opt = {
        margin: 0,
        filename: `Urlaubskonto_${currentUser.name}_${currentYear}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    toast.info("Generiere PDF... Bitte warten ⏳");
    html2pdf().from(element).set(opt).save().then(() => {
        toast.success("PDF erfolgreich exportiert! 📑");
    });
};

const translateType = (t) =>
  t === "vacation" ? "Jahresurlaub" : t === "sick" ? "Krank" : t === "overtime" ? "Zeitausgleich (1:1)" : "Andere";

onMounted(load);
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
  font-family: "Courier New", monospace;
  font-weight: 600;
}
</style>
