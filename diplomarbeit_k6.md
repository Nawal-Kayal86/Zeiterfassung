# 6. Dienstplan- und Urlaubsverwaltung / Nawal /

Ein modernes Zeiterfassungssystem muss über das reine Erfassen von Präsenzzeiten hinausgehen. Der zweite wesentliche Baustein für das Fortbestehen des betrieblichen Betriebsablaufs ist die vorausschauende Personalplanung – namentlich die Verwaltung von Dienstplänen und die Genehmigung von Abwesenheiten (Urlaub, Krankheit).

Dieses Kapitel beschreibt den softwaretechnischen und rechtlichen Workflow, der hinter den Genehmigungsprozessen (Approval Workflows) steckt, und die hierbei angewandten systemischen Sicherheitsaspekte.

## 6.1 Systematischer Genehmigungs-Workflow (Leave Requests)

Der Urlaubsantragsprozess ("Leave Approval Workflow") in dieser Anwendung bildet einen klassischen asynchronen Freigabemechanismus ab, der sich über mehrere Rollenhierarchien erstreckt. Anstelle mühsam per E-Mail nachzufragen, ob ein freier Tag möglich ist, kommuniziert das Team zentral über die Applikation.

- **1. Initiation (Eingabe):** Der Mitarbeiter navigiert zur Komponente `LeaveRequest.vue`. Hier gibt er ein Start- und Enddatum sowie einen optionalen Grund ("Urlaubsantrag Sommer") ein. Das Frontend validiert die Daten chronologisch und blockiert fehlerhafte Zeiträume (z.B. Start > Ende).
- **2. Transit (Status 'Pending'):** Nach dem Klick wird die Anfrage via Axios an den Server geschickt (`POST /api/leave-requests`). Der Controller im Backend legt in der MongoDB ein Dokument in der Collection `LeaveRequests` an und versieht diesen Datensatz initial mit dem Wert `status: 'pending'`.
- **3. Bearbeitung (Admin Dashboard):** Das System filtert auf der Admin-Ansicht (`LeaveApproval.vue`) alle Einträge, die sich im 'pending'-Status befinden. Admins sehen in einer tabellarischen Listenform den Absender, den gewünschten Zeitraum sowie die verbleibenden Urlaubstage des Nutzers.
- **4. Entscheidung (Approve/Reject):** Durch das Betätigen zweier eindeutiger Call-to-Action-Buttons (`Genehmigen`/`Ablehnen`) feuert der Browser einen `PATCH`-Request auf die ID des jeweiligen Antrags. Die Datenbank überschreibt den Status mit `'approved'` (Genehmigt) oder `'rejected'` (Abgelehnt). In der Folge fließen diese Daten in die Echtzeit-Berechnung des Urlaubskontos und des Überstunden-Saldos ein, welche dem Benutzer im Frontend sofort nach der Genehmigung aktualisiert dargestellt werden.

Dieser asynchrone Kommunikationsfluss erhöht die Transparenz für den Arbeitnehmer massiv und verhindert Engpässe sowie Doppelbelegungen im Team.

## 6.2 Sicherheitsaspekte

Wo Genehmigungsprozesse (Workflows) stattfinden, spielen Berechtigungskonzepte und Manipulationsschutz eine entscheidende Rolle.

### 6.2.1 Rollenspezifisches Rechtemodell bei Genehmigungen

Der gesamte Genehmigungszyklus ist serverseitig durch das Modul `auth.js` abgesichert. Das Frontend verbirgt zwar die Buttons zur "Urlaubsfreigabe" per `v-if="user.role === 'admin'"` vor normalen Mitarbeitern. Doch reiner Frontend-Schutz ("Security by Obscurity") wäre fatal, da ein technisch versierter Benutzer im Browser den HTTP-Request per Postman oder cURL manuell nachbauen und "Sich selbst Urlaub gewähren" könnte.

Deshalb prüft der Backend-Router rigoros das injizierte JWT (JSON Web Token) jedes eintreffenden Patches. Stellt der Controller fest, dass der Requester nicht die Rolle `admin` aufweist, bricht die Mongoose-Update-Aktion ab und verwehrt hart den Zugriff (`403 Forbidden`).

### 6.2.2 Reflexion zur Sicherheitsarchitektur

Das Konzept wurde im Projekt vollumfänglich nach dem "Principle of Least Privilege" (Prinzip der minimalen Rechtevergabe) ausgearbeitet. Ein User (`user`) darf exklusiv Methoden der API aufrufen, welche den Filter `user_id == req.user.id` anwenden (z. B. das Laden _seiner eigenen_ Stempelzeiten). Die Modifikation von Fremddaten (wie dem Dienstplan oder den Dienstverträgen in der User-Verwaltung) ist in einem Sandbox-Bereich gekapselt, in den keine unterprivilegierte Rolleneinordnung vorstoßen kann.

Auch die Passwortspeicherung unterliegt diesen hohen Standards. Die Entkoppelung des Klartextpassworts von der Datenbank erfolgt über **Bcrypt (Salting und Hashing)**. Werden die `users`-Dokumente entwendet, besteht so selbst durch massive Rainbow-Table-Angriffe kein akutes Risiko, Klartext-Anmeldedaten zu extrahieren.
Die konsequente Umsetzung derart strenger RBAC-Regeln (Role-Based Access Control) auf Backend-Ebene war die technisch aufwendigste, jedoch für ein Produktivsystem (Production Environment) unabdingbarste Hürde der Projektumsetzung.
