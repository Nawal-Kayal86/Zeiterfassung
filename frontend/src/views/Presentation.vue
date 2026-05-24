<template>
  
  <div class="presentation-wrapper">
    <!-- Fortschrittsbalken am oberen Bildschirmrand -->
    <div class="progress-bar-container">
      <div 
        class="progress-bar-fill" 
        :style="{ width: `${((currentSlide + 1) / totalSlides) * 100}%` }"
      ></div>
    </div>
          <header class="deck-toolbar">
            <div>
              <span class="deck-label">Digitales Zeiterfassungssystem</span>
            </div>
            <div class="deck-actions">
              <button type="button" class="icon-button" title="Vorherige Folie" @click="prevSlide" :disabled="currentSlide === 0">
                &lt;
              </button>
              <span class="slide-counter">{{ currentSlide + 1 }} / {{ slides.length }}</span>
              <button type="button" class="icon-button" title="Nächste Folie" @click="nextSlide" :disabled="currentSlide === slides.length - 1">
                &gt;
              </button>
            </div>
          </header>
    <!-- Haupt-Präsentationsbereich im standardisierten 16:9-Format -->
    <div class="slide-viewport">
      <transition name="slide" mode="out-in">
        <div :key="currentSlide" class="slide-canvas" ref="slideCanvas">
          <!-- FOLIE 1: Titelblatt -->
          <div v-if="currentSlide === 0" class="layout-title">
            <span class="title-sub">MEVN Stack Projekt</span>
            <div class="title-split">
              <div class="title-copy">
                <h1 class="main-heading">
                  Digitales Zeiterfassungssystem
                </h1>
                <p class="project-subtitle">
                  Eine Webanwendung für Arbeitszeiten, Dienstpläne, Urlaubsanträge und Berichte.
                </p>
                <div class="project-authors ">
                  <span class="author-tag text-vuegreen">Entwickelt von</span>
                </div>

                <h3 class=" section-title">
                  <span class=" text-gradient">Nawal Kayal</span>
                </h3>
                <h3 class=" section-title">
                  <span class=" text-gradient">Ahmad Alalan</span>
                </h3>

              </div>
              <div class="title-visual">
                <img :src="liveImage" alt="Live Architekturmodell" class="title-image" />
              </div>
            </div>
          </div>

          <!-- FOLIE 2: Problem und Ziel -->
          <div v-else-if="currentSlide === 1" class="layout-fullscreen-image">
            <img src="../assets/Ziel.png" alt="" class="fullscreen-img">
          </div>

          <!-- FOLIE 3: Frontend Technologien -->
          <div v-else-if="currentSlide === 2" class="layout-content">
            <h2 class="slide-title">Frontend Technologien</h2>
            <p class="description">
              <i class="fa-solid fa-bolt text-vuegreen"></i> <strong>Verwendete Technologien</strong>
            </p>
            <div class="two-column">
              <div class="image-box">
                <img src="../assets/vue.png" alt="Vue.js" class="api-image">
              </div>
              <div>
                <h3>Vue 3</h3>
                <ul>
                  <li>Modernes JavaScript Framework</li>
                  <li>Komponentenbasierte Entwicklung</li>
                  <li>Reaktive Datenbindung</li>
                </ul>
                <h3>Bootstrap 5</h3>
                <ul>
                  <li>Responsives Design (Mobile-First)</li>
                  <li>Vorgefertigte UI-Komponenten</li>
                  <li>Einheitliches Layout</li>
                </ul>
                <h3>Vue Router</h3>
                <ul>
                  <li>Navigation zwischen Seiten (Single Page Application)</li>
                  <li>Dynamisches Routing</li>
                  <li>Übersichtliche Struktur der Anwendung</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- FOLIE 4: Rollen & Berechtigungen -->
          <div v-else-if="currentSlide === 3" class="layout-content">
            <h2 class="slide-title">Rollen &amp; Berechtigungen</h2>
            <p class="description">
              <i class="bi-people text-vuegreen"></i> <strong>Welche Rollen sehen die Mitarbeiter?</strong>
            </p>
            <div class="three-column">
              <div class="info-card border-success text-center">
                <div class="card-icon text-vuegreen"><i class="bi-person"></i></div>
                <h3>User</h3>
                <img src="../assets/03.png" alt="User Role" class="role-image">
              </div>
              <div class="info-card border-indigo text-center">
                <div class="card-icon text-indigo"><i class="bi-box-arrow-in-right"></i></div>
                <h3>Login</h3>
                <img src="../assets/01.png" alt="Login" class="role-image">
              </div>
              <div class="info-card border-emerald text-center">
                <div class="card-icon text-emerald"><i class="bi-shield-lock"></i></div>
                <h3>Admin</h3>
                <img src="../assets/02.png" alt="Admin Role" class="role-image">
              </div>
            </div>
          </div>

          <!-- FOLIE 5: Was die Benutzer live sehen -->
          <div v-else-if="currentSlide === 4" class="layout-content">
            <h2 class="slide-title">Was die Benutzer live sehen</h2>
            <div class="two-column-compact">
              <div class="iframe-box">
                <div class="iframe-header">
                  <span>Live Vorschau</span>
                  <a :href="demoFrameUrl" target="_blank" rel="noreferrer">Öffnen</a>
                </div>
                <iframe class="slide-iframe" :src="demoFrameUrl" title="Zeiterfassung Live Demo"></iframe>
              </div>
              <div>
                <p class="description">
                  Das Frontend ist eine Vue Single Page Application mit klarer Navigation und rollenabhängigen Ansichten.
                </p>
                <ul>
                  <li><strong>Vue 3 Komponenten</strong><br />Dashboard, Terminal, Kalender, Reports und Adminbereiche sind als getrennte Views aufgebaut.</li>
                  <li><strong>Schnelle Bedienung</strong><br />Zeiten starten, Pausen verwalten, Urlaub beantragen und Berichte ansehen.</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- FOLIE 7: Backend-Architektur und Datenfluss -->
          <div v-else-if="currentSlide === 6" class="layout-content">
            <h2 class="slide-title">Backend-Architektur und Datenfluss</h2>
            <div class="three-column">
              <div class="image-box">
                <img src="../assets/API.png" alt="REST-API Architecture" class="api-image">
              </div>
              <div>
                <p class="description">
                  Das Backend basiert auf <strong>Node.js und Express</strong> und folgt einer klar strukturierten Architektur.
                </p>
                <p class="description">
                  <strong>Die Hauptbestandteile sind:</strong>
                </p>
                <ul>
                  <li><strong>REST-API (Routes):</strong> Definition der Endpunkte und Verarbeitung von JSON-Anfragen</li>
                  <li><strong>Controller & Service-Schicht:</strong> Verarbeitung der Geschäftslogik und Trennung der Verantwortlichkeiten</li>
                  <li><strong>Datenbankverbindung (Mongoose):</strong> Zugriff auf die MongoDB-Datenbank</li>
                </ul>
                <p class="description">
                  Die Daten werden in einer <strong>MongoDB Atlas Cloud-Datenbank</strong> gespeichert.
                </p>
                <p class="description">
                  Sensible Konfigurationsdaten (z. B. Zugangsdaten, Tokens) werden in einer <strong>.env-Datei</strong> verwaltet, um Sicherheit und Wartbarkeit zu gewährleisten.
                </p>
                <p class="description">
                  Der Datenfluss erfolgt zentral über das Backend, welches alle Anfragen verarbeitet und die Daten konsistent in der Datenbank speichert.
                </p>
              </div>
              <div class="image-box">
                <img src="../assets/Mongo.png" alt="MongoDB Architecture" class="api-image">
              </div>
            </div>
          </div>

          <!-- FOLIE 8: Authentifizierung & Zugriffskontrolle -->
          <div v-else-if="currentSlide === 7" class="layout-content">
            <h2 class="slide-title">Authentifizierung &amp; Zugriffskontrolle (JWT)</h2>
            <div class="two-column-image-large">
              <div>
                <p class="description">
                  <i class="fa-solid fa-check text-vuegreen"></i> <strong>Sicherheit mit JSON Web Token (JWT)</strong>
                </p>
                <ul>
                  <li>Login-Daten werden an das Backend gesendet</li>
                  <li>Backend erstellt einen signierten Token (JWT)</li>
                  <li>Token wird bei jeder Anfrage mitgeschickt</li>
                  <li>Middleware prüft die Gültigkeit des Tokens</li>
                </ul>
                <p class="description">
                  <i class="fa-solid fa-check text-vuegreen"></i> <strong>Rollenbasierte Zugriffskontrolle</strong>
                </p>
                <ul>
                  <li>Admin → Zugriff auf alle Daten</li>
                  <li>User → Zugriff nur auf eigene Daten</li>
                </ul>
                <p class="description">
                  <i class="fa-solid fa-check text-vuegreen"></i> <strong>Weitere Sicherheitsmaßnahmen:</strong>
                </p>
                <ul>
                  <li>Private Routes schützen sensible Bereiche</li>
                  <li>Gehashte Passwörter statt Klartext</li>
                  <li>.env-Dateien für sichere Konfiguration</li>
                </ul>
              </div>
              <div class="image-box">
                <img src="../assets/sicherhiet.png" alt="Security Architecture" class="api-image">
              </div>
            </div>
          </div>

          <!-- FOLIE 9: REST-API & Kommunikation -->
          <div v-else-if="currentSlide === 8" class="layout-content">
            <h2 class="slide-title">REST-API &amp; Kommunikation</h2>
            <div class="two-column-image-large">
              <div>
                <p class="description">
                  <i class="fa-solid fa-check text-vuegreen"></i> <strong>REST-API Verbindung zwischen Frontend und Backend</strong>
                </p>
                <p class="description">
                  Kommunikation erfolgt über HTTP-Methoden:
                </p>
                <ul>
                  <li><strong>GET</strong> → Daten abrufen</li>
                  <li><strong>POST</strong> → Neue Daten erstellen</li>
                  <li><strong>PUT</strong> → Daten aktualisieren</li>
                  <li><strong>DELETE</strong> → Daten löschen</li>
                </ul>
                <p class="description">
                  Frontend nutzt Axios für API-Aufrufe
                </p>
                <p class="description">
                  <i class="fa-solid fa-check text-vuegreen"></i> <strong>Vorteile:</strong>
                </p>
                <ul>
                  <li>Klare Trennung von UI und Logik</li>
                  <li>Einfache Erweiterbarkeit</li>
                  <li>Strukturierte Datenverarbeitung im Backend</li>
                </ul>
              </div>
              <div class="image-box">
                <img src="../assets/backFront.png" alt="REST-API Architecture" class="api-image">
              </div>
            </div>
          </div>


          <!-- FOLIE 6: Sektion 4 Trenner -->
          <div v-else-if="currentSlide === 5" class="layout-content">
            <h2 class="slide-title">DevOps &amp; Deployment</h2>
            <div class="two-column-image-large">
              <div>
                <p class="description">
                  <strong>GitHub-Repository &amp; Git-Workflow</strong>
                </p>
                <p class="description">
                  <strong>CI/CD-Pipeline auf Render.com</strong>
                </p>
                <ul>
                  <li><strong>Automatisches Deployment</strong> bei jedem Merge in den Main-Branch</li>
                  <li><strong>Branch-Workflow</strong> für saubere Versionskontrolle und Teamarbeit</li>
                  <li><strong>Environment Variables</strong> schützen sensible Daten im Deployment</li>
                </ul>
                <p class="description">
                  Die Git-Zusammenarbeitsregeln, Continuous Deployment-Pipelines und Cloud-Infrastrukturen in der Übersicht.
                </p>
              </div>
              <div class="image-box">
                <img src="../assets/github.png" alt="GitHub Logo" class="api-image" />
              </div>
            </div>
          </div>

          <!-- FOLIE 10: MongoDB Atlas Cloud-Infrastruktur -->
          <div v-else-if="currentSlide === 9" class="layout-outro">
            <h1 class="outro-heading">Cloud-Infrastruktur: MongoDB Atlas</h1>
            <p class="outro-sub">
              Verwaltet, sicher und skalierbar mit automatischem Backup, IP-Whitelist und verschlüsselter Verbindung.
            </p>
            <div class="outro-badges">
              <div class="outro-badge">
                <i class="fa-solid fa-cloud"></i>
                Verteilter Cluster
              </div>
              <div class="outro-badge">
                <i class="fa-solid fa-network-wired"></i>
                IP-Whitelist
              </div>
              <div class="outro-badge">
                <i class="fa-solid fa-key text-emerald"></i>
                Secure URI
              </div>
            </div>
            <div class="image-box" style="max-width: 520px; width: 100%;">
              <img src="../assets/Mongo2.png" alt="MongoDB Atlas" class="api-image">
            </div>
          </div>

          <!-- FOLIE 11: Outro & Fragen -->
          <div v-else-if="currentSlide === 10" class="layout-outro">
            <h1 class="outro-heading">
              Vielen Dank für Ihre <span class="text-gradient">Aufmerksamkeit!</span>
            </h1>
            <p class="outro-sub">Wir freuen uns auf Ihre Fragen und die gemeinsame Diskussion.</p>
            <div class="outro-badges">
              <div class="outro-badge"><i class="fa-brands fa-github"></i> github.com/htl-it/zeiterfassung</div>
              <div class="outro-badge"><i class="fa-solid fa-server text-vuegreen"></i> zeiterfassung.onrender.com</div>
            </div>
            <div class="text-gradient">
              Ahmad Alalan &amp; Nawal Kayal &bull; HTL IT Diplomarbeit 2026
            </div>
          </div>


        </div>
        
      </transition>
    </div>
              <!-- Foliennummerierung unten rechts -->
          <nav class="slide-nav" aria-label="Folien">
            <button
              v-for="(slide, index) in slides"
              :key="slide.id"
              type="button"
              :class="{ active: index === currentSlide }"
              :title="slide.category"
              @click="goToSlide(index)"
            >
              {{ String(index + 1).padStart(2, '0') }}
            </button>
          </nav>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import liveImage from '../assets/image01.png';

// Index der aktuellen Folie (0-basiert)
const currentSlide = ref(0);
const totalSlides = 11;
const slideCanvas = ref(null);
const demoFrameUrl = `${window.location.origin}/login`;

const slides = [
  { id: 'slide1', category: 'Diplomarbeit • HTL IT 2026', layout: 'title' },
  { id: 'slide2-problem', category: 'Problem und Ziel', layout: 'problem' },
  { id: 'slide3-frontend', category: 'Frontend Technologien', layout: 'frontend' },
  { id: 'slide4-roles', category: 'Rollen & Berechtigungen', layout: 'roles' },
  { id: 'slide5-live', category: 'Live Vorschau', layout: 'live-view' },
  { id: 'slide6-section', category: 'Sektion 04', layout: 'section' },
  { id: 'slide7-backend', category: 'Backend-Architektur', layout: 'backend' },
  { id: 'slide8-auth', category: 'Authentifizierung & Zugriffskontrolle', layout: 'security' },
  { id: 'slide9-api', category: 'REST-API & Kommunikation', layout: 'api' },
  { id: 'slide10-deployment-atlas', category: 'MongoDB Atlas', layout: 'deployment-atlas' },
  { id: 'slide11-outro', category: 'Abschluss', layout: 'outro' }
];

const nextSlide = () => {
  if (currentSlide.value < totalSlides - 1) {
    currentSlide.value++;
  }
};

const prevSlide = () => {
  if (currentSlide.value > 0) {
    currentSlide.value--;
  }
};

const goToSlide = (index) => {
  currentSlide.value = index;
};

watch(currentSlide, () => {
  if (slideCanvas.value) {
    slideCanvas.value.scrollTop = 0;
  }
});

// Tastaturnavigation für den Vortrag
const handleKeyDown = (e) => {
  if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
    nextSlide();
  } else if (e.key === 'ArrowLeft') {
    prevSlide();
  } else if (e.key === 'Home') {
    currentSlide.value = 0;
  } else if (e.key === 'End') {
    currentSlide.value = totalSlides - 1;
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<style scoped>
/* ==========================================================
   PERSÖNLICHES IT-FARBKONZEPT (THEME) & SCALABLE CANVAS STYLE
   ========================================================== */

.presentation-wrapper {
  --bg-primary: #090d16;
  --bg-secondary: #0f172a;
  --bg-card: rgba(30, 41, 59, 0.4);
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --color-primary: #6366f1; /* Indigo Accent */
  --color-vuegreen: #42b883; /* Vue Green */
  --color-danger: #ef4444;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --border-glow: rgba(99, 102, 241, 0.15);

  background: radial-gradient(circle at top left, rgba(99, 102, 241, 0.16), transparent 26%),
    radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.12), transparent 24%),
    radial-gradient(circle at 40% 80%, rgba(16, 185, 129, 0.08), transparent 20%),
    linear-gradient(135deg, #070b14 0%, #0c1222 52%, #090d16 100%);
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  position: relative;
  font-family: 'Inter', sans-serif;
  color: var(--text-main);
  padding: 0;
  box-sizing: border-box;
  overflow: hidden;
}

.presentation-wrapper::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 20% 15%, rgba(99, 102, 241, 0.16), transparent 18%),
    radial-gradient(circle at 80% 30%, rgba(16, 185, 129, 0.12), transparent 16%),
    radial-gradient(circle at 50% 80%, rgba(59, 130, 246, 0.1), transparent 24%);
  pointer-events: none;
  opacity: 0.85;
}

/* Fortschrittsanzeige */
.progress-bar-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 6px;
  background-color: rgba(255, 255, 255, 0.05);
  z-index: 50;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), var(--color-vuegreen));
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Viewport im klassischen 16:9-Format */
.slide-viewport {
  width: 100%;
  height: 100%;
  background: rgba(15, 23, 42, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 28px;
  position: relative;
  overflow: hidden;
  box-shadow:
    0 40px 120px rgba(15, 23, 42, 0.45),
    0 0 90px rgba(99, 102, 241, 0.18),
    inset 0 0 1.5px rgba(255, 255, 255, 0.12);
}

.slide-viewport::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.16), transparent 25%),
    radial-gradient(circle at 75% 25%, rgba(16, 185, 129, 0.12), transparent 18%);
  pointer-events: none;
}

.slide-canvas {
  width: 100%;
  height: 100%;
  padding: 10px 30px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
}

/* Header */
.slide-header,
.deck-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  /* margin-bottom: 25px; */
  padding-top: 10px;
}

.category-badge {
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: var(--color-vuegreen);
  background-color: rgba(66, 184, 131, 0.1);
  padding: 6px 14px;
  border-radius: 30px;
}

.system-tag {
  font-size: 12px;
  font-family: 'JetBrains Mono', monospace;
  color: var(--text-muted);
}

.deck-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.3rem 0.6rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.icon-button {
  width: 1.8rem;
  height: 1.8rem;
  border: none;
  border-radius: 50%;
  color: #0f172a;
  background: #ffffff;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.icon-button:hover:not(:disabled) {
  transform: scale(1.08);
}

.icon-button:disabled {
  opacity: 0.25;
  cursor: not-allowed;
}

.slide-counter {
  font-size: 0.85rem;
  font-weight: 600;
  color: #ffffff;
  min-width: 3rem;
  text-align: center;
}

/* --- Untere Navigation (Dots) --- */
.slide-nav {
  display: flex;
  justify-content: center;
  gap: 0.4rem;
  padding-top: 1rem;
  padding-bottom: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.slide-nav button {
  width: 2.1rem;
  height: 2.1rem;
  border-radius: 50%;
  border: none;
}

.iframe-box {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.iframe-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-main);
}

.slide-iframe {
  width: 100%;
  height: calc(100vh - 250px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  background: #0b1220;
}

.slide-nav button {
  width: 2.55rem;
  height: 2.55rem;
  border-radius: 50%;
  color: rgba(255, 255, 255, 0.78);
  background: rgba(255, 255, 255, 0.16);
  transition: all 0.3s ease;
}

.slide-nav button:hover {
  background: rgba(255, 255, 255, 0.25);
  color: #ffffff;
}

.slide-nav button.active {
  background: #ffffff;
  color: #0f172a;
  transform: scale(1.05);
}

/* Folientitel */
.slide-title {
  font-family: 'Poppins', sans-serif;
  font-size: 38px;
  font-weight: 700;
  margin: 0 0 20px 0;
  letter-spacing: -0.5px;
  border-left: 5px solid var(--color-vuegreen);
  padding-left: 18px;
  color: #fff;
  flex-shrink: 0;
}

/* Layouts */
.two-column {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: stretch;
}

.two-column-compact {
  display: grid;
  grid-template-columns: 2.5fr 1fr;
  gap: 20px;
  align-items: stretch;
  flex: 1;
  min-height: 0;
}

.two-column-image-large {
  display: grid;
  grid-template-columns: 1fr 3fr;
  gap: 20px;
  align-items: stretch;
}

.three-column {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 25px;
  height: auto;
}

/* Karten & Boxen */
.info-card {
  background-color: var(--bg-card);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 10px;
  transition: transform 0.2s ease, border-color 0.2s ease;
  display: flex;
  flex-direction: column;
  /* max-height: 100vh; */
  height: calc(100vh - 260px);
}

.info-card:hover {
  border-color: var(--border-glow);
}

.info-card h3 {
  font-family: 'Poppins', sans-serif;
  font-size: 22px;
  margin-top: 0;
  margin-bottom: 18px;
  color: #fff;
}

.info-card p {
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.5;
}

/* Titel-Folie */
.layout-title {
  text-align: center;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.title-sub {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 4px;
  color: var(--color-primary);
  margin-bottom: 15px;
}

.main-heading {
  font-family: 'Poppins', sans-serif;
  font-size: 64px;
  font-weight: 800;
  line-height: 1.15;
  margin: 0 0 20px 0;
  letter-spacing: -1.5px;
  color: #fff;
}

.title-split {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 48px;
  width: 100%;
  max-width: 1080px;
  margin-bottom: 24px;
}

.title-copy {
  flex: 1 1 52%;
  text-align: left;
}

.title-visual {
  flex: 0 0 420px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.title-visual::before {
  content: '';
  position: absolute;
  inset: -12px;
  border-radius: 32px;
  background: radial-gradient(circle at 30% 30%, rgba(99, 102, 241, 0.25), transparent 45%),
    radial-gradient(circle at 70% 20%, rgba(16, 185, 129, 0.16), transparent 35%);
  filter: blur(18px);
  opacity: 0.9;
  z-index: 0;
}

.title-image {
  width: 100%;
  max-width: 420px;
  border-radius: 8px;
  position: relative;
  z-index: 1;
}

.text-gradient {
  background: linear-gradient(135deg, var(--color-primary), var(--color-vuegreen));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.project-subtitle {
  font-size: 20px;
  color: var(--text-muted);
  max-width: 800px;
  margin: 0 auto 40px auto;
  line-height: 1.5;
}

.project-authors {
  display: flex;
  gap: 20px;
}

.author-tag {
  background-color: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 10px 24px;
  border-radius: 30px;
  font-weight: 500;
  font-size: 25px;
  font-family: 'Poppins', sans-serif;
  
}

/* Sektions-Folie */
.layout-section {
  text-align: center;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.section-badge {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 4px;
  color: var(--color-primary);
  margin-bottom: 15px;
}

.section-title {
  font-family: 'Poppins', sans-serif;
  font-size: 56px;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 20px;
  color: #fff;
}

.section-desc {
  font-size: 18px;
  color: var(--text-muted);
  max-width: 700px;
  line-height: 1.5;
}

/* Standard Content Layouts */
.layout-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

/* Fullscreen Image Layout */
.layout-fullscreen-image {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
}

.fullscreen-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 12px;
}

.description {
  font-size: 16px;
  color: var(--text-muted);
  line-height: 1.6;
  margin-bottom: 20px;
}

.layout-content ul {
  margin: 0;
  padding-left: 20px;
}

.layout-content li {
  font-size: 15px;
  margin-bottom: 12px;
  color: var(--text-muted);
  line-height: 1.5;
}

.layout-content li strong {
  color: #fff;
}

/* Code-Box Styles */
.code-box {
  background-color: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  overflow-x: auto;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  line-height: 1.45;
  color: #e2e8f0;
}

/* Image Box Styles */
.image-box {
  background-color: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 250px);
}

.api-image {
  width: 100%;
  max-width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 8px;
}

.role-image {
  width: 100%;
  max-width: 100%;
  height: 88%;
  /* max-height: 600px; */
  object-fit: contain;
  border-radius: 8px;
  /* margin-bottom: 15px; */
}

.code-keyword { color: #f472b6; }
.code-string { color: #34d399; }
.code-comment { color: #64748b; font-style: italic; }
.code-func { color: #60a5fa; }
.code-number { color: #fbbf24; }

/* Flow diagram inside code-box */
.flow-preview {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  line-height: 1.8;
  color: var(--text-muted);
}

.flow-arrow {
  padding-left: 15px;
}

/* Git-Workflow-Diagramm */
.git-diagram {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  padding: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.03);
}

.git-branch {
  display: flex;
  align-items: center;
  gap: 15px;
  background-color: var(--bg-card);
  padding: 12px 25px;
  border-radius: 8px;
  width: 220px;
}

.section-image {
  width: 120px;
  height: 120px;
  object-fit: contain;
  margin-bottom: 24px;
}

.section-subtitles {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 16px 0 0;
  color: var(--text-muted);
  font-size: 1rem;
  font-weight: 500;
}

.section-subtitles span {
  display: block;
}

.branch-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: var(--color-vuegreen);
}

.feature-dot {
  background-color: var(--color-primary);
}

.branch-name {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

.git-arrow-down {
  width: 2px;
  height: 30px;
  background-color: rgba(255, 255, 255, 0.15);
  margin: 10px 0;
  position: relative;
}

.git-arrow-down::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: -4px;
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 6px solid rgba(255, 255, 255, 0.15);
}

/* Outro / Q&A Layout */
.layout-outro {
  text-align: center;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.outro-heading {
  font-family: 'Poppins', sans-serif;
  font-size: 56px;
  font-weight: 800;
  margin-bottom: 20px;
  color: #fff;
}

.outro-sub {
  font-size: 20px;
  color: var(--text-muted);
  margin-bottom: 40px;
}

.outro-badges {
  display: flex;
  gap: 20px;
  margin-bottom: 50px;
}

.outro-badge {
  background-color: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 12px 25px;
  border-radius: 30px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #fff;
}

.outro-meta {
  font-size: 14px;
  color: var(--text-muted);
}

/* Vue Transitions */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* Helpers */
.border-success { border-color: rgba(16, 185, 129, 0.2) !important; }
.border-indigo { border-color: rgba(99, 102, 241, 0.2) !important; }
.border-emerald { border-color: rgba(16, 185, 129, 0.2) !important; }
.text-vuegreen { color: var(--color-vuegreen); }
.text-indigo { color: var(--color-primary); }
.text-emerald { color: #10b981; }
.comment { color: #64748b; font-style: italic; }
.command { color: var(--color-vuegreen); }
.mt-4 { margin-top: 16px; }
</style>