# 4. Implementierung des Zeiterfassungssystems

Nach der Konzeption der Architektur erfolgte die praktische Umsetzung. Dieses Kapitel beleuchtet ausgewählte Implementierungsdetails, unterteilt in die von Ahmad verantwortete Backend-Logik und die von Nawal umgesetzte Frontend-Darstellung.

## 4.1 Backend-Implementierung / Ahmad /

Das Backend bildet das datentechnische Rückgrat. Die Hauptaufgabe bestand darin, sichere und deterministische Endpunkte bereitzustellen, welche die "Kommen" und "Gehen" Anfragen fehlerfrei verarbeiten.

### 4.1.1 Praktische Datenbankoperationen

Die Datenbankoperationen wurden mittels Mongoose-Modellen abstrahiert. Ein zentraler Vorgang ist das Einbuchungsszenario (Start Session).
Wenn ein Nutzer stempelt, muss das System zunächst überprüfen, ob er nicht bereits "eingestempelt" ist. Hierzu wird eine Queries ausgeführt, die nach einem offenen Datensatz (`end_time: null`) für die spezifische `user_id` sucht. 
Ist kein offener Satz vorhanden, wird ein neues Dokument in der `WorkSessions`-Collection erstellt:
```javascript
const session = new WorkSession({
    user_id: req.user.id,
    start_time: new Date()
});
await session.save();
```
Die Mongoose-Schemas sind streng typisiert und nutzen "default"-Attribute (z.B. `Date.now`), was die Code-Redundanz im Controller drastisch reduziert.

### 4.1.2 API-Endpunkte

Für den Stempelprozess wurden spezifische Endpunkte unter dem Prefix `/api/workSessions/` deklariert. Ein `POST /start` initiiert die Schicht, ein `POST /stop` finalisiert sie. Beim Beenden (`stop`) wird ein Payload-Parameter für "Pausenzeiten" mitgeschickt. Das Backend rechnet diese vom Gesamtintervall ab. 
Für die Urlaubsanträge (LeaveRequests) wurden CRUD-Routen implementiert. Administratoren nutzten hierbei `PATCH /api/leave-requests/:id/status`, um das `status`-Feld im JSON-Dokument von `pending` auf `approved` oder `rejected` zu mutieren.

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
    }
}
```
Diese Funktion nutzt das Konzept der *Closures* in JavaScript, um Rollenbasierten Zugriff (`RBAC`) dynamisch und elegant direkt in der Routen-Deklaration zu erzwingen (z.B. `router.get('/', auth('admin'), controller)`).

### 4.1.4 Fehlerbehandlung

Um Serverabstürze (Process-Crashes) durch "Unhandled Promise Rejections" zu vermeiden, sind alle asynchronen Controller-Routinen in standardisierte `try...catch` Blöcke gekapselt. Fehler werden im Catch-Block abgefangen, protokolliert und anschließend als generische HTTP 500 Responses (oder 400 bei Validierungsfehlern) sicher an den Client zurückgegeben.

---

## 4.2 Frontend-Implementierung / Nawal /

Das Frontend konsumiert die Backend-Ressourcen und formt aus ihnen ein interaktives Erlebnis für den Mitarbeiter. 

### 4.2.1 Komponenten-Implementierung

Das Projekt ist in modulare *Single File Components (.vue)* gegliedert. Typische Beispiele sind `Dashboard.vue`, `Kalender.vue` und `LeaveRequest.vue`.
Im Skript-Bereich (`<script setup>` oder klassisches Options-API) existiert der lokale Zustand (State). Das `Dashboard` hält beispielsweise Variablen wie `activeSession` oder `liveDuration`. Ist `activeSession` nicht null (also ein offener Zeitstempel vom Server geliefert), blendet die Komponente mittels der Direktive `v-if="activeSession"` den roten "Gehen"-Button ein, andernfalls den grünen "Kommen"-Button.

### 4.2.2 Formularvalidierung

Um dem Backend ungültige Anfragen (und damit Netzwerkkosten) zu ersparen, erfolgt eine strenge Vor-Validierung auf dem Client. Ein Beispiel ist das Formular zur manuellen Zeiterfassung. Mittels HTML5-Attributen (`required`, `type="time"`) und Vue-v-model-Bindungen wird die Integrität gesichert. Trägt ein Nutzer im Urlaubsantrag ein Enddatum ein, das vor dem Startdatum liegt, wird die Eingabe programmtechnisch blockiert und eine rote Hinweismeldung eingeblendet.

### 4.2.3 Dynamische Inhalte

Das Herzstück dynamischer Anzeigen ist die Live-Puls-Uhr. Bei einer aktiven Session berechnet eine `setInterval`-Schleife im Frontend jede Sekunde die Differenz aus der aktuellen Systemzeit und dem `start_time`-Serverwert. Dies kreiert für den Anwender die nahtlose Illusion eines voranschreitenden Timers, obgleich der Zustand faktisch erst bei Klick auf "Stop" serverseitig gespeichert wird.
Der FullCalendar `@fullcalendar/vue3` nutzt ähnliche Dynamik: Nach dem Laden der Datensatz-Arrays iteriert die Applikation über alle Work-Sessions und mappt sie in das geforderte `Event Object`-Format (mit `title`, `start`, `end`, `color`) des Kalenders.

### 4.2.4 Responsives Layout

Die Struktur der Templates fußt auf Bootstrap 5 Klassen (`d-flex`, `container-fluid`, `col-lg-6`). So wird beispielsweise die manuelle Erfassungs-Maske auf großen Screens als Kachel neben der Live-Uhr platziert (`row col-lg-6`). Auf mobilen Geräten bricht dieses Grid-System um (Stacking), sodass Formular und UI-Buttons untereinandergereiht flüssig bis an den Bildschirmrand (100% viewport width) skalieren.

---

## 4.3 Integration / Nawal & Ahmad /

Die größte technische Schnittstelle war die fehlerfreie Symbiose der beiden Teilsysteme.

### 4.3.1 Backend-Frontend-Kommunikation

Zur Kommunikation wurde die asynchrone HTTP-Bibliothek *Axios* als dedizierte Service-Klasse (`api.js`) im Frontend gekapselt.  Um dem Entwickler zu ersparen, manuell bei jeder Anfrage den JWT-Token bereitzuhalten, wurde ein `Axios-Interceptor` geschrieben. Dieser fängt den ausgehenden Request ab, liest den Token aus dem Browser-`localStorage` und injiziert ihn implizit in den HTTP-Header (`Authorization: Bearer <token>`).

### 4.3.2 Datenaustausch

Da JavaScript auf Frontend- und Backend-Ebene zum Einsatz kam (Isomorphe Ansatz), entfielen mühselige Parsing-Hürden. Node.js antwortet nativ in JSON. Vue.js verarbeitet dieses JSON-Objekt im Result (`res.data`) umstandslos und bindet es in die Views ein. Ein Reibungspunkt stellte lediglich die Zeitzonenkonvertierung dar (UTC Serverzeit vs. Locale Browser-Zeit des Anwenders), was durch standardisierte `Date`-Konvertierungen innerhalb von Vue-Computed-Properties gemeistert wurde.

### 4.3.3 Performance-Monitoring und Optimierung

Um langsame Ladezeiten zu minimieren, lädt das Dashboard beim Initialisieren nicht alle Datensätze aller Nutzer, sondern aggregiert `WorkSession`-Metadaten über spezielle Mongoose-Aggregation-Pipelines (`/api/workSessions/summary`). Erst wenn dediziert die "Liste" oder der "Kalender" geöffnet wird, holt das System weitreichende Arrays nach ("Lazy Fetching"). Dies senkt den initialen Datenverbrauch und garantiert, dass die Applikation im WLAN sowie auf einer mobilen LTE-Datenverbindung gleichsam "snappy" (zügig) agiert.
