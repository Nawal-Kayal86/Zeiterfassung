# 1. Einleitung

Das vorliegende Dokument bildet die Dokumentation der Diplomarbeit von Nawal Kayal und Ahmad Alalan. Im Rahmen dieser Arbeit wurde ein vollständiges, cloud-basiertes Zeiterfassungssystem konzipiert, entwickelt und erfolgreich bereitgestellt. Die Digitalisierung von Arbeitsprozessen ist in der heutigen Geschäftswelt ein entscheidender Faktor für die Wettbewerbsfähigkeit von Unternehmen. Einer der zentralen Bereiche, der von einer solchen Transformation profitiert, ist die Arbeitszeiterfassung. Durch die zunehmend flexibleren Arbeitszeitmodelle, wie Gleitzeit und Home-Office, steigen die Anforderungen an Systeme, welche die Arbeits- und Pausenzeiten der Mitarbeitenden rechtskonform, transparent und effizient protokollieren.

## 1.1 Projektkontext

Ausgelöst durch jüngste Beschlüsse des Europäischen Gerichtshofs (EuGH) und Anpassungen in nationalen Arbeitsgesetzen sind Unternehmen – vom Kleinbetrieb bis zum Großkonzern – in der Pflicht, sämtliche Arbeitszeiten ihrer Belegschaft systematisch und fälschungssicher zu erfassen. Vor diesem Hintergrund entstand die Idee für das vorliegende Projekt "Zeiterfassung".

Traditionelle Lösungen wie Stempelkarten aus Papier oder aufwendig geführte Excel-Listen sind nicht nur fehleranfällig, sondern verursachen in der Personalverwaltung (Human Resources) einen massiven administrativen Überbau. Die Herausforderung bestand darin, eine moderne Softwarearchitektur zu schaffen, die sowohl von technischen Laien intuitiv bedient werden kann als auch den administrativen Anforderungen von Abteilungs- und Personalleitern gerecht wird.

Die entwickelte Applikation ist eine vollwertige "Single Page Application" (SPA) basierend auf dem JavaScript-Framework Vue.js 3 im Frontend, gepaart mit einem performanten Node.js/Express-Server im Backend. Eine NoSQL-Datenbank (MongoDB) dient zur flexiblen und persistenten Datenspeicherung. Das Projekt wurde nach modernen Software-Engineering-Prinzipien umgesetzt und vollständig in der Cloud (Render und MongoDB Atlas) provisioniert, sodass es plattformunabhängig im Webbrowser nutzbar ist.

## 1.2 Projektziele

Das oberste Ziel der Arbeit was die Entwicklung eines umfassenden Zeiterfassungssystems, das ohne große Einarbeitungszeit von allen Mitarbeitenden eines Unternehmens verwendet werden kann. Es galt, eine Lösung zu entwerfen, die den gesamten Mitarbeiterlebenszyklus hinsichtlich der Anwesenheitsverwaltung abdeckt – vom ersten Stempeln beim Tagesbeginn über die Verwaltung von Urlaubstagen bis hin zur finalen Zeitabrechnung und dem Export von Berichten.

Besonderer Wert wurde bei der Konzeption auf das Design der Benutzeroberfläche gelegt. Die Nutzerführung soll "frictionless" – also ohne Reibungsverluste – erfolgen. Die Trennung der Software in eine REST-basierte API und ein entkoppeltes Client-Interface stellt zudem die zukünftige Skalierbarkeit sicher, etwa um in späteren Phasen Hardware-Terminals (z. B. NFC-Lesegeräte) oder native mobile Anwendungen integrieren zu können.

Um den Erfolg und die Fertigstellung des Projekts strukturiert messen zu können, wurden die Ziele nach dem MoSCoW-Prinzip (Must, Should, Could, Won't) in sogenannte MUSS- und ZUSATZ-Ziele unterteilt. Im Verlauf der Entwicklung wurden viele der ursprünglichen Zusatzziele bereits erfolgreich in den Kernfunktionsumfang integriert.

## 1.3 MUSS-Ziele

Bei den MUSS-Zielen (Must-Haves) handelt es sich um die essenziellen Anforderungen, ohne die das fertige Produkt seinen fundamentalen Zweck nicht erfüllen würde. Zu den MUSS-Zielen dieser Diplomarbeit zählen:

- **Sichere Benutzerauthentifizierung:** Ein Login-System basierend auf JWT (JSON Web Tokens), welches sicherstellt, dass nur autorisierte Mitarbeitende Zugang zum Zeiterfassungsportal erhalten. Kennwörter werden durch kryptografische Verfahren (bcrypt) sicher gespeichert.
- **Hierarchisches Rollen- und Abteilungsmanagement:** Implementierung einer logischen Trennung zwischen normalen Benutzern (`user`), Personalverantwortlichen bzw. Abteilungsleitern (`employee`/`manager`) und Systemadministratoren (`admin`). Nutzer können Abteilungen zugeordnet werden, um die Verwaltung zu strukturieren.
- **Digitale Stempeluhr (Dashboard):** Eine zentrale Dashboard-Komponente mit Echtzeit-Tracking. Ein interaktiver Live-Zähler visualisiert die aktuelle Sitzungsdauer und berücksichtigt dabei auch Pausenzeiten.
- **Manuelle Zeiterfassung & Korrektur:** Die Möglichkeit für Benutzer und Administratoren, Arbeitszeiten manuell nachzutragen oder bestehende Einträge zu korrigieren, falls das Stempeln vergessen wurde.
- **Flexible Dienstplan- und Soll-Stunden-Verwaltung:** Jeder Mitarbeiter verfügt über ein hinterlegtes Arbeitszeitmodell (Wochenstunden und feste Schichtzeiten), das als Basis für die Soll-Ist-Vergleiche dient.
- **Urlaubs- und Abwesenheitsverwaltung:** Ein digitales Antragsverfahren für Urlaube und Abwesenheiten mit Statusverfolgung (Pending, Approved, Rejected).

## 1.4 ZUSATZ-Ziele

ZUSATZ-Ziele repräsentieren Funktionen, welche die Administration erleichtern oder das optische Erscheinungsbild aufwerten ("Quality of Life"-Features):

- **Professionelles Berichts- & Billing-System:** Aggregation der gestempelten Zeiten zur Berechnung von Überstunden und Monatsabrechnungen. Integration eines PDF-Export-Systems (mittels `html2pdf.js`) zum Generieren von offiziellen Arbeitszeitnachweisen.
- **Sondertermin-Tracking (Workflow):** Erfassung spezieller Abwesenheiten wie Arztbesuche oder Behördengänge mit Validierungslogik (z.B. maximale Dauer von 3 Stunden).
- **Dynamische Benutzeroberfläche & UX:** Implementierung von ansprechenden Animationen (z.B. Pulse-Effekt beim aktiven Stempeln), interaktiven Dashboards und einem responsiven Design für die Nutzung auf mobilen Endgeräten.
- **System-Logging & Audit Trail:** Eine administrative Ansicht zur Überwachung von Systemereignissen und Fehlermeldungen (vorgesehen im Terminal-Interface).
- **NFC-Vorbereitung:** Die softwareseitige Vorbereitung des Datenmodells (Speichern von NFC-Tag-IDs bei den Nutzern), um zukünftig auf Smartphones mit Web-NFC-API oder physischen Scannern stempeln zu können (Proof of Concept).

Zusammenfassend verfolgt dieses Projekt den Anspruch, eine durchgängige Fullstack-Anwendung im MEVN-Stack (MongoDB, Express, Vue, Node) zu realisieren, die sowohl architektonisch sauber als auch praxisnah zur Lösung aktueller Workflow-Hürden konzipiert ist. Im folgenden Kapitel wird dargelegt, wie die Konzeption der Benutzeroberfläche und die Definition der Design-Philosophie diesen Zielen Rechnung tragen.
