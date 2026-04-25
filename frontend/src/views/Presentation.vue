<template>
  <main class="presentation-page">
    <section class="deck" :class="activeSlide.theme">
      <header class="deck-toolbar">
        <div>
          <span class="deck-label">Projektpraesentation</span>
          <strong>Zeiterfassung</strong>
        </div>
        <div class="deck-actions">
          <button type="button" class="icon-button" title="Vorherige Folie" @click="prevSlide">
            &lt;
          </button>
          <span>{{ currentSlide + 1 }} / {{ slides.length }}</span>
          <button type="button" class="icon-button" title="Naechste Folie" @click="nextSlide">
            &gt;
          </button>
        </div>
      </header>

      <article class="slide">
        <div class="slide-copy">
          <p class="eyebrow">{{ activeSlide.kicker }}</p>
          <h1>{{ activeSlide.title }}</h1>
          <p class="lead">{{ activeSlide.lead }}</p>

          <div v-if="activeSlide.people" class="people-grid">
            <article v-for="person in activeSlide.people" :key="person.label" class="person-item">
              <span>{{ person.label }}</span>
              <strong>{{ person.name }}</strong>
            </article>
          </div>

          <div v-if="activeSlide.points" class="point-grid">
            <article v-for="point in activeSlide.points" :key="point.title" class="point-item">
              <span class="point-mark">{{ point.mark }}</span>
              <div>
                <h2>{{ point.title }}</h2>
                <p>{{ point.text }}</p>
              </div>
            </article>
          </div>
        </div>

        <div class="slide-visual">
          <div v-if="activeSlide.visual === 'system'" class="visual-panel system-map">
            <div class="system-node browser">
              <span>Frontend</span>
              <strong>Vue 3 SPA</strong>
              <small>Views, Router, Axios</small>
            </div>
            <div class="system-line">REST API</div>
            <div class="system-node server">
              <span>Backend</span>
              <strong>Express.js</strong>
              <small>Controller, Services, Middleware</small>
            </div>
            <div class="system-line">Mongoose</div>
            <div class="system-node database">
              <span>Datenbank</span>
              <strong>MongoDB</strong>
              <small>User, Zeiten, Urlaub, Logs</small>
            </div>
          </div>

          <div v-else-if="activeSlide.visual === 'modules'" class="visual-panel module-map">
            <article v-for="module in modules" :key="module.name">
              <span>{{ module.code }}</span>
              <strong>{{ module.name }}</strong>
              <small>{{ module.description }}</small>
            </article>
          </div>

          <div v-else-if="activeSlide.visual === 'backend'" class="visual-panel backend-picture">
            <div class="backend-browser">
              <div class="backend-bar">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <div class="backend-code">
                <p><b>POST</b> /api/auth/login</p>
                <p><b>GET</b> /api/work-sessions</p>
                <p><b>POST</b> /api/leave-requests</p>
                <p><b>GET</b> /healthz</p>
              </div>
            </div>
            <div class="backend-layers">
              <span>Security Headers</span>
              <span>JWT Auth Middleware</span>
              <span>Controller</span>
              <span>Service Layer</span>
              <span>Mongoose Models</span>
            </div>
          </div>

          <div v-else-if="activeSlide.visual === 'data'" class="visual-panel data-picture">
            <div v-for="model in dataModels" :key="model.name" class="data-table">
              <strong>{{ model.name }}</strong>
              <span v-for="field in model.fields" :key="field">{{ field }}</span>
            </div>
          </div>

          <div v-else-if="activeSlide.visual === 'frontend'" class="visual-panel frontend-picture">
            <div class="mock-app">
              <aside>
                <strong>Zeiterfassung</strong>
                <span>Dashboard</span>
                <span>Terminal</span>
                <span>Urlaub</span>
                <span>Reports</span>
              </aside>
              <section>
                <div class="mock-header">
                  <span>Heute</span>
                  <strong>07:42 h</strong>
                </div>
                <div class="mock-cards">
                  <article>Start</article>
                  <article>Pause</article>
                  <article>Ende</article>
                </div>
                <div class="mock-chart"></div>
              </section>
            </div>
          </div>

          <div v-else-if="activeSlide.visual === 'live'" class="visual-panel live-panel">
            <div class="live-topbar">
              <span></span>
              <strong>{{ demoFrameUrl }}</strong>
              <a :href="demoFrameUrl" target="_blank" rel="noreferrer">Oeffnen</a>
            </div>
            <iframe class="demo-frame" :src="demoFrameUrl" title="Zeiterfassung Live Demo"></iframe>
          </div>

          <div v-else class="visual-panel stack-picture">
            <article v-for="tech in technologies" :key="tech.name">
              <span>{{ tech.area }}</span>
              <strong>{{ tech.name }}</strong>
              <small>{{ tech.use }}</small>
            </article>
          </div>
        </div>
      </article>

      <nav class="slide-nav" aria-label="Folien">
        <button
          v-for="(slide, index) in slides"
          :key="slide.title"
          type="button"
          :class="{ active: index === currentSlide }"
          :title="slide.title"
          @click="goToSlide(index)"
        >
          {{ String(index + 1).padStart(2, "0") }}
        </button>
      </nav>
    </section>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

const currentSlide = ref(0);

const slides = [
  {
    kicker: "MEVN Stack Projekt",
    title: "Digitales Zeiterfassungssystem",
    lead: "Eine Webanwendung fuer Arbeitszeiten, Dienstplanung, Urlaubsantraege, Berichte und Administration.",
    theme: "theme-cover",
    visual: "system",
    people: [
      { label: "Entwickelt von", name: "Nawal Kayal und Ahmad Alalan" },
      { label: "Technologie", name: "Vue 3, Node.js, Express, MongoDB" },
    ],
  },
  {
    kicker: "Problem und Ziel",
    title: "Warum dieses Projekt?",
    lead: "Das System ersetzt verstreute Listen und manuelle Schritte durch eine zentrale, nachvollziehbare Plattform.",
    theme: "theme-light",
    visual: "modules",
    points: [
      { mark: "01", title: "Zeit sparen", text: "Arbeitszeiten werden direkt digital erfasst und koennen sofort ausgewertet werden." },
      { mark: "02", title: "Transparenz schaffen", text: "Mitarbeitende und Admins sehen Status, Antraege und Berichte an einem Ort." },
      { mark: "03", title: "Prozesse ordnen", text: "Urlaub, Dienstplan, Kalender und Reports folgen klaren Workflows." },
    ],
  },
  {
    kicker: "Frontend",
    title: "Was die Benutzer live sehen",
    lead: "Das Frontend ist eine Vue Single Page Application mit klarer Navigation und rollenabhaengigen Ansichten.",
    theme: "theme-blue",
    visual: "frontend",
    points: [
      { mark: "UI", title: "Vue 3 Komponenten", text: "Dashboard, Terminal, Kalender, Reports und Adminbereiche sind als getrennte Views aufgebaut." },
      { mark: "UX", title: "Schnelle Bedienung", text: "Zeiten starten, Pausen verwalten, Urlaub beantragen und Berichte ansehen." },
    ],
  },
  {
    kicker: "Backend Bild",
    title: "Backend-Architektur",
    lead: "Das Backend verarbeitet API-Anfragen, prueft Sicherheit, ruft Services auf und speichert Daten in MongoDB.",
    theme: "theme-dark",
    visual: "backend",
    points: [
      { mark: "API", title: "Express.js", text: "REST-Endpunkte fuer Auth, User, Arbeitszeiten, Urlaub, Reports und Systemstatus." },
      { mark: "SEC", title: "Sicherheit", text: "JWT, bcrypt, Security Headers, CORS-Regeln und zentrale Fehlerbehandlung." },
      { mark: "OPS", title: "Betrieb", text: "Health-Checks, Logging, Monitoring und sauberes Shutdown-Verhalten fuer Deployment." },
    ],
  },
  {
    kicker: "Datenmodell",
    title: "Daten sauber strukturiert",
    lead: "Mongoose-Modelle bilden die wichtigsten Objekte des Systems ab und halten die Daten konsistent.",
    theme: "theme-green",
    visual: "data",
    points: [
      { mark: "DB", title: "MongoDB", text: "Flexible NoSQL-Datenbank fuer Arbeitszeiten, Benutzer, Abteilungen und Antraege." },
      { mark: "LOG", title: "Nachvollziehbarkeit", text: "Logs und Statusfelder machen Entscheidungen und Fehler spaeter nachvollziehbar." },
    ],
  },
  {
    kicker: "Technologien",
    title: "Welche Technologien wurden verwendet?",
    lead: "Der Stack ist modern, gut testbar und fuer lokales Arbeiten sowie Cloud-Deployment geeignet.",
    theme: "theme-tech",
    visual: "stack",
    points: [
      { mark: "FE", title: "Vue, Vite, Bootstrap", text: "Schnelle Entwicklung, responsive Oberflaeche und modulare Komponenten." },
      { mark: "BE", title: "Node, Express, Mongoose", text: "Strukturierte API-Schicht mit Datenzugriff ueber Modelle und Services." },
      { mark: "QA", title: "Jest und Supertest", text: "Unit- und Integrationstests fuer kritische Backend-Funktionen." },
    ],
  },
  {
    kicker: "Live Demo",
    title: "Frontend live zeigen",
    lead: "Hier kann die echte Anwendung direkt in der Praesentation gezeigt werden: Login, Dashboard, Zeiterfassung, Urlaub und Reports.",
    theme: "theme-live",
    visual: "live",
    points: [
      { mark: "1", title: "Login", text: "Benutzer anmelden und rollenabhaengige Navigation zeigen." },
      { mark: "2", title: "Zeiterfassung", text: "Arbeitsstart, Pause, Ende und Tagesuebersicht demonstrieren." },
      { mark: "3", title: "Admin", text: "Benutzer, Abteilungen, Urlaub, Reports und Dienstplanung vorstellen." },
    ],
  },
  {
    kicker: "Fazit",
    title: "Ergebnis",
    lead: "Das Projekt zeigt eine vollstaendige Webanwendung mit Frontend, Backend, Datenbank, Sicherheit, Tests und Deployment-Vorbereitung.",
    theme: "theme-finish",
    visual: "system",
    points: [
      { mark: "OK", title: "Funktional", text: "Die wichtigsten Ablaufe der Zeiterfassung sind digital abgebildet." },
      { mark: "UP", title: "Erweiterbar", text: "Durch Controller, Services und Komponenten kann das System gut weiterentwickelt werden." },
    ],
  },
];

const modules = [
  { code: "01", name: "Dashboard", description: "Tagesstatus und Schnellzugriff" },
  { code: "02", name: "Terminal", description: "Start, Pause und Ende" },
  { code: "03", name: "Kalender", description: "Termine und Feiertage" },
  { code: "04", name: "Urlaub", description: "Antrag und Freigabe" },
  { code: "05", name: "Reports", description: "Auswertungen und Abrechnung" },
  { code: "06", name: "Admin", description: "User, Rollen, Abteilungen" },
];

const dataModels = [
  { name: "User", fields: ["name", "email", "role", "department"] },
  { name: "WorkSession", fields: ["user", "start", "end", "breaks"] },
  { name: "LeaveRequest", fields: ["status", "from", "to", "reason"] },
  { name: "Department", fields: ["name", "members", "manager"] },
  { name: "Schedule", fields: ["date", "shift", "assignedUsers"] },
  { name: "Log", fields: ["level", "message", "requestId"] },
];

const technologies = [
  { area: "Frontend", name: "Vue 3", use: "Reaktive UI und Komponenten" },
  { area: "Build", name: "Vite", use: "Schneller Dev Server und Build" },
  { area: "UI", name: "Bootstrap 5", use: "Responsive Layouts" },
  { area: "HTTP", name: "Axios", use: "API-Kommunikation mit Token" },
  { area: "Backend", name: "Express.js", use: "REST API und Middleware" },
  { area: "Datenbank", name: "MongoDB", use: "Persistenz ueber Mongoose" },
  { area: "Auth", name: "JWT + bcrypt", use: "Login und Passwortschutz" },
  { area: "Tests", name: "Jest + Supertest", use: "Backend-Qualitaetssicherung" },
];

const activeSlide = computed(() => slides[currentSlide.value]);
const demoFrameUrl = computed(() => `${window.location.origin}/login`);

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
</script>

<style scoped>
.presentation-page {
  min-height: 100vh;
  color: #172033;
  background: #eef3f8;
}

.deck {
  min-height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr auto;
  overflow: hidden;
}

.deck-toolbar,
.slide-nav {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem;
}

.deck-toolbar {
  color: rgba(255, 255, 255, 0.92);
}

.deck-toolbar strong,
.person-item strong,
.point-item h2,
.system-node strong,
.data-table strong,
.stack-picture strong {
  display: block;
}

.deck-label,
.eyebrow,
.person-item span,
.point-mark,
.system-node span,
.data-table span,
.stack-picture span {
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.deck-actions {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.45rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(14px);
}

.icon-button,
.slide-nav button {
  border: 0;
  cursor: pointer;
  font-weight: 800;
}

.icon-button {
  width: 2.15rem;
  height: 2.15rem;
  border-radius: 50%;
  color: #102544;
  background: rgba(255, 255, 255, 0.9);
}

.slide {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(420px, 1.1fr);
  gap: 2rem;
  align-items: center;
  min-height: 0;
  padding: 1.25rem clamp(1.25rem, 3vw, 3.5rem) 0.75rem;
}

.slide-copy {
  max-width: 720px;
  color: #ffffff;
}

.eyebrow {
  margin: 0 0 0.9rem;
  color: rgba(255, 255, 255, 0.78);
}

h1 {
  margin: 0;
  max-width: 11ch;
  font-size: clamp(2.6rem, 5vw, 5.8rem);
  line-height: 0.95;
  letter-spacing: 0;
}

.lead {
  max-width: 58ch;
  margin: 1.3rem 0 0;
  color: rgba(255, 255, 255, 0.82);
  font-size: clamp(1.05rem, 1.5vw, 1.28rem);
  line-height: 1.65;
}

.people-grid,
.point-grid {
  display: grid;
  gap: 0.9rem;
  margin-top: 1.35rem;
}

.people-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.person-item,
.point-item,
.visual-panel {
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.13);
  box-shadow: 0 24px 50px rgba(0, 0, 0, 0.16);
  backdrop-filter: blur(18px);
}

.person-item {
  padding: 1rem;
  border-radius: 0.5rem;
}

.person-item strong {
  margin-top: 0.3rem;
  color: #ffffff;
}

.point-item {
  display: grid;
  grid-template-columns: 3.2rem 1fr;
  gap: 0.9rem;
  padding: 1rem;
  border-radius: 0.5rem;
}

.point-mark {
  display: grid;
  place-items: center;
  width: 3.1rem;
  height: 3.1rem;
  border-radius: 0.45rem;
  color: #0f2138;
  background: #ffffff;
}

.point-item h2 {
  margin: 0;
  color: #ffffff;
  font-size: 1.03rem;
}

.point-item p {
  margin: 0.25rem 0 0;
  color: rgba(255, 255, 255, 0.76);
  line-height: 1.5;
}

.slide-visual {
  min-width: 0;
}

.visual-panel {
  min-height: min(68vh, 660px);
  border-radius: 0.65rem;
  padding: clamp(1rem, 2vw, 1.5rem);
}

.system-map {
  display: grid;
  grid-template-columns: 1fr auto 1fr auto 1fr;
  align-items: center;
  gap: 0.9rem;
}

.system-node {
  min-height: 250px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 1.35rem;
  border-radius: 0.55rem;
  color: #ffffff;
}

.system-node strong {
  margin-top: 0.4rem;
  font-size: 1.75rem;
}

.system-node small {
  margin-top: 0.65rem;
  color: rgba(255, 255, 255, 0.76);
  line-height: 1.5;
}

.browser {
  background: linear-gradient(160deg, #1d63b7, #40a6c8);
}

.server {
  background: linear-gradient(160deg, #27324a, #596a91);
}

.database {
  background: linear-gradient(160deg, #0c7b61, #39ad7c);
}

.system-line {
  min-width: 5.2rem;
  padding: 0.55rem 0.7rem;
  border-radius: 999px;
  color: #142137;
  text-align: center;
  font-size: 0.78rem;
  font-weight: 800;
  background: rgba(255, 255, 255, 0.9);
}

.module-map,
.data-picture,
.stack-picture {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem;
}

.module-map article,
.stack-picture article,
.data-table {
  min-height: 128px;
  padding: 1rem;
  border-radius: 0.5rem;
  color: #102544;
  background: rgba(255, 255, 255, 0.88);
}

.module-map span {
  display: grid;
  place-items: center;
  width: 2.3rem;
  height: 2.3rem;
  margin-bottom: 0.75rem;
  border-radius: 0.45rem;
  color: #ffffff;
  font-weight: 800;
  background: #1c5ea8;
}

.module-map strong,
.stack-picture strong {
  font-size: 1.15rem;
}

.module-map small,
.stack-picture small {
  display: block;
  margin-top: 0.4rem;
  color: #526177;
  line-height: 1.45;
}

.backend-picture {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 1rem;
}

.backend-browser {
  overflow: hidden;
  border-radius: 0.6rem;
  background: #101827;
  border: 1px solid rgba(255, 255, 255, 0.22);
}

.backend-bar {
  display: flex;
  gap: 0.45rem;
  padding: 0.9rem;
  background: #1f2937;
}

.backend-bar span {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  background: #d8e2f0;
}

.backend-code {
  display: grid;
  align-content: center;
  min-height: 420px;
  padding: 1.4rem;
  color: #dce9ff;
  font-family: Consolas, "Courier New", monospace;
}

.backend-code p {
  margin: 0.42rem 0;
  padding: 0.85rem;
  border-radius: 0.45rem;
  background: rgba(255, 255, 255, 0.08);
}

.backend-code b {
  color: #65d6ad;
}

.backend-layers {
  display: grid;
  gap: 0.75rem;
  align-content: center;
}

.backend-layers span {
  display: block;
  padding: 1rem;
  border-radius: 0.5rem;
  color: #ffffff;
  font-weight: 800;
  background: linear-gradient(135deg, #194c8f, #2d80c5);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.16);
}

.data-table {
  display: grid;
  align-content: start;
  gap: 0.45rem;
}

.data-table strong {
  color: #0c604f;
  font-size: 1.15rem;
}

.data-table span {
  padding: 0.42rem 0.55rem;
  border-radius: 0.35rem;
  color: #41516a;
  background: #edf5f1;
}

.frontend-picture {
  padding: 0;
  overflow: hidden;
}

.mock-app {
  display: grid;
  grid-template-columns: 185px 1fr;
  min-height: min(68vh, 660px);
  background: #f6f8fb;
}

.mock-app aside {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  padding: 1.2rem;
  color: #ffffff;
  background: #17345d;
}

.mock-app aside strong {
  margin-bottom: 1rem;
}

.mock-app aside span {
  padding: 0.75rem;
  border-radius: 0.45rem;
  background: rgba(255, 255, 255, 0.12);
}

.mock-app section {
  padding: 1.4rem;
}

.mock-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem;
  border-radius: 0.5rem;
  background: #ffffff;
  box-shadow: 0 14px 30px rgba(22, 35, 58, 0.08);
}

.mock-header strong {
  color: #1b805d;
  font-size: 2rem;
}

.mock-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.9rem;
  margin-top: 1rem;
}

.mock-cards article {
  min-height: 110px;
  display: grid;
  place-items: center;
  border-radius: 0.5rem;
  color: #ffffff;
  font-weight: 900;
  background: linear-gradient(135deg, #1c67b1, #46a9c6);
}

.mock-chart {
  height: 230px;
  margin-top: 1rem;
  border-radius: 0.5rem;
  background:
    linear-gradient(90deg, transparent 0 12%, rgba(28, 103, 177, 0.18) 12% 14%, transparent 14% 100%),
    linear-gradient(180deg, #ffffff, #edf4fb);
  box-shadow: 0 14px 30px rgba(22, 35, 58, 0.08);
}

.live-panel {
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 0.8rem;
  padding: 0.8rem;
  background: rgba(255, 255, 255, 0.96);
}

.live-topbar {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.8rem;
  align-items: center;
  padding: 0.75rem;
  border-radius: 0.45rem;
  color: #172033;
  background: #edf3f8;
}

.live-topbar span {
  width: 0.8rem;
  height: 0.8rem;
  border-radius: 50%;
  background: #2c9f78;
}

.live-topbar strong {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.live-topbar a {
  color: #175ea8;
  font-weight: 800;
  text-decoration: none;
}

.demo-frame {
  width: 100%;
  min-height: 560px;
  border: 0;
  border-radius: 0.45rem;
  background: #ffffff;
}

.slide-nav {
  justify-content: center;
  flex-wrap: wrap;
  padding-bottom: 1.15rem;
}

.slide-nav button {
  width: 2.55rem;
  height: 2.55rem;
  border-radius: 50%;
  color: rgba(255, 255, 255, 0.78);
  background: rgba(255, 255, 255, 0.16);
}

.slide-nav button.active {
  color: #152138;
  background: #ffffff;
}

.theme-cover {
  background: linear-gradient(135deg, #123a63 0%, #286c9d 48%, #2f9a82 100%);
}

.theme-light {
  background: linear-gradient(135deg, #26344e 0%, #536a86 52%, #8a9f98 100%);
}

.theme-blue {
  background: linear-gradient(135deg, #172f5f 0%, #1d75b8 48%, #57b3c1 100%);
}

.theme-dark {
  background: linear-gradient(135deg, #111827 0%, #26384f 52%, #46647d 100%);
}

.theme-green {
  background: linear-gradient(135deg, #123b35 0%, #16745d 50%, #6ead87 100%);
}

.theme-tech {
  background: linear-gradient(135deg, #2c2f3d 0%, #575f75 52%, #9aa7ad 100%);
}

.theme-live {
  background: linear-gradient(135deg, #14345b 0%, #236c9c 45%, #43a479 100%);
}

.theme-finish {
  background: linear-gradient(135deg, #1d2b43 0%, #4a6f8c 52%, #d2a85f 100%);
}

@media (max-width: 1120px) {
  .slide {
    grid-template-columns: 1fr;
    align-items: start;
    overflow-y: auto;
  }

  h1 {
    max-width: 16ch;
  }

  .visual-panel {
    min-height: auto;
  }
}

@media (max-width: 760px) {
  .deck-toolbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .slide {
    padding: 1rem;
  }

  .people-grid,
  .module-map,
  .data-picture,
  .stack-picture,
  .backend-picture,
  .system-map,
  .mock-app {
    grid-template-columns: 1fr;
  }

  .system-node {
    min-height: 150px;
  }

  .system-line {
    min-width: 0;
  }

  .mock-cards {
    grid-template-columns: 1fr;
  }

  .demo-frame {
    min-height: 430px;
  }
}
</style>
