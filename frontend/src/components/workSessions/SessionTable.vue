<template>
  <div class="card shadow-sm mt-4">
    <div class="card-header bg-light fw-bold d-flex align-items-center justify-content-between gap-2">
      <span class="d-flex align-items-center gap-2">
        <i class="bi bi-list-columns-reverse text-secondary"></i>
        {{ title }}
      </span>
      <span class="badge bg-secondary-subtle text-secondary-emphasis">
        {{ sessions.length }} Eintraege
      </span>
    </div>

    <div class="card-body p-0">
      <table class="table table-hover mb-0">
        <thead class="table-light">
          <tr>
            <th v-if="showUserColumn">Mitarbeiter</th>
            <th>Datum</th>
            <th>Start</th>
            <th>Ende</th>
            <th>Pause</th>
            <th>Dauer</th>
            <th v-if="editable" class="text-end pe-4">Aktion</th>
          </tr>
        </thead>

        <tbody>
          <tr v-if="loading">
            <td :colspan="columnCount" class="text-center py-4 text-muted">Lade Eintraege...</td>
          </tr>
          <tr v-else-if="sessions.length === 0">
            <td :colspan="columnCount" class="text-center py-4 text-muted">
              Keine Eintraege gefunden
            </td>
          </tr>
          <tr v-for="session in sessions" :key="session.id">
            <td v-if="showUserColumn">{{ session.name }}</td>
            <td>{{ formatDate(session.start) }}</td>
            <td>{{ formatTime(session.start) }}</td>
            <td>{{ formatTime(session.end) }}</td>
            <td>
              <span class="badge bg-light text-dark font-monospace">
                {{ session.pause || "0:00" }}
              </span>
            </td>
            <td>{{ calcDuration(session.start, session.end) }}</td>
            <td v-if="editable" class="text-end pe-4">
              <button
                class="btn btn-sm btn-outline-primary border-0"
                title="Eintrag bearbeiten"
                @click="$emit('edit', session)"
              >
                <i class="bi bi-pencil-square"></i>
              </button>
              <button
                class="btn btn-sm btn-outline-danger border-0"
                title="Eintrag loeschen"
                @click="$emit('delete', session.id)"
              >
                <i class="bi bi-trash3"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { calcDuration, formatDate, formatTime } from "../../utils/time";

const props = defineProps({
  sessions: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: "Alle Eintraege",
  },
  showUserColumn: {
    type: Boolean,
    default: false,
  },
  editable: {
    type: Boolean,
    default: true,
  },
});

defineEmits(["edit", "delete"]);

const columnCount = computed(() => {
  let count = 5;

  if (props.showUserColumn) {
    count += 1;
  }

  if (props.editable) {
    count += 1;
  }

  return count;
});
</script>
