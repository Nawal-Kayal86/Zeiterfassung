# 3. Technische Architektur

Eine auf Robustheit, Geschwindigkeit und Sicherheit ausgelegte Software erfordert ein weitsichtiges architektonisches Fundament. Im Zentrum dieses Kapitels steht die technische Grundausrichtung (Tech-Stack) des Zeiterfassungssystems. Das Projekt wurde von Beginn an als moderne Client-Server-Architektur konzipiert. Die Entscheidung fiel auf den etablierten MEVN-Stack (MongoDB, Express.js, Vue.js, Node.js), der eine durchgängige Entwicklung in JavaScript auf allen Ebenen ermöglicht.

Die Architektur folgt dem Prinzip der strikten Schichtentrennung (Separation of Concerns): Das Frontend ist ausschließlich für die Darstellung und Benutzerinteraktion zuständig, das Backend verwaltet die Geschäftslogik und den Datenzugriff, und die Datenbank sorgt für die persistente Speicherung. Diese Trennung ermöglicht es, einzelne Schichten unabhängig voneinander weiterzuentwickeln, zu testen und zu skalieren.

## 3.1 Backend-Architektur

Das Backend trägt die alleinige Verantwortung für die Geschäftslogik, die Datenhaltung sowie die Zugangsprüfung (Authentifizierung). Es agiert als zentraler, zustandsloser (stateless) API-Server, der Anfragen (Requests) von autorisierten Clients entgegennimmt, validiert und entsprechende Antworten (Responses) im JSON-Format liefert.

Der Backend-Server ist als monolithische Node.js-Applikation strukturiert, wobei die interne Organisation modular aufgebaut ist. Die Hauptdatei `server.js` initialisiert den Express-Server, bindet die Middleware-Kette ein und registriert die Routenmodule. Jeder fachliche Bereich (Benutzer, Arbeitsschichten, Urlaubsanträge, Abteilungen, Kalender, Workflows, Logs, Dienstpläne) wird durch ein eigenes Routenmodul in `routes/` abgebildet. Die zugehörigen Datenmodelle befinden sich in `models/`.

### 3.1.1 Datenbankdesign mit MongoDB

Als Datenbanktechnologie wurde MongoDB gewählt. Im Gegensatz zu relationalen Systemen (wie MySQL oder PostgreSQL) bietet eine dokumentenbasierte NoSQL-Datenbank den entscheidenden Vorteil struktureller Flexibilität, da das Einpflegen neuer Felder – etwa bei einer zukünftigen NFC-Integration – keine komplexen Migrationsroutinen erfordert. Dokumente werden im BSON-Format (Binary JSON) gespeichert, was eine native Kompatibilität mit JavaScript-Objekten gewährleistet.

Die Modellierung der Datenschemata (Schemas) erfolgt über den Object Data Modeling (ODM) Layer _Mongoose_. Neun primäre Collections bilden den logischen Kern:

1. **Users:** Speichert Stammdaten (Name, E-Mail), kryptografisch gehashte Passwörter (via `bcrypt`), Berechtigungsrollen (user/employee/admin), Abteilungszuordnung, NFC-Tag-ID, Eintrittsdatum, Aktivierungsstatus, jährlichen Urlaubsanspruch, Wochenstunden und einen detaillierten Arbeitszeitplan pro Wochentag (Montag bis Sonntag mit Von/Bis-Zeiten und Aktiv-Flag).
2. **WorkSessions (Stempelzeiten):** Die kritischste Entität. Jedes Dokument referenziert via `ObjectId` den zugehörigen Mitarbeiter und besitzt persistierte Zeitstempel für `start_time` und `end_time` sowie die Dauer der absolvierten Pausen. Zusätzlich enthält jedes Dokument abrechnungsrelevante Felder wie Zeitmodell, Ist-Stunden, Soll-Stunden, Übertrag, Gleitzeitsaldo und diverse Zuschlagsfelder.
3. **LeaveRequests (Urlaube):** Entitäten für beantragte Urlaubstage oder sonstige Abwesenheiten, untergliedert durch State-Status-Strings (`pending`, `approved`, `rejected`). Jeder Antrag speichert Von/Bis-Datum, Urlaubsart (vacation, sick, overtime, other) und eine optionale Begründung.
4. **Departments:** Eine Referenztabelle der Abteilungen eines Unternehmens mit Name und Beschreibung.
5. **Schedules (Dienstpläne):** Persistente Arbeitszeitkonfigurationen pro Benutzer, die separat vom User-Modell verwaltet werden. Enthalten Wochenstunden und tagesweise Schichtdefinitionen.
6. **WorkSchedules (Arbeitszeitmodelle):** Globale Vorlagen für Arbeitszeitmodelle, die mehreren Mitarbeitern zugewiesen werden können.
7. **Holidays (Feiertage):** Jahresabhängige Feiertags-Einträge mit Datum und Bezeichnung, die in die Urlaubstage- und Sollstunden-Berechnungen einfließen.
8. **Logs:** Systemereignisse mit Zeitstempel, Level (info/warn/error) und Nachricht für den administrativen Audit Trail.
9. **Workflows:** Sondertermine (z.B. Arztbesuche) mit Aufgabenbeschreibung, Status und Benutzerreferenz.

### 3.1.2 API-Struktur und Routing-System

Die Kommunikation zwischen Frontend und Backend basiert auf den Prinzipien einer RESTful-Architektur (Representational State Transfer). Entitäten sind über eindeutige URLs (Endpoints) gekapselt. Die API stellt insgesamt acht Routenmodule bereit:

- `/api/users` – Benutzerverwaltung (Login, Registrierung, Profil, Me-Endpoint)
- `/api/workSessions` – Stempelvorgänge (Start, Stop, Manual-Time, Summary)
- `/api/leave-requests` – Urlaubsanträge (CRUD, Statusänderung)
- `/api/departments` – Abteilungsverwaltung
- `/api/schedule` – Individuelle Dienstpläne
- `/api/calendar` – Kalender- und Feiertagsdaten
- `/api/workflow` – Sondertermine und Aufgaben
- `/api/logs` – System-Logs

Für jede Entität werden die Standard-HTTP-Methoden verwendet:

- **GET-Requests:** Zum Abrufen von Ressourcen (z. B. das Laden aller gebuchten Arbeitszeiten eines Monats für einen User).
- **POST-Requests:** Zur Neuanlage von Entitäten, wie dem Erstellen eines neuen User-Logins oder dem Auslösen eines neuen Stempelvorgangs ("Start").
- **PUT/PATCH-Requests:** Zum Aktualisieren bestehender Datensätze, etwa bei der Genehmigung (`approve`) eines Urlaubsantrags.
- **DELETE-Requests:** Für administrative Bereinigungen und das Zurückziehen offener Anträge.

Die Orchestrierung dieser Routen im Node.js-Server ist modular über `express.Router()` realisiert. Dies beugt unübersichtlichem "Spaghetti-Code" in der Haupt-Serverdatei (`server.js`) vor, da jeder Domänen-Kontext (Nutzerverwaltung vs. Urlaubsgeschäft) über eine eigene Datei (wie `routes/users.js`, `routes/leaveRequests.js`) logisch getrennt gewartet wird.

### 3.1.3 Sicherheitskonzept und Middleware-Konfiguration

Um den Datenschutzvorgaben gerecht zu werden, kommt eine bewährte JWT-Strategie zum Einsatz. JSON Web Tokens stellen sicher, dass serverseitig keine Sitzungsinformationen (Sessions) vorgehalten werden müssen (Stateless Authentication). Im Zuge des Logins verifiziert der Server das Kennwort mit dem Hash aus der Datenbank. Bei Erfolg generiert das Backend ein digital signiertes Token (`process.env.JWT_SECRET`), welches die Role des Subjekts enthält und dem Client für weitere Anfragen übergeben wird.

Die Kontrolle der API-Endpunkte ist über eine zentrale Express-Middleware (`auth.js`) gelöst:

- Ein ankommender Request wird abgefangen.
- Es wird auf die Präsenz eines "Bearer Tokens" im Authorization-Header geprüft.
- Erweist sich das Token als valide (Zeitraum und Signatur), wird geprüft, ob die auf dem Token eingetragene `role` (etwa 'admin') den Endpunkt betreten darf. Erfüllt die Rolle die Metabedingung nicht, unterbricht die Middleware den Request mit dem HTTP-Status 403 (Forbidden), ehe der Controller den Codeblock erreicht.
- Schutz gegen Web-Risiken: Express ist via CORS ("Cross-Origin Resource Sharing") abgesichert, sodass nur autorisierte Origins Anfragen stellen dürfen.

Die Passwortspeicherung unterliegt hohen Standards: Die Entkopplung des Klartextpassworts von der Datenbank erfolgt über **Bcrypt (Salting und Hashing)** mit einem konfiguriertem Salt-Runden-Faktor. Selbst bei einem Datenbank-Leak besteht durch massive Rainbow-Table-Angriffe kein akutes Risiko, Klartext-Anmeldedaten zu extrahieren.

## 3.2 Technologiestack und Implementierung

Der verwendete Stack kombiniert performante Laufzeitumgebungen mit modernen Toolketten. Die bewusste Entscheidung für einen homogenen JavaScript-Stack auf allen Ebenen reduziert den Kontextwechsel zwischen verschiedenen Programmiersprachen und ermöglicht Codesharing zwischen Frontend und Backend, beispielsweise bei Validierungslogiken und Datumsformatierungen.

### 3.2.1 Backend-Implementierungsdetails (Node.js/Express)

Das Backend ist als ECMAScript-Modul (ESM, `type: module` in der package.json) aufgebaut. Dies erlaubt die Verwendung der modernen `import`-Syntax, die in Vanilla-JavaScript-Umgebungen State-of-the-Art ist. Durch die asynchrone Architektur (Single-Threaded, Event Loop) von Node.js bewältigt der Server hunderte simulierte gleichzeitige Stempelvorgänge von Mitarbeitenden, ohne zu blockieren, da sämtliche C.R.U.D.-Datenbankzugriffe der Mongoose-Bibliothek auf Non-Blocking-I/O-Verfahren basieren.

Die zentralen Backend-Dependencies umfassen:

- `express` (v4.18) – HTTP-Server und Routing-Framework
- `mongoose` (v8.x) – MongoDB Object Data Modeling
- `jsonwebtoken` (v9.x) – JWT-Generierung und -Validierung
- `bcrypt` (v5.x) – Passwort-Hashing
- `cors` (v2.x) – Cross-Origin Resource Sharing
- `dotenv` (v16.x) – Laden von Umgebungsvariablen aus `.env`-Dateien
- `body-parser` (v1.x) – Parsing von Request-Bodies (JSON)
- `nodemon` (v3.x) – Automatischer Server-Restart bei Code-Änderungen (Development)

### 3.2.2 Frontend-Implementierungsdetails (Vue 3/Vite)

Für die Frontend-Darstellung fiel die Entscheidung auf Vue.js (Version 3) – explizit aufgrund der reaktiven Composition API. Anstelle traditioneller Options-API-Optionen lagert die Composition API Logiken effizient aus und verbessert die Wartbarkeit drastisch durch bessere Code-Organisation und Wiederverwendbarkeit.

Zur Übersetzung und Generierung der Vue-Applikation wird nicht mehr auf herkömmliches Webpack, sondern auf _Vite_ (v7.x) gesetzt. Vite kompiliert auf Basis nativer ES-Module und verkürzt die Kaltstart- und "Hot Module Replacement (HMR)"-Zeiten in der Projektentwicklung beträchtlich, wodurch Feedback-Zyklen massiv optimiert wurden.

Die Frontend-Dependencies umfassen:

- `vue` (v3.3) – Reaktives UI-Framework
- `vue-router` (v4.5) – Client-seitige Navigation
- `axios` (v1.12) – HTTP-Client mit Interceptor-Unterstützung
- `bootstrap` (v5.3) – CSS-Framework und Grid-System
- `@fullcalendar/vue3` (v6.x) – Kalender-Komponente
- `@fullcalendar/daygrid` (v6.x) – Tag/Monat-Ansicht für FullCalendar
- `vue3-toastify` (v0.2) – Toast-Benachrichtigungen
- `html2pdf.js` (v0.14) – Client-seitige PDF-Generierung
- `@vitejs/plugin-vue` (v6.x) – Vite-Plugin für Vue-SFC-Kompilierung

Die Kommunikation mit dem Backend regelt die populäre HTTP-Bibliothek `Axios`, welche um globale Interceptors ergänzt wird, die bei jeder Anfrage das zur Sitzung gehörende JWT in den Header infundieren. Bei einem 401-Response (Unauthorized) leitet der Interceptor automatisch auf die Login-Seite um.

### 3.2.3 Entwicklungsumgebung und Deployment-Strategie (Render)

Für den reibungslosen Übergang vom lokalen Code (`localhost`) zum auslieferbaren Cloud-Release kam eine durchdachte Deployment-Strategie zum Einsatz.

Die lokale Entwicklungsumgebung besteht aus:
- Visual Studio Code als IDE mit Vue-spezifischen Extensions
- Node.js v20+ als Laufzeitumgebung
- Git als Versionskontrollsystem (Repository auf GitHub)
- MongoDB Compass für die lokale Datenbankinspektion

Das Backend (Node.js) und das finale Build-Verzeichnis des Frontends (erzeugt durch `npm run build` im Vite-Kontext) werden bei Render (PaaS) als gemeinsamer Web-Service veröffentlicht. Der Build-Befehl in der `package.json` des Backends orchestriert dabei den gesamten Prozess: `npm install && cd ../frontend && npm install && npm run build`.

Eine Besonderheit der Architektur zeigt sich in der `server.js` am Fallback-Routing `app.get('*', ... )`, die dafür sorgt, dass nicht von der Backend-API gefangene Routen in die kompilierte `index.html` der Single-Page-Application geleitet werden – so obliegt das Client-Side-Routing alleinig dem `vue-router` und 404-Fehler beim Navigieren werden vollständig negiert. Dies garantiert einen robusten und skalierenden Dauerbetrieb der Anwendung im World Wide Web.

Die Datenbank wird über MongoDB Atlas als vollständig verwalteter Cloud-Service (Database-as-a-Service) bereitgestellt. Die Verbindung erfolgt über einen Connection-String in der Umgebungsvariable `MONGODB_URI`, wobei TLS-Verschlüsselung für die Datenübertragung zum Einsatz kommt.
