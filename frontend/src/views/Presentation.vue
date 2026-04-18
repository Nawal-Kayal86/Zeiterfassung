<template>
  <div class="presentation-page">
    <header class="hero-section">
      <nav class="topbar">
        <div class="brand">
          <div class="brand-mark">
            <i class="bi bi-clock-history"></i>
          </div>
          <div>
            <p class="brand-kicker">Projektvorstellung</p>
            <h1>Zeiterfassung</h1>
          </div>
        </div>

        <div class="hero-actions">
          <RouterLink class="ghost-button" to="/login">Login</RouterLink>
          <RouterLink class="primary-button" :to="ctaTarget">
            {{ ctaLabel }}
          </RouterLink>
        </div>
      </nav>

      <div class="hero-grid">
        <section class="hero-copy">
          <p class="eyebrow">Digitale Arbeitszeiterfassung fuer moderne Teams</p>
          <h2>
            Ein Frontend, das Stempeln, Planung und Verwaltung in einer klaren
            Oberflaeche zusammenbringt.
          </h2>
          <p class="hero-text">
            Das Projekt verbindet Zeiterfassung, Urlaubsprozesse, Dienstplanung
            und Auswertung in einer zentralen Web-Anwendung. Die Oberflaeche ist
            auf schnelle Bedienung im Alltag ausgelegt und unterstuetzt sowohl
            Mitarbeitende als auch Admins.
          </p>

          <div class="cta-row">
            <RouterLink class="primary-button large" :to="ctaTarget">
              {{ ctaLabel }}
            </RouterLink>
            <a class="ghost-button large" href="#module">Module ansehen</a>
          </div>

          <div class="hero-metrics">
            <article v-for="stat in stats" :key="stat.label" class="metric-card">
              <strong>{{ stat.value }}</strong>
              <span>{{ stat.label }}</span>
            </article>
          </div>
        </section>

        <section class="showcase-card">
          <div class="screen-window">
            <div class="window-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>

            <div class="screen-layout">
              <aside class="mock-sidebar">
                <p>Dashboard</p>
                <p>Kalender</p>
                <p>Urlaub</p>
                <p>Berichte</p>
              </aside>

              <div class="mock-content">
                <div class="mock-live-card">
                  <span class="live-pill">Live Sitzung</span>
                  <strong>07:42:18</strong>
                  <p>Arbeitsbeginn registriert, Pause und Arbeitsende direkt steuerbar.</p>
                </div>

                <div class="mock-grid">
                  <article v-for="panel in mockPanels" :key="panel.title" class="mini-panel">
                    <span>{{ panel.kicker }}</span>
                    <strong>{{ panel.title }}</strong>
                    <p>{{ panel.text }}</p>
                  </article>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </header>

    <main>
      <section class="info-section">
        <div class="section-heading">
          <p class="eyebrow">Projektidee</p>
          <h3>Warum dieses System sinnvoll ist</h3>
          <p>
            Die Anwendung reduziert manuelle Listen, vereinfacht Freigaben und
            buendelt zeitkritische Prozesse an einem Ort.
          </p>
        </div>

        <div class="benefit-grid">
          <article v-for="benefit in benefits" :key="benefit.title" class="benefit-card">
            <div class="icon-wrap">
              <i :class="benefit.icon"></i>
            </div>
            <h4>{{ benefit.title }}</h4>
            <p>{{ benefit.text }}</p>
          </article>
        </div>
      </section>

      <section id="module" class="info-section alt-section">
        <div class="section-heading">
          <p class="eyebrow">Module</p>
          <h3>Diese Bereiche deckt das Frontend bereits ab</h3>
          <p>
            Die Praesentation basiert auf den vorhandenen Ansichten im Projekt
            und zeigt die Staerke des bestehenden Funktionsumfangs.
          </p>
        </div>

        <div class="module-grid">
          <article v-for="feature in features" :key="feature.title" class="module-card">
            <div class="module-head">
              <i :class="feature.icon"></i>
              <span>{{ feature.category }}</span>
            </div>
            <h4>{{ feature.title }}</h4>
            <p>{{ feature.text }}</p>
          </article>
        </div>
      </section>

      <section class="info-section process-section">
        <div class="section-heading narrow">
          <p class="eyebrow">Ablauf</p>
          <h3>So laeuft ein typischer Arbeitstag im System</h3>
        </div>

        <div class="timeline">
          <article v-for="step in processSteps" :key="step.step" class="timeline-card">
            <span>{{ step.step }}</span>
            <h4>{{ step.title }}</h4>
            <p>{{ step.text }}</p>
          </article>
        </div>
      </section>

      <section class="info-section stack-section">
        <div class="section-heading">
          <p class="eyebrow">Technik</p>
          <h3>Technologie-Stack des Projekts</h3>
        </div>

        <div class="stack-list">
          <span v-for="item in stack" :key="item">{{ item }}</span>
        </div>
      </section>

      <section class="closing-banner">
        <div>
          <p class="eyebrow">Bereit fuer die Demo</p>
          <h3>Die Praesentationsseite fuehrt direkt in die bestehende Anwendung.</h3>
        </div>

        <div class="hero-actions">
          <RouterLink class="ghost-button" to="/login">Zum Login</RouterLink>
          <RouterLink class="primary-button" :to="ctaTarget">
            {{ ctaLabel }}
          </RouterLink>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed } from "vue";

const stats = [
  { value: "10+", label: "App-Module im Frontend" },
  { value: "2 Rollen", label: "Mitarbeitende und Admin" },
  { value: "1 Plattform", label: "Zeiten, Urlaub und Planung" },
];

const benefits = [
  {
    icon: "bi bi-lightning-charge-fill",
    title: "Schnelle Bedienung",
    text: "Wichtige Aktionen wie Arbeitsbeginn, Pause und Arbeitsende sind direkt erreichbar.",
  },
  {
    icon: "bi bi-shield-check",
    title: "Klare Rollenlogik",
    text: "Admin-Funktionen wie Benutzerverwaltung, Abteilungen und Freigaben bleiben sauber getrennt.",
  },
  {
    icon: "bi bi-bar-chart-line-fill",
    title: "Mehr Uebersicht",
    text: "Berichte, Kalender, Fehlerprotokoll und Abrechnung helfen bei Kontrolle und Nachvollziehbarkeit.",
  },
];

const features = [
  {
    icon: "bi bi-clock-fill",
    category: "Zeiterfassung",
    title: "Dashboard mit Live-Stempelung",
    text: "Erfasst Arbeitsbeginn, Pausen und Arbeitsende und zeigt aktuelle Sitzungen sichtbar an.",
  },
  {
    icon: "bi bi-calendar3",
    category: "Planung",
    title: "Kalender und Dienstplan",
    text: "Arbeitszeiten, Termine und Schichten werden strukturiert in eigenen Ansichten dargestellt.",
  },
  {
    icon: "bi bi-sun-fill",
    category: "Personal",
    title: "Urlaubsantrag und Freigabe",
    text: "Mitarbeitende stellen Antraege, Admins pruefen und bestaetigen diese im gleichen System.",
  },
  {
    icon: "bi bi-people-fill",
    category: "Administration",
    title: "Benutzer- und Abteilungsverwaltung",
    text: "Verwaltet Benutzerrollen, organisatorische Bereiche und zentrale Stammdaten.",
  },
  {
    icon: "bi bi-graph-up-arrow",
    category: "Reporting",
    title: "Berichte und Abrechnung",
    text: "Auswertungen und Abrechnungslisten unterstuetzen die spaetere Weiterverarbeitung.",
  },
  {
    icon: "bi bi-hospital-fill",
    category: "Spezialprozesse",
    title: "Workflow fuer Arzttermine",
    text: "Auch Sonderfaelle im Arbeitsalltag sind als eigener Frontend-Prozess vorgesehen.",
  },
];

const processSteps = [
  {
    step: "01",
    title: "Anmelden",
    text: "Mitarbeitende melden sich an und gelangen direkt auf das persoenliche Dashboard.",
  },
  {
    step: "02",
    title: "Zeiten erfassen",
    text: "Arbeitsbeginn, Pause und Arbeitsende werden digital dokumentiert oder manuell korrigiert.",
  },
  {
    step: "03",
    title: "Verwalten",
    text: "Kalender, Urlaubsantraege und Dienstplaene werden zentral gepflegt und geprueft.",
  },
  {
    step: "04",
    title: "Auswerten",
    text: "Berichte, Fehlerprotokolle und Abrechnungsdaten schaffen Transparenz fuer das Team.",
  },
];

const stack = [
  "Vue 3",
  "Vite",
  "Vue Router",
  "Bootstrap 5",
  "Node.js",
  "Express",
  "MongoDB",
];

const mockPanels = [
  {
    kicker: "Heute",
    title: "Dienstplan aktiv",
    text: "Schichten und Verfuegbarkeiten bleiben fuer das Team sichtbar.",
  },
  {
    kicker: "Admin",
    title: "Freigaben offen",
    text: "Urlaubsantraege und Stammdatenaenderungen sind an einem Ort gebuendelt.",
  },
  {
    kicker: "Berichte",
    title: "Monatsuebersicht",
    text: "Die Datenbasis steht fuer Auswertungen und Abrechnung bereit.",
  },
];

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
  color: #10233d;
  background:
    radial-gradient(circle at top left, rgba(255, 166, 114, 0.24), transparent 28%),
    radial-gradient(circle at top right, rgba(39, 130, 255, 0.18), transparent 24%),
    linear-gradient(180deg, #f7f5ef 0%, #eef4ff 45%, #ffffff 100%);
}

.hero-section,
.info-section,
.closing-banner {
  width: min(1180px, calc(100% - 2rem));
  margin: 0 auto;
}

.hero-section {
  padding: 2rem 0 4rem;
}

.topbar,
.hero-actions,
.brand,
.cta-row,
.hero-metrics,
.section-heading,
.module-head,
.stack-list {
  display: flex;
}

.topbar {
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: 3.5rem;
}

.brand {
  align-items: center;
  gap: 1rem;
}

.brand-mark,
.icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.brand-mark {
  width: 3.25rem;
  height: 3.25rem;
  border-radius: 1rem;
  color: #fff;
  font-size: 1.35rem;
  background: linear-gradient(135deg, #1747a6, #2f81ff);
  box-shadow: 0 18px 40px rgba(23, 71, 166, 0.28);
}

.brand-kicker,
.eyebrow,
.module-head span,
.timeline-card span,
.live-pill,
.mini-panel span {
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 0.74rem;
  font-weight: 700;
}

.brand h1,
.hero-copy h2,
.section-heading h3,
.closing-banner h3,
.metric-card strong,
.mock-live-card strong,
.module-card h4,
.benefit-card h4,
.timeline-card h4,
.mini-panel strong {
  margin: 0;
}

.hero-grid {
  align-items: center;
  gap: 1.5rem;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
}

.hero-copy h2 {
  font-size: clamp(2.5rem, 4vw, 4.4rem);
  line-height: 0.98;
  max-width: 10ch;
}

.hero-text,
.section-heading p,
.benefit-card p,
.module-card p,
.timeline-card p,
.mock-live-card p,
.mini-panel p {
  color: #516076;
  line-height: 1.65;
}

.hero-actions,
.cta-row,
.hero-metrics,
.benefit-grid,
.module-grid,
.timeline,
.stack-list,
.mock-grid {
  gap: 1rem;
}

.hero-actions,
.cta-row,
.hero-metrics,
.stack-list {
  flex-wrap: wrap;
}

.primary-button,
.ghost-button {
  border-radius: 999px;
  padding: 0.9rem 1.35rem;
  text-decoration: none;
  font-weight: 700;
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease,
    background 0.25s ease;
}

.primary-button {
  color: #fff;
  background: linear-gradient(135deg, #ef6c2f, #ff9d5c);
  box-shadow: 0 14px 30px rgba(239, 108, 47, 0.28);
}

.ghost-button {
  color: #16315e;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(22, 49, 94, 0.1);
}

.primary-button:hover,
.ghost-button:hover {
  transform: translateY(-2px);
}

.large {
  padding-inline: 1.6rem;
}

.metric-card,
.benefit-card,
.module-card,
.timeline-card,
.mini-panel,
.mock-live-card,
.showcase-card {
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(33, 66, 119, 0.08);
  box-shadow: 0 24px 60px rgba(27, 53, 99, 0.08);
}

.metric-card {
  min-width: 10rem;
  padding: 1rem 1.1rem;
  border-radius: 1.25rem;
}

.metric-card strong,
.mock-live-card strong {
  display: block;
  font-size: 1.8rem;
  color: #0f274f;
}

.metric-card span {
  color: #64748b;
}

.showcase-card {
  padding: 1rem;
  border-radius: 2rem;
  transform: rotate(2deg);
}

.screen-window {
  border-radius: 1.5rem;
  overflow: hidden;
  background: linear-gradient(180deg, #f5f9ff, #eef3fb);
}

.window-dots {
  display: flex;
  gap: 0.45rem;
  padding: 0.9rem 1rem;
  background: rgba(10, 28, 56, 0.06);
}

.window-dots span {
  width: 0.7rem;
  height: 0.7rem;
  border-radius: 50%;
  background: #d0d8e5;
}

.screen-layout {
  display: grid;
  grid-template-columns: 140px 1fr;
  min-height: 430px;
}

.mock-sidebar {
  padding: 1.25rem;
  background: linear-gradient(180deg, #123267, #1f4d96);
  color: rgba(255, 255, 255, 0.92);
}

.mock-sidebar p {
  margin: 0 0 1rem;
  font-weight: 600;
}

.mock-content {
  padding: 1.25rem;
}

.live-pill {
  display: inline-block;
  color: #2f81ff;
  margin-bottom: 0.5rem;
}

.mock-live-card {
  padding: 1.4rem;
  border-radius: 1.4rem;
  margin-bottom: 1rem;
}

.mock-grid,
.benefit-grid,
.module-grid,
.timeline {
  display: grid;
}

.mock-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.mini-panel {
  padding: 1rem;
  border-radius: 1.2rem;
}

.info-section {
  padding: 1.5rem 0 4rem;
}

.alt-section {
  padding-top: 3.5rem;
}

.section-heading {
  flex-direction: column;
  gap: 0.75rem;
  max-width: 42rem;
  margin-bottom: 2rem;
}

.section-heading.narrow {
  max-width: 30rem;
}

.section-heading h3,
.closing-banner h3 {
  font-size: clamp(1.8rem, 2.5vw, 3rem);
}

.benefit-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.module-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.timeline {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.benefit-card,
.module-card,
.timeline-card {
  border-radius: 1.5rem;
  padding: 1.4rem;
}

.icon-wrap {
  width: 3rem;
  height: 3rem;
  margin-bottom: 1rem;
  border-radius: 1rem;
  color: #fff;
  background: linear-gradient(135deg, #1747a6, #2f81ff);
}

.module-head {
  align-items: center;
  gap: 0.75rem;
  color: #1c4fa6;
  margin-bottom: 1rem;
}

.module-head i {
  font-size: 1.25rem;
}

.stack-list span {
  padding: 0.8rem 1rem;
  border-radius: 999px;
  background: rgba(18, 50, 103, 0.08);
  color: #123267;
  font-weight: 700;
}

.closing-banner {
  margin-top: 1rem;
  margin-bottom: 3rem;
  padding: 2rem;
  border-radius: 2rem;
  background: linear-gradient(135deg, #123267, #2155a1);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.closing-banner .eyebrow,
.closing-banner h3 {
  color: #fff;
}

@media (max-width: 1024px) {
  .hero-grid,
  .benefit-grid,
  .module-grid,
  .timeline,
  .mock-grid {
    grid-template-columns: 1fr;
  }

  .showcase-card {
    transform: none;
  }
}

@media (max-width: 768px) {
  .topbar,
  .closing-banner {
    flex-direction: column;
    align-items: flex-start;
  }

  .hero-copy h2 {
    max-width: 100%;
  }

  .screen-layout {
    grid-template-columns: 1fr;
  }

  .mock-sidebar {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem;
  }
}
</style>
