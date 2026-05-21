<template>
  <div :style="styles.presentationWrapper">
    <div :style="styles.progressBarContainer">
      <div :style="[styles.progressBarFill, { width: progressWidth }]" ></div>
    </div>

    <main :style="styles.slideViewport">
      <div :style="styles.slideCanvas">
        <div :style="styles.slideMeta">
          <span :style="styles.categoryBadge">{{ activeSlide.category }}</span>
        </div>

        <template v-if="activeSlide.layout === 'title'">
          <div :style="styles.layoutTitle">
            <div :style="styles.titleAccent">SYSTEM-ARCHITEKTUR &amp; IMPLEMENTIERUNG</div>
            <h1 :style="styles.mainHeading">
              Ganzheitliches Full-Stack<br />
              <span :style="styles.textGradient">Zeiterfassungssystem</span>
            </h1>
            <p :style="styles.projectSubtitle">
              Moderne Web-Applikation zur reaktiven Schichtenplanung, Sollzeitermittlung &amp; Freigabeprozesse
            </p>
            <div :style="styles.projectAuthors">
              <div :style="styles.authorTag">Ahmad Alalan</div>
              <div :style="styles.authorTag">Nawal Kayal</div>
            </div>
          </div>
        </template>

        <template v-else-if="activeSlide.layout === 'agenda'">
          <div :style="styles.layoutAgenda">
            <h2 :style="styles.slideTitle">Agenda &amp; Sektionen</h2>
            <div :style="styles.agendaGrid">
              <div :style="styles.agendaItem">
                <div :style="styles.agendaNum">01</div>
                <div :style="styles.agendaText">
                  <h3 :style="styles.h3">Einleitung</h3>
                  <p :style="styles.p">Problemstellung, Ziel &amp; Motivation der Diplomarbeit</p>
                </div>
              </div>
              <div :style="styles.agendaItem">
                <div :style="styles.agendaNum">02</div>
                <div :style="styles.agendaText">
                  <h3 :style="styles.h3">Architektur &amp; Daten</h3>
                  <p :style="styles.p">Express.js-Backend, Mongoose ODM-Datenmodelle &amp; Indizes</p>
                </div>
              </div>
              <div :style="styles.agendaItem">
                <div :style="styles.agendaNum">03</div>
                <div :style="styles.agendaText">
                  <h3 :style="styles.h3">IT-Sicherheit</h3>
                  <p :style="styles.p">JWT (HS256) Schutz, NoSQL-Injection Filter &amp; Rate Limiting</p>
                </div>
              </div>
              <div :style="styles.agendaItem">
                <div :style="styles.agendaNum">04</div>
                <div :style="styles.agendaText">
                  <h3 :style="styles.h3">Frontend &amp; Logik</h3>
                  <p :style="styles.p">Vue.js 3, Vite-Tooling, Abwesenheitsanträge &amp; Reports</p>
                </div>
              </div>
              <div :style="[{ ...styles.agendaItem, gridColumn: 'span 2' }]">
                <div :style="styles.agendaNum">05</div>
                <div :style="styles.agendaText">
                  <h3 :style="styles.h3">Git &amp; Deployment</h3>
                  <p :style="styles.p">Branching-Modell, Render.com Pipelines &amp; MongoDB Atlas</p>
                </div>
              </div>
            </div>
          </div>
        </template>

        <template v-else-if="activeSlide.layout === 'problem'">
          <div :style="styles.layoutProblem">
            <h2 :style="styles.slideTitle">Die Problemstellung &amp; Zielsetzung</h2>
            <div :style="styles.twoColumn">
              <div :style="[{ ...styles.infoCard, borderColor: 'rgba(239, 68, 68, 0.2)' }]">
                <div :style="[{ ...styles.cardIcon, color: '#ef4444' }]">
                  <i class="fa-solid fa-triangle-exclamation"></i>
                </div>
                <h3 :style="styles.h3">Ausgangssituation</h3>
                <ul :style="styles.ul">
                  <li :style="styles.li">Zettelwirtschaft und ungenaue Excel-Listen im Arbeitsalltag</li>
                  <li :style="styles.li">Keine Echtzeitüberprüfung von Pausen- und Sollzeitüberschreitungen</li>
                  <li :style="styles.li">Medienbrüche beim analogen Beantragen von Urlauben</li>
                  <li :style="styles.li">Fehlender, manipulationssicherer Audit-Trail für IT-Systemprüfungen</li>
                </ul>
              </div>
              <div :style="[{ ...styles.infoCard, borderColor: 'rgba(16, 185, 129, 0.2)' }]">
                <div :style="[{ ...styles.cardIcon, color: '#10b981' }]">
                  <i class="fa-solid fa-circle-check"></i>
                </div>
                <h3 :style="styles.h3">Unsere Lösung</h3>
                <ul :style="styles.ul">
                  <li :style="styles.li">Vollwertige Cloud-Plattform mit reaktivem Web-Terminal</li>
                  <li :style="styles.li">Schnittstelle für physisches NFC-Hardware-Stempeln</li>
                  <li :style="styles.li">Integrierte Urlaubs-, Dienst- &amp; Abwesenheitsverwaltung</li>
                  <li :style="styles.li">Lückenloses Audit-Protokoll bei Systemanomalien</li>
                </ul>
              </div>
            </div>
          </div>
        </template>

        <template v-else-if="activeSlide.layout === 'architecture'">
          <div :style="styles.layoutArchitecture">
            <h2 :style="styles.slideTitle">Gesamte Systemarchitektur</h2>
            <div :style="styles.architectureFlow">
              <div :style="styles.flowStep">
                <div :style="styles.stepIcon"><i class="fa-brands fa-vuejs"></i></div>
                <h4 :style="styles.h4">Frontend (Vue 3 / Vite)</h4>
                <p :style="styles.p">Reaktive Benutzeroberfläche, Axios-Schnittstellen, Route Guards</p>
              </div>
              <div :style="styles.flowArrow"><i class="fa-solid fa-arrow-right-arrow-left"></i></div>
              <div :style="[{ ...styles.flowStep, ...styles.highlightStep }]">
                <div :style="[{ ...styles.stepIcon, color: '#6366f1' }]"><i class="fa-brands fa-node-js"></i></div>
                <h4 :style="styles.h4">Backend (Node.js / Express)</h4>
                <p :style="styles.p">REST-Schnittstellen, JWT Auth-Middleware, NoSQL Payload Filter</p>
              </div>
              <div :style="styles.flowArrow"><i class="fa-solid fa-arrow-right-arrow-left"></i></div>
              <div :style="styles.flowStep">
                <div :style="styles.stepIcon"><i class="fa-solid fa-database"></i></div>
                <h4 :style="styles.h4">Datenbank (MongoDB Atlas)</h4>
                <p :style="styles.p">Mongoose Datenmodelle, Verbundindizes, Aggregation Pipelines</p>
              </div>
            </div>
          </div>
        </template>

        <template v-else-if="activeSlide.layout === 'database'">
          <div :style="styles.layoutDatabase">
            <h2 :style="styles.slideTitle">Mongoose Datenmodellierung (ODM)</h2>
            <div :style="styles.modelsGrid">
              <div :style="styles.modelBadge">
                <i class="fa-solid fa-user-gear" :style="{ color: '#6366f1', fontSize: '32px' }"></i>
                <div :style="styles.badgeContent">
                  <h4 :style="styles.h4">User.js</h4>
                  <p :style="styles.p">Benutzerstammdaten, Rolle, NFC-Tag ID, Passwort-Hash (Bcrypt)</p>
                </div>
              </div>
              <div :style="styles.modelBadge">
                <i class="fa-solid fa-business-time" :style="{ color: '#10b981', fontSize: '32px' }"></i>
                <div :style="styles.badgeContent">
                  <h4 :style="styles.h4">WorkSession.js</h4>
                  <p :style="styles.p">Kommen/Gehen-Zeitstempel, Pause, Ist/Soll-Saldo, Übertrag</p>
                </div>
              </div>
              <div :style="styles.modelBadge">
                <i class="fa-solid fa-calendar-check" :style="{ color: '#f59e0b', fontSize: '32px' }"></i>
                <div :style="styles.badgeContent">
                  <h4 :style="styles.h4">LeaveRequest.js</h4>
                  <p :style="styles.p">Urlaubs- &amp; Krankenstandantrag, Status (Pending, Approved)</p>
                </div>
              </div>
              <div :style="styles.modelBadge">
                <i class="fa-solid fa-clipboard-list" :style="{ color: '#ef4444', fontSize: '32px' }"></i>
                <div :style="styles.badgeContent">
                  <h4 :style="styles.h4">Log.js</h4>
                  <p :style="styles.p">INFO, WARN &amp; ERROR Systemprotokolle, Verbundindex für Audits</p>
                </div>
              </div>
            </div>
            <div :style="styles.techNote">
              <i class="fa-solid fa-lightbulb" :style="{ marginRight: '8px', color: '#6366f1' }"></i>
              Verbundindizes (Compound Indices) wie <code>&#123; user_id: 1, violation_date: 1, created_at: -1 &#125;</code> optimieren Suchanfragen bei großem Datenaufkommen drastisch.
            </div>
          </div>
        </template>

        <template v-else-if="activeSlide.layout === 'security'">
          <div :style="styles.layoutSecurity">
            <h2 :style="styles.slideTitle">Mehrstufiges IT-Security-Konzept</h2>
            <div :style="styles.twoColumn">
              <div :style="styles.infoCard">
                <h3 :style="styles.h3">Token-basierte Authentifizierung</h3>
                <ul :style="styles.ul">
                  <li :style="styles.li"><strong>HS256 Algorithmus:</strong> Gewährleistet kryptografisch unmanipulierbare JSON Web Tokens</li>
                  <li :style="styles.li"><strong>Zustandsvalidierung:</strong> Inaktivierte Benutzerkonten (<code>is_active = false</code>) werden trotz gültiger Tokens sofort abgewiesen</li>
                  <li :style="styles.li"><strong>Schutz vor Replay-Attacken:</strong> Erzwungene Validierung von Issuer und Audience Parametern</li>
                </ul>
              </div>
              <div :style="styles.infoCard">
                <h3 :style="styles.h3">Payload-Säuberung &amp; DDoS-Schutz</h3>
                <ul :style="styles.ul">
                  <li :style="styles.li"><strong>NoSQL-Injection Filter:</strong> Rekursive Prüfung aller JSON-Schlüssel auf unzulässige MongoDB-Operatoren (wie <code>$gt</code>, <code>$ne</code>)</li>
                  <li :style="styles.li"><strong>Rate Limiting:</strong> In-Memory-Sperre blockiert wiederholte Login-Versuche pro Client-IP nach 5 Fehlversuchen für 15 Minuten</li>
                </ul>
              </div>
            </div>
          </div>
        </template>

        <template v-else-if="activeSlide.layout === 'frontend'">
          <div :style="styles.layoutFrontend">
            <h2 :style="styles.slideTitle">Reaktives Frontend mit Vue.js 3 &amp; Vite</h2>
            <div :style="styles.twoColumn">
              <div>
                <h3 :style="styles.h3">Moderne UI/UX &amp; Performance</h3>
                <ul :style="styles.ul">
                  <li :style="styles.li"><strong>Composition API:</strong> Modularer und lesbarer Aufbau der Logik mittels Reactive Refs und Hooks</li>
                  <li :style="styles.li"><strong>Vite-Tooling:</strong> Instant-Server-Starts (unter 500ms) und Hot Module Replacement (HMR) zur reibungslosen Entwicklung</li>
                  <li :style="styles.li"><strong>Atomic Design:</strong> Strukturierte Kapselung wiederverwendbarer Komponenten</li>
                  <li :style="styles.li"><strong>Route Guards:</strong> Clientseitiger Schutz geschützter Pfade basierend auf Benutzerrollen</li>
                </ul>
              </div>
              <div :style="styles.performanceChartBox">
                <h4 :style="styles.h4">Build- und HMR-Zeiten im Vergleich</h4>
                <div :style="styles.barChart">
                  <div :style="styles.barBar">
                    <div :style="[styles.barFill, styles.webpackFill]"><span>45s</span></div>
                    <div :style="styles.barTitle">Webpack Build</div>
                  </div>
                  <div :style="styles.barBar">
                    <div :style="[styles.barFill, styles.viteFill]"><span>2s</span></div>
                    <div :style="styles.barTitle">Vite Build</div>
                  </div>
                  <div :style="styles.barBar">
                    <div :style="[styles.barFill, styles.hmrFill]"><span>&lt;0.1s</span></div>
                    <div :style="styles.barTitle">Vite HMR</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <template v-else-if="activeSlide.layout === 'schedules'">
          <div :style="styles.layoutSchedules">
            <h2 :style="styles.slideTitle">Dienstplan- &amp; Sollzeitraster</h2>
            <div :style="styles.twoColumn">
              <div :style="styles.infoCard">
                <h3 :style="styles.h3">WorkSchedule.js (1:1 Relation)</h3>
                <p :style="styles.p">Tagesgenaue Definitionen der wöchentlichen Arbeitszeiten zur Entlastung des primären Benutzer-Dokuments:</p>
                <ul :style="styles.ul">
                  <li :style="styles.li">Präzise Vorgabe im 24-Stunden-Format (z.B. <code>"08:00"</code> bis <code>"16:00"</code>)</li>
                  <li :style="styles.li">Echtzeit-Sollabgleich mit den gestempelten Ist-Stunden</li>
                  <li :style="styles.li">Individuelle Pausenregelungen (z.B. automatischer Abzug bei mehr als 6 Stunden Arbeit)</li>
                </ul>
              </div>
              <div :style="styles.infoCard">
                <h3 :style="styles.h3">Schedule.js (Schichtraster)</h3>
                <p :style="styles.p">Ermöglicht flexible operative Schichtplanungen für Teams:</p>
                <ul :style="styles.ul">
                  <li :style="styles.li">Zuweisung vordefinierter Arbeitszeiten (z.B. Früh-, Spät-, Nachtschicht)</li>
                  <li :style="styles.li">Dynamische Dashboard-Kalenderdarstellung im Web-Frontend</li>
                </ul>
              </div>
            </div>
          </div>
        </template>

        <template v-else-if="activeSlide.layout === 'workflows'">
          <div :style="styles.layoutWorkflows">
            <h2 :style="styles.slideTitle">Urlaubsabwicklung &amp; Workflows</h2>
            <div :style="styles.twoColumn">
              <div :style="styles.infoCard">
                <h3 :style="styles.h3">Einstufiger Genehmigungsweg</h3>
                <ul :style="styles.ul">
                  <li :style="styles.li"><strong>Mitarbeiter:</strong> Beantragen Urlaube über ein intuitives Datums-Formular</li>
                  <li :style="styles.li"><strong>Abteilungsleiter:</strong> Sehen und bearbeiten ausschließlich Anträge von Mitarbeitern, die ihrer eigenen Abteilung zugeordnet sind (verifiziert über die Controller-Ebene)</li>
                  <li :style="styles.li"><strong>Admin-Ebene:</strong> Uneingeschränkte, globale Freigabe- und Administrationsrechte</li>
                </ul>
              </div>
              <div :style="styles.workflowTableBox">
                <table :style="styles.presentationTable">
                  <thead>
                    <tr>
                      <th :style="styles.th">Status-Enum</th>
                      <th :style="styles.th">Verursacher</th>
                      <th :style="styles.th">Bedeutung</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td :style="[{ ...styles.td, color: '#f59e0b' }]"><code>pending</code></td>
                      <td :style="styles.td">Mitarbeiter</td>
                      <td :style="styles.td">Antrag wartet auf Freigabe</td>
                    </tr>
                    <tr>
                      <td :style="styles.td"><code>approved</code></td>
                      <td :style="styles.td">Abteilungsleiter / Admin</td>
                      <td :style="styles.td">Gutschrift im Zeitkonto</td>
                    </tr>
                    <tr>
                      <td :style="styles.td"><code>rejected</code></td>
                      <td :style="styles.td">Abteilungsleiter / Admin</td>
                      <td :style="styles.td">Ablehnung mit Begründung</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </template>

        <template v-else-if="activeSlide.layout === 'git'">
          <div :style="styles.layoutGit">
            <h2 :style="styles.slideTitle">Entwicklung im Team &amp; Git-Workflow</h2>
            <div :style="styles.twoColumn">
              <div>
                <h3 :style="styles.h3">Teamarbeit mit GitHub</h3>
                <p :style="styles.p">Durchdachte Versionskontrolle zur Vermeidung von Quellcode-Konflikten:</p>
                <ul :style="styles.ul">
                  <li :style="styles.li"><strong>Feature Branches:</strong> Jede neue Funktionalität (z.B. <code>feature/auth-validation</code>) wird isoliert implementiert</li>
                  <li :style="styles.li"><strong>Protected Main Branch:</strong> Direkte Pushs auf <code>main</code> sind gesperrt, um Produktions-Ausfälle zu verhindern</li>
                  <li :style="styles.li"><strong>Pull Requests (PR):</strong> Zusammenführungen erfordern erfolgreiche lokale Tests und Code-Reviews</li>
                </ul>
              </div>
              <div :style="styles.gitDiagram">
                <div :style="styles.gitBranch">
                  <span :style="styles.branchDot"></span>
                  <span :style="styles.branchName">main (Production)</span>
                </div>
                <div :style="styles.gitArrowDown"></div>
                <div :style="[{ ...styles.gitBranch, backgroundColor: 'transparent' }]">
                  <span :style="[{ ...styles.branchDot, backgroundColor: '#6366f1' }]" ></span>
                  <span :style="styles.branchName">feature/nfc-login</span>
                </div>
              </div>
            </div>
          </div>
        </template>

        <template v-else-if="activeSlide.layout === 'deployment'">
          <div :style="styles.layoutDeployment">
            <h2 :style="styles.slideTitle">Continuous Deployment &amp; Cloud Hosting</h2>
            <div :style="styles.threeColumn">
              <div :style="styles.infoCard">
                <div :style="[{ ...styles.cardIcon, color: '#42b883' }]"><i class="fa-solid fa-cloud-arrow-up"></i></div>
                <h3 :style="styles.h3">Render.com CD</h3>
                <p :style="styles.p">Verknüpfte Pipelines bauen und deployen die Applikation vollautomatisch bei jedem Merge auf GitHub (Zero-Downtime).</p>
              </div>
              <div :style="styles.infoCard">
                <div :style="[{ ...styles.cardIcon, color: '#6366f1' }]"><i class="fa-solid fa-server"></i></div>
                <h3 :style="styles.h3">Express.js Hosting</h3>
                <p :style="styles.p">Der Node.js Server dient zeitgleich als API-Provider und serviert die statisch kompilierten Frontend-Assets aus <code>/frontend/dist</code>.</p>
              </div>
              <div :style="styles.infoCard">
                <div :style="[{ ...styles.cardIcon, color: '#10b981' }]"><i class="fa-solid fa-database"></i></div>
                <h3 :style="styles.h3">MongoDB Atlas</h3>
                <p :style="styles.p">Gehostetes und gesichertes Datenbank-Cluster. Der Datenbankzugriff ist per IP-Whitelisting streng auf die App-Infrastruktur limitiert.</p>
              </div>
            </div>
          </div>
        </template>

        <template v-else>
          <div :style="styles.layoutOutro">
            <h1 :style="styles.mainHeading">
              Vielen Dank für Ihre <span :style="styles.textGradient">Aufmerksamkeit!</span>
            </h1>
            <p :style="styles.projectSubtitle">Wir freuen uns auf Ihre Fragen und die gemeinsame Diskussion.</p>
            <div :style="styles.outroLinks">
              <div :style="styles.outroBadge"><i class="fa-brands fa-github"></i> github.com/htl-it/zeiterfassung</div>
              <div :style="styles.outroBadge"><i class="fa-solid fa-server"></i> zeiterfassung.onrender.com</div>
            </div>
            <div :style="styles.closingMeta">
              Ahmad Alalan &amp; Nawal Kayal &bull; HTL IT Diplomarbeit 2026
            </div>
          </div>
        </template>

        <div :style="styles.slideCounter">
          {{ currentSlide + 1 }} / {{ totalSlides }}
        </div>
      </div>
    </main>

    <div :style="styles.presentationControls">
      <button
        type="button"
        @click="prevSlide"
        :disabled="prevDisabled"
        :style="[styles.ctrlBtn, prevDisabled ? { opacity: 0.3, cursor: 'not-allowed' } : { opacity: 1, cursor: 'pointer' }]"
        title="Zurück (Pfeiltaste Links)"
      >
        <i class="fa-solid fa-chevron-left"></i>
      </button>
      <button
        type="button"
        @click="nextSlide"
        :disabled="nextDisabled"
        :style="[styles.ctrlBtn, nextDisabled ? { opacity: 0.3, cursor: 'not-allowed' } : { opacity: 1, cursor: 'pointer' }]"
        title="Weiter (Pfeiltaste Rechts / Leertaste)"
      >
        <i class="fa-solid fa-chevron-right"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const currentSlide = ref(0);

const slides = [
  { id: 'slide1', title: 'Startseite', category: 'Diplomarbeit • HTL IT 2026', layout: 'title' },
  { id: 'slide2', title: 'Projekt-Übersicht', category: '01 / Einleitung', layout: 'agenda' },
  { id: 'slide3', title: 'Die Problemstellung', category: '01 / Einleitung', layout: 'problem' },
  { id: 'slide4', title: 'Systemarchitektur', category: '02 / Software-Architektur', layout: 'architecture' },
  { id: 'slide5', title: 'Datenbank-Modelle', category: '02 / Software-Architektur', layout: 'database' },
  { id: 'slide6', title: 'Sicherheits-Konzepte', category: '03 / IT-Security & Middleware', layout: 'security' },
  { id: 'slide7', title: 'Das Vue.js Frontend', category: '04 / Frontend-Schnittstellen', layout: 'frontend' },
  { id: 'slide8', title: 'Dienstplan & Sollzeiten', category: '05 / Business-Logik', layout: 'schedules' },
  { id: 'slide9', title: 'Urlaubsanträge & Workflow', category: '05 / Business-Logik', layout: 'workflows' },
  { id: 'slide10', title: 'Entwicklung & Git-Workflow', category: '06 / DevOps & Deployment', layout: 'git' },
  { id: 'slide11', title: 'Deployment & Hosting', category: '06 / DevOps & Deployment', layout: 'deployment' },
  { id: 'slide12', title: 'Fragen & Antworten', category: 'Abschluss', layout: 'outro' }
];

const totalSlides = computed(() => slides.length);
const activeSlide = computed(() => slides[currentSlide.value]);
const progressWidth = computed(() => `${((currentSlide.value + 1) / totalSlides.value) * 100}%`);
const prevDisabled = computed(() => currentSlide.value === 0);
const nextDisabled = computed(() => currentSlide.value === totalSlides.value - 1);

const nextSlide = () => {
  if (currentSlide.value < totalSlides.value - 1) {
    currentSlide.value += 1;
  }
};

const prevSlide = () => {
  if (currentSlide.value > 0) {
    currentSlide.value -= 1;
  }
};

const handleKeyDown = (event) => {
  if (event.key === 'ArrowRight' || event.key === ' ' || event.key === 'Enter') {
    nextSlide();
  } else if (event.key === 'ArrowLeft') {
    prevSlide();
  } else if (event.key === 'Home') {
    currentSlide.value = 0;
  } else if (event.key === 'End') {
    currentSlide.value = totalSlides.value - 1;
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});

const styles = {
  presentationWrapper: {
    backgroundColor: '#090d16',
    minHeight: '100vh',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    fontFamily: "'Inter', sans-serif",
    color: '#f8fafc',
    padding: '20px 0',
    boxSizing: 'border-box'
  },
  progressBarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '5px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    zIndex: 10
  },
  progressBarFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #6366f1, #42b883)',
    transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
  },
  slideViewport: {
    width: '1280px',
    height: '720px',
    backgroundColor: '#0f172a',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
  },
  slideCanvas: {
    width: '100%',
    height: '100%',
    padding: '60px 80px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    position: 'relative'
  },
  slideMeta: {
    marginBottom: '20px'
  },
  categoryBadge: {
    fontSize: '13px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    color: '#42b883',
    backgroundColor: 'rgba(66, 184, 131, 0.1)',
    padding: '6px 14px',
    borderRadius: '30px'
  },
  slideTitle: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: '38px',
    fontWeight: '700',
    margin: '0 0 35px 0',
    letterSpacing: '-0.5px',
    borderLeft: '5px solid #42b883',
    paddingLeft: '18px',
    color: '#fff'
  },
  twoColumn: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '40px',
    alignItems: 'stretch'
  },
  threeColumn: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '25px'
  },
  infoCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    padding: '30px',
    transition: 'border-color 0.2s ease',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start'
  },
  cardIcon: {
    fontSize: '36px',
    marginBottom: '15px'
  },
  h3: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: '22px',
    marginTop: 0,
    marginBottom: '18px',
    color: '#fff'
  },
  ul: {
    margin: 0,
    paddingLeft: '20px'
  },
  li: {
    fontSize: '16px',
    marginBottom: '12px',
    color: '#94a3b8',
    lineHeight: '1.5'
  },
  layoutTitle: {
    textAlign: 'center',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  titleAccent: {
    fontSize: '13px',
    fontWeight: '700',
    letterSpacing: '4px',
    color: '#6366f1',
    marginBottom: '15px'
  },
  mainHeading: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: '64px',
    fontWeight: '800',
    lineHeight: '1.15',
    margin: '0 0 20px 0',
    letterSpacing: '-1.5px',
    color: '#fff'
  },
  textGradient: {
    background: 'linear-gradient(135deg, #6366f1, #42b883)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  projectSubtitle: {
    fontSize: '20px',
    color: '#94a3b8',
    maxWidth: '800px',
    margin: '0 auto 40px auto',
    lineHeight: '1.5'
  },
  projectAuthors: {
    display: 'flex',
    gap: '20px'
  },
  authorTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    padding: '10px 24px',
    borderRadius: '30px',
    fontWeight: '500',
    fontSize: '16px',
    color: '#f8fafc'
  },
  agendaGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '25px'
  },
  agendaItem: {
    display: 'flex',
    gap: '20px',
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.03)'
  },
  agendaNum: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: '32px',
    fontWeight: '700',
    color: '#6366f1',
    lineHeight: 1
  },
  agendaText: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  },
  h4: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: '18px',
    margin: '0 0 10px 0',
    color: '#fff'
  },
  p: {
    fontSize: '14px',
    margin: 0,
    color: '#94a3b8',
    lineHeight: '1.4'
  },
  architectureFlow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '40px'
  },
  flowStep: {
    flex: 1,
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '16px',
    padding: '30px 20px',
    textAlign: 'center',
    maxWidth: '300px'
  },
  highlightStep: {
    borderColor: '#6366f1',
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    boxShadow: '0 0 15px rgba(99, 102, 241, 0.1)'
  },
  stepIcon: {
    fontSize: '40px',
    color: '#42b883',
    marginBottom: '15px'
  },
  flowArrow: {
    fontSize: '24px',
    color: '#94a3b8'
  },
  modelsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    marginTop: '10px'
  },
  modelBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    padding: '20px',
    borderRadius: '12px'
  },
  badgeContent: {
    display: 'flex',
    flexDirection: 'column'
  },
  techNote: {
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
    borderLeft: '4px solid #6366f1',
    padding: '15px 20px',
    borderRadius: '0 8px 8px 0',
    fontSize: '14px',
    color: '#94a3b8',
    marginTop: '24px'
  },
  performanceChartBox: {
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderRadius: '12px',
    padding: '25px',
    border: '1px solid rgba(255, 255, 255, 0.04)'
  },
  barChart: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: '200px',
    paddingBottom: '20px'
  },
  barBar: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
    width: '80px'
  },
  barFill: {
    width: '40px',
    borderRadius: '6px 6px 0 0',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingTop: '8px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#fff'
  },
  webpackFill: {
    background: 'linear-gradient(180deg, #ef4444, #7f1d1d)',
    height: '90%'
  },
  viteFill: {
    background: 'linear-gradient(180deg, #6366f1, #312e81)',
    height: '10%'
  },
  hmrFill: {
    background: 'linear-gradient(180deg, #42b883, #064e3b)',
    height: '2%'
  },
  barTitle: {
    fontSize: '11px',
    marginTop: '10px',
    color: '#94a3b8',
    textAlign: 'center'
  },
  workflowTableBox: {
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid rgba(255, 255, 255, 0.04)'
  },
  presentationTable: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  th: {
    textAlign: 'left',
    padding: '12px',
    fontSize: '14px',
    color: '#94a3b8',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
  },
  td: {
    padding: '14px 12px',
    fontSize: '14px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    color: '#94a3b8'
  },
  gitDiagram: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '12px',
    padding: '40px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(255, 255, 255, 0.03)'
  },
  gitBranch: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    padding: '12px 25px',
    borderRadius: '8px',
    width: '220px'
  },
  branchDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: '#42b883'
  },
  branchName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#fff'
  },
  gitArrowDown: {
    width: '2px',
    height: '40px',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    margin: '10px 0',
    position: 'relative'
  },
  layoutOutro: {
    textAlign: 'center',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  outroLinks: {
    display: 'flex',
    gap: '20px',
    marginBottom: '50px'
  },
  outroBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    padding: '12px 25px',
    borderRadius: '30px',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '15px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: '#fff'
  },
  closingMeta: {
    fontSize: '14px',
    color: '#94a3b8'
  },
  slideCounter: {
    position: 'absolute',
    bottom: '35px',
    right: '50px',
    fontSize: '14px',
    color: '#94a3b8',
    fontFamily: "'JetBrains Mono', monospace",
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: '4px 12px',
    borderRadius: '20px'
  },
  presentationControls: {
    marginTop: '25px',
    display: 'flex',
    gap: '15px'
  },
  ctrlBtn: {
    backgroundColor: '#0f172a',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    color: '#f8fafc',
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
  }
};
</script>
