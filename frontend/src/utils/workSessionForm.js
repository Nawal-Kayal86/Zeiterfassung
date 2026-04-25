const EMPTY_MANUAL_SESSION = Object.freeze({
  id: null,
  date: "",
  start: "",
  end: "",
  pause: "0:00",
});

export function createEmptyManualSession() {
  return { ...EMPTY_MANUAL_SESSION };
}

export function normalizeDateInput(dateValue) {
  if (typeof dateValue !== "string" || !dateValue.trim()) {
    return "";
  }

  if (!dateValue.includes(".")) {
    return dateValue;
  }

  const [day, month, year] = dateValue.split(".");
  if (!day || !month || !year) {
    return dateValue;
  }

  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

export function buildManualSessionPayload(formState) {
  return {
    date: normalizeDateInput(formState.date),
    start: formState.start || "",
    end: formState.end || "",
    pause: formState.pause || "0:00",
  };
}

export function buildSessionUpdatePayload(formState) {
  const normalizedDate = normalizeDateInput(formState.date);

  return {
    start: formState.start ? `${normalizedDate}T${formState.start}:00` : null,
    end: formState.end ? `${normalizedDate}T${formState.end}:00` : null,
    pause: formState.pause || "0:00",
  };
}

export function createManualSessionFromRecord(session) {
  return {
    id: session.id,
    date: session.start ? session.start.split("T")[0] : session.date_today || "",
    start: extractTime(session.start),
    end: extractTime(session.end),
    pause: session.pause || "0:00",
  };
}

function extractTime(dateTimeValue) {
  if (!dateTimeValue) {
    return "";
  }

  return new Date(dateTimeValue).toTimeString().slice(0, 5);
}
