# 1. Einleitung

Das vorliegende Dokument bildet die Dokumentation der Diplomarbeit von Nawal Kayal und Ahmad Alalan. Im Rahmen dieser Arbeit wurde ein vollständiges, cloud-basiertes Zeiterfassungssystem konzipiert, entwickelt und erfolgreich bereitgestellt. Die Digitalisierung von Arbeitsprozessen ist in der heutigen Geschäftswelt ein entscheidender Faktor für die Wettbewerbsfähigkeit von Unternehmen. Einer der zentralen Bereiche, der von einer solchen Transformation profitiert, ist die Arbeitszeiterfassung. Durch die zunehmend flexibleren Arbeitszeitmodelle, wie Gleitzeit und Home-Office, steigen die Anforderungen an Systeme, welche die Arbeits- und Pausenzeiten der Mitarbeitenden rechtskonform, transparent und effizient protokollieren.

Die Motivation für dieses Projekt resultiert aus der Beobachtung, dass insbesondere kleine und mittlere Unternehmen (KMU) in Österreich und Deutschland nach wie vor auf analoge Methoden der Zeiterfassung zurückgreifen. Laut einer Studie des Bundesministeriums für Arbeit und Soziales aus dem Jahr 2023 verwenden noch immer über 40 Prozent der Betriebe mit weniger als 50 Mitarbeitenden manuelle Verfahren wie handschriftliche Stundenzettel oder einfache Tabellenkalkulationen. Diese Praxis führt nicht nur zu einer erhöhten Fehlerquote bei der Lohn- und Gehaltsabrechnung, sondern birgt auch das Risiko, arbeitsrechtliche Dokumentationspflichten nicht vollständig zu erfüllen.

## 1.1 Projektkontext

Ausgelöst durch jüngste Beschlüsse des Europäischen Gerichtshofs (EuGH) und Anpassungen in nationalen Arbeitsgesetzen sind Unternehmen – vom Kleinbetrieb bis zum Großkonzern – in der Pflicht, sämtliche Arbeitszeiten ihrer Belegschaft systematisch und fälschungssicher zu erfassen. Vor diesem Hintergrund entstand die Idee für das vorliegende Projekt "Zeiterfassung".

Das wegweisende Urteil des EuGH vom 14. Mai 2019 (Rechtssache C-55/18, CCOO gegen Deutsche Bank) verpflichtet die Mitgliedstaaten der Europäischen Union dazu, Arbeitgeber zur Einführung eines "objektiven, verlässlichen und zugänglichen Systems" der Arbeitszeiterfassung zu verpflichten. Dieses Urteil stützt sich auf die Auslegung der Arbeitszeitrichtlinie 2003/88/EG und der Rahmenrichtlinie 89/391/EWG zum Schutz der Gesundheit und Sicherheit der Arbeitnehmer. In Österreich wurde dieser Rechtsrahmen durch das Arbeitszeitgesetz (AZG) und das Arbeitsruhegesetz (ARG) bereits grundsätzlich abgedeckt, wobei die Pflicht zur lückenlosen Aufzeichnung durch die neue Rechtsprechung erheblich verschärft wurde.

Traditionelle Lösungen wie Stempelkarten aus Papier oder aufwendig geführte Excel-Listen sind nicht nur fehleranfällig, sondern verursachen in der Personalverwaltung (Human Resources) einen massiven administrativen Überbau. Die Herausforderung bestand darin, eine moderne Softwarearchitektur zu schaffen, die sowohl von technischen Laien intuitiv bedient werden kann als auch den administrativen Anforderungen von Abteilungs- und Personalleitern gerecht wird. Das System musste dabei sowohl die gesetzlichen Anforderungen an die Dokumentation erfüllen als auch eine angenehme Benutzererfahrung (User Experience) bieten, um die Akzeptanz bei den Mitarbeitenden sicherzustellen.

Die entwickelte Applikation ist eine vollwertige "Single Page Application" (SPA) basierend auf dem JavaScript-Framework Vue.js 3 im Frontend, gepaart mit einem performanten Node.js/Express-Server im Backend. Eine NoSQL-Datenbank (MongoDB) dient zur flexiblen und persistenten Datenspeicherung. Das Projekt wurde nach modernen Software-Engineering-Prinzipien umgesetzt und vollständig in der Cloud (Render und MongoDB Atlas) provisioniert, sodass es plattformunabhängig im Webbrowser nutzbar ist.

Die Wahl des MEVN-Stacks (MongoDB, Express.js, Vue.js, Node.js) als technologische Basis war eine bewusste Entscheidung. Dieser Stack ermöglicht eine durchgängige Entwicklung in JavaScript auf allen Ebenen – vom Datenbankzugriff über die Serverlogik bis hin zur Benutzeroberfläche. Diese Homogenität reduziert den Kontextwechsel für Entwickler erheblich und beschleunigt den Entwicklungsprozess. Zudem verfügt der MEVN-Stack über eine große, aktive Community und eine Vielzahl an bewährten Bibliotheken und Werkzeugen.

## 1.2 Projektziele

Das oberste Ziel der Arbeit war die Entwicklung eines umfassenden Zeiterfassungssystems, das ohne große Einarbeitungszeit von allen Mitarbeitenden eines Unternehmens verwendet werden kann. Es galt, eine Lösung zu entwerfen, die den gesamten Mitarbeiterlebenszyklus hinsichtlich der Anwesenheitsverwaltung abdeckt – vom ersten Stempeln beim Tagesbeginn über die Verwaltung von Urlaubstagen bis hin zur finalen Zeitabrechnung und dem Export von Berichten.

Besonderer Wert wurde bei der Konzeption auf das Design der Benutzeroberfläche gelegt. Die Nutzerführung soll "frictionless" – also ohne Reibungsverluste – erfolgen. Ein Stempelvorgang darf nach dem Login nicht mehr als einen einzigen Klick erfordern. Die Trennung der Software in eine REST-basierte API und ein entkoppeltes Client-Interface stellt zudem die zukünftige Skalierbarkeit sicher, etwa um in späteren Phasen Hardware-Terminals (z. B. NFC-Lesegeräte) oder native mobile Anwendungen integrieren zu können.

Ein weiteres zentrales Ziel war die Demonstration der Praxistauglichkeit durch ein vollständiges Cloud-Deployment. Die Applikation sollte nicht nur auf lokalen Entwicklungsservern funktionieren, sondern unter einer festen, öffentlich erreichbaren URL im Internet verfügbar sein. Dies stellte besondere Anforderungen an die Konfiguration des Servers, die Absicherung der API und die Handhabung des SPA-Routings in einer Produktionsumgebung.

Um den Erfolg und die Fertigstellung des Projekts strukturiert messen zu können, wurden die Ziele nach dem MoSCoW-Prinzip (Must, Should, Could, Won't) in sogenannte MUSS- und ZUSATZ-Ziele unterteilt. Im Verlauf der Entwicklung wurden viele der ursprünglichen Zusatzziele bereits erfolgreich in den Kernfunktionsumfang integriert, was den iterativen Charakter des Entwicklungsprozesses widerspiegelt.

## 1.3 MUSS-Ziele

Bei den MUSS-Zielen (Must-Haves) handelt es sich um die essenziellen Anforderungen, ohne die das fertige Produkt seinen fundamentalen Zweck nicht erfüllen würde. Zu den MUSS-Zielen dieser Diplomarbeit zählen:

- **Sichere Benutzerauthentifizierung:** Ein Login-System basierend auf JWT (JSON Web Tokens), welches sicherstellt, dass nur autorisierte Mitarbeitende Zugang zum Zeiterfassungsportal erhalten. Kennwörter werden durch kryptografische Verfahren (bcrypt) sicher gespeichert. Der Authentifizierungsmechanismus muss zustandslos (stateless) sein, um eine horizontale Skalierung des Backends zu ermöglichen.
- **Hierarchisches Rollen- und Abteilungsmanagement:** Implementierung einer logischen Trennung zwischen normalen Benutzern (`user`), Personalverantwortlichen bzw. Abteilungsleitern (`employee`/`manager`) und Systemadministratoren (`admin`). Nutzer können Abteilungen zugeordnet werden, um die Verwaltung zu strukturieren. Die Zugriffsrechte der API und des Frontends müssen anhand dieser Rollen validiert werden (Role-Based Access Control, RBAC).
- **Digitale Stempeluhr (Dashboard):** Eine zentrale Dashboard-Komponente mit Echtzeit-Tracking. Ein interaktiver Live-Zähler visualisiert die aktuelle Sitzungsdauer und berücksichtigt dabei auch Pausenzeiten. Der Stempelvorgang ("Kommen" und "Gehen") muss mit einem einzigen Klick durchführbar sein.
- **Manuelle Zeiterfassung & Korrektur:** Die Möglichkeit für Benutzer und Administratoren, Arbeitszeiten manuell nachzutragen oder bestehende Einträge zu korrigieren, falls das Stempeln vergessen wurde. Auch diese manuell erfassten Zeiten müssen in sämtlichen Auswertungen berücksichtigt werden.
- **Flexible Dienstplan- und Soll-Stunden-Verwaltung:** Jeder Mitarbeiter verfügt über ein hinterlegtes Arbeitszeitmodell (Wochenstunden und feste Schichtzeiten pro Wochentag), das als Basis für die Soll-Ist-Vergleiche dient. Die Administration muss diese Modelle individuell für jeden Mitarbeitenden konfigurieren können.
- **Urlaubs- und Abwesenheitsverwaltung:** Ein digitales Antragsverfahren für Urlaube und Abwesenheiten mit Statusverfolgung (Pending, Approved, Rejected). Das System muss verschiedene Urlaubsarten (Jahresurlaub, Krankenstand, Zeitausgleich, Sonderurlaub) unterscheiden und den Resturlaub automatisch berechnen.
- **Persistenz und Datenintegrität:** Zuverlässige Speicherung aller Stempeldaten (Start, Ende, Pausenzeiten) gekoppelt an den jeweiligen Benutzer in der MongoDB. Die Datenbank muss in der Cloud gehostet werden, um Datenverlust bei lokalen Ausfällen zu verhindern.
- **Kalender- und Dienstplanansicht:** Bereitstellung einer visuellen Monatsübersicht der Arbeitszeiten mittels einer integrierten Kalenderkomponente. Schichten und genehmigte Urlaube werden farblich codiert dargestellt.

## 1.4 ZUSATZ-Ziele

ZUSATZ-Ziele (Should-Haves und Could-Haves) repräsentieren Funktionen, welche die Administration erleichtern oder das optische Erscheinungsbild aufwerten ("Quality of Life"-Features):

- **Professionelles Berichts- & Billing-System:** Aggregation der gestempelten Zeiten zur Berechnung von Überstunden und Monatsabrechnungen. Integration eines PDF-Export-Systems (mittels `html2pdf.js`) zum Generieren von offiziellen Arbeitszeitnachweisen. Die Abrechnung muss Soll-Stunden, Ist-Stunden, Überstunden, Gleitzeitsaldo und weitere abrechnungsrelevante Felder pro Tag und Monat darstellen können.
- **Sondertermin-Tracking (Workflow):** Erfassung spezieller Abwesenheiten wie Arztbesuche oder Behördengänge mit Validierungslogik (z.B. maximale Dauer von 3 Stunden). Diese Sondertermine werden separat von den regulären Arbeitsschichten verwaltet und ermöglichen eine lückenlose Dokumentation der Abwesenheitsgründe.
- **Echtzeit-Überstundenberechnung:** Das System berechnet in Echtzeit den aktuellen Überstundensaldo des eingeloggten Mitarbeiters, indem es sämtliche abgeschlossene Arbeitssitzungen mit den hinterlegten Soll-Stunden vergleicht. Genehmigte Zeitausgleichstage werden automatisch vom Saldo abgezogen.
- **Dynamische Benutzeroberfläche & UX:** Implementierung von ansprechenden Animationen (z.B. Pulse-Effekt beim aktiven Stempeln), interaktiven Dashboards mit Toast-Benachrichtigungen und einem responsiven Design für die Nutzung auf mobilen Endgeräten. Die User Experience soll das Niveau moderner Produktivitäts-Apps erreichen.
- **Feiertags-Integration:** Automatische Berücksichtigung gesetzlicher Feiertage bei der Berechnung von Urlaubstagen und Sollarbeitszeiten. Feiertage werden in einer separaten Datenbank-Collection verwaltet und fließen in sämtliche Kalkulationen ein.
- **System-Logging & Audit Trail:** Eine administrative Ansicht zur Überwachung von Systemereignissen und Fehlermeldungen im Terminal-Interface. Alle relevanten Aktionen (Login, Stempeln, Urlaubsanträge) werden protokolliert und sind für Administratoren einsehbar.
- **Cloud Deployment:** Die automatische und lauffähige Bereitstellung des Backends, Frontends und der Datenbank in einer realen Cloud-Umgebung (Render.com und MongoDB Atlas), anstatt lediglich auf lokalen Entwicklungsservern. Dies ermöglicht die Nutzung von jedem Gerät aus mit einer festen URL.
- **NFC-Vorbereitung:** Die softwareseitige Vorbereitung des Datenmodells (Speichern von NFC-Tag-IDs bei den Nutzern), um zukünftig auf Smartphones mit Web-NFC-API oder physischen Scannern stempeln zu können (Proof of Concept).

## 1.5 Aufgabenverteilung

Die vorliegende Diplomarbeit wurde als Teamprojekt von zwei Personen durchgeführt. Die Aufgabenverteilung wurde zu Projektbeginn festgelegt und im Verlauf der Entwicklung flexibel angepasst:

- **Nawal Kayal:** Verantwortlich für die Konzeption und Implementierung des Frontends (Vue.js 3), das UI/UX-Design, die Kalender- und Urlaubsverwaltungskomponenten, die PDF-Export-Funktionalität sowie die Dokumentation der Kapitel 1, 2, 5 und 6.
- **Ahmad Alalan:** Verantwortlich für die Backend-Architektur (Node.js/Express), das Datenbankdesign (MongoDB/Mongoose), die API-Endpunkte, die Authentifizierungs- und Autorisierungslogik, das Cloud-Deployment sowie die Dokumentation der Kapitel 3 und 4.
- **Gemeinsam:** Integration der Teilsysteme, End-to-End-Tests, Fehlerbehebung, Kapitel 7 (Herausforderungen und Lösungen) sowie die Zusammenfassung.

## 1.6 Aufbau der Arbeit

Die vorliegende Diplomarbeit gliedert sich in sieben Hauptkapitel, die den gesamten Entwicklungsprozess von der Konzeption bis zur Reflexion nachvollziehbar dokumentieren:

- **Kapitel 1 – Einleitung:** Stellt den Projektkontext, die Motivation und die Zieldefinition vor.
- **Kapitel 2 – Benutzeroberfläche und Design:** Beschreibt die Anforderungsanalyse, die Design-Philosophie und die Implementierung der UI-Komponenten.
- **Kapitel 3 – Technische Architektur:** Erläutert den Technologie-Stack, das Datenbankdesign, die API-Struktur und das Sicherheitskonzept.
- **Kapitel 4 – Implementierung:** Dokumentiert ausgewählte Implementierungsdetails des Backends und Frontends sowie deren Integration.
- **Kapitel 5 – Zeiterfassungs-Prozess und Abrechnung:** Beschreibt den fachlichen Kernprozess des Stempelns und die Berichtsaggreation.
- **Kapitel 6 – Dienstplan- und Urlaubsverwaltung:** Erläutert den Genehmigungs-Workflow und die Sicherheitsaspekte.
- **Kapitel 7 – Herausforderungen und Lösungen:** Reflektiert die technischen Hürden und deren Lösungsansätze, gefolgt von der Zusammenfassung und einem Ausblick.

Zusammenfassend verfolgt dieses Projekt den Anspruch, eine durchgängige Fullstack-Anwendung im MEVN-Stack (MongoDB, Express, Vue, Node) zu realisieren, die sowohl architektonisch sauber als auch praxisnah zur Lösung aktueller Workflow-Hürden konzipiert ist. Im folgenden Kapitel wird dargelegt, wie die Konzeption der Benutzeroberfläche und die Definition der Design-Philosophie diesen Zielen Rechnung tragen.
