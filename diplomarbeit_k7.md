# 7. Herausforderungen und Lösungen / Nawal & Ahmad /

Bei der Entwicklung eines Fullstack-Projekts dieser Größenordnung im MEVN-Stack treten unweigerlich technische und architektonische Hürden auf. Dieses Kapitel beleuchtet die Kernprobleme der Umsetzung und deren Lösungsansätze.

## 7.1 Rollenbasierte Zugriffskontrolle – Lösungsansatz

Eine drastische Hürde war die Sicherstellung, dass im Frontend keine Navigationselemente zu Inhalten für den `user` angezeigt werden, die ihm nicht zustanden (`Berichte`, `Mitarbeiter anlegen`). Anstelle die Router-Links (`<router-link>`) hart zu verdrahten, wurde in der dynamischen Navigation auf die im LocalStorage vorgehaltene JWT-Signatur zugegriffen. Über Computed-Properties (Vue.js) wird nun reaktiv überwacht, welche Berechtigung der Nutzer hält, und dementsprechend das Menü aufgebaut.

## 7.2 Live-Zeitberechnung im Frontend

Ein UX-Problem stellte die Darstellung des "Live-Timers" auf dem Dashboard dar. Wenn ein Nutzer "Start" drückt, tickt die Uhr hoch. Lädt der Benutzer die Seite neu (F5/Reload), verliert Vue den aktuellen Timer-State.
**Lösung:** Um die Kontinuität wiederherzustellen, rechnet die Vue-Anwendung bei jedem Initialisieren (`mounted()`/`created()`) die Serverzeit des "Starts" gegen die Zeit des lokalen Browsers. Ist ein aktueller Datensatz des Servers noch offen (`end_time === null`), startet das Frontend nahtlos die `setInterval`-Tickrate von der kalkulierten Differenz aus.

## 7.3 Validierung und Benutzerführung bei Urlaubsanträgen

Nutzer machten häufig den Fehler, leere Formulare (z.B. bei der "Manuellen Zeit-Erfassung") wegzuschicken oder widersprüchliche Pausenzeiten (z. B. "2:70") einzutragen.
**Lösung:** Es wurde ein striktes Client-Side-Validation implementiert. HTML-Felder erfuhren Restriktionen (`required type="time"`). Das Absenden (`submit.prevent`) der Formulare ist unmöglich, solange inkonsistente Zustände vorliegen. 

## 7.4 Datenstruktur und Verschachtelung in MongoDB

Ein weiteres komplexes Problem bei der Berichterstellung (`Billing`) lag in der Verschachtelung (`Nesting`) der NoSQL-Datensätze. Eine `WorkSession` speichert nicht den Namen des Nutzers, sondern lediglich redundanzfrei seine `user_id`. Der Versuch, alle Sessions und die zugehörigen Namen der Angestellten in einer Schleife abzufragen (das "N+1 Queries Problem"), führte zu Performance-Engpässen im Localhost-Bereich.
**Lösung:** Dieses Problem wurde meisterhaft mithilfe iterativer MongoDB Aggregation Frameworks (`$lookup`, `$unwind`) gelöst. Dies verlagert rechenintensive Map-Reduce-Verfahren (Left-Outer-Joins) auf die Datenbankebene, wodurch Node.js extrem entlastet wird.

## 7.5 Integration und Darstellung komplexer Kalender-Daten

Die Visualisierung von hunderten Schichten im `@fullcalendar/vue3` führte zum "Überladen" des Viewports (Monatansicht). 
**Lösung:** Implementierung intelligenter Filterfunktionen (z. B. Abteilungs-Filter in `Kalender.vue`) und dynamischer Farbcodierungen. Der Backend-Endpunkt konvertiert beim Ausliefern ISO-Datumsstrings in lokal-verträgliche Timestamps, was Parsingfehler in Apples iOS-Safari (die oft Date-Probleme haben) unterband.

## 7.6 Hosting & Deployment-Probleme auf Render

Beim Deployment auf den Cloud-Dienstleister Render (Platform-as-a-Service) kam es beim Neuladen (Page-Refresh) der App zu `404 Not Found`-Fehlern, da der Node-Server versuchte, eine API-Route zu adressieren, die eigentlich dem Vue-Router oblag.
**Lösung:** Konfiguration des Express-Backends mit einem Catch-All-Handler:
```javascript
app.get('*', (req, res) => {
  // Ignoriere API falls nicht da
  if (req.path.startsWith('/api')) return res.status(404).end();
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});
```
Damit ist die Single-Page-Application "URL-Deep-Link" fähig und toleriert direkte Link-Aufrufe (z. B. `/dashboard` im URL-Eingabefenster des Chrome-Browsers).

---

# Zusammenfassung und Fazit

Das Hauptziel dieses Diplomarbeitsprojektes – die Entwicklung eines vollwertigen, digitalen Zeiterfassungssystems für kleine und mittlere Unternehmen (KMU) im MEVN-Technologie-Stack – wurde vollumfänglich und erfolgreich umgesetzt.

Die in der Anforderungsanalyse definierten "MUSS-Ziele" wie die Live-Stempeluhr, ein hierarchisches Rollensystem und eine persistente Urlaubsverwaltung wurden nahtlos in ein optisch hochwertiges, "frictionless" Frontend (Vue.js 3 / Bootstrap 5) eingebaut. Dank des Backend-Frameworks Express.js und der flexiblen Datenstruktur von MongoDB ist die Applikation skalierbar angelegt.

Besonders herauszustellen ist die Cloud-Readiness. Das Projekt läuft voll operabel in der Produktionsumgebung (Render.com), womit die Praxistauglichkeit direkt unter Beweis gestellt wird. Durch die RESTful-Architektur und den generischen JSON-Datenaustausch, unterstützt durch kryptografisch gesicherte JSON Web Tokens (JWT), erfüllt das System moderne IT-Sicherheitsstandards. Herausforderungen, wie das "N+1 Problem" bei der Aggregation von Abrechnungen, wurden durch geschickte Datenbank-Joins gemeistert.

**Ausblick:** In zukünftigen Iterationen kann das Projekt ideal weiterentwickelt werden. Durch die Vorbereitung eines `NFC`-Feldes in der Datenbank ist die Verknüpfung der Web-Applikation mit NFC-basierten Hardware-Terminals oder Smartphones eine logische Erweiterung. Ebenso wäre ein Export-Mechanismus (PDF oder Excel/CSV-Generierung für die Buchhaltungssoftware) für die Reporting-Zahlen leicht nachrüstbar. Zusammenfassend ist das "Zeiterfassungssystem" eine zukunftssichere SaaS-Grundlage (Software as a Service), die analoge Excel-Tabellen obsolet macht und die Personalverwaltung radikal digitalisiert.
