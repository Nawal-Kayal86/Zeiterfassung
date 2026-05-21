<template>
  <div class="presentation-wrapper">
    <!-- Fortschrittsbalken am oberen Bildschirmrand -->
    <div class="progress-bar-container">
      <div 
        class="progress-bar-fill" 
        :style="{ width: `${((currentSlide + 1) / totalSlides) * 100}%` }"
      ></div>
    </div>

    <!-- Haupt-Präsentationsbereich im standardisierten 16:9-Format -->
    <div class="slide-viewport">
      <transition name="slide" mode="out-in">
        <div :key="currentSlide" class="slide-canvas">
          
          <!-- Header -->
          <div class="slide-header">
            <span class="category-badge">
              Kapitel {{ Math.ceil((currentSlide + 1) / 5) }} / Sektion {{ currentSlide + 1 }}
            </span>
            <div class="system-tag">
              <i class="fa-solid fa-server"></i> Backend Architecture Spec
            </div>
          </div>

          <!-- FOLIE 1: Titelblatt -->
          <div v-if="currentSlide === 0" class="layout-title">
            <span class="title-sub">DIPLOMARBEIT &bull; DEEP DIVE</span>
            <h1 class="main-heading">
              Backend-Architektur &amp;<br />
              <span class="text-gradient">Datenbankschemas</span>
            </h1>
            <p class="project-subtitle">
              Analyse der RESTful API-Strukturen, Mongoose-ODM-Modelle, IT-Sicherheitsprotokolle und hierarchischen Freigabeprozesse.
            </p>
            <div class="project-authors">
              <span class="author-tag"><i class="fa-solid fa-code text-vuegreen"></i> Express.js App</span>
              <span class="author-tag"><i class="fa-solid fa-database text-indigo"></i> MongoDB Atlas</span>
            </div>
          </div>

          <!-- FOLIE 2: Strukturübersicht -->
          <div v-else-if="currentSlide === 1" class="layout-content">
            <h2 class="slide-title">Übersicht der Datenfluss-Architektur</h2>
            <div class="two-column">
              <div>
                <p class="description">
                  Unser Backend trennt die Verantwortungsbereiche strikt nach dem <strong>MVC- / Layered-Architekturmuster</strong>:
                </p>
                <ul>
                  <li><i class="fa-solid fa-check text-vuegreen"></i> <strong>Schnittstelle (Routes):</strong> Definition der HTTP-Endpunkte &amp; Middleware-Verteilung</li>
                  <li><i class="fa-solid fa-check text-vuegreen"></i> <strong>Controller:</strong> Extraktion von HTTP-Parametern &amp; Status-Mapping</li>
                  <li><i class="fa-solid fa-check text-vuegreen"></i> <strong>Service-Schicht:</strong> Reine, vom Web-Framework entkoppelte Business-Logik</li>
                  <li><i class="fa-solid fa-check text-vuegreen"></i> <strong>Datenbank (ODM Models):</strong> Mongoose-Schemadefinitionen mit Validierung</li>
                </ul>
              </div>
              <div class="code-box">
                <div class="flow-preview">
                  <div class="text-vuegreen">[Client Request]</div>
                  <div class="flow-arrow">&rarr; Express Router (Middlewares)</div>
                  <div class="flow-arrow">&rarr; Controller (Params / Body)</div>
                  <div class="flow-arrow">&rarr; Business Service (DB Queries)</div>
                  <div class="flow-arrow">&rarr; MongoDB Document Mutation</div>
                </div>
              </div>
            </div>
          </div>

          <!-- FOLIE 3: User & WorkSchedule Modell -->
          <div v-else-if="currentSlide === 2" class="layout-content">
            <h2 class="slide-title">Modellierung: User.js &amp; WorkSchedule.js</h2>
            <div class="two-column">
              <div>
                <h3>Entkopplung für optimale Performance</h3>
                <p class="description">
                  Benutzerstammdaten und detaillierte Tages-Sollzeitraster werden in getrennten Collections verwaltet, um Datenredundanzen zu vermeiden:
                </p>
                <ul>
                  <li><strong>User.js:</strong> Speichert primäre Zugangsdaten, Bcrypt-Passworthash, Rolle, NFC-Tag ID und Eintritts-/Austrittsdaten.</li>
                  <li><strong>WorkSchedule.js:</strong> Erzwingt eine performante 1:1-Relation via <code>unique: true</code> auf <code>user_id</code>. Definiert Soll-Uhrzeiten im Standard-Stringformat.</li>
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

          <!-- FOLIE 4: WorkSession Modell -->
          <div v-else-if="currentSlide === 3" class="layout-content">
            <h2 class="slide-title">Modellierung: WorkSession.js</h2>
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
                <h3>Abrechnungs- &amp; Stempelungsdaten</h3>
                <p class="description">
                  Dieses transaktionale Hauptschema speichert sämtliche operativen Stempelvorgänge eines Mitarbeiters für das Lohnabrechnungssystem:
                </p>
                <ul>
                  <li><strong>Präzise ISO-Zeitstempel:</strong> <code>start_time</code> ("Kommen") und <code>end_time</code> ("Gehen") zur sekundengenauen Nettozeitberechnung.</li>
                  <li><strong>Saldo-Datenbankfelder:</strong> Speichert Ist-Stunden, Sollvorgaben, Pausen sowie Gleitzeitkonten-Überträge (<code>salGes</code>).</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- FOLIE 5: LeaveRequest Modell -->
          <div v-else-if="currentSlide === 4" class="layout-content">
            <h2 class="slide-title">Modellierung: LeaveRequest.js</h2>
            <div class="two-column">
              <div>
                <h3>Zustandsautomaten für Anträge</h3>
                <p class="description">
                  Das Urlaubskonto sowie Krankenstand- und Zeitausgleichsanträge werden über das <code>LeaveRequest</code>-Modell abgewickelt:
                </p>
                <ul>
                  <li><strong>Abwesenheits-Typen:</strong> Typisiert über ein strenges Enum (<code>vacation</code>, <code>sick</code>, <code>other</code>, <code>overtime</code>).</li>
                  <li><strong>Zustands-Verfolgung:</strong> Antragsstatus wechseln kontrolliert von <code>pending</code> auf <code>approved</code> oder <code>rejected</code>.</li>
                  <li><strong>Audit-Verlinkung:</strong> Speichert das freigebende Vorgesetzten-Dokument im Feld <code>decided_by</code>.</li>
                </ul>
              </div>
              <div class="code-box">
                <pre><code><span class="code-keyword">const</span> LeaveRequestSchema = <span class="code-keyword">new</span> Schema({
  user_id: { type: Schema.Types.ObjectId, ref: <span class="code-string">"User"</span> },
  from: { type: Date, required: <span class="code-keyword">true</span> },
  to: { type: Date, required: <span class="code-keyword">true</span> },
  type: { 
    type: String, 
    enum: [<span class="code-string">"vacation"</span>, <span class="code-string">"sick"</span>, <span class="code-string">"overtime"</span>] 
  },
  status: { type: String, default: <span class="code-string">"pending"</span> }
});</code></pre>
              </div>
            </div>
          </div>

          <!-- FOLIE 6: Department & Holiday Modelle -->
          <div v-else-if="currentSlide === 5" class="layout-content">
            <h2 class="slide-title">Modellierung: Department.js &amp; Holiday.js</h2>
            <div class="two-column">
              <div class="code-box">
                <pre><code><span class="code-keyword">const</span> HolidaySchema = <span class="code-keyword">new</span> Schema({
  year: { type: Number, required: <span class="code-keyword">true</span> },
  state: { type: String, default: <span class="code-string">"W"</span> },
  holidays: [{ date: String, name: String }],
  ferien: [{ name: String, start: String, end: String }]
});
HolidaySchema.index(
  { year: <span class="code-number">1</span>, state: <span class="code-number">1</span> }, 
  { unique: <span class="code-keyword">true</span> }
);</code></pre>
              </div>
              <div>
                <h3>Stammdaten &amp; Kalender-Schnittstellen</h3>
                <p class="description">
                  Gewährleisten saubere relationale Integrität und korrekte, regionale Feiertagsgutschriften:
                </p>
                <ul>
                  <li><strong>Abteilungen:</strong> Das <code>DepartmentSchema</code> sorgt mit unique indizierten Namen für eine redundanzfreie Abteilungsstruktur.</li>
                  <li><strong>Feiertags-Kalender:</strong> Sub-Dokumente kapseln Feiertage und Schulferien pro Jahr und Bundesland (z.B. "W" für Wien). Ein Verbundindex erzwingt Eindeutigkeit.</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- FOLIE 7: Schedule & Workflow Modelle -->
          <div v-else-if="currentSlide === 6" class="layout-content">
            <h2 class="slide-title">Modellierung: Schedule.js &amp; Workflow.js</h2>
            <div class="two-column">
              <div>
                <h3>Schichten &amp; Task-Management</h3>
                <p class="description">
                  Zwei Hilfs-Schemata unterstützen die Personalplanung sowie administrative System-Workflows:
                </p>
                <ul>
                  <li><strong>Schichten (Schedule):</strong> Verwaltet Früh-, Spät- und Nachtschichten mitsamt Uhrzeitvorgaben für die Teams.</li>
                  <li><strong>Systemaufgaben (Workflow):</strong> Einfaches State-Tracking (<code>open</code>/<code>done</code>) zur teamübergreifenden Aufgabenerledigung (z.B. Korrekturen von Fehlbuchungen).</li>
                </ul>
              </div>
              <div class="code-box">
                <pre><code><span class="code-keyword">const</span> scheduleSchema = <span class="code-keyword">new</span> Schema({
  name: { type: String, required: <span class="code-keyword">true</span> },
  department: { type: String, required: <span class="code-keyword">true</span> },
  shift: {
    type: String,
    enum: [<span class="code-string">"Frühschicht"</span>, <span class="code-string">"Spätschicht"</span>, <span class="code-string">"Nachtschicht"</span>]
  }
});</code></pre>
              </div>
            </div>
          </div>

          <!-- FOLIE 8: Revisionssicheres Logging -->
          <div v-else-if="currentSlide === 7" class="layout-content">
            <h2 class="slide-title">Revisionssicheres Logging: Log.js</h2>
            <div class="two-column">
              <div class="code-box">
                <pre><code><span class="code-keyword">const</span> LogSchema = <span class="code-keyword">new</span> Schema({
  message: { type: String, required: <span class="code-keyword">true</span> },
  level: { type: String, enum: [<span class="code-string">"INFO"</span>, <span class="code-string">"WARN"</span>, <span class="code-string">"ERROR"</span>] },
  user_id: { type: Schema.Types.ObjectId, ref: <span class="code-string">"User"</span> },
  violation_date: { type: String, default: <span class="code-keyword">null</span> }
});
LogSchema.index({ 
  user_id: <span class="code-number">1</span>, violation_date: <span class="code-number">1</span>, created_at: -<span class="code-number">1</span> 
});</code></pre>
              </div>
              <div>
                <h3>Protokollierung von Anomalien</h3>
                <p class="description">
                  Unser Log-Modell erfasst revisionssicher alle systemkritischen Vorkommnisse und Compliance-Verstöße:
                </p>
                <ul>
                  <li><strong>Gefahrenstufen:</strong> Kategorisierung von Events über <code>INFO</code>, <code>WARN</code> und <code>ERROR</code>.</li>
                  <li><strong>Verbundindex (Compound Index):</strong> Verknüpft Benutzer, Datum und Zeitstempel für lückenlose, extrem performante Systemprüfungen (Audits).</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- FOLIE 9: Sektion 2 Trenner -->
          <div v-else-if="currentSlide === 8" class="layout-section">
            <span class="section-badge">SEKTION 02</span>
            <h1 class="section-title">
              Middleware &amp;<br />
              <span class="text-gradient">IT-Sicherheit</span>
            </h1>
            <p class="section-desc">
              Kryptografischer API-Schutz, Rollenberechtigungen und Abwehrmechanismen gegen Denial-of-Service &amp; Payload-Manipulationen.
            </p>
          </div>

          <!-- FOLIE 10: Authentifizierung (auth.js) -->
          <div v-else-if="currentSlide === 9" class="layout-content">
            <h2 class="slide-title">Authentifizierung &amp; RBAC (auth.js)</h2>
            <div class="two-column">
              <div>
                <h3>Strikte Token-Verifikation</h3>
                <p class="description">
                  Unsere <code>auth.js</code>-Middleware sichert Endpunkte ab, indem sie eingehende Bearer-Tokens dechiffriert:
                </p>
                <ul>
                  <li><strong>Signaturprüfung:</strong> Verhindert Manipulationen durch strikte Einschränkung auf den sicheren <code>HS256</code>-Algorithmus.</li>
                  <li><strong>Audience &amp; Issuer Validierung:</strong> Verifiziert die kryptografische Authentizität der System-Quellen.</li>
                  <li><strong>Inaktivitätsprüfung:</strong> Blockiert gesperrte Benutzerkonten (<code>is_active === false</code>) sofort an der API-Grenze.</li>
                </ul>
              </div>
              <div class="code-box">
                <pre><code><span class="code-keyword">const</span> decoded = jwt.verify(token, process.env.JWT_SECRET, {
  algorithms: [<span class="code-string">"HS256"</span>],
  issuer: <span class="code-string">"zeiterfassung-api"</span>,
  audience: <span class="code-string">"zeiterfassung-client"</span>
});

<span class="code-keyword">const</span> user = <span class="code-keyword">await</span> User.findById(decoded.id)
  .select(<span class="code-string">"_id role is_active department"</span>).lean();</code></pre>
              </div>
            </div>
          </div>

          <!-- FOLIE 11: NoSQL Injection Schutz -->
          <div v-else-if="currentSlide === 10" class="layout-content">
            <h2 class="slide-title">Security: Payload Sanitization</h2>
            <div class="two-column">
              <div class="code-box">
                <pre><code><span class="code-keyword">function</span> <span class="code-func">containsProhibitedKeys</span>(value) {
  <span class="code-keyword">if</span> (!value || <span class="code-keyword">typeof</span> value !== <span class="code-string">"object"</span>) 
    <span class="code-keyword">return</span> <span class="code-keyword">false</span>;
  <span class="code-keyword">return</span> Object.entries(value).some(([key, val]) => {
    <span class="code-keyword">if</span> (key.startsWith(<span class="code-string">"$"</span>) || key.includes(<span class="code-string">"."</span>)) 
      <span class="code-keyword">return</span> <span class="code-keyword">true</span>;
    <span class="code-keyword">return</span> <span class="code-func">containsProhibitedKeys</span>(val);
  });
}</code></pre>
              </div>
              <div>
                <h3>Abwehr von Payload-Injections</h3>
                <p class="description">
                  Unsere in <code>security.js</code> implementierte Middleware schützt vor schädlichen Manipulationsversuchen (z.B. Authentication Bypass via JSON-Injektionen):
                </p>
                <ul>
                  <li><strong>Rekursive Filterung:</strong> Überprüft alle eingehenden payloads (Body, Query, Params) bis in die tiefsten Schachtelungsebenen.</li>
                  <li><strong>Zeichenprüfung:</strong> Fängt MongoDB-Operatoren (wie <code>$gt</code>, <code>$ne</code>) sowie Punkt-Notationen ab und lehnt Anfragen mit HTTP 400 ab.</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- FOLIE 12: Rate Limiter (security.js) -->
          <div v-else-if="currentSlide === 11" class="layout-content">
            <h2 class="slide-title">Security: Brute-Force Rate Limiting</h2>
            <div class="two-column">
              <div>
                <h3>In-Memory Begrenzung</h3>
                <p class="description">
                  Zum Schutz vor unbefugten, automatisierten Loginversuchen per Wörterbuchangriff steuert eine schlanke Rate-Limiting-Logik den Zugang:
                </p>
                <ul>
                  <li><strong>IP-Auflösung:</strong> Berücksichtigt Proxys durch das Auslesen des <code>x-forwarded-for</code> Headers.</li>
                  <li><strong>Retry-After Feedback:</strong> Teilt betroffenen Clients bei Überschreitung (mehr als 5 Fehlversuche) die exakte verbleibende Wartezeit via HTTP-Header und Status 429 mit.</li>
                </ul>
              </div>
              <div class="code-box">
                <pre><code><span class="code-keyword">if</span> (currentEntry &amp;&amp; currentEntry.count &gt;= MAX_ATTEMPTS) {
  res.setHeader(<span class="code-string">"Retry-After"</span>, retryAfterSeconds);
  <span class="code-keyword">return</span> res.status(<span class="code-number">429</span>).json({
    error: <span class="code-string">"Zu viele Login-Versuche. Bitte spaeter."</span>
  });
}</code></pre>
              </div>
            </div>
          </div>

          <!-- FOLIE 13: Sektion 3 Trenner -->
          <div v-else-if="currentSlide === 12" class="layout-section">
            <span class="section-badge">SEKTION 03</span>
            <h1 class="section-title">
              Controllers &amp;<br />
              <span class="text-gradient">Business-Logik</span>
            </h1>
            <p class="section-desc">
              Präsentation des Controller-Service-Patterns, rollenbasierter API-Validierungen und REST-Konventionen.
            </p>
          </div>

          <!-- FOLIE 14: leaveRequestController.js -->
          <div v-else-if="currentSlide === 13" class="layout-content">
            <h2 class="slide-title">Controller: leaveRequestController.js</h2>
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
                <h3>Hierarchische Urlaubsfreigaben</h3>
                <p class="description">
                  Der Abwesenheits-Controller setzt die Berechtigungsstruktur des Unternehmens serverseitig durch:
                </p>
                <ul>
                  <li><strong>Globale Admins:</strong> Besitzen uneingeschränkte Rechte und können alle Anträge im System verwalten.</li>
                  <li><strong>Abteilungsleiter:</strong> Dürfen Anträge ausschließlich bearbeiten und einsehen, wenn der betroffene Mitarbeiter derselben Abteilung (<code>department</code>) zugeordnet ist.</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- FOLIE 15: REST Konventionen -->
          <div v-else-if="currentSlide === 14" class="layout-content">
            <h2 class="slide-title">REST-Konventionen &amp; Services</h2>
            <div class="two-column">
              <div>
                <h3>Saubere API-Spezifikation</h3>
                <p class="description">
                  Unsere Controller delegieren die Anfragen an spezialisierte Services und liefern standardisierte API-Antworten zurück:
                </p>
                <ul>
                  <li><strong>Entkopplung:</strong> Controller enthalten keine Datenbankabfragen, sondern mappen Transport- auf Business-Objekte.</li>
                  <li><strong>HTTP 201 Created:</strong> Liefert nach der Erstellung den Ressourcenpfad über den standardisierten Location-Header zurück.</li>
                </ul>
              </div>
              <div class="code-box">
                <pre><code><span class="code-keyword">export async function</span> <span class="code-func">createDepartmentController</span>(req, res) {
  <span class="code-keyword">const</span> createdDepartment = <span class="code-keyword">await</span> <span class="code-func">createDepartment</span>(req.body);
  <span class="code-func">sendCreated</span>(
    req, res, createdDepartment,
    <span class="code-string">`\${req.baseUrl}/\${createdDepartment.department.id}`</span>
  );
}</code></pre>
              </div>
            </div>
          </div>

          <!-- FOLIE 16: Sektion 4 Trenner -->
          <div v-else-if="currentSlide === 15" class="layout-section">
            <span class="section-badge">SEKTION 04</span>
            <h1 class="section-title">
              DevOps &amp;<br />
              <span class="text-gradient">Deployment</span>
            </h1>
            <p class="section-desc">
              Die Git-Zusammenarbeitsregeln, Continuous Deployment-Pipelines und Cloud-Infrastrukturen in der Übersicht.
            </p>
          </div>

          <!-- FOLIE 17: GitHub Git-Workflow -->
          <div  v-else-if="currentSlide === 16" class="layout-content">
            <h2 class="slide-title">GitHub-Repository &amp; Git-Workflow</h2>
            <div class="two-column">
              <div>
                <p class="description">
                  Die Zusammenarbeit im Entwicklungsteam stützt sich auf etablierte Qualitätsrichtlinien (GitHub Flow):
                </p>
                <ul>
                  <li><i class="fa-solid fa-code-branch text-vuegreen"></i> <strong>Feature Branches:</strong> Jede Funktion wird getrennt und isoliert entwickelt (z.B. <code>feature/security-hardening</code>).</li>
                  <li><i class="fa-solid fa-lock text-vuegreen"></i> <strong>Protected Main:</strong> Direkte Commits auf den Produktionszweig sind systemweit gesperrt.</li>
                  <li><i class="fa-solid fa-code-compare text-vuegreen"></i> <strong>Pull Requests:</strong> Merges erfordern Code-Reviews und die Validierung lokaler Tests.</li>
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
                  <span class="branch-name">feature/security-hardening</span>
                </div>
              </div>
            </div>
          </div>

          <!-- FOLIE 18: Render.com CD -->
          <div v-else-if="currentSlide === 17" class="layout-content">
            <h2 class="slide-title">CI/CD-Pipeline auf Render.com</h2>
            <div class="two-column">
              <div class="code-box">
                <div class="command-block">
                  <span class="comment"># Build Command</span><br>
                  <span class="command">npm install &amp;&amp; npm run build</span>
                </div>
                <div class="command-block mt-4">
                  <span class="comment"># Start Command</span><br>
                  <span class="command">node backend/server.js</span>
                </div>
              </div>
              <div>
                <h3>Automatisierte Cloud-Auslieferung</h3>
                <p class="description">
                  Unsere Live-Instanz ist direkt an das GitHub-Repository angebunden und liefert Änderungen vollautomatisch aus:
                </p>
                <ul>
                  <li><strong>Web-Trigger:</strong> Jeder erfolgreiche PR-Merge auf den <code>main</code>-Zweig startet die Cloud-Build-Pipeline.</li>
                  <li><strong>Zero-Downtime Deployment:</strong> Die alte Serverinstanz bleibt solange aktiv, bis der neue Build den automatischen System-Healthcheck besteht.</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- FOLIE 19: MongoDB Atlas Cloud-Infrastruktur -->
          <div v-else-if="currentSlide === 18" class="layout-content">
            <h2 class="slide-title">Cloud-Infrastruktur: MongoDB Atlas</h2>
            <div class="three-column">
              <div class="info-card border-success text-center">
                <div class="card-icon text-vuegreen"><i class="fa-solid fa-cloud"></i></div>
                <h3>Verteilter Cluster</h3>
                <p>Gehostet im managed Cloud-Netzwerk mit automatischen Backups &amp; Sharding-Optionen.</p>
              </div>
              <div class="info-card border-indigo text-center">
                <div class="card-icon text-indigo"><i class="fa-solid fa-network-wired"></i></div>
                <h3>IP-Sperre</h3>
                <p>Der Datenbankzugriff ist streng limitiert und erlaubt nur Whitelist-Anfragen von Render.com.</p>
              </div>
              <div class="info-card border-emerald text-center">
                <div class="card-icon text-emerald"><i class="fa-solid fa-key"></i></div>
                <h3>Secure URI</h3>
                <p>Der Verbindungsaufbau erfolgt verschlüsselt über in der Cloud hinterlegte Environment Variables (<code>MONGODB_URI</code>).</p>
              </div>
            </div>
          </div>

          <!-- FOLIE 20: Outro & Fragen -->
          <div v-else-if="currentSlide === 19" class="layout-outro">
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

          <!-- Foliennummerierung unten rechts -->
          <div class="slide-counter">
            {{ currentSlide + 1 }} / {{ totalSlides }}
          </div>
        </div>
      </transition>
    </div>

    <!-- Navigationssteuerungen unten -->
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
const totalSlides = 20;

const slides = [
  { id: 'slide1', category: 'Diplomarbeit • HTL IT 2026', layout: 'title' },
  { id: 'slide2', category: '01 / Datenfluss-Architektur', layout: 'agenda' },
  { id: 'slide3', category: '01 / Datenbankschemas', layout: 'models-user' },
  { id: 'slide4', category: '01 / Datenbankschemas', layout: 'models-work' },
  { id: 'slide5', category: '01 / Datenbankschemas', layout: 'models-leave' },
  { id: 'slide6', category: '01 / Datenbankschemas', layout: 'models-dept' },
  { id: 'slide7', category: '01 / Datenbankschemas', layout: 'models-schedule' },
  { id: 'slide8', category: '01 / Datenbankschemas', layout: 'models-log' },
  { id: 'slide9', category: '02 / IT-Security & Middleware', layout: 'section' },
  { id: 'slide10', category: '02 / IT-Security & Middleware', layout: 'security-token' },
  { id: 'slide11', category: '02 / IT-Security & Middleware', layout: 'security-payload' },
  { id: 'slide12', category: '02 / IT-Security & Middleware', layout: 'security-limit' },
  { id: 'slide13', category: '03 / Controllers & Business-Logik', layout: 'section' },
  { id: 'slide14', category: '03 / Controllers & Business-Logik', layout: 'controller-leave' },
  { id: 'slide15', category: '03 / Controllers & Business-Logik', layout: 'controller-rest' },
  { id: 'slide16', category: '04 / DevOps & Deployment', layout: 'section' },
  { id: 'slide17', category: '04 / DevOps & Deployment', layout: 'git' },
  { id: 'slide18', category: '04 / DevOps & Deployment', layout: 'deployment-render' },
  { id: 'slide19', category: '04 / DevOps & Deployment', layout: 'deployment-atlas' },
  { id: 'slide20', category: 'Abschluss', layout: 'outro' }
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
  justify-content: flex-start;
  height: 100%;
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

/* Navigationssteuerungen (Buttons) */
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