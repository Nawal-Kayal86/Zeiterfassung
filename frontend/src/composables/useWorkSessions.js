import { computed, onBeforeUnmount, ref, watch } from "vue";
import { toast } from "vue3-toastify";
import api from "../api";
import {
  buildManualSessionPayload,
  buildSessionUpdatePayload,
  createEmptyManualSession,
  createManualSessionFromRecord,
} from "../utils/workSessionForm";

const DEFAULT_SUMMARY = Object.freeze({
  lastStart: null,
  lastEnd: null,
  totalEntries: 0,
});

export function useWorkSessions(currentUser) {
  const apiSummary = ref({ ...DEFAULT_SUMMARY });
  const workSessions = ref([]);
  const manualSession = ref(createEmptyManualSession());
  const loading = ref(false);
  const saving = ref(false);
  const liveDuration = ref("00:00:00");
  const pausedSeconds = ref(0);
  const isPauseActive = ref(false);
  const timerId = ref(null);

  const activeSession = computed(() => {
    if (!currentUser.value?.id) {
      return null;
    }

    return (
      workSessions.value.find((session) => {
        if (session.user_id && session.user_id !== currentUser.value.id) {
          return false;
        }

        if (!session.start) {
          return false;
        }

        if (!session.end) {
          return true;
        }

        return new Date(session.end) <= new Date(session.start);
      }) || null
    );
  });

  const summary = computed(() => {
    const fallbackSummary = buildSummaryFallback(workSessions.value, currentUser.value);

    return {
      totalEntries: apiSummary.value.totalEntries ?? fallbackSummary.totalEntries,
      lastStart: apiSummary.value.lastStart || fallbackSummary.lastStart,
      lastEnd: apiSummary.value.lastEnd || fallbackSummary.lastEnd,
    };
  });

  const isEditingManualSession = computed(() => Boolean(manualSession.value.id));

  watch(activeSession, (session) => {
    if (session) {
      startLiveTimer();
      return;
    }

    stopLiveTimer();
  });

  onBeforeUnmount(() => {
    stopLiveTimer();
  });

  async function refresh() {
    loading.value = true;

    try {
      const [sessionResponse, summaryResponse] = await Promise.all([
        api.get("/workSessions"),
        api.get("/workSessions/summary"),
      ]);

      workSessions.value = sessionResponse.data;
      apiSummary.value = summaryResponse.data || { ...DEFAULT_SUMMARY };
    } catch {
      workSessions.value = [];
      apiSummary.value = { ...DEFAULT_SUMMARY };
    } finally {
      loading.value = false;
    }
  }

  async function startWorkday() {
    try {
      resetPauseState();
      const response = await api.post("/workSessions/start");
      toast.success(response.data.message || "Arbeitsbeginn gespeichert!");
      await refresh();
    } catch {}
  }

  async function stopWorkday() {
    try {
      const response = await api.post("/workSessions/stop", {
        pause: formatPauseDuration(pausedSeconds.value),
      });
      toast.success(response.data.message || "Arbeitsende gespeichert!");
      resetPauseState();
      await refresh();
    } catch {}
  }

  async function saveManualSession() {
    saving.value = true;

    try {
      if (manualSession.value.id) {
        const updatePayload = buildSessionUpdatePayload(manualSession.value);
        await api.put(`/workSessions/${manualSession.value.id}`, updatePayload);
        toast.success("Eintrag erfolgreich aktualisiert!");
      } else {
        const createPayload = buildManualSessionPayload(manualSession.value);
        await api.post("/workSessions/manual-time", createPayload);
        toast.success("Eintrag erfolgreich gespeichert!");
      }

      resetManualSession();
      await refresh();
    } finally {
      saving.value = false;
    }
  }

  function beginEdit(session) {
    manualSession.value = createManualSessionFromRecord(session);
  }

  function resetManualSession() {
    manualSession.value = createEmptyManualSession();
  }

  async function deleteSession(sessionId) {
    await api.delete(`/workSessions/${sessionId}`);
    toast.success("Eintrag geloescht.");
    await refresh();
  }

  function togglePause() {
    isPauseActive.value = !isPauseActive.value;
    toast[isPauseActive.value ? "info" : "success"](
      isPauseActive.value ? "Pause gestartet" : "Pause beendet",
    );
  }

  function startLiveTimer() {
    if (!activeSession.value) {
      return;
    }

    stopLiveTimer();
    updateLiveDuration();
    timerId.value = window.setInterval(updateLiveDuration, 1000);
  }

  function stopLiveTimer() {
    if (timerId.value) {
      window.clearInterval(timerId.value);
      timerId.value = null;
    }

    liveDuration.value = "00:00:00";
  }

  function updateLiveDuration() {
    if (!activeSession.value) {
      liveDuration.value = "00:00:00";
      return;
    }

    if (isPauseActive.value) {
      pausedSeconds.value += 1;
      return;
    }

    const sessionStart = new Date(activeSession.value.start);
    const elapsedMilliseconds = Math.max(
      Date.now() - sessionStart.getTime() - pausedSeconds.value * 1000,
      0,
    );

    liveDuration.value = formatElapsedDuration(elapsedMilliseconds);
  }

  function resetPauseState() {
    isPauseActive.value = false;
    pausedSeconds.value = 0;
  }

  return {
    summary,
    workSessions,
    manualSession,
    loading,
    saving,
    liveDuration,
    isPauseActive,
    activeSession,
    isEditingManualSession,
    refresh,
    startWorkday,
    stopWorkday,
    saveManualSession,
    beginEdit,
    resetManualSession,
    deleteSession,
    togglePause,
  };
}

function formatPauseDuration(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours}:${String(minutes).padStart(2, "0")}`;
}

function formatElapsedDuration(elapsedMilliseconds) {
  const totalSeconds = Math.floor(elapsedMilliseconds / 1000);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

function buildSummaryFallback(workSessions, currentUser) {
  const relevantSessions = workSessions.filter((session) =>
    isRelevantForSummary(session, currentUser),
  );

  const sessionsWithStart = relevantSessions
    .filter((session) => session.start)
    .sort((left, right) => new Date(right.start) - new Date(left.start));

  const sessionsWithEnd = relevantSessions
    .filter((session) => session.end && new Date(session.end) > new Date(session.start))
    .sort((left, right) => new Date(right.end) - new Date(left.end));

  return {
    totalEntries: relevantSessions.length,
    lastStart: sessionsWithStart[0]?.start || null,
    lastEnd: sessionsWithEnd[0]?.end || null,
  };
}

function isRelevantForSummary(session, currentUser) {
  if (!currentUser?.id) {
    return true;
  }

  if (currentUser.role === "admin") {
    return true;
  }

  if (!session.user_id) {
    return true;
  }

  return session.user_id === currentUser.id;
}
