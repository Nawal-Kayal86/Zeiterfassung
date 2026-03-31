# 3. Technische Architektur / Ahmad /

Eine auf Robustheit, Geschwindigkeit und Sicherheit ausgelegte Software erfordert ein weitsichtiges architektonisches Fundament. Im Zentrum dieses Kapitels steht die technische Grundausrichtung (Tech-Stack) des Zeiterfassungssystems. Das Projekt wurde von Beginn an als moderne Client-Server-Architektur konzipiert. Die Entscheidung fiel auf den etablierten MEVN-Stack (MongoDB, Express.js, Vue.js, Node.js), der eine durchgängige Entwicklung in JavaScript auf allen Ebenen ermöglicht.

## 3.1 Backend-Architektur

Das Backend trägt die alleinige Verantwortung für die Geschäftslogik, die Datenhaltung sowie die Zugangsprüfung (Authentifizierung). Es agiert als zentraler, zustandsloser (stateless) API-Server, der Anfragen (Requests) von autorisierten Clients entgegennimmt, validiert und entsprechende Antworten (Responses) im JSON-Format liefert.

### 3.1.1 Datenbankdesign mit MongoDB

Als Datenbanktechnologie wurde MongoDB gewählt. Im Gegensatz zu relationalen Systemen (wie MySQL) bietet eine dokumentenbasierte NoSQL-Datenbank den entscheidenden Vorteil struktureller Flexibilität, da das Einpflegen neuer Felder – etwa bei einer zukünftigen NFC-Integration – keine komplexen Migrationsroutinen erfordert.

Die Modellierung der Datenschemata (Schemas) erfolgt über den Object Data Modeling (ODM) Layer _Mongoose_. Sechs primäre Collections bilden den logischen Kern:

1. **Users:** Speichert Stammdaten, kryptografisch gehashte Passwörter (via `bcrypt`) sowie Berechtigungsrollen und Abteilungskürzel.
2. **WorkSessions (Stempelzeiten):** Die kritischste Entität. Jedes Dokument referenziert via `ObjectId` den zugehörigen Mitarbeiter und besitzt persistierte Zeitstempel für `start_time` und `end_time` sowie die Dauer der absolvierten Pausen.
3. **LeaveRequests (Urlaube):** Entitäten für beantragte Urlaubstage oder sonstige Abwesenheiten, untergliedert durch State-Status-Strings (`pending`, `approved`, `rejected`).
4. **Departments:** Eine Referenztabelle der Abteilungen eines Unternehmens.
5. **Logs & Workflow:** Speichern Fehler, Server-Ereignisse und asynchrone Prozesszyklen, was die Nachverfolgbarkeit (Audit Trail) durch den Administrator ermöglicht.

### 3.1.2 API-Struktur und Routing-System

Die Kommunikation zwischen Frontend und Backend basiert auf den Prinzipien einer RESTful-Architektur (Representational State Transfer). Entitäten (wie Benutzer oder Schichten) sind über eindeutige URLs (Endpoints) gekapselt, beispielsweise `/api/users` oder `/api/workSessions`.

- **GET-Requests:** Zum Abrufen von Ressourcen (z. B. das Laden aller gebuchten Arbeitszeiten eines Monats für einen User).
- **POST-Requests:** Zur Neuanlage von Entitäten, wie dem Erstellen eines neuen User-Logins oder dem Auslösen eines neuen Stempelvorgangs ("Start").
- **PUT/PATCH-Requests:** Zum Aktualisieren bestehender Datensätze, etwa bei der Genehmigung (`approve`) eines Urlaubsantrags.
- **DELETE-Requests:** Für administrative Bereinigungen.

Die Orchestrierung dieser Routen im Node.js-Server ist modular über `express.Router()` realisiert. Dies beugt unübersichtlichem "Spaghetti-Code" in der Haupt-Serverdatei (`server.js`) vor, da jeder Domänen-Kontext (Nutzerverwaltung vs. Urlaubsgeschäft) über eine eigene Datei (wie `routes/users.js`, `routes/leaveRequests.js`) logisch getrennt gewartet wird.

### 3.1.3 Sicherheitskonzept und Middleware-Konfiguration

Um den Datenschutzvorgaben gerecht zu werden, kommt eine bewährte JWT-Strategie zum Einsatz. JSON Web Tokens stellen sicher, dass serverseitig keine Sitzungsinformationen (Sessions) vorgehalten werden müssen (Stateless Authentication). Im Zuge des Logins verifiziert der Server das Kennwort mit dem Hash aus der Datenbank. Bei Erfolg generiert das Backend ein digital signiertes Token (`process.env.JWT_SECRET`), welches die Role des Subjekts enthält und dem Client für weitere Anfragen übergeben wird.

Die Kontrolle der API-Endpunkte ist über eine zentrale Express-Middleware (`auth.js`) gelöst:

- Ein ankommender Sub-Request wird abgefangen.
- Es wird auf die Präsenz eines "Bearer Tokens" im Autorisations-Header geprüft.
- Erweist sich das Token als valide (Zeitraum und Signatur), wird geprüft, ob die auf dem Token eingetragene `role` (etwa 'admin') den Endpunkt betreten darf. Erfüllt die Rolle die Metabedingung nicht, unterbricht die Middleware den Request mit dem HTTP-Status 403 (Forbidden), ehe der Controller den Codeblock erreicht.
- Schutz gegen Web-Risiken: Express ist via CORS ("Cross-Origin Resource Sharing") abgesichert.

## 3.2 Technologiestack und Implementierung

Der verwendete Stack kombiniert performante Laufzeitumgebungen mit modernen Toolketten.

### 3.2.1 Backend-Implementierungsdetails (Node.js/Express)

Das Backend ist als ECMAScript-Modul (ESM, `type: module` in der package.json) aufgebaut. Dies erlaubt die Verwendung der modernen `import`-Syntax, die in Vanilla-JavaScript-Umgebungen State-of-the-Art ist. Durch die asynchrone Architektur (Single-Threaded, Event Loop) von Node.js bewältigt der Server hunderte simulierte gleichzeitige Stempelvorgänge von Mitarbeitenden, ohne zu blockieren, da sämtliche C.R.U.D.-Datenbankzugriffe der Mongoose-Bibliothek auf Non-Blocking-I/O-Verfahren basieren.

### 3.2.2 Frontend-Implementierungsdetails (Vue 3/Vite)

Für die Frontend-Darstellung fiel die Entscheidung auf Vue.js (Version 3) – explizit auf Grund der reaktiven Composition API. Anstelle traditioneller Optionen lagert die Composition API Logiken effizient aus und veredelt die Wartbarkeit drastisch.

Zur Übersetzung und Generierung der Vue-Applikation wird nicht mehr auf herkömmliches Webpack, sondern auf _Vite_ gesetzt. Vite kompiliert auf Basis nativer ES-Module und verkürzte die Kaltstart- und "Hot Module Replacement (HMR)"-Zeiten in der Projektentwicklung beträchtlich, wodurch Feedback-Zyklen massiv optimiert wurden.
Die Kommunikation mit dem Backend regelt die populäre HTTP-Bibliothek `Axios`, welche um globale Interceptors ergänzt wird, die bei jeder Anfrage das zur Sitzung gehörende JWT in den Header infundieren.

### 3.2.3 Entwicklungsumgebung und Deployment-Strategie (Render)

Für den reibungslosen Übergang vom lokalen Code (`localhost`) zum auslieferbaren Cloud-Release kam eine durchdachte Deployment-Strategie zum Einsatz.
Das Backend (Node.js) und das finale Build-Verzeichnis des Frontends (erzeugt durch `npm run build` im Vite-Kontext) werden bei Render (PaaS) als gemeinsamer Web-Service veröffentlicht. Eine Besonderheit der Architektur zeigt sich in der `server.js` am Fallback-Routing `app.get('*', ... )`, die dafür sorgt, dass nicht von der Backend-API gefangene Routen in die kompilierte `index.html` der Single-Page-Application geleitet werden – so obliegt das Client-Side-Routing alleinig dem `vue-router` und 404-Fehler beim Navigieren werden vollständig negiert. Dies garantiert einen robusten und skalierenden Dauerbetrieb der Anwendung im World Wide Web.
