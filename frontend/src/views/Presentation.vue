<template>
  <div class="presentation-page">
    <main class="presentation-stage">
      <section class="slide-shell">
        <div class="slide-surface" :class="activeSlide.theme">
          <div class="slide-overlay overlay-top">
            <RouterLink class="primary-button overlay-cta" :to="ctaTarget">
              {{ ctaLabel }}
            </RouterLink>
          </div>

          <div class="slide-chrome">
            <span></span>
            <span></span>
            <span></span>
          </div>

          <article class="slide-content">
            <div class="slide-copy">
              <p class="slide-kicker">{{ activeSlide.kicker }}</p>
              <h2>{{ activeSlide.title }}</h2>
              <p v-if="activeSlide.subtitle" class="slide-subtitle">{{ activeSlide.subtitle }}</p>
              <p class="slide-text">{{ activeSlide.text }}</p>

              <div v-if="activeSlide.meta?.length" class="cover-meta">
                <article v-for="entry in activeSlide.meta" :key="entry.name" class="cover-meta-card">
                  <span>{{ entry.role }}</span>
                  <strong>{{ entry.name }}</strong>
                </article>
              </div>

              <div
                v-if="activeSlide.stats?.length && activeSlide.visual !== 'cover'"
                class="stat-grid"
              >
                <article v-for="stat in activeSlide.stats" :key="stat.label" class="stat-card">
                  <strong>{{ stat.value }}</strong>
                  <span>{{ stat.label }}</span>
                </article>
              </div>

              <div v-if="activeSlide.points?.length" class="point-list">
                <article
                  v-for="point in activeSlide.points"
                  :key="point.title"
                  class="point-card"
                >
                  <div class="point-icon">
                    <i :class="point.icon"></i>
                  </div>
                  <div>
                    <h3>{{ point.title }}</h3>
                    <p>{{ point.text }}</p>
                  </div>
                </article>
              </div>
            </div>

            <div class="slide-visual">
              <div v-if="activeSlide.visual === 'cover'" class="visual-card cover-visual">
                <div class="cover-badge">MEVN Stack</div>
                <div class="cover-architecture">
                  <img class="cover-architecture-image" :src="liveImageUrl" alt="Systemarchitektur" />
                </div>
              </div>

              <div v-else class="visual-card dashboard-visual">
                <div class="frame-head">
                  <div class="frame-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <div class="frame-url">{{ demoFrameUrl }}</div>
                </div>
                <div class="frame-stage">
                  <iframe
                    class="app-frame"
                    :src="demoFrameUrl"
                    title="Zeiterfassung Login Demo"
                  ></iframe>
                </div>
              </div>
            </div>
          </article>

          <div class="slide-overlay overlay-bottom">
            <nav class="slide-picker" aria-label="Folienauswahl">
              <button
                v-for="(slide, index) in slides"
                :key="slide.title"
                type="button"
                class="slide-dot"
                :class="{ active: index === currentSlide }"
                @click="goToSlide(index)"
              >
                <span>{{ String(index + 1).padStart(2, '0') }}</span>
              </button>
            </nav>
          </div>
        </div>

      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

const currentSlide = ref(0);

const slides = [
  {
    shortTitle: "Start",
    title: "Digitales Zeiterfassungssystem",
    subtitle: "Konzeption, Entwicklung und Cloud-Deployment",
    text: "eines webbasierten Zeiterfassungssystems im MEVN-Stack",
    theme: "theme-warm",
    visual: "cover",
    meta: [
      {
        role: "Projektarbeit",
        name: "Nawal Kayal\nAhmad Alalan",
      },
      {
        role: "Betreuer",
        name: "DI Mag. Dr. Martin Gruber\nDI Endre Beda",
      },
    ],
  },
  {
    shortTitle: "Ziel",
    kicker: "Folie 02",
    title: "Projektziel",
    text: "Ziel ist eine Anwendung, die den Arbeitsalltag vereinfacht und manuelle Listen oder verteilte Prozesse ersetzt.",
    theme: "theme-ocean",
    visual: "abstract",
    badges: ["Arbeitszeit", "Urlaub", "Planung", "Admin"],
    points: [
      {
        icon: "bi bi-bullseye",
        title: "Zentrale Bedienung",
        text: "Alle wichtigen Funktionen liegen an einem Ort und sind schnell erreichbar.",
      },
      {
        icon: "bi bi-check2-square",
        title: "Weniger Medienbrueche",
        text: "Informationen muessen nicht in mehreren Systemen gepflegt werden.",
      },
    ],
  },
  {
    shortTitle: "Nutzen",
    kicker: "Folie 03",
    title: "Welchen Nutzen bietet das System?",
    text: "Die Anwendung spart Zeit, schafft Transparenz und verbessert die Zusammenarbeit zwischen Mitarbeitenden und Verwaltung.",
    theme: "theme-amber",
    visual: "abstract",
    badges: ["Schnell", "Klar", "Nachvollziehbar"],
    points: [
      {
        icon: "bi bi-lightning-charge-fill",
        title: "Schnelle Bedienung",
        text: "Arbeitsbeginn, Pause und Arbeitsende sind ohne Umwege verfuegbar.",
      },
      {
        icon: "bi bi-bar-chart-line-fill",
        title: "Klare Auswertung",
        text: "Berichte und Monatsdaten schaffen Transparenz fuer Team und Administration.",
      },
      {
        icon: "bi bi-shield-check",
        title: "Saubere Rollenlogik",
        text: "Mitarbeitende und Admins sehen genau die Funktionen, die sie benoetigen.",
      },
    ],
  },
  {
    shortTitle: "Dashboard",
    kicker: "Folie 04",
    title: "Dashboard und Live-Zeiterfassung",
    text: "Das Dashboard ist der Startpunkt der Anwendung und zeigt aktive Zeiten, offene Aufgaben und wichtige Informationen direkt an.",
    theme: "theme-sky",
    visual: "dashboard",
    points: [
      {
        icon: "bi bi-play-circle-fill",
        title: "Starten und beenden",
        text: "Zeiten koennen sofort gestartet, pausiert und beendet werden.",
      },
      {
        icon: "bi bi-eye-fill",
        title: "Alles im Blick",
        text: "Offene Antraege, Statusmeldungen und Tagesdaten bleiben sichtbar.",
      },
    ],
  },
  {
    shortTitle: "Kalender",
    kicker: "Folie 05",
    title: "Kalender und Dienstplanung",
    text: "Planung wird durch eigene Ansichten fuer Termine, Schichten und Verfuegbarkeiten strukturierter und einfacher.",
    theme: "theme-forest",
    visual: "abstract",
    badges: ["Kalender", "Schichten", "Verfuegbarkeit"],
    points: [
      {
        icon: "bi bi-calendar3",
        title: "Uebersichtliche Planung",
        text: "Arbeitszeiten und Schichten lassen sich in klaren Ansichten organisieren.",
      },
      {
        icon: "bi bi-people-fill",
        title: "Teamorientiert",
        text: "Dienstplaene bleiben fuer das Team sichtbar und besser abstimmbar.",
      },
    ],
  },
  {
    shortTitle: "Urlaub",
    kicker: "Folie 06",
    title: "Urlaubsantrag und Freigabe",
    text: "Urlaub wird digital beantragt, geprueft und freigegeben. Dadurch entstehen transparente und nachvollziehbare Prozesse.",
    theme: "theme-lilac",
    visual: "abstract",
    badges: ["Antrag", "Pruefung", "Freigabe"],
    points: [
      {
        icon: "bi bi-send-check-fill",
        title: "Digitaler Antrag",
        text: "Mitarbeitende stellen Antraege direkt in der Anwendung.",
      },
      {
        icon: "bi bi-person-check-fill",
        title: "Schnelle Entscheidung",
        text: "Freigaben werden zentral von zustaendigen Personen bearbeitet.",
      },
    ],
  },
  {
    shortTitle: "Admin",
    kicker: "Folie 07",
    title: "Benutzer- und Abteilungsverwaltung",
    text: "Admins pflegen Rollen, Stammdaten und organisatorische Strukturen zentral im System.",
    theme: "theme-slate",
    visual: "abstract",
    badges: ["Benutzer", "Rollen", "Abteilungen"],
    points: [
      {
        icon: "bi bi-person-badge-fill",
        title: "Rollen steuern",
        text: "Zugriffe und Verantwortlichkeiten koennen sauber abgebildet werden.",
      },
      {
        icon: "bi bi-diagram-3-fill",
        title: "Organisation strukturieren",
        text: "Abteilungen und Stammdaten bleiben konsistent an einem Ort.",
      },
    ],
  },
  {
    shortTitle: "Berichte",
    kicker: "Folie 08",
    title: "Berichte und Monatsdaten",
    text: "Das Projekt erzeugt auswertbare Daten fuer Kontrolle, Nachvollziehbarkeit und spaetere Abrechnung.",
    theme: "theme-copper",
    visual: "abstract",
    badges: ["Reporting", "Monat", "Abrechnung"],
    points: [
      {
        icon: "bi bi-graph-up-arrow",
        title: "Auswertungen",
        text: "Monatsansichten und Berichte helfen bei der Analyse der Arbeitsdaten.",
      },
      {
        icon: "bi bi-receipt-cutoff",
        title: "Weiterverarbeitung",
        text: "Die Datenbasis eignet sich fuer spaetere Abrechnung und Dokumentation.",
      },
    ],
  },
  {
    shortTitle: "Rollen",
    kicker: "Folie 09",
    title: "Zwei Rollen, eine Plattform",
    text: "Die Anwendung unterscheidet klar zwischen Mitarbeitenden und Admins, bleibt aber in einer gemeinsamen Oberflaeche konsistent.",
    theme: "theme-indigo",
    visual: "roles",
  },
  {
    shortTitle: "Ablauf",
    kicker: "Folie 10",
    title: "Typischer Ablauf im Alltag",
    text: "Vom Login ueber die Zeiterfassung bis zur Auswertung bildet das System einen kompletten Arbeitstag digital ab.",
    theme: "theme-mint",
    visual: "timeline",
  },
  {
    shortTitle: "Sonderfaelle",
    kicker: "Folie 11",
    title: "Auch Sonderfaelle sind abbildbar",
    text: "Neben Standardablaeufen koennen auch besondere Prozesse wie Korrekturen oder Arzttermine systematisch umgesetzt werden.",
    theme: "theme-rose",
    visual: "abstract",
    badges: ["Korrekturen", "Ausnahmen", "Spezialprozesse"],
    points: [
      {
        icon: "bi bi-heart-pulse-fill",
        title: "Flexible Prozesse",
        text: "Die Anwendung ist nicht nur fuer Standardfaelle gedacht, sondern auch fuer reale Alltagssituationen.",
      },
      {
        icon: "bi bi-arrow-repeat",
        title: "Korrekturen moeglich",
        text: "Abweichungen koennen nachvollziehbar dokumentiert und bearbeitet werden.",
      },
    ],
  },
  {
    shortTitle: "Design",
    kicker: "Folie 12",
    title: "Warum das Frontend wichtig ist",
    text: "Die Oberflaeche entscheidet darueber, wie schnell ein Team das System annimmt und im Alltag nutzt.",
    theme: "theme-night",
    visual: "abstract",
    badges: ["Klar", "Modern", "Direkt"],
    points: [
      {
        icon: "bi bi-window-stack",
        title: "Uebersichtliche Struktur",
        text: "Wichtige Funktionen muessen ohne langes Suchen erreichbar sein.",
      },
      {
        icon: "bi bi-stars",
        title: "Professioneller Eindruck",
        text: "Eine gute Praesentation der Anwendung staerkt auch die Wirkung des Projekts.",
      },
    ],
  },
  {
    shortTitle: "Tech",
    kicker: "Folie 13",
    title: "Technologie-Stack",
    text: "Das Projekt basiert auf einem modernen Web-Stack mit Frontend, Routing, Backend und Datenbank.",
    theme: "theme-graphite",
    visual: "stack",
  },
  {
    shortTitle: "Ende",
    kicker: "Folie 14",
    title: "Bereit fuer Demo und Anwendung",
    text: "Die Praesentation fuehrt direkt in die bestehende Anwendung und eignet sich fuer Schule, Projektvorstellung oder Demo.",
    theme: "theme-gold",
    visual: "closing",
    stats: [
      { value: "Vue 3", label: "Frontend" },
      { value: "Express", label: "Backend" },
      { value: "MongoDB", label: "Datenbasis" },
    ],
  },
];

const activeSlide = computed(() => slides[currentSlide.value]);
const demoFrameUrl = "https://zeiterfassung-mh87.onrender.com/login";
const liveImageUrl = "src/assets/live.png";

const goToSlide = (index) => {
  currentSlide.value = index;
};

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % slides.length;
};

const prevSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + slides.length) % slides.length;
};

const onKeydown = (event) => {
  if (event.key === "ArrowRight" || event.key === " ") {
    event.preventDefault();
    nextSlide();
  }

  if (event.key === "ArrowLeft") {
    event.preventDefault();
    prevSlide();
  }
};

onMounted(() => {
  window.addEventListener("keydown", onKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeydown);
});

const ctaTarget = computed(() =>
  localStorage.getItem("token") ? "/dashboard" : "/login",
);

const ctaLabel = computed(() =>
  localStorage.getItem("token") ? "Zur Anwendung" : "Demo starten",
);
</script>

<style scoped>
.presentation-page {
  min-height: 100vh;
  padding: 0;
  color: #10233d;
  background:
    radial-gradient(circle at top left, rgba(255, 167, 112, 0.18), transparent 24%),
    radial-gradient(circle at top right, rgba(57, 124, 255, 0.16), transparent 20%),
    linear-gradient(180deg, #f5efe5 0%, #edf4ff 45%, #f8fbff 100%);
}

.presentation-stage {
  width: 100%;
  min-height: 100vh;
}

.slide-content,
.stat-grid,
.point-card,
.slide-actions,
.dashboard-grid,
.mock-panels {
  display: flex;
}

.slide-kicker,
.visual-pill,
.mini-panel span,
.timeline-step span,
.role-card span {
  margin: 0 0 0.35rem;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.slide-copy h2,
.point-card h3,
.stat-card strong,
.mock-hero strong,
.mini-panel strong,
.timeline-step strong,
.role-card strong,
.closing-box strong {
  margin: 0;
}

.primary-button,
.ghost-button,
.slide-dot {
  transition:
    transform 0.22s ease,
    background 0.22s ease,
    box-shadow 0.22s ease,
    border-color 0.22s ease,
    opacity 0.22s ease;
}

.primary-button,
.ghost-button {
  border-radius: 999px;
  padding: 0.9rem 1.35rem;
  text-decoration: none;
  font-weight: 700;
}

.primary-button {
  color: #fff;
  background: linear-gradient(135deg, #ef6c2f, #ff9d5c);
  box-shadow: 0 14px 28px rgba(239, 108, 47, 0.22);
}

.ghost-button {
  color: #16315e;
  background: rgba(255, 255, 255, 0.76);
  border: 1px solid rgba(22, 49, 94, 0.12);
}

.primary-button:hover,
.ghost-button:hover,
.slide-dot:hover {
  transform: translateY(-2px);
}

.slide-shell {
  position: relative;
  width: 100%;
  min-height: 100vh;
}

.slide-surface {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
}

.slide-shell:hover .slide-overlay,
.slide-shell:focus-within .slide-overlay {
  opacity: 1;
  pointer-events: auto;
}

.slide-overlay {
  position: absolute;
  left: 0;
  right: 0;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.2rem 1.5rem;
  opacity: 0;
  pointer-events: none;
}

.overlay-top {
  top: 0;
}

.overlay-bottom {
  bottom: 0;
  justify-content: center;
}

.overlay-cta {
  box-shadow: 0 14px 30px rgba(239, 108, 47, 0.24);
}

.slide-chrome {
  display: flex;
  gap: 0.45rem;
  padding: 1rem 1.2rem;
  background: rgba(255, 255, 255, 0.16);
}

.slide-chrome span {
  width: 0.78rem;
  height: 0.78rem;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.55);
}

.slide-content {
  justify-content: space-between;
  gap: 1.5rem;
  min-height: calc(100vh - 56px);
  padding: 2rem 2rem 5.5rem;
}

.slide-copy,
.slide-visual {
  flex: 1 1 0;
  min-width: 0;
}

.slide-copy {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.slide-copy h2 {
  font-size: clamp(2.3rem, 3.6vw, 4.8rem);
  line-height: 0.98;
  max-width: 12ch;
}

.slide-subtitle {
  max-width: 24ch;
  margin: 1rem 0 0;
  font-size: clamp(1.05rem, 1.5vw, 1.45rem);
  font-weight: 700;
  line-height: 1.35;
  color: #18335d;
}

.slide-text,
.point-card p,
.stat-card span,
.mock-hero p,
.mini-panel p,
.timeline-step p,
.role-card p,
.closing-box p {
  color: rgba(15, 34, 63, 0.76);
  line-height: 1.65;
}

.stat-grid {
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 1.5rem;
}

.cover-meta {
  display: grid;
  gap: 0.9rem;
  margin-top: 1.5rem;
}

.cover-meta-card {
  max-width: 28rem;
  padding: 1rem 1.1rem;
  border-radius: 1.2rem;
  background: rgba(255, 255, 255, 0.58);
  border: 1px solid rgba(18, 50, 103, 0.08);
  box-shadow: 0 18px 40px rgba(22, 44, 86, 0.06);
}

.cover-meta-card span {
  display: inline-block;
  margin-bottom: 0.35rem;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #49658f;
}

.cover-meta-card strong {
  display: block;
  font-size: 1.2rem;
  white-space: pre-line;
  color: #102544;
}

.stat-card,
.point-card,
.visual-card,
.mini-panel,
.timeline-step,
.role-card,
.mock-hero {
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(18, 50, 103, 0.08);
  box-shadow: 0 18px 40px rgba(22, 44, 86, 0.08);
  backdrop-filter: blur(12px);
}

.stat-card {
  min-width: 10rem;
  padding: 1rem 1.1rem;
  border-radius: 1.2rem;
}

.stat-card strong,
.mock-hero strong,
.closing-box strong {
  display: block;
  font-size: 1.8rem;
  color: #102544;
}

.point-list {
  display: grid;
  gap: 1rem;
  margin-top: 1.5rem;
}

.point-card {
  gap: 1rem;
  padding: 1.1rem 1.15rem;
  border-radius: 1.3rem;
}

.point-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  flex: 0 0 3rem;
  border-radius: 1rem;
  font-size: 1.1rem;
  color: #fff;
  background: linear-gradient(135deg, #1949aa, #3182ff);
}

.slide-visual {
  display: flex;
  align-items: center;
  justify-content: center;
}

.visual-card {
  width: 100%;
  min-height: 100%;
  border-radius: 1.6rem;
  padding: 1.25rem;
}

.dashboard-visual {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cover-visual {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1.25rem;
  min-height: 560px;
  padding: 2rem;
  background:
    radial-gradient(circle at top right, rgba(49, 130, 255, 0.22), transparent 28%),
    linear-gradient(160deg, rgba(16, 37, 68, 0.96), rgba(27, 70, 139, 0.92));
  color: #f4f8ff;
}

.cover-badge {
  align-self: flex-start;
  padding: 0.7rem 1rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.16);
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.cover-architecture {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 560px;
  padding: 1rem;
  border-radius: 1.8rem;
  background:
    radial-gradient(circle at 30% 70%, rgba(175, 219, 255, 0.36), transparent 28%),
    radial-gradient(circle at 80% 20%, rgba(205, 232, 255, 0.34), transparent 26%),
    linear-gradient(180deg, rgba(220, 235, 247, 0.58), rgba(102, 126, 134, 0.54));
  border: 1px solid rgba(255, 255, 255, 0.28);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.35);
  overflow: hidden;
}

.cover-architecture-image {
  display: block;
  width: 100%;
  max-width: 520px;
  height: 520px;
  object-fit: contain;
  filter: drop-shadow(0 18px 30px rgba(57, 101, 149, 0.2));
}

.frame-head {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.85rem 1rem;
  border-radius: 1.1rem;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(18, 50, 103, 0.08);
}

.frame-dots {
  display: flex;
  gap: 0.4rem;
}

.frame-dots span {
  width: 0.7rem;
  height: 0.7rem;
  border-radius: 50%;
  background: #c8d3e4;
}

.frame-url {
  min-width: 0;
  flex: 1 1 auto;
  padding: 0.7rem 0.9rem;
  border-radius: 999px;
  background: rgba(237, 243, 251, 0.95);
  color: #18335d;
  font-size: 0.9rem;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.frame-stage {
  overflow: hidden;
  border-radius: 1.4rem;
  border: 1px solid rgba(18, 50, 103, 0.08);
  background: rgba(255, 255, 255, 0.76);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.45);
}

.app-frame {
  width: 100%;
  height: 560px;
  border: 0;
  background: #ffffff;
}

.frame-foot strong {
  display: block;
  margin: 0;
  font-size: 1.2rem;
  color: #102544;
}

.frame-foot p {
  margin: 0.35rem 0 0;
  color: rgba(15, 34, 63, 0.72);
  line-height: 1.55;
}

.abstract-visual {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  align-content: center;
}

.visual-badge {
  padding: 1.2rem;
  border-radius: 1.4rem;
  font-weight: 800;
  font-size: clamp(1rem, 1.8vw, 1.6rem);
  color: #16315e;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(22, 49, 94, 0.1);
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 150px 1fr;
  min-height: 420px;
  overflow: hidden;
  border-radius: 1.4rem;
}

.mock-sidebar {
  padding: 1.2rem;
  background: linear-gradient(180deg, #123267, #1f4d96);
  color: rgba(255, 255, 255, 0.92);
}

.mock-sidebar p {
  margin: 0 0 1rem;
  font-weight: 600;
}

.mock-main {
  padding: 1.2rem;
}

.mock-hero {
  padding: 1.3rem;
  border-radius: 1.3rem;
  margin-bottom: 1rem;
}

.visual-pill {
  display: inline-block;
  color: #1d67d7;
}

.mock-panels {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.mini-panel {
  padding: 1rem;
  border-radius: 1.2rem;
}

.timeline-visual,
.role-visual {
  display: grid;
  gap: 1rem;
  align-content: center;
}

.timeline-step,
.role-card {
  padding: 1.2rem;
  border-radius: 1.35rem;
}

.stack-visual {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-content: center;
}

.stack-visual span {
  padding: 0.95rem 1.1rem;
  border-radius: 999px;
  font-weight: 700;
  color: #123267;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(22, 49, 94, 0.1);
}

.closing-visual {
  display: flex;
  align-items: center;
  justify-content: center;
}

.closing-box {
  max-width: 30rem;
  padding: 1.8rem;
  border-radius: 1.5rem;
  background: rgba(255, 255, 255, 0.76);
  border: 1px solid rgba(18, 50, 103, 0.1);
  box-shadow: 0 24px 50px rgba(22, 44, 86, 0.1);
}

.slide-actions {
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 1.25rem;
}

.slide-picker {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.65rem;
  max-width: min(920px, calc(100% - 2rem));
}

.slide-dot {
  width: 2.9rem;
  height: 2.9rem;
  padding: 0;
  border-radius: 999px;
  cursor: pointer;
  border: 1px solid rgba(17, 44, 84, 0.08);
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 14px 30px rgba(17, 44, 84, 0.08);
}

.slide-dot span {
  display: block;
  font-size: 0.8rem;
  font-weight: 700;
  color: #16315e;
}

.slide-dot.active {
  color: #fff;
  background: linear-gradient(135deg, #123267, #255daa);
  border-color: transparent;
}

.slide-dot.active span {
  color: #fff;
}

.theme-warm {
  background: linear-gradient(135deg, #fff1dc 0%, #ffe4d1 34%, #fff8f1 100%);
}

.theme-ocean {
  background: linear-gradient(135deg, #e4f1ff 0%, #d3ebff 46%, #f6fbff 100%);
}

.theme-amber {
  background: linear-gradient(135deg, #fff2dd 0%, #ffe8bf 50%, #fff9ed 100%);
}

.theme-sky {
  background: linear-gradient(135deg, #e7f4ff 0%, #d7eaff 40%, #f7fbff 100%);
}

.theme-forest {
  background: linear-gradient(135deg, #e8f7ee 0%, #d9f0df 42%, #f5fcf7 100%);
}

.theme-lilac {
  background: linear-gradient(135deg, #f0e9ff 0%, #e7ddff 44%, #faf7ff 100%);
}

.theme-slate {
  background: linear-gradient(135deg, #e9eef6 0%, #dce5f2 44%, #f8fbff 100%);
}

.theme-copper {
  background: linear-gradient(135deg, #fff0e4 0%, #fbe0cf 46%, #fff8f2 100%);
}

.theme-indigo {
  background: linear-gradient(135deg, #e8ebff 0%, #dde1ff 46%, #f8f9ff 100%);
}

.theme-mint {
  background: linear-gradient(135deg, #e6fbf5 0%, #d6f4eb 45%, #f6fffb 100%);
}

.theme-rose {
  background: linear-gradient(135deg, #fff0f2 0%, #ffe0e7 46%, #fff8f9 100%);
}

.theme-night {
  background: linear-gradient(135deg, #dfe8fb 0%, #d3dbf4 45%, #f3f6ff 100%);
}

.theme-graphite {
  background: linear-gradient(135deg, #edf0f6 0%, #dfe5f0 42%, #fafcff 100%);
}

.theme-gold {
  background: linear-gradient(135deg, #fff4dd 0%, #ffe5b3 45%, #fffaf1 100%);
}

@media (max-width: 1100px) {
  .slide-content {
    flex-direction: column;
    min-height: auto;
  }

  .slide-copy h2 {
    max-width: none;
  }
}

@media (max-width: 820px) {
  .slide-overlay {
    padding: 1rem;
  }

  .dashboard-grid,
  .mock-panels,
  .abstract-visual {
    grid-template-columns: 1fr;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .slide-content {
    padding: 1.2rem 1.2rem 5rem;
  }

  .overlay-top {
    flex-direction: column;
    align-items: flex-start;
  }

  .slide-dot {
    width: 2.55rem;
    height: 2.55rem;
  }

  .app-frame {
    height: 420px;
  }

  .frame-head {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
