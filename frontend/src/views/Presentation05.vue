<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// Aktuelle Folie (1-basiert)
const currentSlide = ref(1)
const totalSlides = 12

const nextSlide = () => {
  if (currentSlide.value < totalSlides) currentSlide.value++
}

const prevSlide = () => {
  if (currentSlide.value > 1) currentSlide.value--
}

// Tastatursteuerung (Pfeiltasten / Leertaste / Enter)
const handleKeyDown = (event) => {
  if (event.key === 'ArrowRight' || event.key === ' ' || event.key === 'Enter') {
    nextSlide()
  } else if (event.key === 'ArrowLeft') {
    prevSlide()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <div class="presentation-wrapper">
    <div class="controls">
      <button @click="prevSlide" :disabled="currentSlide === 1" class="nav-btn">
        <i class="fa-solid fa-chevron-left"></i>
      </button>
      <span class="slide-indicator">{{ currentSlide }} / {{ totalSlides }}</span>
      <button @click="nextSlide" :disabled="currentSlide === totalSlides" class="nav-btn">
        <i class="fa-solid fa-chevron-right"></i>
      </button>
    </div>

    <div v-if="currentSlide === 1" class="slide-container">
      <div class="title-layout">
        <p class="subtitle">Diplomarbeit &bull; HTL IT</p>
        <h1>Frontend Architektur<br>mit Vue.js 3</h1>
        <p class="description">Moderne, reaktive Benutzeroberflächen für digitales Zeitmanagement</p>
        <div class="authors">Ahmad Alalan & Nawal Kayal</div>
      </div>
    </div>

    <div v-if="currentSlide === 2" class="slide-container">
      <div class="section-title-layout">
        <hr class="accent-line">
        <h2>Der Frontend-Stack</h2>
        <p class="section-desc">Warum wir uns für Vue.js 3 und Vite entschieden haben.</p>
      </div>
    </div>

    <div v-if="currentSlide === 3" class="slide-container">
      <h2 class="slide-title">Technologie-Ebene</h2>
      <div class="content-area">
        <div class="two-column">
          <div class="tile">
            <div class="icon"><i class="fa-brands fa-vuejs"></i></div>
            <h3>Core Framework</h3>
            <p><strong>Vue.js 3:</strong> Einsatz der Composition API für saubere Logik-Trennung und optimale Reaktivität.</p>
            <p><strong>Reaktive States:</strong> Nutzung von <code>ref</code> und <code>computed</code> für UI-Updates in Echtzeit.</p>
          </div>
          <div class="tile">
            <div class="icon"><i class="fa-solid fa-bolt"></i></div>
            <h3>Build & Tooling</h3>
            <p><strong>Vite:</strong> Ultra-schnelles Entwicklungs-Tooling durch nativen ESM-Support.</p>
            <p><strong>Axios:</strong> Kapselung der HTTP-Kommunikation mit zentralen Interceptoren.</p>
          </div>
        </div>
      </div>
    </div>

    <div v-if="currentSlide === 4" class="slide-container">
      <h2 class="slide-title">Komponenten-Logik</h2>
      <div class="content-area">
        <div class="two-column alignment-center">
          <div class="image-wrapper rounded">
            <div class="placeholder-img-content">
              <i class="fa-solid fa-network-wired"></i>
              <span>Atomic Design Diagramm</span>
            </div>
          </div>
          <div>
            <h3>Modulare Bausteine</h3>
            <p>Unsere UI folgt dem <strong>Atomic Design Prinzip</strong>:</p>
            <ul class="custom-list">
              <li><strong>Atoms:</strong> Buttons, Icons, Badges.</li>
              <li><strong>Molecules:</strong> Suchfelder, Listenelemente.</li>
              <li><strong>Organisms:</strong> Komplexe Tabellen, Dashboard-Widgets.</li>
            </ul>
            <p>Diese Struktur garantiert eine <span class="highlight">hohe Wiederverwendbarkeit</span> und einfache Wartung.</p>
          </div>
        </div>
      </div>
    </div>

    <div v-if="currentSlide === 5" class="slide-container">
      <h2 class="slide-title">Projektstruktur (src/)</h2>
      <div class="content-area">
        <div class="two-column">
          <div>
            <h3>Saubere Organisation</h3>
            <p>Ein Blick in das Quellcode-Verzeichnis:</p>
            <ul class="structure-list">
              <li><i class="fa-solid fa-folder-open"></i> <strong>components/:</strong> UI Widgets</li>
              <li><i class="fa-solid fa-folder-open"></i> <strong>views/:</strong> Ganze Seitenlayouts</li>
              <li><i class="fa-solid fa-folder-open"></i> <strong>composables/:</strong> Geteilte Logik (Hooks)</li>
              <li><i class="fa-solid fa-folder-open"></i> <strong>api/:</strong> Axios Instanz & Aufrufe</li>
            </ul>
            <p class="margin-top-sm">Die Trennung ermöglicht parallele Feature-Entwicklung ohne Merge-Konflikte.</p>
          </div>
          <div class="image-wrapper">
            <div class="placeholder-img-content">
              <i class="fa-solid fa-folder-tree"></i>
              <span>src/ Verzeichnisstruktur</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="currentSlide === 6" class="slide-container">
      <h2 class="slide-title">Entwicklungs-Vorteile</h2>
      <div class="content-area">
        <div class="tiled-content">
          <div class="tile">
            <div class="icon"><i class="fa-solid fa-gauge-high"></i></div>
            <h3>Instant Start</h3>
            <p>Vite startet den Dev-Server in unter 500ms, unabhängig von der Projektgröße.</p>
          </div>
          <div class="tile">
            <div class="icon"><i class="fa-solid fa-fire-flame-curved"></i></div>
            <h3>Hot Reload</h3>
            <p>Änderungen im Code werden sofort im Browser sichtbar, ohne den State zu verlieren (HMR).</p>
          </div>
          <div class="tile">
            <div class="icon"><i class="fa-solid fa-box-archive"></i></div>
            <h3>Optimized</h3>
            <p>Automatisches Code-Splitting und Tree-shaking für minimale Ladezeiten.</p>
          </div>
        </div>
      </div>
    </div>

    <div v-if="currentSlide === 7" class="slide-container bleed-image-layout">
      <div class="content-container">
        <h2 class="slide-title">Das Dashboard UI</h2>
        <h3>Intuitive Mitarbeiter-Sicht</h3>
        <p>Das Herzstück der Anwendung bietet dem User vollen Fokus auf seine Arbeitszeit:</p>
        <ul class="custom-list">
          <li><strong>Live-Timer:</strong> Millisekundengenaue Anzeige der aktuellen Sitzung.</li>
          <li><strong>Status-Pulse:</strong> Visuelles Feedback über den Stempelzustand.</li>
          <li><strong>Responsiv:</strong> Optimierte Ansicht für Tablets und Desktop.</li>
        </ul>
      </div>
      <div class="image-container">
        <div class="placeholder-img-content full-height">
          <i class="fa-solid fa-desktop-radar"></i>
          <span>Dashboard UI Mockup</span>
        </div>
      </div>
    </div>

    <div v-if="currentSlide === 8" class="slide-container">
      <h2 class="slide-title">Routing & Security</h2>
      <div class="content-area">
        <div class="table-layout">
          <table>
            <thead>
              <tr>
                <th>Route</th>
                <th>Komponente (.vue)</th>
                <th>Berechtigung</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>/login</code></td>
                <td>LoginView.vue</td>
                <td>Öffentlich</td>
              </tr>
              <tr>
                <td><code>/dashboard</code></td>
                <td>DashboardView.vue</td>
                <td>Mitarbeiter (User)</td>
              </tr>
              <tr>
                <td><code>/calendar</code></td>
                <td>CalendarView.vue</td>
                <td>Mitarbeiter (User)</td>
              </tr>
              <tr>
                <td><code>/admin</code></td>
                <td>AdminOverview.vue</td>
                <td>Administrator</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="quote">"Vue Router Guards schützen sensible Bereiche vor unbefugtem Zugriff direkt im Frontend."</p>
      </div>
    </div>

    <div v-if="currentSlide === 9" class="slide-container">
      <h2 class="slide-title">Build Performance</h2>
      <div class="content-area">
        <h3>Entwicklungs-Geschwindigkeit (Sekunden)</h3>
        <div class="bar-chart-container">
          <div class="bar-group">
            <div class="bar-track"><div class="bar-fill" style="height: 5%;"></div></div>
            <div class="bar-label">Vite (2s)</div>
          </div>
          <div class="bar-group">
            <div class="bar-track"><div class="bar-fill" style="height: 100%;"></div></div>
            <div class="bar-label">Webpack (45s)</div>
          </div>
          <div class="bar-group">
            <div class="bar-track"><div class="bar-fill" style="height: 2%;"></div></div>
            <div class="bar-label">Vite HMR (&lt;100ms)</div>
          </div>
        </div>
        <p class="center-text margin-top-md">Die Wahl von Vite steigert die Produktivität während der Implementierung massiv.</p>
      </div>
    </div>

    <div v-if="currentSlide === 10" class="slide-container">
      <h2 class="slide-title">Feature Showcase</h2>
      <div class="content-area">
        <div class="tiled-content">
          <div class="tile padding-sm">
            <div class="image-wrapper height-sm">
              <div class="placeholder-img-content"><i class="fa-solid fa-fingerprint"></i></div>
            </div>
            <h4>Stempel-Terminal</h4>
            <p class="font-sm">Einfache Ein/Aus-Logik mit NFC-Fallback.</p>
          </div>
          <div class="tile padding-sm">
            <div class="image-wrapper height-sm">
              <div class="placeholder-img-content"><i class="fa-solid fa-umbrella-beach"></i></div>
            </div>
            <h4>Urlaubskonto</h4>
            <p class="font-sm">Interaktive Formulare & PDF-Export.</p>
          </div>
          <div class="tile padding-sm">
            <div class="image-wrapper height-sm">
              <div class="placeholder-img-content"><i class="fa-solid fa-calendar-days"></i></div>
            </div>
            <h4>Planer</h4>
            <p class="font-sm">Visuelle Übersicht aller Abwesenheiten.</p>
          </div>
        </div>
      </div>
    </div>

    <div v-if="currentSlide === 11" class="slide-container">
      <h2 class="slide-title">Optimierung</h2>
      <div class="content-area">
        <h3>Bundle Size Reduktion (in KB)</h3>
        <div class="area-chart-container">
          <svg class="area-chart-svg" viewBox="0 0 1000 300">
            <path class="area-fill" d="M0,250 L200,220 L400,180 L600,140 L800,100 L1000,80 L1000,300 L0,300 Z"></path>
            <path class="area-stroke" d="M0,250 L200,220 L400,180 L600,140 L800,100 L1000,80"></path>
            <circle cx="0" cy="250" r="8" fill="#fff" stroke="#10b981" stroke-width="3"></circle>
            <circle cx="1000" cy="80" r="8" fill="#fff" stroke="#10b981" stroke-width="3"></circle>
          </svg>
        </div>
        <div class="chart-labels">
          <span>Initial Setup</span>
          <span>Optimized Production Build</span>
        </div>
        <p class="margin-top-md">Durch <strong>Tree-shaking</strong> und Lazy-loading der Routen erreichen wir minimale Ladezeiten für Endnutzer.</p>
      </div>
    </div>

    <div v-if="currentSlide === 12" class="slide-container">
      <div class="outro-layout">
        <h1 class="thank-you">Vielen Dank!</h1>
        <p class="outro-text">Haben Sie Fragen zum Frontend oder der Vue.js Architektur?</p>
        <div class="github-link">
          <p><i class="fa-brands fa-github"></i> github.com/htl-it/diplomarbeit</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&family=Inter:wght@400;500;600&display=swap'); */

/* Global Wrapper for Page centering */
.presentation-wrapper {
  background-color: #020617;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px 0;
  position: relative;
}

/* 1. CORE DESIGN SYSTEM & SLIDE CANVAS */
.slide-container {
  width: 1280px;
  height: 720px;
  background-color: #0f172a;
  color: #f8fafc;
  font-family: 'Inter', sans-serif;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 60px;
  box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.6);
  box-sizing: border-box;
}

.slide-container::before {
  content: '';
  position: absolute;
  top: -15%;
  right: -10%;
  width: 45%;
  height: 70%;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%);
  z-index: 0;
}

.slide-container > * {
  position: relative;
  z-index: 1;
}

/* 2. TYPOGRAPHY */
h1 {
  font-family: 'Poppins', sans-serif;
  font-size: 72px;
  line-height: 1.1;
  margin: 0;
  font-weight: 700;
  color: #fff;
}

h3 {
  font-family: 'Poppins', sans-serif;
  font-size: 28px;
  color: #fff;
  margin: 0 0 12px 0;
}

h4 {
  margin: 10px 0 5px;
  color: #fff;
}

p, li {
  font-size: 20px;
  line-height: 1.6;
  color: #94a3b8;
}

code {
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  color: #10b981;
}

/* Slide Header Title */
.slide-title {
  font-family: 'Poppins', sans-serif;
  font-size: 40px;
  font-weight: 600;
  color: #10b981;
  margin: 0 0 35px 0;
  text-transform: uppercase;
  letter-spacing: 2px;
  border-left: 6px solid #10b981;
  padding-left: 20px;
}

/* 3. LAYOUT COMPONENTS */
.content-area {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
}

.two-column {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  width: 100%;
}

.alignment-center {
  align-items: center;
}

.tiled-content {
  display: flex;
  gap: 30px;
  width: 100%;
}

.tile {
  flex: 1;
  background: rgba(30, 41, 59, 0.7);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 24px;
  padding: 35px;
}

.tile .icon {
  font-size: 48px;
  color: #10b981;
  margin-bottom: 20px;
}

/* Image Wrappers & Placeholders */
.image-wrapper {
  width: 100%;
  height: 420px;
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: #1e293b;
}

.image-wrapper.rounded {
  border-radius: 50%;
  width: 350px;
  height: 350px;
  margin: 0 auto;
}

.placeholder-img-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #475569;
  gap: 15px;
}

.placeholder-img-content i {
  font-size: 64px;
  color: rgba(16, 185, 129, 0.3);
}

/* 4. SPECIFIC FOLIE STYLES */
/* Folie 1: Titel */
.title-layout {
  text-align: center;
  justify-content: center;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.subtitle {
  color: #10b981;
  font-weight: 600;
  letter-spacing: 3px;
  text-transform: uppercase;
  margin-bottom: 20px;
}

.description {
  font-size: 24px;
  margin-top: 30px;
}

.authors {
  margin-top: 60px;
  font-weight: 600;
  color: #fff;
  font-size: 22px;
}

/* Folie 2: Section Title */
.section-title-layout {
  text-align: center;
  height: 100%;
  justify-content: center;
  display: flex;
  flex-direction: column;
}

.section-title-layout h2 {
  font-size: 84px;
  margin: 0;
  color: #fff;
  font-family: 'Poppins', sans-serif;
}

.accent-line {
  width: 120px;
  height: 6px;
  background: #10b981;
  border: none;
  margin: 30px auto;
}

.section-desc {
  font-size: 24px;
}

/* Folie 4 & 7: Listen & UI */
.custom-list {
  padding-left: 20px;
}

.custom-list li {
  margin-bottom: 10px;
}

.highlight {
  color: #10b981;
}

.structure-list {
  list-style: none;
  padding-left: 0;
}

.structure-list li {
  margin-bottom: 12px;
}

.structure-list i {
  color: #10b981;
  margin-right: 10px;
}

/* Folie 7: Bleed Layout */
.slide-container.bleed-image-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: 0;
  align-items: start;
}

.bleed-image-layout .content-container {
  padding: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  box-sizing: border-box;
}

.bleed-image-layout .image-container {
  height: 720px;
  background-color: #1e293b;
}

.full-height {
  height: 100%;
}

/* Folie 8: Tabelle */
.table-layout table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  overflow: hidden;
}

.table-layout th {
  background: rgba(16, 185, 129, 0.1);
  padding: 22px;
  text-align: left;
  color: #fff;
  font-size: 20px;
}

.table-layout td {
  padding: 18px 22px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(30, 41, 59, 0.3);
  font-size: 18px;
}

.quote {
  margin-top: 25px;
  font-style: italic;
}

/* Folie 9: Bar Chart */
.bar-chart-container {
  display: flex;
  align-items: flex-end;
  gap: 40px;
  height: 300px;
  padding: 20px;
  width: 100%;
  box-sizing: border-box;
}

.bar-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.bar-track {
  width: 60px;
  height: 250px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  position: relative;
  display: flex;
  align-items: flex-end;
}

.bar-fill {
  width: 100%;
  border-radius: 10px;
  background: linear-gradient(to top, #6366f1, #10b981);
}

.bar-label {
  font-size: 16px;
  font-weight: 600;
  color: #94a3b8;
}

/* Folie 11: Area Chart SVG */
.area-chart-container {
  width: 100%;
  height: 350px;
}

.area-chart-svg {
  width: 100%;
  height: 100%;
}

.area-fill {
  fill: rgba(16, 185, 129, 0.15);
}

.area-stroke {
  stroke: #10b981;
  stroke-width: 4;
  fill: none;
}

.chart-labels {
  display: flex;
  justify-content: space-between;
  color: #94a3b8;
  font-size: 14px;
  margin-top: 10px;
}

/* Folie 12: Outro */
.outro-layout {
  text-align: center;
  height: 100%;
  justify-content: center;
  display: flex;
  flex-direction: column;
}

.thank-you {
  font-size: 80px;
  color: #10b981;
}

.outro-text {
  font-size: 26px;
  margin-top: 20px;
}

.github-link {
  margin-top: 50px;
}

.github-link p {
  color: #fff;
  font-weight: 600;
}

/* Helper Utilities */
.margin-top-sm { margin-top: 20px; }
.margin-top-md { margin-top: 30px; }
.padding-sm { padding: 10px; }
.height-sm { height: 180px; }
.font-sm { font-size: 14px; }
.center-text { text-align: center; }

/* 5. SLIDE NAVIGATION CONTROLS OVERLAY */
.controls {
  position: absolute;
  bottom: 20px;
  right: 40px;
  display: flex;
  align-items: center;
  gap: 20px;
  z-index: 100;
  background: rgba(15, 23, 42, 0.8);
  padding: 10px 20px;
  border-radius: 30px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.nav-btn {
  background: #1e293b;
  border: 1px solid rgba(16, 185, 129, 0.4);
  color: #fff;
  padding: 10px 15px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-btn:hover:not(:disabled) {
  background: #10b981;
  color: #0f172a;
  transform: scale(1.05);
}

.nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  border-color: rgba(255, 255, 255, 0.1);
}

.slide-indicator {
  color: #94a3b8;
  font-weight: 600;
  font-family: monospace;
  font-size: 16px;
}
</style>