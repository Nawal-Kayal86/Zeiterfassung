# 5. Zeiterfassungs-Prozess und Abrechnung / Nawal /

In diesem Kapitel wird der fachliche Kernprozess des Systems "Zeiterfassung-Prozess" im Detail beleuchtet. Es wird erläutert, wie das "Kommen und Gehen" systemanalytisch als Workflow-Design entworfen wurde und wie das System diese Rohdaten für spätere Berichte und Abrechnungen (Billing) der Abteilungen nutzbar macht.

## 5.1 Workflow-Design

Das Stempeln – in traditionellen Betrieben ein mechanischer Akt mit Lochkarten – wurde in einen digitalen Workflow von maximaler Einfachheit übersetzt. Da das Tooling webbasiert ist, muss der Prozess reibungslos greifen, egal ob der Anwender an seinem Desktop-Rechner sitzt oder am Firmeneingang auf seinem Smartphone den Browser öffnet.

### 5.1.1 Workflow-Architektur (Kommen/Gehen)

Der Workflow "Kommen/Gehen" funktioniert als zyklischer `Start-End-Prozess`. Technisch gesehen repräsentieren diese Buchungen Arbeitsblöcke (`WorkSessions`).

*   **Der "Kommen"-Event (Check-In):** Die Weboberfläche initialisiert den Stempelvorgang (`START`). Dabei wird sofort eine Latenz-unabhängige "Optimistic UI"-Resonanz erzeugt (ein grüner Toast "Arbeitsbeginn erfolgreich"). Der Startzeitpunkt wird als `UTC-Timestamp` (via `Date.now()`) im Datenbankdokument fixiert. Ab diesem Augenblick startet im Frontend eine JavaScript-`setInterval`-Uhr (der "Live Puls"), welche die laufenden Sekunden auf dem Dashboard visualisiert. Das Gefühl der laufenden Zeit soll die Mitarbeiter psychologisch unterstützen.
*   **Der "Arzt-" und "Pausen"-Event:** Pausenzeiten sind im Standard in modernen Unternehmen streng reguliert (etwa gesetzlich verordnete 30 Minuten nach 6 Stunden). Um eine nahtlose Dokumentation ohne ständiges Starten und Beenden von Teil-Schichten zu garantieren, wurde ein Modus für das Einloggen von Pausen-Stunden (im Frontend implementiert als ein Input "Pause (HH:MM)") integriert. Auch ein separater Checkpoint für "Arzttermine" wurde als prominentes Element (Workflow "Doc") UI-seitig hinterlegt.
*   **Der "Gehen"-Event (Check-Out):** Der Kreis schließt sich mit dem Stop-Prozess (`END`). Die Systemarchitektur schickt nun ein asynchrones Update (`PATCH`/`POST /stop`) an den Server. Das offene Dokument zur laufenden `user_id` erhält in seiner Spalte `end_time` den aktuellen Zeitstempel.

### 5.1.2 Manipulationsschutz und NFC-Integration

Eine zwingende Anforderung an Zeiterfassungssysteme aus HR-Sicht ist die Nachverfolgbarkeit und die Resilienz gegen Betrug ("Buddy Punching"). Da die Applikation Cloud-basiert von überall aufrufbar ist, muss zukünftig – falls gefordert – zweifelsfrei bewiesen werden können, dass sich der Mitarbeiter physisch vor Ort befand.
Zu diesem Zweck wurde im System als *Proof of Concept* ein Datenfeld "`nfc_tag`" im Nutzer-Profil eingebettet. Dies legt das logische Fundament dafür, das reine Software-Stempeln optional mit einem Hardware-Ereignis zu verknüpfen (z.B. indem Mitarbeiter mit einem Chip-Schlüsselanhänger einen fest im Büro installierten NFC-Reader berühren). Das Frontend (respektive die Web-App) fängt den Serial-Code-String ab, sendet ihn an die API, wo er mit dem im Nutzer hinterlegten Tag-Code verifiziert wird. Nur ein identisches Matching bucht die Schicht ein. 

## 5.2 Berichte und Abrechnung (Dashboard/Billing)

Rohdaten (Stempelzeiten) sind für ein Unternehmen wertlos, wenn sie nicht adäquat verdichtet und summiert werden. Die Datenaufbereitung für das Projekt obliegt daher einer dedizierten Billing- und Berichtekomponente.

Nur System-Administratoren erhalten Zugriff auf den `/reports` Endpunkt. Hierbei aggregiert das Backend die summierten Zeiten über alle Arbeitsschichten hinweg (sogenanntes *Number Crunching*). Dies geschieht durch leistungsstarke `Mongoose Aggregation Pipelines` (z. B. `$match`, `$lookup`, `$group`).

**Abrechnungsprozess:**
1.  **Filterung:** Die Pipeline im Backend sammelt alle Sessions und filtert leere oder ungültige Schichten (z.B. noch offene Sitzungen) heraus (`{ $match: { end_time: { $ne: null } } }`).
2.  **Verknüpfung (Join):** Mongoose verknüpft per `$lookup` die `WorkSessions` mit den `User`-Entitäten, um festzustellen, in welcher Abteilung (`Department`) der Mitarbeiter arbeitet.
3.  **Berechnung (Subtraktion & Summierung):** Die MongoDB evaluiert serverseitig die Zeitdifferenz in Millisekunden (`end_time` minus `start_time` minus `pause`). Das Ergebnis wird durch `$sum` für jede Abteilung gruppiert und akkumuliert.
4.  **Darstellung:** Das Frontend (`Berichte.vue` & `Billing.vue`) rendert dieses kalkulierte JSON-Objekt in ein optisch hochwertiges, tabellarisches Layout. Dem Administrator offenbart sich so ein sofortiger Überblick über die Gesamtarbeitsstunden (Total Hours) – aufgeschlüsselt je Abteilung (Sales, Support, Development etc.) oder Mitarbeiter. Diese Listen werden final, optional exportierbar, der Personalverrechnung übergeben.

Dieser ganzheitliche Ansatz zwischen Frontend-Präsentation und Backend-Data-Mining bildet die Essenz der modernen Personalabrechnung und garantiert reell messbare Zeitauswertungen für das Controlling. Dies schlägt eine logische Brücke zur im Folgekapitel behandelten Ressourcenplanung (Urlaub und Dienstplan).
