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
          <i class="bi bi-arrow-left"></i> Zurueck
        </button>
      </div>
    </div>

    <div class="row g-4">
      <div class="col-lg-5">
        <div class="card shadow-sm border-0 h-100">
          <div class="card-header bg-white border-0 pt-4 px-4 pb-0">
            <h5 class="fw-bold d-flex align-items-center gap-2 text-indigo">
              <i class="bi bi-info-circle-fill"></i> Informationen /
              Urlaubskonto
            </h5>
          </div>
          <div class="card-body px-4">
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
                      <div class="d-flex align-items-center justify-content-between gap-2">
                        <span>Stichtag:</span>
                        <input
                          v-model="selectedDate"
                          type="date"
                          class="form-control form-control-sm w-auto"
                        />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>Urlaubsanspruch</td>
                    <td class="text-end fw-bold">{{ totalVacation }} Tage</td>
                  </tr>
                  <tr>
                    <td>Urlaub verbraucht Periode</td>
                    <td class="text-end fw-bold text-danger">
                      {{ usedVacation }} Tage
                    </td>
                  </tr>
                  <tr>
                    <td>Urlaub verplant</td>
                    <td class="text-end fw-bold text-warning">
                      {{ plannedVacation }} Tage
                    </td>
                  </tr>
                  <tr class="table-success border-top border-success">
                    <td class="fw-bold text-success">Restl. Urlaubsanspruch</td>
                    <td class="text-end fw-bold text-success">
                      {{ remainingVacation }} Tage
                    </td>
                  </tr>
                  <tr class="border-top">
                    <td class="text-muted small">1:1 (Ueberstunden)</td>
                    <td class="text-end fw-mono">{{ overtimeSaldo }} h</td>
                  </tr>
                  <tr>
                    <td class="text-muted small">ZGUE (Zeitguthaben)</td>
                    <td class="text-end fw-mono">0:00 h</td>
                  </tr>
                  <tr class="fw-bold bg-light">
                    <td class="text-indigo">SGes (Saldo Gesamt)</td>
                    <td class="text-end fw-mono text-indigo">
                      {{ overtimeSaldo }} h
                    </td>
                  </tr>
                </tbody>
              </table>
              <div class="p-3">
                <div class="progress" style="height: 10px">
                  <div
                    class="progress-bar bg-success"
                    :style="{ width: `${usedVacationProgress}%` }"
                  ></div>
                  <div
                    class="progress-bar bg-warning"
                    :style="{ width: `${plannedVacationProgress}%` }"
                  ></div>
                </div>
                <div class="d-flex justify-content-between mt-1 small text-muted">
                  <span>Verbraucht: {{ usedVacation }}</span>
                  <span>Geplant: {{ plannedVacation }}</span>
                  <span>Gesamt: {{ totalVacation }}</span>
                </div>
              </div>
            </div>

            <div class="mt-3 text-center">
              <a
                href="#"
                class="text-decoration-none text-indigo fw-bold"
                @click.prevent="exportPDF"
              >
                <i class="bi bi-file-earmark-pdf"></i> Als PDF ausgeben
              </a>
            </div>
          </div>
        </div>
      </div>

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
                    v-model="form.from"
                    type="date"
                    class="form-control"
                    required
                  />
                </div>

                <div class="col-md-6">
                  <label class="form-label small fw-bold text-muted">BIS</label>
                  <input
                    v-model="form.to"
                    type="date"
                    class="form-control"
                    required
                  />
                </div>

                <div class="col-md-12">
                  <label class="form-label small fw-bold text-muted">
                    URLAUBSART
                  </label>
                  <select v-model="form.type" class="form-select">
                    <option value="vacation">Jahresurlaub</option>
                    <option value="sick">Krankheitsurlaub</option>
                    <option value="overtime">Zeitausgleich (1:1)</option>
                    <option value="other">Andere / Sonderurlaub</option>
                  </select>
                </div>

                <div class="col-12">
                  <label class="form-label small fw-bold text-muted">
                    GRUND / BEMERKUNG
                  </label>
                  <textarea
                    v-model="form.reason"
                    class="form-control"
                    rows="3"
                    placeholder="Grund fuer den Antrag..."
                    required
                  ></textarea>
                </div>

                <div v-if="previewDays > 0" class="col-12 mt-4">
                  <div
                    class="alert alert-info py-2 mb-3 border-0 shadow-sm d-flex justify-content-between align-items-center"
                  >
                    <span>
                      <i class="bi bi-calculator"></i> Vorschau Berechnung:
                    </span>
                    <span class="fw-bold fs-5">
                      {{ previewDays }} {{ previewDays === 1 ? "Tag" : "Tage" }}
                    </span>
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

        <div class="card shadow-sm border-0">
          <div class="card-header bg-white border-0 pt-4 px-4 pb-0">
            <h5 class="fw-bold mb-0 text-indigo">
              <i class="bi bi-clock-history"></i> Meine Antraege
            </h5>
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
                    <th class="text-end">Aktion</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="request in requests" :key="request._id">
                    <td>{{ format(request.from) }}</td>
                    <td>{{ format(request.to) }}</td>
                    <td>
                      <small>{{ request.reason }}</small><br />
                      <span class="badge bg-light text-dark border">
                        {{ translateType(request.type) }}
                      </span>
                    </td>
                    <td>
                      <span
                        v-if="request.status === 'pending'"
                        class="badge bg-warning-soft text-warning border border-warning-subtle px-2 rounded-pill"
                      >
                        In Bearbeitung
                      </span>
                      <span
                        v-if="request.status === 'approved'"
                        class="badge bg-success-soft text-success border border-success-subtle px-2 rounded-pill"
                      >
                        Genehmigt
                      </span>
                      <span
                        v-if="request.status === 'rejected'"
                        class="badge bg-danger-soft text-danger border border-danger-subtle px-2 rounded-pill"
                      >
                        Abgelehnt
                      </span>
                    </td>
                    <td class="text-end">
                      <button
                        v-if="request.status === 'pending'"
                        class="btn btn-sm btn-outline-danger"
                        title="Antrag zurueckziehen"
                        @click="deleteRequest(request._id)"
                      >
                        <i class="bi bi-trash3"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>

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

    <div
      id="vacation-report"
      style="opacity: 0; pointer-events: none; position: fixed; top: 0; left: 0; z-index: -1; width: 800px; padding: 40px; background: white; font-family: sans-serif; color: #1a1a1a;"
    >
      <div
        style="border-bottom: 3px solid #6366f1; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center;"
      >
        <div style="flex: 1">
          <h1 style="margin: 0; font-size: 28px; color: #6366f1">
            Urlaubskonto {{ currentYear }}
          </h1>
          <p style="margin: 5px 0 0; color: #64748b; font-weight: 600">
            Offizieller Auszug - Zeiterfassung System
          </p>
        </div>
        <div style="text-align: right; flex: 1">
          <h2 style="margin: 0; font-size: 20px">{{ currentUser.name }}</h2>
          <p style="margin: 5px 0 0; color: #64748b">
            Zeitraum: {{ vacationPeriod }}
          </p>
        </div>
      </div>

      <div style="display: flex; gap: 20px; margin-bottom: 40px">
        <div
          style="flex: 1; background: #f0fdf4; padding: 25px; border-radius: 12px; border: 1px solid #bbf7d0; text-align: center;"
        >
          <span
            style="font-size: 12px; text-transform: uppercase; color: #166534; font-weight: 800; letter-spacing: 1px;"
          >
            Restanspruch
          </span>
          <div
            style="font-size: 42px; font-weight: 900; color: #166534; margin: 10px 0;"
          >
            {{ remainingVacation }} Tage
          </div>
          <p style="margin: 0; color: #166534; font-size: 14px">
            von {{ totalVacation }} Tagen Gesamtanspruch
          </p>
        </div>
        <div
          style="flex: 1; background: #f8fafc; padding: 25px; border-radius: 12px; border: 1px solid #e2e8f0;"
        >
          <h4
            style="margin: 0 0 15px 0; font-size: 14px; text-transform: uppercase; color: #475569;"
          >
            Kontodetails
          </h4>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px">
            <span style="color: #64748b">Genommener Urlaub:</span>
            <span style="font-weight: 700; color: #ef4444">
              {{ usedVacation }} Tage
            </span>
          </div>
          <div style="display: flex; justify-content: space-between">
            <span style="color: #64748b">Geplanter Urlaub:</span>
            <span style="font-weight: 700; color: #f59e0b">
              {{ plannedVacation }} Tage
            </span>
          </div>
        </div>
      </div>

      <h3
        style="font-size: 18px; color: #1e293b; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; margin-bottom: 20px;"
      >
        Detaillierter Verlauf der Antraege
      </h3>
      <table style="width: 100%; border-collapse: collapse">
        <thead>
          <tr
            style="background: #f8fafc; text-align: left; color: #475569; font-size: 12px; text-transform: uppercase;"
          >
            <th style="padding: 12px; border-bottom: 2px solid #e2e8f0">Zeitraum</th>
            <th style="padding: 12px; border-bottom: 2px solid #e2e8f0">Art des Urlaubs</th>
            <th style="padding: 12px; border-bottom: 2px solid #e2e8f0">Status</th>
            <th style="padding: 12px; border-bottom: 2px solid #e2e8f0; text-align: right;">
              Netto-Tage
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="request in requests.filter((entry) => entry.type === 'vacation')"
            :key="request._id"
            style="border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #334155;"
          >
            <td style="padding: 12px">
              {{ format(request.from) }} - {{ format(request.to) }}
            </td>
            <td style="padding: 12px">{{ translateType(request.type) }}</td>
            <td style="padding: 12px">
              <span
                :style="{
                  padding: '4px 10px',
                  borderRadius: '50px',
                  fontSize: '11px',
                  fontWeight: '700',
                  background:
                    request.status === 'approved'
                      ? '#dcfce7'
                      : request.status === 'rejected'
                        ? '#fee2e2'
                        : '#fef3c7',
                  color:
                    request.status === 'approved'
                      ? '#166534'
                      : request.status === 'rejected'
                        ? '#991b1b'
                        : '#92400e',
                  border: '1px solid currentColor',
                }"
              >
                {{
                  request.status === "approved"
                    ? "GENEHMIGT"
                    : request.status === "rejected"
                      ? "ABGELEHNT"
                      : "IN BEARBEITUNG"
                }}
              </span>
            </td>
            <td style="padding: 12px; font-weight: 700; text-align: right">
              {{ calculateWorkDays(request.from, request.to) }}
            </td>
          </tr>
        </tbody>
      </table>

      <div
        style="margin-top: 80px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 11px;"
      >
        Dieser Auszug wurde am {{ todayFormatted }} maschinell erstellt. <br />
        Er dient zur Information des Arbeitnehmers ueber seinen aktuellen Urlaubsstatus.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from "vue";
import api from "../api";
import { toast } from "vue3-toastify";
import html2pdf from "html2pdf.js";

const requests = ref([]);
const sessions = ref([]);
const holidaysMap = ref({});
const workSchedule = ref(null);
const form = ref({ from: "", to: "", type: "vacation", reason: "" });
const selectedDate = ref(new Date().toISOString().split("T")[0]);
const employmentStartDate = ref(null);
const employmentEndDate = ref(null);

const currentUser = JSON.parse(localStorage.getItem("user")) || {};
const totalVacation = ref(currentUser.vacation_days_per_year || 25);
const weeklyHours = ref(currentUser.weekly_hours || 40);

const selectedDateObject = computed(() => new Date(`${selectedDate.value}T00:00:00`));
const currentYear = computed(() => selectedDateObject.value.getFullYear());
const todayFormatted = computed(() =>
  selectedDateObject.value.toLocaleDateString("de-DE"),
);
const dayMap = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

const getDateKey = (value) => {
  if (!value) return "";
  return new Date(value).toISOString().split("T")[0];
};

const parseTimeToMinutes = (value) => {
  if (!value || !value.includes(":")) return 0;
  const [hours, minutes] = value.split(":").map(Number);
  return (hours * 60) + minutes;
};

const getEffectivePeriodStart = () => {
  const yearStart = new Date(currentYear.value, 0, 1);
  if (!employmentStartDate.value) return yearStart;

  const start = new Date(employmentStartDate.value);
  return start > yearStart ? start : yearStart;
};

const getEffectivePeriodEnd = () => {
  const selected = new Date(selectedDateObject.value);
  if (!employmentEndDate.value) return selected;

  const end = new Date(employmentEndDate.value);
  return end < selected ? end : selected;
};

const vacationPeriod = computed(() => {
  const start = getEffectivePeriodStart();
  const end = getEffectivePeriodEnd();
  return `${start.toLocaleDateString("de-DE")} - ${end.toLocaleDateString("de-DE")}`;
});

const getScheduledMinutesForDate = (date) => {
  const schedule = workSchedule.value?.schedule;
  const fallbackMinutes = Math.round((weeklyHours.value / 5) * 60);

  if (!schedule) {
    return date.getDay() === 0 || date.getDay() === 6 ? 0 : fallbackMinutes;
  }

  const dayKey = dayMap[date.getDay()];
  const plan = schedule[dayKey];
  if (!plan?.active) return 0;

  const minutes = parseTimeToMinutes(plan.to) - parseTimeToMinutes(plan.from);
  return minutes > 0 ? minutes : fallbackMinutes;
};

const approvedLeaves = computed(() =>
  requests.value.filter((request) => request.status === "approved"),
);

const isDateCoveredByApprovedLeave = (dateKey, types = []) =>
  approvedLeaves.value.some((request) => {
    if (types.length && !types.includes(request.type)) return false;
    const from = getDateKey(request.from);
    const to = getDateKey(request.to);
    return dateKey >= from && dateKey <= to;
  });

const calculateWorkDays = (startStr, endStr, cutoffStr = selectedDate.value) => {
  if (!startStr || !endStr) return 0;

  const start = new Date(startStr);
  const end = new Date(endStr);
  const cutoff = new Date(`${cutoffStr}T00:00:00`);
  const periodStart = getEffectivePeriodStart();
  const effectiveStart = start > periodStart ? start : periodStart;
  const effectiveEnd = end < cutoff ? end : cutoff;
  let days = 0;

  if (effectiveEnd < effectiveStart) return 0;

  for (let cursor = new Date(effectiveStart); cursor <= effectiveEnd; cursor.setDate(cursor.getDate() + 1)) {
    const dateKey = getDateKey(cursor);
    const isHoliday = !!holidaysMap.value[dateKey];
    if (cursor.getDay() !== 0 && cursor.getDay() !== 6 && !isHoliday) {
      days += 1;
    }
  }

  return days;
};

const previewDays = computed(() => {
  if (form.value.from && form.value.to && form.value.type === "vacation") {
    return calculateWorkDays(form.value.from, form.value.to, selectedDate.value);
  }
  return 0;
});

const usedVacation = computed(() =>
  requests.value.reduce((sum, request) => {
    if (request.status === "approved" && request.type === "vacation") {
      return sum + calculateWorkDays(request.from, request.to, selectedDate.value);
    }
    return sum;
  }, 0),
);

const plannedVacation = computed(() =>
  requests.value.reduce((sum, request) => {
    if (
      request.status === "pending" &&
      request.type === "vacation" &&
      getDateKey(request.from) <= selectedDate.value
    ) {
      return sum + calculateWorkDays(request.from, request.to, selectedDate.value);
    }
    return sum;
  }, 0),
);

const remainingVacation = computed(
  () => totalVacation.value - usedVacation.value - plannedVacation.value,
);

const usedVacationProgress = computed(() => {
  if (!totalVacation.value) return 0;
  return (usedVacation.value / totalVacation.value) * 100;
});

const plannedVacationProgress = computed(() => {
  if (!totalVacation.value) return 0;
  return (plannedVacation.value / totalVacation.value) * 100;
});

const overtimeSaldo = computed(() => {
  const sessionMinutesByDate = new Map();

  sessions.value.forEach((session) => {
    if (!session.start || !session.end) return;

    const dateKey = session.date_today || getDateKey(session.start);
    if (!dateKey.startsWith(`${currentYear.value}-`)) return;
    if (dateKey > selectedDate.value) return;

    const diffMs = new Date(session.end) - new Date(session.start);
    if (diffMs <= 0) return;

    let workedMinutes = Math.floor(diffMs / 60000);
    workedMinutes -= parseTimeToMinutes(session.pause || "0:00");
    if (workedMinutes < 0) workedMinutes = 0;

    sessionMinutesByDate.set(
      dateKey,
      (sessionMinutesByDate.get(dateKey) || 0) + workedMinutes,
    );
  });

  const yearStart = getEffectivePeriodStart();
  const periodEnd = getEffectivePeriodEnd();
  let totalIstMinutes = 0;
  let totalSollMinutes = 0;
  let totalOvertimeDeductionMinutes = 0;

  if (periodEnd < yearStart) return "0:00";

  for (let cursor = new Date(yearStart); cursor <= periodEnd; cursor.setDate(cursor.getDate() + 1)) {
    const dateKey = getDateKey(cursor);
    const isHoliday = !!holidaysMap.value[dateKey];
    const scheduledMinutes = getScheduledMinutesForDate(cursor);
    const approvedRegularLeave = isDateCoveredByApprovedLeave(dateKey, [
      "vacation",
      "sick",
      "other",
    ]);
    const approvedOvertimeLeave = isDateCoveredByApprovedLeave(dateKey, [
      "overtime",
    ]);

    totalIstMinutes += sessionMinutesByDate.get(dateKey) || 0;

    if (!isHoliday && !approvedRegularLeave && !approvedOvertimeLeave) {
      totalSollMinutes += scheduledMinutes;
    }

    if (!isHoliday && approvedOvertimeLeave) {
      totalOvertimeDeductionMinutes += scheduledMinutes;
    }
  }

  const diff = totalIstMinutes - totalSollMinutes - totalOvertimeDeductionMinutes;
  const sign = diff < 0 ? "-" : "";
  const absDiff = Math.abs(diff);
  const hours = Math.floor(absDiff / 60);
  const minutes = String(absDiff % 60).padStart(2, "0");

  return `${sign}${hours}:${minutes}`;
});

const loadCalendarForSelectedYear = async () => {
  const calendarRes = await api.get(`/calendar?year=${currentYear.value}`);
  const map = {};
  calendarRes.data?.holidays?.forEach((holiday) => {
    map[holiday.date] = holiday.name;
  });
  holidaysMap.value = map;
};

const load = async () => {
  try {
    const meRes = await api.get("/me");
    if (meRes.data?.user) {
      employmentStartDate.value = meRes.data.user.start_date || null;
      employmentEndDate.value = meRes.data.user.end_date || null;
      totalVacation.value = meRes.data.user.vacation_days_per_year || 25;

      try {
        const scheduleRes = await api.get(`/schedule/${meRes.data.user.id}`);
        if (scheduleRes.data) {
          weeklyHours.value = scheduleRes.data.weekly_hours || 40;
          workSchedule.value = scheduleRes.data;
        }
      } catch (error) {
        console.warn("Plan-Load fail", error);
      }
    }

    const requestsRes = await api.get("/leave-requests");
    requests.value = requestsRes.data;

    const sessionsRes = await api.get("/workSessions");
    sessions.value = sessionsRes.data;

    await loadCalendarForSelectedYear();
  } catch (error) {
    console.error("Error loading requests", error);
  }
};

const submitRequest = async () => {
  try {
    await api.post("/leave-requests", form.value);
    toast.success("Dein Urlaubsantrag wurde erfolgreich uebermittelt!");
    form.value = { from: "", to: "", type: "vacation", reason: "" };
    await load();
  } catch (error) {
    // Fehler wird global behandelt
  }
};

const deleteRequest = async (id) => {
  if (!confirm("Moechtest du diesen Antrag wirklich zurueckziehen?")) return;
  try {
    await api.delete(`/leave-requests/${id}`);
    toast.info("Antrag erfolgreich geloescht.");
    await load();
  } catch (error) {
    // Fehler wird global behandelt
  }
};

const format = (value) => new Date(value).toLocaleDateString("de-DE");

const exportPDF = async () => {
  const element = document.getElementById("vacation-report");
  if (!element) {
    toast.error("PDF-Vorlage nicht gefunden.");
    return;
  }

  const previousStyle = element.getAttribute("style") || "";
  const options = {
    margin: 0,
    filename: `Urlaubskonto_${currentUser.name}_${selectedDate.value}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
  };

  try {
    element.setAttribute(
      "style",
      "opacity: 1; pointer-events: auto; position: fixed; top: 0; left: -10000px; z-index: 9999; width: 800px; padding: 40px; background: white; font-family: sans-serif; color: #1a1a1a;",
    );
    await nextTick();

    toast.info("Generiere PDF... Bitte warten...");
    await html2pdf().from(element).set(options).save();
    toast.success("PDF erfolgreich exportiert!");
  } catch (error) {
    console.error("PDF export failed", error);
    toast.error("PDF konnte nicht erzeugt werden.");
  } finally {
    element.setAttribute("style", previousStyle);
  }
};

const translateType = (type) =>
  type === "vacation"
    ? "Jahresurlaub"
    : type === "sick"
      ? "Krank"
      : type === "overtime"
        ? "Zeitausgleich (1:1)"
        : "Andere";

watch(currentYear, async () => {
  try {
    await loadCalendarForSelectedYear();
  } catch (error) {
    console.error("Calendar reload failed", error);
  }
});

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
