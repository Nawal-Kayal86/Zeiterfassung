# 5. Zeiterfassungs-Prozess und Abrechnung

In diesem Kapitel wird der fachliche Kernprozess des Systems "Zeiterfassung-Prozess" im Detail beleuchtet. Es wird erläutert, wie das "Kommen und Gehen" systemanalytisch als Workflow-Design entworfen wurde und wie das System diese Rohdaten für spätere Berichte und Abrechnungen (Billing) der Abteilungen nutzbar macht. Die Verknüpfung von operativer Zeiterfassung und analytischer Auswertung bildet das Alleinstellungsmerkmal gegenüber einfachen Stempeluhren.

## 5.1 Workflow-Design

Das Stempeln – in traditionellen Betrieben ein mechanischer Akt mit Lochkarten – wurde in einen digitalen Workflow von maximaler Einfachheit übersetzt. Da das Tooling webbasiert ist, muss der Prozess reibungslos greifen, egal ob der Anwender an seinem Desktop-Rechner sitzt oder am Firmeneingang auf seinem Smartphone den Browser öffnet.

### 5.1.1 Workflow-Architektur (Kommen/Gehen)

Der Workflow "Kommen/Gehen" funktioniert als zyklischer `Start-End-Prozess`. Technisch gesehen repräsentieren diese Buchungen Arbeitsblöcke (`WorkSessions`). Jeder Arbeitsblock durchläuft folgende Zustände:

1. **Initialisiert (Open):** Eine Session wurde gestartet, `start_time` ist gesetzt, `end_time` ist `null`.
2. **Pausiert (Paused):** Der Benutzer hat die Pause-Funktion aktiviert. Dieser Zustand wird ausschließlich im Frontend gehalten (via `isPaused`-Flag und `pauseTime`-Zähler). Das Backend kennt keinen expliziten Pausen-Zustand – die akkumulierte Pausenzeit wird erst beim Beenden der Session übermittelt.
3. **Abgeschlossen (Closed):** Die Session wurde beendet, `end_time` ist gesetzt, die Pausenzeit wurde als String (z.B. "0:30") gespeichert.

Im Detail funktioniert der Workflow folgendermaßen:

- **Der "Kommen"-Event (Check-In):** Die Weboberfläche initialisiert den Stempelvorgang (`START`). Dabei wird sofort eine "Optimistic UI"-Resonanz erzeugt (ein grüner Toast "Arbeitsbeginn erfolgreich 🚀"). Der Startzeitpunkt wird als `UTC-Timestamp` (via `Date.now()`) im Datenbankdokument fixiert. Ab diesem Augenblick startet im Frontend eine JavaScript-`setInterval`-Uhr (der "Live Puls"), welche die laufenden Sekunden auf dem Dashboard visualisiert. Das Gefühl der laufenden Zeit soll die Mitarbeitenden psychologisch unterstützen.
- **Der Pausen-Event:** Um eine nahtlose Dokumentation ohne ständiges Starten und Beenden von Teil-Schichten zu garantieren, wurde ein Pause-Modus implementiert. Per Klick auf "Pause machen" wechselt der Button seinen Zustand zu "Pause beenden" und die Pausenzeit wird sekundengenau hochgezählt. Die Pause beeinflusst den Live-Timer: Während der Pause wird die Sitzungsdauer nicht weiter hochgezählt, stattdessen akkumuliert sich die Pausenzeit separat. Ein Toast informiert den Benutzer sowohl beim Pausenstart ("Pause gestartet ☕") als auch beim Pausenende ("Pause beendet – Weiter geht's! 💪").
- **Der Arzttermin-Event:** Für Arzttermine und Behördengänge wurde eine separate Workflow-Komponente implementiert. Über einen dedizierten Button im Dashboard wird der Benutzer zur `Workflow.vue` Komponente navigiert, wo er den Grund, die Start- und Endzeit des Termins erfassen kann. Die maximale Dauer ist auf 3 Stunden begrenzt.
- **Der "Gehen"-Event (Check-Out):** Der Kreis schließt sich mit dem Stop-Prozess (`END`). Das Frontend berechnet die akkumulierte Pausenzeit in ein HH:MM-Format und sendet ein `POST /stop` mit dem Pausen-Parameter an den Server. Das offene Dokument zur laufenden `user_id` erhält den aktuellen Zeitstempel als `end_time`. Ein Toast bestätigt: "Feierabend! Gut gemacht! 🏠".

### 5.1.2 Manuelle Nacherfassung

Falls ein Mitarbeitender das Stempeln vergisst (z.B. bei Dienstreisen oder technischen Problemen), steht die manuelle Erfassung bereit. Über den Toggle-Switch im Dashboard wechselt die Ansicht zum Formular mit den Feldern: Datum (date), Startzeit (time), Endzeit (time) und Pause (HH:MM). Die manuelle Buchung wird als reguläre WorkSession gespeichert und ist in allen Auswertungen gleichwertig enthalten.

Zusätzlich können bestehende Einträge über die Eintrags-Tabelle im Dashboard bearbeitet werden. Ein Klick auf das Stift-Icon lädt den Eintrag in das manuelle Erfassungsformular, wo Start-, Endzeit und Pause korrigiert werden können. Ein Toast bestätigt die Aktualisierung: "Eintrag erfolgreich aktualisiert! ✅". Einträge können auch vollständig gelöscht werden (nach Bestätigung via Confirm-Dialog).

### 5.1.3 Manipulationsschutz und NFC-Integration

Eine zwingende Anforderung an Zeiterfassungssysteme aus HR-Sicht ist die Nachverfolgbarkeit und die Resilienz gegen Betrug ("Buddy Punching"). Da die Applikation Cloud-basiert von überall aufrufbar ist, muss zukünftig – falls gefordert – zweifelsfrei bewiesen werden können, dass sich der Mitarbeiter physisch vor Ort befand.

Zu diesem Zweck wurde im System als _Proof of Concept_ ein Datenfeld "`nfc_tag`" im Nutzer-Profil eingebettet. Dies legt das logische Fundament dafür, das reine Software-Stempeln optional mit einem Hardware-Ereignis zu verknüpfen (z.B. indem Mitarbeitende mit einem Chip-Schlüsselanhänger einen fest im Büro installierten NFC-Reader berühren). Das Frontend (respektive die Web-App) fängt den Serial-Code-String ab, sendet ihn an die API, wo er mit dem im Nutzer hinterlegten Tag-Code verifiziert wird. Nur ein identisches Matching bucht die Schicht ein.

Das `nfc_tag`-Feld im User-Schema ist als `unique` und `sparse` deklariert, was bedeutet, dass keine zwei Benutzer denselben NFC-Tag besitzen dürfen, Benutzer ohne NFC-Tag jedoch keinen Konflikt erzeugen.

## 5.2 Berichte und Abrechnung (Dashboard/Billing)

Rohdaten (Stempelzeiten) sind für ein Unternehmen wertlos, wenn sie nicht adäquat verdichtet und summiert werden. Die Datenaufbereitung für das Projekt obliegt daher einer dedizierten Billing- und Berichtekomponente.

### 5.2.1 Soll-Ist-Vergleich

Das Herzstück der Abrechnung ist der tägliche Soll-Ist-Vergleich. Für jeden Arbeitstag wird berechnet:

- **Ist-Stunden:** Die tatsächlich gearbeitete Zeit (Differenz von Start und Ende, abzüglich Pausen).
- **Soll-Stunden:** Die vom Arbeitszeitmodell vorgeschriebene Arbeitszeit für diesen Wochentag. Bei einem 40-Stunden-Modell mit 5 Arbeitstagen beträgt das Tagessoll 8 Stunden. Feiertage reduzieren das Soll auf 0.
- **Übertrag/Saldo:** Die Differenz zwischen Ist und Soll, kumuliert über den Monat.

### 5.2.2 Echtzeit-Überstundenberechnung

In der LeaveRequest-Komponente wird der Überstundensaldo in Echtzeit berechnet. Der Algorithmus funktioniert wie folgt:

1. Aus den Wochenstunden des Benutzers wird das tägliche Soll berechnet (z.B. 40h / 5 Tage = 8h pro Tag = 480 Minuten).
2. Alle abgeschlossenen WorkSessions werden geladen und die tatsächlich gearbeiteten Minuten (Ist) aufsummiert, wobei Pausenzeiten subtrahiert werden.
3. Die Anzahl der Arbeitstage seit der ersten Buchung wird ermittelt (Wochenenden ausgenommen).
4. Soll-Minuten = Arbeitstage × Tagessoll.
5. Genehmigte Zeitausgleichstage werden als Abzug berücksichtigt.
6. Überstundensaldo = Ist-Minuten - Soll-Minuten - Zeitausgleichs-Abzug.

### 5.2.3 Aggregations-Pipeline

Nur System-Administratoren erhalten Zugriff auf den `/reports` Endpunkt. Hierbei aggregiert das Backend die summierten Zeiten über alle Arbeitsschichten hinweg (sogenanntes _Number Crunching_). Dies geschieht durch leistungsstarke `Mongoose Aggregation Pipelines` (z. B. `$match`, `$lookup`, `$group`).

**Abrechnungsprozess:**

1. **Filterung:** Die Pipeline sammelt alle Sessions und filtert leere oder ungültige Schichten heraus (`{ $match: { end_time: { $ne: null } } }`).
2. **Verknüpfung (Join):** Mongoose verknüpft per `$lookup` die `WorkSessions` mit den `User`-Entitäten, um festzustellen, in welcher Abteilung der Mitarbeiter arbeitet.
3. **Berechnung (Subtraktion & Summierung):** Die MongoDB evaluiert serverseitig die Zeitdifferenz in Millisekunden (`end_time` minus `start_time` minus `pause`). Das Ergebnis wird durch `$sum` für jede Abteilung gruppiert und akkumuliert.
4. **Darstellung & Export:** Das Frontend (`Berichte.vue` & `Billing.vue`) rendert dieses kalkulierte JSON-Objekt in ein optisch hochwertiges, tabellarisches Layout. Ein besonderes Feature stellt hierbei der Export-Mechanismus dar: Über die Integration der Bibliothek `html2pdf.js` können offizielle Arbeitszeitnachweise und Urlaubskonto-Auszüge direkt im PDF-Format generiert und für die Personalverrechnung ausgegeben werden. Dem Administrator offenbart sich so ein sofortiger Überblick über die Gesamtarbeitsstunden (Total Hours) – aufgeschlüsselt je Abteilung oder Mitarbeiter.

### 5.2.4 Urlaubskonto und Feiertagsberechnung

Das Urlaubskonto wird dynamisch aus den genehmigten, offenen und abgelehnten Anträgen berechnet. Die Berechnung der Netto-Urlaubstage (Arbeitstage ohne Wochenenden und Feiertage) ist dabei besonders anspruchsvoll:

Für jedes Datum im beantragten Zeitraum wird geprüft, ob es sich um einen Wochentag (Montag bis Freitag) handelt und ob das Datum nicht als Feiertag in der Holiday-Collection eingetragen ist. Nur Tage, die beide Bedingungen erfüllen, werden als Netto-Urlaubstage gezählt. Diese Logik wird sowohl für die Vorschau-Berechnung im Antragsformular als auch für die Bestandsführung des Urlaubskontos verwendet.

Der Gesamturlaub berechnet sich als: Restanspruch = Jahresanspruch - verbrauchte Tage (genehmigte Anträge) - geplante Tage (offene Anträge).

Dieser ganzheitliche Ansatz zwischen Frontend-Präsentation und Backend-Data-Mining bildet die Essenz der modernen Personalabrechnung und garantiert reell messbare Zeitauswertungen für das Controlling. Dies schlägt eine logische Brücke zur im Folgekapitel behandelten Ressourcenplanung (Urlaub und Dienstplan).
