# 4. Implementierung des Zeiterfassungssystems

Nach der Konzeption der Architektur erfolgte die praktische Umsetzung. Dieses Kapitel beleuchtet ausgewählte Implementierungsdetails, unterteilt in die von Ahmad verantwortete Backend-Logik und die von Nawal umgesetzte Frontend-Darstellung. Die Implementierung folgte einem iterativen Entwicklungsprozess, bei dem neue Features in kurzen Zyklen entwickelt, getestet und integriert wurden.

## 4.1 Backend-Implementierung

Das Backend bildet das datentechnische Rückgrat. Die Hauptaufgabe bestand darin, sichere und deterministische Endpunkte bereitzustellen, welche die "Kommen" und "Gehen" Anfragen fehlerfrei verarbeiten.

### 4.1.1 Praktische Datenbankoperationen

Die Datenbankoperationen wurden mittels Mongoose-Modellen abstrahiert. Ein zentraler Vorgang ist das Einbuchungsszenario (Start Session). Wenn ein Nutzer stempelt, muss das System zunächst überprüfen, ob er nicht bereits "eingestempelt" ist. Hierzu wird eine Query ausgeführt, die nach einem offenen Datensatz (`end_time: null`) für die spezifische `user_id` sucht. Ist kein offener Satz vorhanden, wird ein neues Dokument in der `WorkSessions`-Collection erstellt:

```javascript
const session = new WorkSession({
  user_id: req.user.id,
  date_today: new Date().toISOString().split('T')[0],
  start_time: new Date(),
});
await session.save();
```

Die Mongoose-Schemas sind streng typisiert und nutzen "default"-Attribute (z.B. `Date.now`), was die Code-Redundanz im Controller drastisch reduziert.

Das WorkSession-Modell ist dabei das komplexeste Schema der Applikation. Neben den Kernfeldern `user_id`, `start_time`, `end_time` und `pause` enthält es zahlreiche abrechnungsrelevante Felder: `zeitmodell` für die Arbeitszeitart, `ist` und `soll` für die tatsächlichen und vorgeschriebenen Stunden, `uebertrag` für den Saldo-Übertrag vom Vortag, sowie Spezialfelder wie `oneToOneDay` (1:1-Zeitausgleich pro Tag), `oneToOneGesamt` (kumulierter Zeitausgleich), `zgu` (Zeitguthaben), `salGes` (Gesamtsaldo) und weitere administrative Felder für Gleitzeit und Zuschläge.

### 4.1.2 API-Endpunkte

Für den Stempelprozess wurden spezifische Endpunkte unter dem Prefix `/api/workSessions/` deklariert. Ein `POST /start` initiiert die Schicht, ein `POST /stop` finalisiert sie. Beim Beenden (`stop`) wird ein Payload-Parameter für "Pausenzeiten" mitgeschickt. Das Backend rechnet diese vom Gesamtintervall ab.

Der Endpunkt `POST /manual-time` erlaubt die nachträgliche Erfassung von Arbeitszeiten. Er akzeptiert Datum, Start- und Endzeit sowie optionale Pause und erstellt daraus eine vollständige WorkSession. Der `GET /summary` Endpunkt liefert aggregierte Daten (letzter Start, letztes Ende, Gesamtzahl der Einträge) für die Dashboard-Kacheln.

Für die Urlaubsanträge (LeaveRequests) wurden CRUD-Routen implementiert. Administratoren nutzen hierbei `PATCH /api/leave-requests/:id/status`, um das `status`-Feld im JSON-Dokument von `pending` auf `approved` oder `rejected` zu mutieren. Der Endpunkt prüft dabei serverseitig die Rolle des anfragenden Benutzers und verhindert, dass normale User ihren eigenen Antrag genehmigen.

### 4.1.3 Authentifizierungslogik

Die JWT-Generierung erfolgt nach dem Login. Die sensible Umgebungsvariable `process.env.JWT_SECRET` signiert den Token. Für jeden geschützten Endpunkt wurde eine Custom-Middleware `auth.js` deklariert:

```javascript
export const auth = (requiredRole) => {
  return (req, res, next) => {
    const token = req.header("Authorization");
    // Token Validierung...
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    if (requiredRole && req.user.role !== requiredRole) {
      return res.status(403).json({ error: "Access Denied" });
    }
    next();
  };
};
```

Diese Funktion nutzt das Konzept der _Closures_ in JavaScript, um rollenbasierenden Zugriff (RBAC) dynamisch und elegant direkt in der Routen-Deklaration zu erzwingen (z.B. `router.get('/', auth('admin'), controller)`). Der Token enthält die Benutzer-ID, den Namen, die Rolle und die E-Mail-Adresse als Payload, was redundante Datenbankabfragen bei jedem Request vermeidet.

### 4.1.4 Fehlerbehandlung

Um Serverabstürze (Process-Crashes) durch "Unhandled Promise Rejections" zu vermeiden, sind alle asynchronen Controller-Routinen in standardisierte `try...catch` Blöcke gekapselt. Fehler werden im Catch-Block abgefangen, protokolliert und anschließend als generische HTTP 500 Responses (oder 400 bei Validierungsfehlern) sicher an den Client zurückgegeben.

Zusätzlich wurde ein zentrales Logging-System implementiert: Kritische Server-Ereignisse (Fehlgeschlagene Logins, Datenbankfehler, unerwartete Exceptions) werden in die `Logs`-Collection geschrieben und sind für Administratoren über das Terminal-Interface einsehbar. Dies ermöglicht eine proaktive Fehlerdiagnose im Produktivbetrieb.

### 4.1.5 Kalender- und Feiertagslogik

Der Kalender-Endpunkt (`GET /api/calendar`) liefert Feiertagsdaten für ein gegebenes Jahr. Diese Feiertage werden in der `Holiday`-Collection gespeichert und enthalten das Datum im ISO-Format sowie die Bezeichnung des Feiertags. Die Feiertage fließen in zwei zentrale Berechnungen ein: Die Bestimmung der Netto-Urlaubstage (Arbeitstage ohne Wochenenden und Feiertage) und die Berechnung der Soll-Arbeitszeit (Feiertage reduzieren die Soll-Stunden).

---

## 4.2 Frontend-Implementierung

Das Frontend konsumiert die Backend-Ressourcen und formt aus ihnen ein interaktives Erlebnis für den Mitarbeiter. Die Implementierung erfolgte komponentenbasiert unter Verwendung sowohl der Options-API (für das Dashboard) als auch der modernen Composition API mit `<script setup>` (für neuere Komponenten wie LeaveRequest und Workflow).

### 4.2.1 Komponenten-Implementierung

Das Projekt ist in modulare _Single File Components (.vue)_ gegliedert. Insgesamt umfasst die Applikation 17 View-Komponenten, darunter:

- `Dashboard.vue` – Stempelterminal und manuelle Erfassung
- `Calendar.vue` – Kalenderansicht mit FullCalendar
- `LeaveRequest.vue` – Urlaubsantrag und Urlaubskonto
- `LeaveApproval.vue` – Admin-Ansicht für Genehmigungen
- `Billing.vue` – Monatsabrechnung mit Soll-Ist-Vergleich
- `Reports.vue` – Statistische Übersichten
- `NewUser.vue` – Benutzeranlage mit Arbeitszeitkonfiguration
- `WorkSchedule.vue` – Verwaltung der Arbeitszeitmodelle
- `Workflow.vue` – Sondertermin-Erfassung
- `Config.vue` – Systemkonfiguration
- `Login.vue` – Authentifizierung

Im Skript-Bereich existiert der lokale Zustand (State). Das `Dashboard` hält beispielsweise Variablen wie `activeSession`, `liveDuration`, `isPaused` und `pauseTime`. Ist `activeSession` nicht null (also ein offener Zeitstempel vom Server geliefert), blendet die Komponente mittels der Direktive `v-if="activeSession"` das Live-Terminal und den "Gehen"-Button ein, andernfalls den grünen "Kommen"-Button.

### 4.2.2 Formularvalidierung

Um dem Backend ungültige Anfragen (und damit Netzwerkkosten) zu ersparen, erfolgt eine strenge Vor-Validierung auf dem Client. Ein Beispiel ist das Formular zur manuellen Zeiterfassung. Mittels HTML5-Attributen (`required`, `type="time"`) und Vue-v-model-Bindungen wird die Integrität gesichert. Trägt ein Nutzer im Urlaubsantrag ein Enddatum ein, das vor dem Startdatum liegt, wird die Eingabe programmtechnisch blockiert und eine rote Hinweismeldung eingeblendet.

Im Workflow-Formular (Arzttermine) greift zusätzlich eine Maximal-Dauer-Validierung: Die Differenz zwischen Start- und Endzeit wird in Minuten berechnet und darf 180 Minuten (3 Stunden) nicht überschreiten. Diese Geschäftsregel wird ausschließlich im Frontend erzwungen, bevor der Request das Backend erreicht.

### 4.2.3 Dynamische Inhalte

Das Herzstück dynamischer Anzeigen ist die Live-Puls-Uhr. Bei einer aktiven Session berechnet eine `setInterval`-Schleife im Frontend jede Sekunde die Differenz aus der aktuellen Systemzeit und dem `start_time`-Serverwert. Die Pausenzeit wird dabei in Sekunden akkumuliert und von der Gesamtdauer abgezogen. Dies kreiert für den Anwender die nahtlose Illusion eines voranschreitenden Timers, obgleich der Zustand faktisch erst bei Klick auf "Stop" serverseitig gespeichert wird.

Die Überstundenberechnung in der `LeaveRequest.vue` Komponente ist ein weiteres Beispiel für komplexe clientseitige Berechnungen: Sämtliche abgeschlossene WorkSessions werden geladen, die Ist-Minuten (Arbeitszeit minus Pausen) aufsummiert, die Soll-Minuten anhand der hinterlegten Wochenstunden und der Anzahl der Arbeitstage berechnet, und genehmigte Zeitausgleichstage als Abzug berücksichtigt. Das Ergebnis wird als formatierter Stunden:Minuten-String (z.B. "+12:30" oder "-3:45") angezeigt.

Der FullCalendar `@fullcalendar/vue3` nutzt ähnliche Dynamik: Nach dem Laden der Datensatz-Arrays iteriert die Applikation über alle Work-Sessions und mappt sie in das geforderte `Event Object`-Format (mit `title`, `start`, `end`, `color`) des Kalenders.

### 4.2.4 PDF-Export-System

Ein herausragendes Feature der Applikation ist der PDF-Export des Urlaubskontos. Die Bibliothek `html2pdf.js` ermöglicht die Konvertierung von HTML-Elementen in PDF-Dokumente direkt im Browser, ohne Server-Roundtrip. Dazu wird ein verstecktes HTML-Template (`id="vacation-report"`) mit professionellem Layout bereitgehalten:

- Kopfbereich mit Titel, Mitarbeitername und Zeitraum
- Zusammenfassungsboxen mit Restanspruch und Kontodetails
- Detaillierte Verlaufstabelle aller Urlaubsanträge
- Fußzeile mit Erstelldatum und Disclaimer

Das Template nutzt Inline-Styles (statt CSS-Klassen), da `html2pdf.js` intern `html2canvas` verwendet und Inline-Styles zuverlässiger gerendert werden. Die PDF-Erzeugung wird durch einen Button-Klick ausgelöst und der Download automatisch gestartet.

### 4.2.5 Responsives Layout

Die Struktur der Templates fußt auf Bootstrap 5 Klassen (`d-flex`, `container-fluid`, `col-lg-6`). So wird beispielsweise die manuelle Erfassungs-Maske auf großen Screens als Kachel neben der Live-Uhr platziert (`row col-lg-6`). Auf mobilen Geräten bricht dieses Grid-System um (Stacking), sodass Formular und UI-Buttons untereinandergereiht flüssig bis an den Bildschirmrand (100% viewport width) skalieren.

---

## 4.3 Integration

Die größte technische Schnittstelle war die fehlerfreie Symbiose der beiden Teilsysteme.

### 4.3.1 Backend-Frontend-Kommunikation

Zur Kommunikation wurde die asynchrone HTTP-Bibliothek _Axios_ als dedizierte Service-Klasse (`api.js`) im Frontend gekapselt. Um dem Entwickler zu ersparen, manuell bei jeder Anfrage den JWT-Token bereitzuhalten, wurde ein `Axios-Interceptor` geschrieben. Dieser fängt den ausgehenden Request ab, liest den Token aus dem Browser-`localStorage` und injiziert ihn implizit in den HTTP-Header (`Authorization: Bearer <token>`).

Ein zweiter Response-Interceptor wurde implementiert, um globale Fehlerbehandlung zu realisieren: Bei einem HTTP 401 (Unauthorized) wird der Benutzer automatisch ausgeloggt und zum Login umgeleitet. Bei anderen Fehlern wird ein Error-Toast mit der Fehlermeldung des Backends angezeigt. Dies reduziert den Boilerplate-Code in den einzelnen Komponenten erheblich.

### 4.3.2 Datenaustausch

Da JavaScript auf Frontend- und Backend-Ebene zum Einsatz kam (Isomorpher Ansatz), entfielen mühselige Parsing-Hürden. Node.js antwortet nativ in JSON. Vue.js verarbeitet dieses JSON-Objekt im Result (`res.data`) umstandslos. Ein Reibungspunkt stellte lediglich die Zeitzonenkonvertierung dar (UTC Serverzeit vs. Locale Browser-Zeit des Anwenders), was durch standardisierte `toLocaleString('de-DE')`-Konvertierungen sowie eine zentrale Utility-Datei (`utils/time.js`) mit den Funktionen `formatDate`, `formatTime` und `calcDuration` gemeistert wurde.

### 4.3.3 Performance-Monitoring und Optimierung

Um langsame Ladezeiten zu minimieren, lädt das Dashboard beim Initialisieren nicht alle Datensätze aller Nutzer, sondern aggregiert `WorkSession`-Metadaten über spezielle Mongoose-Aggregation-Pipelines (`/api/workSessions/summary`). Erst wenn dediziert die "Liste" oder der "Kalender" geöffnet wird, holt das System weitreichende Arrays nach ("Lazy Fetching"). Dies senkt den initialen Datenverbrauch und garantiert, dass die Applikation im WLAN sowie auf einer mobilen LTE-Datenverbindung gleichsam "snappy" (zügig) agiert.

Zusätzlich wurde die Pagination-Strategie bei der Billing-Ansicht optimiert: Anstatt alle WorkSessions eines gesamten Jahres zu laden, werden nur die Einträge des ausgewählten Monats abgerufen. Dies reduziert die Payload-Größe um bis zu 92% und beschleunigt den Seitenaufbau spürbar.
