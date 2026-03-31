# 7. Herausforderungen und Lösungen

Bei der Entwicklung eines Fullstack-Projekts dieser Größenordnung im MEVN-Stack treten unweigerlich technische und architektonische Hürden auf. Dieses Kapitel beleuchtet die Kernprobleme der Umsetzung und deren Lösungsansätze. Die hier dokumentierten Erfahrungen sollen als Referenz für ähnliche Projekte dienen.

## 7.1 Rollenbasierte Zugriffskontrolle – Lösungsansatz

Eine drastische Hürde war die Sicherstellung, dass im Frontend keine Navigationselemente zu Inhalten für den `user` angezeigt werden, die ihm nicht zustanden (`Berichte`, `Mitarbeiter anlegen`). Anstelle die Router-Links (`<router-link>`) hart zu verdrahten, wurde in der dynamischen Navigation auf die im LocalStorage vorgehaltene JWT-Signatur zugegriffen. Über Computed-Properties (Vue.js) wird nun reaktiv überwacht, welche Berechtigung der Nutzer hält, und dementsprechend das Menü aufgebaut.

Die Herausforderung bestand dabei nicht nur im Frontend, sondern insbesondere in der konsistenten Durchsetzung auf Backend-Ebene. Es musste sichergestellt werden, dass auch bei manipulierten Frontend-Requests die API die korrekten Zugriffsrechte erzwingt. Die Lösung war eine zentrale Middleware-Funktion, die als Higher-Order-Function (Closure) implementiert wurde und die erforderliche Rolle als Parameter akzeptiert. Dies ermöglichte eine deklarative Rollenprüfung direkt in der Routen-Definition.

## 7.2 Live-Zeitberechnung im Frontend

Ein UX-Problem stellte die Darstellung des "Live-Timers" auf dem Dashboard dar. Wenn ein Nutzer "Start" drückt, tickt die Uhr hoch. Lädt der Benutzer die Seite neu (F5/Reload), verliert Vue den aktuellen Timer-State, da JavaScript-Variablen nicht über Page-Reloads persistieren.

**Lösung:** Um die Kontinuität wiederherzustellen, rechnet die Vue-Anwendung bei jedem Initialisieren (`created()`) die Serverzeit des "Starts" gegen die aktuelle Browser-Zeit. Ist ein aktueller Datensatz des Servers noch offen (`end_time === null`), startet das Frontend nahtlos die `setInterval`-Tickrate von der kalkulierten Differenz aus. Der Timer beginnt also nicht bei 00:00:00, sondern bei der tatsächlich verstrichenen Zeit (z.B. 02:14:37).

Eine weitere Komplikation entstand durch die Pausenfunktion: Die Pausenzeit wird clientseitig in Sekunden akkumuliert, geht aber bei einem Reload verloren. Da Pausen in der Praxis selten während eines Reloads aktiv sind und die tatsächliche Pausenzeit erst beim "Gehen" an das Backend übermittelt wird, wurde dieser Trade-Off bewusst akzeptiert.

## 7.3 Validierung und Benutzerführung bei Formularen

Nutzer machten häufig den Fehler, leere Formulare (z.B. bei der "Manuellen Zeit-Erfassung") wegzuschicken oder widersprüchliche Pausenzeiten (z. B. "2:70") einzutragen.

**Lösung:** Es wurde ein striktes Client-Side-Validation implementiert. HTML-Felder erfuhren Restriktionen (`required type="time"`). Das Absenden (`submit.prevent`) der Formulare ist unmöglich, solange inkonsistente Zustände vorliegen. Im Workflow-Formular wurde zusätzlich eine Geschäftslogik-Validierung eingebaut: Die Differenz zwischen Start- und Endzeit wird berechnet und mit dem Maximalwert (180 Minuten) verglichen. Fehlermeldungen werden über `alert()` oder `toast.error()` an den Nutzer kommuniziert.

Für den Urlaubsantrag wurde die Validierung noch weiter verfeinert: Neben der chronologischen Prüfung (Start vor Ende) wird auch die Vorschau-Berechnung der Arbeitstage (exklusive Wochenenden und Feiertage) in Echtzeit aktualisiert. Dies gibt dem Antragsteller sofort eine Rückmeldung, wie viele Urlaubstage tatsächlich betroffen sind.

## 7.4 Datenstruktur und Verschachtelung in MongoDB

Ein weiteres komplexes Problem bei der Berichterstellung (`Billing`) lag in der Verschachtelung (`Nesting`) der NoSQL-Datensätze. Eine `WorkSession` speichert nicht den Namen des Nutzers, sondern lediglich redundanzfrei seine `user_id`. Der Versuch, alle Sessions und die zugehörigen Namen der Angestellten in einer Schleife abzufragen (das "N+1 Queries Problem"), führte zu Performance-Engpässen.

**Lösung:** Dieses Problem wurde mithilfe von MongoDB Aggregation Frameworks (`$lookup`, `$unwind`) gelöst. Dies verlagert rechenintensive Map-Reduce-Verfahren (Left-Outer-Joins) auf die Datenbankebene, wodurch Node.js extrem entlastet wird. Statt N+1 Queries wird nur noch eine einzige Aggregation-Pipeline ausgeführt, die alle benötigten Daten in einem Response zurückliefert.

Für die Billing-Ansicht musste zusätzlich die Frage gelöst werden, wie die Soll-Stunden pro Tag ermittelt werden, da diese vom individuellen Arbeitszeitmodell des Mitarbeiters abhängen. Die Lösung war eine zweistufige Query: Zuerst wird das Arbeitszeitmodell des Benutzers geladen, dann werden die WorkSessions geladen und clientseitig mit den Soll-Stunden abgeglichen.

## 7.5 Integration und Darstellung komplexer Kalender-Daten

Die Visualisierung von hunderten Schichten im `@fullcalendar/vue3` führte zum "Überladen" des Viewports (Monatsansicht). Auf kleinen Bildschirmen wurden Kalender-Events zu klein oder unleserlich dargestellt.

**Lösung:** Implementierung intelligenter Filterfunktionen (z. B. Abteilungs-Filter in `Calendar.vue`) und dynamischer Farbcodierungen. Der Backend-Endpunkt konvertiert beim Ausliefern ISO-Datumsstrings in lokal-verträgliche Timestamps, was Parsingfehler in verschiedenen Browsern (insbesondere Apples Safari, der oft Date-Probleme hat) unterband.

Die FullCalendar-Integration erforderte zudem die korrekte Transformation der Datenbankdaten in das Event-Objekt-Format des Kalenders. WorkSessions werden zu blauen Events mit der Arbeitszeit als Titel gemappt, genehmigte Urlaube erscheinen als grüne Balken, und Feiertage werden als rote Hintergrundfarbe des Tageszellen dargestellt.

## 7.6 Hosting & Deployment-Probleme auf Render

Beim Deployment auf den Cloud-Dienstleister Render (Platform-as-a-Service) kam es beim Neuladen (Page-Refresh) der App zu `404 Not Found`-Fehlern, da der Node-Server versuchte, eine API-Route zu adressieren, die eigentlich dem Vue-Router oblag.

**Lösung:** Konfiguration des Express-Backends mit einem Catch-All-Handler:

```javascript
app.get("*", (req, res) => {
  // Ignoriere API falls nicht da
  if (req.path.startsWith("/api")) return res.status(404).end();
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});
```

Damit ist die Single-Page-Application "URL-Deep-Link" fähig und toleriert direkte Link-Aufrufe (z. B. `/dashboard` im URL-Eingabefenster des Chrome-Browsers). Die Reihenfolge der Middleware-Registrierung war hierbei entscheidend: Erst werden die API-Routen registriert, dann die statischen Dateien aus dem `dist`-Verzeichnis, und zuletzt der Catch-All-Handler.

Ein weiteres Deployment-Problem war die Handhabung von Umgebungsvariablen. Auf Render müssen Variablen wie `JWT_SECRET` und `MONGODB_URI` über das Dashboard konfiguriert werden, da keine `.env`-Datei im Produktions-Build vorhanden ist. Die Lösung war die konsequente Verwendung von `process.env` mit Fallback-Werten für die lokale Entwicklung.

## 7.7 Zeitzonenproblematik

Ein subtiles, aber kritisches Problem war die Zeitzonenkonvertierung. Der Server speichert alle Zeiten in UTC, während der Browser des Benutzers die lokale Zeitzone verwendet (z.B. CET/CEST für Österreich). Dies führte initial zu Diskrepanzen: Eine um 08:00 Uhr CET gestempelte Buchung wurde in der Datenbank als 07:00 UTC gespeichert und manchmal fälschlicherweise als "07:00" in der Tabelle angezeigt.

**Lösung:** Eine zentrale Utility-Datei (`utils/time.js`) wurde erstellt, die konsistente Formatierungsfunktionen bereitstellt:

- `formatDate(dt)`: Konvertiert ein UTC-Datum in das lokale Format "dd.mm.yyyy" mittels `toLocaleDateString('de-DE')`
- `formatTime(dt)`: Konvertiert eine UTC-Zeit in das lokale Format "HH:MM" mittels `toLocaleTimeString('de-DE')`
- `calcDuration(start, end)`: Berechnet die Differenz zwischen zwei Timestamps in "HH:MM"-Format

Diese Funktionen werden in allen Komponenten wiederverwendet und garantieren eine konsistente Zeitdarstellung.

---

# Zusammenfassung und Fazit

Das Hauptziel dieses Diplomarbeitsprojektes – die Entwicklung eines vollwertigen, digitalen Zeiterfassungssystems für kleine und mittlere Unternehmen (KMU) im MEVN-Technologie-Stack – wurde vollumfänglich und erfolgreich umgesetzt.

Die in der Anforderungsanalyse definierten "MUSS-Ziele" wie die Live-Stempeluhr mit Echtzeit-Timer, ein hierarchisches Rollensystem mit drei Berechtigungsstufen, eine vollständige Urlaubs- und Abwesenheitsverwaltung mit asynchronem Genehmigungsworkflow sowie die persistente Speicherung aller Daten in MongoDB Atlas wurden nahtlos in ein optisch hochwertiges, "frictionless" Frontend (Vue.js 3 / Bootstrap 5) eingebaut.

Darüber hinaus wurden mehrere ZUSATZ-Ziele erfolgreich realisiert:

- **PDF-Export:** Offizielle Urlaubskonto-Auszüge können direkt aus dem Browser als A4-formatierte PDF-Dokumente generiert und heruntergeladen werden (via html2pdf.js).
- **Echtzeit-Überstundenberechnung:** Das Urlaubskonto zeigt den aktuellen Überstundensaldo in Echtzeit an, berechnet aus allen WorkSessions und hinterlegten Soll-Stunden.
- **Feiertags-Integration:** Gesetzliche Feiertage werden bei der Urlaubsberechnung und der Sollstunden-Kalkulation automatisch berücksichtigt.
- **Sondertermin-Tracking:** Arztbesuche und andere Kurzabwesenheiten können separat erfasst werden.
- **System-Logging:** Administrative Systemereignisse werden protokolliert und sind über ein Terminal-Interface einsehbar.
- **Cloud-Deployment:** Die Applikation läuft produktiv auf Render.com mit MongoDB Atlas als Datenbank-Backend.

Besonders herauszustellen ist die Cloud-Readiness. Das Projekt läuft voll operabel in der Produktionsumgebung (Render.com), womit die Praxistauglichkeit direkt unter Beweis gestellt wird. Durch die RESTful-Architektur und den generischen JSON-Datenaustausch, unterstützt durch kryptografisch gesicherte JSON Web Tokens (JWT), erfüllt das System moderne IT-Sicherheitsstandards. Herausforderungen, wie das "N+1 Problem" bei der Aggregation von Abrechnungen und die Zeitzonenproblematik bei der Anzeige, wurden durch geschickte Lösungsansätze gemeistert.

Dank des Backend-Frameworks Express.js und der flexiblen Datenstruktur von MongoDB ist die Applikation skalierbar angelegt. Die strikte Trennung von API und Client-Interface ermöglicht die unabhängige Weiterentwicklung beider Teilsysteme. Die Verwendung von Vite als Build-Tool garantiert schnelle Entwicklungszyklen und optimierte Produktions-Bundles.

**Ausblick:** In zukünftigen Iterationen kann das Projekt ideal weiterentwickelt werden. Die vielversprechendsten Erweiterungsmöglichkeiten umfassen:

- **NFC-Hardware-Integration:** Durch die Vorbereitung eines `nfc_tag`-Feldes in der Datenbank ist die Verknüpfung mit physischen NFC-Terminals oder der Web-NFC-API auf Android-Smartphones eine logische nächste Stufe.
- **Excel/CSV-Export:** Für die Integration mit bestehender Buchhaltungssoftware (z.B. BMD, DATEV) wäre ein tabellarischer Export der Abrechnungsdaten wertvoll.
- **Push-Benachrichtigungen:** Erinnerungen an vergessene Stempelvorgänge oder Statusänderungen bei Urlaubsanträgen via Web-Push-Notifications.
- **Progressive Web App (PWA):** Durch die Ergänzung eines Service Workers und eines Web App Manifests könnte die Applikation als installierbare PWA auf dem Smartphone-Homescreen platziert werden.
- **Mehrsprachigkeit (i18n):** Die Internationalisierung des Frontends für den Einsatz in multinationalen Unternehmen.

Der grundlegende PDF-Druck für Arbeitszeitnachweise wurde bereits erfolgreich integriert und beweist die Erweiterbarkeit des Systems. Zusammenfassend ist das "Zeiterfassungssystem" eine zukunftssichere SaaS-Grundlage (Software as a Service), die analoge Excel-Tabellen obsolet macht und die Personalverwaltung radikal digitalisiert.
