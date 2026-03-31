# 6. Dienstplan- und Urlaubsverwaltung

Ein modernes Zeiterfassungssystem muss über das reine Erfassen von Präsenzzeiten hinausgehen. Der zweite wesentliche Baustein für das Fortbestehen des betrieblichen Ablaufs ist die vorausschauende Personalplanung – namentlich die Verwaltung von Dienstplänen und die Genehmigung von Abwesenheiten (Urlaub, Krankheit).

Dieses Kapitel beschreibt den softwaretechnischen und rechtlichen Workflow, der hinter den Genehmigungsprozessen (Approval Workflows) steckt, und die hierbei angewandten systemischen Sicherheitsaspekte. Besonderes Augenmerk liegt auf der Echtzeit-Berechnung des Urlaubskontos und der nahtlosen Integration in das Überstunden-Management.

## 6.1 Arbeitszeitmodelle und Dienstplanung

### 6.1.1 Individuelles Arbeitszeitmodell

Jeder Mitarbeiter im System verfügt über ein individuell konfigurierbares Arbeitszeitmodell, das im User-Modell als eingebettetes Subdokument (`work_schedule`) gespeichert wird. Dieses Modell definiert für jeden Wochentag (Montag bis Sonntag):

- **Von-Zeit (from):** Der reguläre Arbeitsbeginn (z.B. "08:00")
- **Bis-Zeit (to):** Das reguläre Arbeitsende (z.B. "16:00")
- **Aktiv-Flag (active):** Ob an diesem Tag grundsätzlich gearbeitet wird (z.B. `false` für Samstag und Sonntag)

Zusätzlich wird die wöchentliche Sollarbeitszeit (`weekly_hours`) als Dezimalzahl gespeichert (z.B. 40 oder 38.5), woraus das tägliche Soll berechnet wird. Standardmäßig wird ein Vollzeit-Modell mit 40 Wochenstunden und Arbeitszeiten von 08:00 bis 16:00 Uhr (Montag bis Freitag) hinterlegt.

### 6.1.2 Dedizierte Dienstplan-Verwaltung

Neben dem eingebetteten Arbeitszeitplan im User-Modell existiert eine separate `Schedule`-Collection, die es ermöglicht, Arbeitszeitkonfigurationen unabhängig vom Benutzerprofil zu verwalten. Dies dient der Entkopplung: Änderungen am Dienstplan erfordern keine Mutation des User-Dokuments, und historische Dienstpläne können zur Nachvollziehbarkeit archiviert werden.

Die `WorkSchedule`-Collection stellt darüber hinaus globale Arbeitszeitvorlagen bereit, die mehreren Mitarbeitern zugewiesen werden können (z.B. "Vollzeit 40h", "Teilzeit 20h", "Schichtmodell A"). Dies reduziert den administrativen Aufwand bei der Konfiguration erheblich.

### 6.1.3 Administrativer Konfigurationsworkflow

Administratoren konfigurieren Arbeitszeiten über die `WorkSchedule.vue` und `Config.vue` Komponenten. Ein typischer Workflow:

1. Der Administrator navigiert zur Dienstplanverwaltung.
2. Er wählt einen Mitarbeiter aus der Dropdown-Liste.
3. Für jeden Wochentag kann er die Von/Bis-Zeiten anpassen und den Aktiv-Status per Toggle umschalten.
4. Die wöchentliche Sollarbeitszeit wird manuell eingegeben oder automatisch aus den aktiven Tagessummen berechnet.
5. Nach dem Speichern werden die neuen Soll-Werte sofort in allen Berechnungen (Billing, Überstunden) wirksam.

## 6.2 Systematischer Genehmigungs-Workflow (Leave Requests)

Der Urlaubsantragsprozess ("Leave Approval Workflow") in dieser Anwendung bildet einen klassischen asynchronen Freigabemechanismus ab, der sich über mehrere Rollenhierarchien erstreckt. Anstelle mühsam per E-Mail nachzufragen, ob ein freier Tag möglich ist, kommuniziert das Team zentral über die Applikation.

### 6.2.1 Urlaubsarten

Das System unterscheidet vier Kategorien von Abwesenheiten, die jeweils unterschiedliche Auswirkungen auf das Urlaubskonto und den Überstundensaldo haben:

1. **Jahresurlaub (vacation):** Regulärer bezahlter Urlaub berechnet auf den jährlichen Urlaubsanspruch. Reduziert den Resturlaub.
2. **Krankheitsurlaub (sick):** Krankheitsbedingte Abwesenheit. Wird nicht vom Urlaubskonto abgezogen, aber als Abwesenheit im Kalender vermerkt.
3. **Zeitausgleich (overtime):** Abbau von Überstunden als Freizeit. Reduziert den Überstundensaldo, nicht aber den Urlaubsanspruch.
4. **Sonderurlaub (other):** Für besondere Anlässe (z.B. Hochzeit, Umzug, Trauerfall). Wird je nach Betriebsvereinbarung behandelt.

### 6.2.2 Workflow-Phasen

Der Genehmigungsprozess durchläuft vier klar definierte Phasen:

- **1. Initiation (Eingabe):** Der Mitarbeiter navigiert zur Komponente `LeaveRequest.vue`. Hier gibt er ein Start- und Enddatum, die Urlaubsart und einen optionalen Grund ein. Das Frontend validiert die Daten chronologisch und blockiert fehlerhafte Zeiträume. Eine Vorschau-Berechnung zeigt dem Antragsteller sofort die Anzahl der betroffenen Arbeitstage an – unter Berücksichtigung von Wochenenden und Feiertagen.
- **2. Transit (Status 'Pending'):** Nach dem Klick wird die Anfrage via Axios an den Server geschickt (`POST /api/leave-requests`). Der Controller im Backend legt in der MongoDB ein Dokument in der Collection `LeaveRequests` an und versieht diesen Datensatz initial mit dem Wert `status: 'pending'`. Der Antragsteller sieht seinen Antrag sofort in der "Meine Anträge"-Liste mit einem orangefarbenen "In Bearbeitung"-Badge.
- **3. Bearbeitung (Admin Dashboard):** Das System filtert auf der Admin-Ansicht (`LeaveApproval.vue`) alle Einträge, die sich im 'pending'-Status befinden. Admins sehen in einer tabellarischen Listenform den Absender, den gewünschten Zeitraum sowie die verbleibenden Urlaubstage des Nutzers.
- **4. Entscheidung (Approve/Reject):** Durch das Betätigen zweier eindeutiger Call-to-Action-Buttons (`Genehmigen`/`Ablehnen`) feuert der Browser einen `PATCH`-Request auf die ID des jeweiligen Antrags. Die Datenbank überschreibt den Status mit `'approved'` (Genehmigt) oder `'rejected'` (Abgelehnt). In der Folge fließen diese Daten in die Echtzeit-Berechnung des Urlaubskontos und des Überstunden-Saldos ein, welche dem Benutzer im Frontend sofort nach der Genehmigung aktualisiert dargestellt werden.

Dieser asynchrone Kommunikationsfluss erhöht die Transparenz für den Arbeitnehmer massiv und verhindert Engpässe sowie Doppelbelegungen im Team.

### 6.2.3 Urlaubskonto-Darstellung

Das Urlaubskonto in der `LeaveRequest.vue` Komponente bietet dem Mitarbeitenden eine umfassende Übersicht:

- **Urlaubsperiode:** Der relevante Zeitraum (z.B. "01.01.2026 - 31.12.2026")
- **Stichtag:** Das aktuelle Datum als Berechnungsbasis
- **Urlaubsanspruch:** Der jährliche Gesamtanspruch in Tagen (aus dem Benutzerprofil)
- **Urlaub verbraucht:** Die Summe aller genehmigten Jahresurlaubstage in der aktuellen Periode
- **Urlaub verplant:** Die Summe aller offenen (pending) Jahresurlaubsanträge
- **Restlicher Urlaubsanspruch:** Anspruch minus verbraucht minus verplant
- **Fortschrittsbalken:** Eine visuelle Darstellung des Verbrauchs als segmentierter Balken (grün für verbraucht, orange für geplant)
- **Überstundensaldo (1:1):** Der aktuelle Überstundensaldo, berechnet aus allen WorkSessions
- **Zeitguthaben (ZGÜ):** Reserviert für zukünftige Erweiterungen
- **Saldo Gesamt (SGes):** Die Summe aller Salden

### 6.2.4 PDF-Export des Urlaubskontos

Ein besonderes Feature ist die Möglichkeit, einen offiziellen Urlaubskonto-Auszug als PDF zu exportieren. Das PDF enthält:

- Einen professionellen Kopfbereich mit Titel, Mitarbeitername und Zeitraum
- Eine Zusammenfassungsbox mit dem Restanspruch und Kontodetails
- Eine detaillierte Verlaufstabelle aller Jahresurlaubs-Anträge mit Zeitraum, Art, Status und Netto-Tagen
- Eine Fußzeile mit dem Erstelldatum und einem Disclaimer

Der Export wird über `html2pdf.js` realisiert, das ein verstecktes HTML-Template im DOM in ein A4-formatiertes PDF konvertiert. Die Toast-Benachrichtigung informiert den Benutzer über den Fortschritt: "Generiere PDF... Bitte warten ⏳" und anschließend "PDF erfolgreich exportiert! 📑".

## 6.3 Sicherheitsaspekte

Wo Genehmigungsprozesse (Workflows) stattfinden, spielen Berechtigungskonzepte und Manipulationsschutz eine entscheidende Rolle.

### 6.3.1 Rollenspezifisches Rechtemodell bei Genehmigungen

Der gesamte Genehmigungszyklus ist serverseitig durch das Modul `auth.js` abgesichert. Das Frontend verbirgt zwar die Buttons zur "Urlaubsfreigabe" per `v-if="user.role === 'admin'"` vor normalen Mitarbeitern. Doch reiner Frontend-Schutz ("Security by Obscurity") wäre fatal, da ein technisch versierter Benutzer im Browser den HTTP-Request per Postman oder cURL manuell nachbauen und "Sich selbst Urlaub gewähren" könnte.

Deshalb prüft der Backend-Router rigoros das injizierte JWT jedes eintreffenden Patches. Stellt der Controller fest, dass der Requester nicht die Rolle `admin` aufweist, bricht die Mongoose-Update-Aktion ab und verwehrt hart den Zugriff (`403 Forbidden`).

### 6.3.2 Datenintegrität bei der Urlaubsberechnung

Die Urlaubsberechnung erfolgt stets auf Basis der aktuellen Daten aus der Datenbank. Bei jedem Laden der LeaveRequest-Komponente werden die aktuellen Nutzerdaten (inkl. Urlaubsanspruch) frisch vom Backend geladen (`GET /api/me`), um sicherzustellen, dass zwischenzeitliche Änderungen durch den Admin (z.B. Erhöhung des Urlaubsanspruchs) sofort berücksichtigt werden. Auch der Dienstplan wird pro Load aktualisiert (`GET /api/schedule/:id`), um die korrekten Wochenstunden für die Überstundenberechnung zu verwenden.

### 6.3.3 Reflexion zur Sicherheitsarchitektur

Das Konzept wurde im Projekt vollumfänglich nach dem "Principle of Least Privilege" (Prinzip der minimalen Rechtevergabe) ausgearbeitet. Ein User (`user`) darf exklusiv Methoden der API aufrufen, welche den Filter `user_id == req.user.id` anwenden (z. B. das Laden _seiner eigenen_ Stempelzeiten). Die Modifikation von Fremddaten (wie dem Dienstplan oder den Dienstverträgen in der User-Verwaltung) ist in einem Sandbox-Bereich gekapselt, in den keine unterprivilegierte Rolleneinordnung vorstoßen kann.

Auch die Passwortspeicherung unterliegt diesen hohen Standards. Die Entkoppelung des Klartextpassworts von der Datenbank erfolgt über **Bcrypt (Salting und Hashing)**. Werden die `users`-Dokumente entwendet, besteht so selbst durch massive Rainbow-Table-Angriffe kein akutes Risiko, Klartext-Anmeldedaten zu extrahieren.

Die konsequente Umsetzung derart strenger RBAC-Regeln (Role-Based Access Control) auf Backend-Ebene war die technisch aufwendigste, jedoch für ein Produktivsystem (Production Environment) unabdingbarste Hürde der Projektumsetzung.
