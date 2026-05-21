<template>
  <div class="presentation-wrapper">
    <!-- Fortschrittsbalken am oberen Rand -->
    <div class="progress-bar-container">
      <div 
        class="progress-bar-fill" 
        :style="{ width: `${((currentSlide + 1) / totalSlides) * 100}%` }"
      ></div>
    </div>

    <!-- Hauptfenster im standardisierten 16:9 Format -->
    <div class="slide-viewport">
      <transition name="slide" mode="out-in">
        <div :key="currentSlide" class="slide-canvas">
          
          <!-- Sektions-Indikator oben links -->
          <div class="slide-header">
            <span class="category-badge">{{ slides[currentSlide].category }}</span>
            <div class="system-tag">
              <i class="fa-solid fa-microchip"></i> HTL IT Diplomarbeit &bull; 2026
            </div>
          </div>

          <!-- FOLIE 1: Titelblatt -->
          <div v-if="slides[currentSlide].layout === 'title'" class="layout-title">
            <span class="title-sub">SYSTEM-ARCHITEKTUR &amp; IMPLEMENTIERUNG</span>
            <h1 class="main-heading">
              Ganzheitliches Full-Stack<br />
              <span class="text-gradient">Zeiterfassungssystem</span>
            </h1>
            <p class="project-subtitle">
              Moderne Web-Applikation zur reaktiven Schichtenplanung, Sollzeitermittlung &amp; Freigabeprozesse im IT-Unternehmensumfeld.
            </p>
            <div class="project-authors">
              <div class="author-tag"><i class="fa-solid fa-user text-vuegreen"></i> Ahmad Alalan</div>
              <div class="author-tag"><i class="fa-solid fa-user text-indigo"></i> Nawal Kayal</div>
            </div>
          </div>

          <!-- FOLIE 2: Agenda -->
          <div v-else-if="slides[currentSlide].layout === 'agenda'" class="layout-agenda">
            <h2 class="slide-title">Agenda &amp; Sektionen</h2>
            <div class="agenda-grid">
              <div v-for="(item, idx) in agendaItems" :key="idx" class="agenda-item">
                <span class="agenda-num">{{ item.num }}</span>
                <div class="agenda-text">
                  <h3>{{ item.title }}</h3>
                  <p>{{ item.desc }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- FOLIE 3: Einleitung / Problemstellung -->
          <div v-else-if="slides[currentSlide].layout === 'problem'" class="layout-problem">
            <h2 class="slide-title">Problemstellung &amp; Lösungsansatz</h2>
            <div class="two-column">
              <div class="info-card border-danger">
                <div class="card-icon text-danger"><i class="fa-solid fa-triangle-exclamation"></i></div>
                <h3>Ausgangslage &amp; Defizite</h3>
                <ul>
                  <li>Zettelwirtschaft und fehleranfällige, analoge Excel-Listen</li>
                  <li>Keine automatisierte Prüfung gesetzlicher Ruhe- &amp; Pausenzeiten</li>
                  <li>Medienbrüche und Intransparenz bei Urlaubsanträgen</li>
                  <li>Fehlender, revisionssicherer Audit-Trail für IT-Systemprüfungen</li>
                </ul>
              </div>
              <div class="info-card border-success">
                <div class="card-icon text-success"><i class="fa-solid fa-circle-check"></i></div>
                <h3>Unsere Enterprise-Lösung</h3>
                <ul>
                  <li>Zentrales Web-Portal mit Echtzeit-Stempelterminal</li>
                  <li>Schnittstelle für physisches NFC-Hardwarestempeln</li>
                  <li>Integrierte Urlaubs-, Dienst- &amp; Abwesenheitsverwaltung</li>
                  <li>Lückenlose, manipulationsgeschützte MongoDB-Aktivitätsprotokolle</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- FOLIE 4: Systemarchitektur -->
          <div v-else-if="slides[currentSlide].layout === 'architecture'" class="layout-architecture">
            <h2 class="slide-title">Systemarchitektur (MEVN-Stack)</h2>
            <div class="architecture-flow">
              <div class="flow-step">
                <div class="step-icon"><i class="fa-brands fa-vuejs"></i></div>
                <h4>Frontend (Vue 3 / Vite)</h4>
                <p>Reaktive Benutzeroberfläche, Axios API Client, Route Guards für RBAC-Sicherheit</p>
              </div>
              <div class="flow-arrow"><i class="fa-solid fa-arrow-right-arrow-left"></i></div>
              <div class="flow-step highlight-step">
                <div class="step-icon"><i class="fa-brands fa-node-js text-indigo"></i></div>
                <h4>Backend (Node.js / Express)</h4>
                <p>RESTful APIs, JWT Token-Verifikation, Security Middleware, statisches Asset-Hosting</p>
              </div>
              <div class="flow-arrow"><i class="fa-solid fa-arrow-right-arrow-left"></i></div>
              <div class="flow-step">
                <div class="step-icon"><i class="fa-solid fa-database text-emerald"></i></div>
                <h4>Datenbank (MongoDB)</h4>
                <p>Mongoose ODM-Schemas, optimierte Verbundindizes, aggregierte Lohn- &amp; Zeitauswertungen</p>
              </div>
            </div>
          </div>

          <!-- FOLIE 5: User.js & WorkSchedule.js -->
          <div v-else-if="slides[currentSlide].layout === 'models-user'" class="layout-models">
            <h2 class="slide-title">Modellierung: User &amp; Sollarbeitszeit</h2>
            <div class="two-column">
              <div>
                <h3>Entkopplung der Dienstplanung</h3>
                <p>Um den primären Benutzerdatensatz schlank zu halten, wurden Stammdaten und Tagesarbeitszeitpläne getrennt:</p>
                <ul>
                  <li><strong>User.js Schema:</strong> Verwaltet Name, Email, Bcrypt-Passworthash, Rolle und NFC-Token ID.</li>
                  <li><strong>WorkSchedule.js Schema:</strong> Erzwingt eine performante 1:1-Relation via <code>unique: true</code> auf <code>user_id</code>. Speichert das Tages-Sollzeitraster im "HH:mm"-Stringformat (z.B. 08:00 bis 16:00).</li>
                </ul>
              </div>
              <div class="code-box">
                <pre><code><span class="code-keyword">const</span> WorkScheduleSchema = <span class="code-keyword">new</span> Schema({
  user_id: { 
    type: Schema.Types.ObjectId, 
    ref: <span class="code-string">"User"</span>, 
    unique: <span class="code-keyword">true</span> 
  },
  weekly_hours: { type: Number, default: <span class="code-number">40</span> },
  schedule: {
    mon: { from: String, to: String, active: Boolean }
  }
});</code></pre>
              </div>
            </div>
          </div>

          <!-- FOLIE 6: WorkSession.js & Holiday.js -->
          <div v-else-if="slides[currentSlide].layout === 'models-work'" class="layout-models">
            <h2 class="slide-title">Modellierung: Stempelungen &amp; Feiertage</h2>
            <div class="two-column">
              <div class="code-box">
                <pre><code><span class="code-keyword">const</span> WorkSessionSchema = <span class="code-keyword">new</span> Schema({
  user_id: { type: Schema.Types.ObjectId, ref: <span class="code-string">"User"</span> },
  date_today: { type: String, required: <span class="code-keyword">true</span> }, 
  start_time: { type: Date, default: <span class="code-keyword">null</span> },
  end_time: { type: Date, default: <span class="code-keyword">null</span> },
  pause: { type: String, default: <span class="code-string">"0:00"</span> },
  ist: { type: String, default: <span class="code-keyword">null</span> },
  salGes: { type: String, default: <span class="code-keyword">null</span> }
});</code></pre>
              </div>
              <div>
                <h3>Ist-Zeiterfassung &amp; Feiertagsmatrix</h3>
                <p>Das Abrechnungsfundament stützt sich auf präzise Zeiterfassung und automatische Feiertagsprüfungen:</p>
                <ul>
                  <li><strong>WorkSession.js Schema:</strong> Speichert ISO-Zeitstempel für Kommen/Gehen sowie kalkulierte Saldo-Werte (ist, soll, pause, salGes, uebertrag) zur Lohnvorbereitung.</li>
                  <li><strong>Holiday.js Schema:</strong> Kapselt gesetzliche Feiertage und Ferienintervalle nach Bundesländern. Ein Verbundindex verhindert redundante Matrizen pro Jahr/Region.</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- FOLIE 7: LeaveRequest.js & Log.js -->
          <div v-else-if="slides[currentSlide].layout === 'models-compliance'" class="layout-models">
            <h2 class="slide-title">Modellierung: Compliance &amp; Anträge</h2>
            <div class="two-column">
              <div>
                <h3>Fehlzeiten &amp; Revisionssicherheit</h3>
                <p>Umfasst sämtliche administrativen Abläufe und Sicherheitsaufzeichnungen:</p>
                <ul>
                  <li><strong>LeaveRequest.js Schema:</strong> Verwaltet Urlaube, Krankenstände und Überstundenzeitausgleich mittels eines kontrollierten Status-Enums (<code>pending</code>, <code>approved</code>, <code>rejected</code>).</li>
                  <li><strong>Log.js Schema:</strong> Zentraler Audit-Trail zur lückenlosen Nachvollziehbarkeit bei Systemanomalien oder unautorisierten Zugriffen.</li>
                  <li><strong>Indexierung:</strong> Verbundindizes optimieren Filtergeschwindigkeiten im Live-Betrieb.</li>
                </ul>
              </div>
              <div class="code-box">
                <pre><code><span class="code-comment">// Log.js - Revisionssichere Indizes</span>
LogSchema.index({ 
  user_id: <span class="code-number">1</span>, 
  violation_date: <span class="code-number">1</span>, 
  created_at: -<span class="code-number">1</span> 
});</code></pre>
              </div>
            </div>
          </div>

          <!-- FOLIE 8: IT-Security Token-Schutz -->
          <div v-else-if="slides[currentSlide].layout === 'security-token'" class="layout-security">
            <h2 class="slide-title">Sicherheit: Token-Validierung (auth.js)</h2>
            <div class="two-column">
              <div class="code-box">
                <pre><code><span class="code-keyword">const</span> decoded = jwt.verify(token, process.env.JWT_SECRET, {
  algorithms: [<span class="code-string">"HS256"</span>],
  issuer: <span class="code-string">"zeiterfassung-api"</span>,
  audience: <span class="code-string">"zeiterfassung-client"</span>
});

<span class="code-keyword">const</span> user = <span class="code-keyword">await</span> User.findById(decoded.id)
  .select(<span class="code-string">"_id role is_active department"</span>).lean();</code></pre>
              </div>
              <div>
                <h3>Strikter Schutz der API-Endpunkte</h3>
                <p>Die <code>auth.js</code>-Middleware sichert alle schützenswerten Routen ab:</p>
                <ul>
                  <li><strong>Erzwungene Signaturprüfung:</strong> Verhindert Manipulationen durch Beschränkung auf den sicheren <code>HS256</code>-Algorithmus.</li>
                  <li><strong>Integritätsprüfung:</strong> Abgleich der Tokenparameter (Issuer &amp; Audience) gegen Spoofing.</li>
                  <li><strong>Zustandsprüfung:</strong> Inaktivierte Benutzerkonten (<code>is_active = false</code>) werden trotz gültiger Signatur abgewiesen.</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- FOLIE 9: IT-Security Payload Hardening -->
          <div v-else-if="slides[currentSlide].layout === 'security-payload'" class="layout-security">
            <h2 class="slide-title">Sicherheit: NoSQL Injection &amp; Rate Limit</h2>
            <div class="two-column">
              <div>
                <h3>Datenbank- &amp; DDoS-Schutz (security.js)</h3>
                <p>Eindringlinge versuchen häufig, Loginmasken durch injizierte MongoDB-Operatoren zu kompromittieren:</p>
                <ul>
                  <li><strong>NoSQL-Injection Filter:</strong> Die Middleware durchsucht eingehende payloads rekursiv und blockiert Schlüssel, die mit <code>$</code> beginnen oder Punkte enthalten.</li>
                  <li><strong>Brute-Force Limitierung:</strong> Map-basiertes In-Memory Rate Limiting sperrt auffällige IP-Adressen nach 5 Fehlversuchen für 15 Minuten.</li>
                </ul>
              </div>
              <div class="code-box">
                <pre><code><span class="code-keyword">function</span> <span class="code-func">containsProhibitedKeys</span>(value) {
  <span class="code-keyword">if</span> (!value || <span class="code-keyword">typeof</span> value !== <span class="code-string">"object"</span>) <span class="code-keyword">return</span> <span class="code-keyword">false</span>;
  <span class="code-keyword">return</span> Object.entries(value).some(([key, val]) => {
    <span class="code-keyword">if</span> (key.startsWith(<span class="code-string">"$"</span>) || key.includes(<span class="code-string">"."</span>)) 
      <span class="code-keyword">return</span> <span class="code-keyword">true</span>;
    <span class="code-keyword">return</span> <span class="code-func">containsProhibitedKeys</span>(val);
  });
}</code></pre>
              </div>
            </div>
          </div>

          <!-- FOLIE 10: leaveRequestController.js -->
          <div v-else-if="slides[currentSlide].layout === 'controller-leave'" class="layout-controller">
            <h2 class="slide-title">Controller: Hierarchische Freigaben</h2>
            <div class="two-column">
              <div class="code-box">
                <pre><code><span class="code-keyword">if</span> (currentUser.role === <span class="code-string">'department_leader'</span>) {
  <span class="code-keyword">const</span> reqst = <span class="code-keyword">await</span> LeaveRequest.findById(requestId)
    .populate(<span class="code-string">'user'</span>).lean();
  <span class="code-keyword">if</span> (!reqst || reqst.user.department !== currentUser.department) {
    <span class="code-keyword">return</span> res.status(<span class="code-number">403</span>).json({ error: <span class="code-string">'Zugriff verweigert'</span> });
  }
}</code></pre>
              </div>
              <div>
                <h3>Abteilungsinterne Rechteprüfung</h3>
                <p>Der <code>leaveRequestController.js</code> kapselt die firmeninterne Freigabehierarchie:</p>
                <ul>
                  <li><strong>Globale Administratoren:</strong> Besitzen uneingeschränkten Zugriff und können jeden Antrag systemweit bearbeiten.</li>
                  <li><strong>Abteilungsleiter:</strong> Zugriff wird serverseitig gefiltert. Anträge von Mitarbeitern anderer Abteilungen werden strikt blockiert (HTTP 403).</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- FOLIE 11: REST-Konventionen & Service Pattern -->
          <div v-else-if="slides[currentSlide].layout === 'controller-rest'" class="layout-controller">
            <h2 class="slide-title">REST-Konventionen &amp; Services</h2>
            <div class="two-column">
              <div>
                <h3>Saubere Trennung der Software-Schichten</h3>
                <p>Einhaltung moderner Software-Entwurfsprinzipien in der Controller-Schicht:</p>
                <ul>
                  <li><strong>Entkopplung:</strong> Controller nehmen HTTP-Anfragen an, validieren sie, delegieren die Logik an Services und senden standardisierte Antworten zurück.</li>
                  <li><strong>REST-Spezifikation:</strong> Erfolgreiche Modifikationen liefern den exakten HTTP-Status <code>201 Created</code> mitsamt dem Ressourcenpfad im Location-Header.</li>
                </ul>
              </div>
              <div class="code-box">
                <pre><code><span class="code-keyword">export async function</span> <span class="code-func">createDepartmentController</span>(req, res) {
  <span class="code-keyword">const</span> createdDepartment = <span class="code-keyword">await</span> <span class="code-func">createDepartment</span>(req.body);
  <span class="code-func">sendCreated</span>(
    req, res, createdDepartment,
    <span class="code-string">`</span><span class="code-keyword">${req.baseUrl}</span><span class="code-string">/</span><span class="code-keyword">${createdDepartment.department.id}</span><span class="code-string">`</span>
  );
}</code></pre>
              </div>
            </div>
          </div>

          <!-- FOLIE 12: Vue.js Frontend Composition API -->
          <div v-else-if="slides[currentSlide].layout === 'frontend-vue'" class="layout-frontend">
            <h2 class="slide-title">Reaktives Frontend mit Vue.js 3</h2>
            <div class="two-column">
              <div>
                <h3>Composition API &amp; reaktives UI-Design</h3>
                <p>Die Client-Schicht fokussiert sich auf eine performante, leicht verständliche Benutzeroberfläche:</p>
                <ul>
                  <li><strong>Composition API:</strong> Modularer und lesbarer Aufbau durch die Nutzung von Reactive Refs (<code>ref</code>) und Hooks (<code>composables</code>).</li>
                  <li><strong>Router Guards:</strong> Schutz kritischer Client-Ansichten (wie Admin-Bereiche) direkt im Browser basierend auf verschlüsselten JWT-Payloads.</li>
                  <li><strong>Live-Ticker:</strong> Präzise Sekunden-Verfolgung der aktuellen Arbeitszeit im User-Dashboard.</li>
                </ul>
              </div>
              <div class="performance-chart-box">
                <h4>Entwicklungsgeschwindigkeit im Vergleich (Buildzeiten)</h4>
                <div class="bar-chart">
                  <div class="bar-bar">
                    <div class="bar-fill webpack" style="height: 90%;"><span>45s</span></div>
                    <div class="bar-title">Webpack Build</div>
                  </div>
                  <div class="bar-bar">
                    <div class="bar-fill vite" style="height: 10%;"><span>2s</span></div>
                    <div class="bar-title">Vite Build</div>
                  </div>
                  <div class="bar-bar">
                    <div class="bar-fill hmr" style="height: 2%;"><span>&lt;0.1s</span></div>
                    <div class="bar-title">Vite HMR</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- FOLIE 13: Teamarbeit & Git-Workflow -->
          <div v-else-if="slides[currentSlide].layout === 'git'" class="layout-git">
            <h2 class="slide-title">GitHub-Repository &amp; Git-Workflows</h2>
            <div class="two-column">
              <div>
                <h3>Strukturierte Versionskontrolle im Team</h3>
                <p>Erhöhte Ausfallsicherheit während der Implementierung durch klare Teamvorgaben:</p>
                <ul>
                  <li><strong>Feature Branches:</strong> Jede Erweiterung (z.B. <code>feature/nfc-login</code>) wird getrennt und unabhängig vom Hauptcode entwickelt.</li>
                  <li><strong>Protected Main Branch:</strong> Direkte Pushs auf den <code>main</code>-Zweig sind gesperrt, um unfertigen Code in der Produktionsumgebung auszuschließen.</li>
                  <li><strong>Pull Requests (PR):</strong> Zusammenführungen erfordern Reviews und lokale Tests.</li>
                </ul>
              </div>
              <div class="git-diagram">
                <div class="git-branch main-branch">
                  <span class="branch-dot"></span>
                  <span class="branch-name">main (Production)</span>
                </div>
                <div class="git-arrow-down"></div>
                <div class="git-branch feature-branch">
                  <span class="branch-dot feature-dot"></span>
                  <span class="branch-name">feature/nfc-login</span>
                </div>
              </div>
            </div>
          </div>

          <!-- FOLIE 14: DevOps & Cloud Hosting -->
          <div v-else-if="slides[currentSlide].layout === 'deployment'" class="layout-deployment">
            <h2 class="slide-title">Deployment &amp; Cloud-Infrastruktur</h2>
            <div class="three-column">
              <div class="info-card border-success">
                <div class="card-icon text-vuegreen"><i class="fa-solid fa-cloud-arrow-up"></i></div>
                <h3>Render.com CD</h3>
                <p>Verknüpfte Build-Pipelines deployen das Projekt vollautomatisch bei jedem Github-Merge (Zero-Downtime).</p>
              </div>
              <div class="info-card border-indigo">
                <div class="card-icon text-indigo"><i class="fa-solid fa-server"></i></div>
                <h3>Express Static</h3>
                <p>Der Node.js Server dient zeitgleich als API-Provider und Hoster der statisch kompilierten Frontend-Assets.</p>
              </div>
              <div class="info-card border-emerald">
                <div class="card-icon text-emerald"><i class="fa-solid fa-database"></i></div>
                <h3>MongoDB Atlas</h3>
                <p>Gehosteter Cloud-Datenbank-Cluster mit IP-Sperre für maximale Datensicherheit.</p>
              </div>
            </div>
          </div>

          <!-- FOLIE 15: Projektergebnis & Ausblick -->
          <div v-else-if="slides[currentSlide].layout === 'summary'" class="layout-summary">
            <h2 class="slide-title">Projektergebnis &amp; Highlights</h2>
            <div class="two-column">
              <div>
                <h3>Erreichte Meilensteine</h3>
                <ul>
                  <li><strong>Hohe Systemstabilität:</strong> Mongoose-Schema-Validierungen fangen Fehleingaben datenbankseitig ab.</li>
                  <li><strong>DSGVO-Konformität:</strong> Revisionssichere Audit-Logs sowie verschlüsselte Passworthashs.</li>
                  <li><strong>Automatisierte DevOps-Kette:</strong> Schnelle Buildzeiten und fehlerfreie Cloud-Auslieferungen.</li>
                </ul>
              </div>
              <div class="highlight-tile">
                <div class="highlight-num">100%</div>
                <p class="highlight-label">Einsatzbereit &amp; Cloud-Hosted</p>
                <p class="highlight-sub">Erfolgreich getestet im simulierten HR-Alltag.</p>
              </div>
            </div>
          </div>

          <!-- FOLIE 16: Outro / Q&A -->
          <div v-else-if="slides[currentSlide].layout === 'outro'" class="layout-outro">
            <h1 class="outro-heading">
              Vielen Dank für Ihre <span class="text-gradient">Aufmerksamkeit!</span>
            </h1>
            <p class="outro-sub">Wir freuen uns auf Ihre Fragen und die gemeinsame Diskussion.</p>
            <div class="outro-badges">
              <div class="outro-badge"><i class="fa-brands fa-github"></i> github.com/htl-it/zeiterfassung</div>
              <div class="outro-badge"><i class="fa-solid fa-server text-vuegreen"></i> zeiterfassung.onrender.com</div>
            </div>
            <div class="outro-meta">
              Ahmad Alalan &amp; Nawal Kayal &bull; HTL IT Diplomarbeit 2026
            </div>
          </div>

          <!-- Folienzähler unten rechts -->
          <div class="slide-counter">
            {{ currentSlide + 1 }} / {{ totalSlides }}
          </div>
        </div>
      </transition>
    </div>

    <!-- Navigationssteuerungen (Buttons) -->
    <div class="presentation-controls">
      <button 
        @click="prevSlide" 
        :disabled="currentSlide === 0" 
        class="ctrl-btn"
        title="Zurück (Pfeiltaste Links)"
      >
        <i class="fa-solid fa-chevron-left"></i>
      </button>
      <button 
        @click="nextSlide" 
        :disabled="currentSlide === totalSlides - 1" 
        class="ctrl-btn"
        title="Weiter (Pfeiltaste Rechts / Leertaste)"
      >
        <i class="fa-solid fa-chevron-right"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

// Index der aktuellen Folie (0-basiert)
const currentSlide = ref(0);

const slides = [
  { id: 'slide1', category: 'Diplomarbeit • HTL IT 2026', layout: 'title' },
  { id: 'slide2', category: '01 / Sektionen & Agenda', layout: 'agenda' },
  { id: 'slide3', category: '01 / Problemstellung', layout: 'problem' },
  { id: 'slide4', category: '02 / Systemarchitektur', layout: 'architecture' },
  { id: 'slide5', category: '02 / Software-Architektur', layout: 'models-user' },
  { id: 'slide6', category: '02 / Software-Architektur', layout: 'models-work' },
  { id: 'slide7', category: '02 / Software-Architektur', layout: 'models-compliance' },
  { id: 'slide8', category: '03 / IT-Security & Middleware', layout: 'security-token' },
  { id: 'slide9', category: '03 / IT-Security & Middleware', layout: 'security-payload' },
  { id: 'slide10', category: '03 / IT-Security & Middleware', layout: 'controller-leave' },
  { id: 'slide11', category: '03 / IT-Security & Middleware', layout: 'controller-rest' },
  { id: 'slide12', category: '04 / Frontend-Schnittstellen', layout: 'frontend-vue' },
  { id: 'slide13', category: '05 / DevOps & Repository', layout: 'git' },
  { id: 'slide14', category: '05 / DevOps & Repository', layout: 'deployment' },
  { id: 'slide15', category: '06 / Fazit', layout: 'summary' },
  { id: 'slide16', category: 'Abschluss', layout: 'outro' }
];

const totalSlides = slides.length;

const agendaItems = [
  { num: '01', title: 'Einleitung', desc: 'Problemstellung, Motivation und Projektziele.' },
  { num: '02', title: 'Architektur & Daten', desc: 'Express.js Backend, Mongoose ODM-Datenmodelle & Indizes.' },
  { num: '03', title: 'IT-Sicherheit', desc: 'JWT Token-Sicherung, NoSQL Payload Filter & Rate Limiting.' },
  { num: '04', title: 'Frontend & Logik', desc: 'Vue.js 3 Webapplikation, Dienstplanung & Urlaubs-Workflows.' },
  { num: '05', title: 'Git & Deployment', desc: 'Continuous Deployment auf Render.com und MongoDB Atlas.' }
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

// Tastaturnavigation für einen flüssigen Vortrag
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

  background-color: var(--bg-primary);
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  font-family: 'Inter', sans-serif;
  color: var(--text-main);
  padding: 40px 0;
  box-sizing: border-box;
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
  width: 1280px;
  height: 720px;
  background-color: var(--bg-secondary);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
}

.slide-canvas {
  width: 100%;
  height: 100%;
  padding: 50px 70px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
}

/* Header */
.slide-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
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

/* Folientitel */
.slide-title {
  font-family: 'Poppins', sans-serif;
  font-size: 38px;
  font-weight: 700;
  margin: 0 0 35px 0;
  letter-spacing: -0.5px;
  border-left: 5px solid var(--color-vuegreen);
  padding-left: 18px;
  color: #fff;
}

/* Layouts */
.two-column {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: stretch;
}

.three-column {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 25px;
}

/* Karten & Boxen */
.info-card {
  background-color: var(--bg-card);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 30px;
  transition: transform 0.2s ease, border-color 0.2s ease;
  display: flex;
  flex-direction: column;
}

.info-card:hover {
  border-color: var(--border-glow);
}

.info-card h3 {
  font-size: 22px;
  margin-top: 0;
  margin-bottom: 18px;
  color: #fff;
}

.info-card ul {
  margin: 0;
  padding-left: 20px;
}

.info-card li {
  font-size: 16px;
  margin-bottom: 12px;
  color: var(--text-muted);
}

.card-icon {
  font-size: 36px;
  margin-bottom: 15px;
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
  font-size: 16px;
}

/* Agenda Folie */
.agenda-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.agenda-item {
  display: flex;
  gap: 20px;
  background-color: var(--bg-card);
  padding: 20px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.03);
}

.agenda-num {
  font-family: 'Poppins', sans-serif;
  font-size: 32px;
  font-weight: 700;
  color: var(--color-primary);
  line-height: 1;
}

.agenda-text h3 {
  font-size: 18px;
  margin: 0 0 6px 0;
  color: #fff;
}

.agenda-text p {
  font-size: 14px;
  margin: 0;
  color: var(--text-muted);
}

/* Architecture Flow */
.architecture-flow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 40px;
}

.flow-step {
  flex: 1;
  background-color: var(--bg-card);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 30px 20px;
  text-align: center;
  max-width: 300px;
}

.highlight-step {
  border-color: var(--color-primary);
  background-color: rgba(99, 102, 241, 0.08);
  box-shadow: 0 0 15px rgba(99, 102, 241, 0.1);
}

.step-icon {
  font-size: 40px;
  color: var(--color-vuegreen);
  margin-bottom: 15px;
}

.highlight-step .step-icon {
  color: var(--color-primary);
}

.flow-step h4 {
  font-family: 'Poppins', sans-serif;
  font-size: 18px;
  margin: 0 0 10px 0;
  color: #fff;
}

.flow-step p {
  font-size: 14px;
  margin: 0;
  color: var(--text-muted);
}

.flow-arrow {
  font-size: 24px;
  color: var(--text-muted);
}

/* Code-Box Styles */
.code-box {
  background-color: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  overflow-x: auto;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13.5px;
  line-height: 1.45;
  color: #e2e8f0;
}

.code-keyword { color: #f472b6; }
.code-string { color: #34d399; }
.code-comment { color: #64748b; font-style: italic; }
.code-func { color: #60a5fa; }
.code-number { color: #fbbf24; }

/* Performance Diagramm */
.performance-chart-box {
  background-color: var(--bg-card);
  border-radius: 12px;
  padding: 25px;
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.performance-chart-box h4 {
  font-size: 16px;
  margin: 0 0 25px 0;
  text-align: center;
}

.bar-chart {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 200px;
  padding-bottom: 20px;
}

.bar-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  justify-content: flex-end;
  width: 80px;
}

.bar-fill {
  width: 40px;
  border-radius: 6px 6px 0 0;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
}

.webpack { background: linear-gradient(180deg, var(--color-danger), #7f1d1d); }
.vite { background: linear-gradient(180deg, var(--color-primary), #312e81); }
.hmr { background: linear-gradient(180deg, var(--color-vuegreen), #064e3b); }

.bar-title {
  font-size: 11px;
  margin-top: 10px;
  color: var(--text-muted);
  text-align: center;
}

/* Tabellen */
.workflow-table-box {
  background-color: var(--bg-card);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.presentation-table {
  width: 100%;
  border-collapse: collapse;
}

.presentation-table th {
  text-align: left;
  padding: 12px;
  font-size: 14px;
  color: var(--text-muted);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.presentation-table td {
  padding: 14px 12px;
  font-size: 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  color: var(--text-muted);
}

/* Git Diagramm */
.git-diagram {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  padding: 40px;
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
  height: 40px;
  background-color: rgba(255, 255, 255, 0.15);
  margin: 10px 0;
  position: relative;
}

/* Highlight Tile */
.highlight-tile {
  background-color: rgba(16, 185, 129, 0.05);
  border: 1px solid rgba(16, 185, 129, 0.15);
  border-radius: 16px;
  padding: 40px;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.highlight-num {
  font-size: 64px;
  font-weight: 800;
  color: var(--color-success);
}

.highlight-label {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  margin: 10px 0 5px 0;
}

.highlight-sub {
  font-size: 13px;
  color: var(--text-muted);
}

/* Outro */
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

/* Folienzähler */
.slide-counter {
  position: absolute;
  bottom: 35px;
  right: 50px;
  font-size: 14px;
  color: var(--text-muted);
  font-family: 'JetBrains Mono', monospace;
  background-color: rgba(255, 255, 255, 0.03);
  padding: 4px 12px;
  border-radius: 20px;
}

/* Controls */
.presentation-controls {
  margin-top: 25px;
  display: flex;
  gap: 15px;
}

.ctrl-btn {
  background-color: var(--bg-secondary);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--text-main);
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.ctrl-btn:hover:not(:disabled) {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  transform: translateY(-2px);
}

.ctrl-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* Vue Animations */
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

/* Utilities */
.border-danger { border-color: rgba(239, 68, 68, 0.2) !important; }
.border-success { border-color: rgba(16, 185, 129, 0.2) !important; }
.border-indigo { border-color: rgba(99, 102, 241, 0.2) !important; }
.border-emerald { border-color: rgba(16, 185, 129, 0.2) !important; }
.text-danger { color: var(--color-danger); }
.text-success { color: var(--color-success); }
.text-vuegreen { color: var(--color-vuegreen); }
.text-indigo { color: var(--color-primary); }
.text-emerald { color: #10b981; }
</style>