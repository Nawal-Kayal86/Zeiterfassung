# 1. Einleitung / Nawal /

Das vorliegende Dokument bildet die Dokumentation der Diplomarbeit von Nawal Kayal und Ahmad Alalan. Im Rahmen dieser Arbeit wurde ein vollständiges, cloud-basiertes Zeiterfassungssystem konzipiert, entwickelt und erfolgreich bereitgestellt. Die Digitalisierung von Arbeitsprozessen ist in der heutigen Geschäftswelt ein entscheidender Faktor für die Wettbewerbsfähigkeit von Unternehmen. Einer der zentralen Bereiche, der von einer solchen Transformation profitiert, ist die Arbeitszeiterfassung. Durch die zunehmend flexibleren Arbeitszeitmodelle, wie Gleitzeit und Home-Office, steigen die Anforderungen an Systeme, welche die Arbeits- und Pausenzeiten der Mitarbeitenden rechtskonform, transparent und effizient protokollieren.

## 1.1 Projektkontext

Ausgelöst durch jüngste Beschlüsse des Europäischen Gerichtshofs (EuGH) und Anpassungen in nationalen Arbeitsgesetzen sind Unternehmen – vom Kleinbetrieb bis zum Großkonzern – in der Pflicht, sämtliche Arbeitszeiten ihrer Belegschaft systematisch und fälschungssicher zu erfassen. Vor diesem Hintergrund entstand die Idee für das vorliegende Projekt.
Traditionelle Lösungen wie Stempelkarten aus Papier oder aufwendig geführte Excel-Listen sind nicht nur fehleranfällig, sondern verursachen in der Personalverwaltung (Human Resources) einen massiven administrativen Überbau. Die Herausforderung bestand darin, eine moderne Softwarearchitektur zu schaffen, die sowohl von technischen Laien intuitiv bedient werden kann als auch den administrativen Anforderungen von Abteilungs- und Personalleitern gerecht wird.

Die entwickelte Applikation ist eine vollwertige "Single Page Application" (SPA) basierend auf dem JavaScript-Framework Vue.js 3 im Frontend, gepaart mit einem performanten Node.js/Express-Server im Backend. Eine NoSQL-Datenbank (MongoDB) dient zur flexiblen und persistenten Datenspeicherung. Das Projekt wurde nach modernen Software-Engineering-Prinzipien umgesetzt und vollständig in der Cloud (Render und MongoDB Atlas) provisioniert, sodass es plattformunabhängig im Webbrowser nutzbar ist.

## 1.2 Projektziele

Das oberste Ziel der Arbeit war die Entwicklung eines leichtgewichtigen (Minimal Viable Product) aber voll funktionsfähigen Zeiterfassungssystems, das ohne große Einarbeitungszeit von allen Mitarbeitenden eines Unternehmens verwendet werden kann. Es galt, eine Lösung zu entwerfen, die den gesamten Mitarbeiterlebenszyklus hinsichtlich der Anwesenheitsverwaltung abdeckt – vom ersten Stempeln beim Tagesbeginn über die Verwaltung von Urlaubstagen bis hin zur finalen Zeitabrechnung durch die Administration.

Besonderer Wert wurde bei der Konzeption auf das Design der Benutzeroberfläche gelegt. Die Nutzerführung devait "frictionless" – also ohne Reibungsverluste – erfolgen. Die Trennung der Software in eine REST-basierte API und ein entkoppeltes Client-Interface sollte zudem die zukünftige Skalierbarkeit sicherstellen, etwa um in späteren Phasen Hardware-Terminals (z. B. NFC-Lesegeräte) oder native mobile Anwendungen integrieren zu können.

Um den Erfolg und die Fertigstellung des Projekts strukturiert messen zu können, wurden die Ziele nach dem MoSCoW-Prinzip (Must, Should, Could, Won't) in sogenannte MUSS- und ZUSATZ-Ziele unterteilt.

## 1.3 MUSS-Ziele

Bei den MUSS-Zielen (Must-Haves) handelt es sich um die essenziellen Anforderungen, ohne die das fertige Produkt seinen fundamentalen Zweck nicht erfüllen würde. Zu den MUSS-Zielen dieser Diplomarbeit zählen:

- **Sichere Benutzerauthentifizierung:** Ein Login-System basierend auf JWT (JSON Web Tokens), welches sicherstellt, dass nur autorisierte Mitarbeitende Zugang zum Zeiterfassungsportal erhalten. Kennwörter müssen durch kryptografische Verfahren (bcrypt) in der Datenbank gespeichert werden.
- **Hierarchisches Rollensystem:** Implementierung einer logischen Trennung zwischen normalen Benutzern (`user`), Personalverantwortlichen bzw. Abteilungsleitern (`employee`/`manager`) und Systemadministratoren (`admin`). Die Zugriffsrechte der API und des Frontends müssen anhand dieser Rollen validiert werden.
- **Digitale Stempeluhr (Dashboard):** Eine zentrale, einfach zu bedienende Dashboard-Komponente, die es dem Benutzer ermöglicht, Arbeitsbeginn, Pausen (z. B. für Arztbesuche) und Arbeitsende mit einem einzigen Klick ("Echtzeit-Stempeln") zu erfassen. Ein interaktiver Live-Zähler soll die aktuelle Sitzungsdauer visualisieren.
- **Persistenz und Relationen:** Zuverlässige Speicherung der Stempeldaten (Start, Ende, Pausenzeiten) gekoppelt an den jeweiligen Benutzer in der MongoDB.
- **Kalender-/Dienstplanansicht:** Bereitstellung einer visuellen Übersicht der monatlichen Arbeitszeiten und der hinterlegten Schichten/Dienstpläne pro Abteilung.
- **Urlaubs- und Abwesenheitsverwaltung:** Die Möglichkeit für Mitarbeitende, Urlaubsanträge (Leave Requests) digital einzureichen und den Status (Pending, Approved, Rejected) einzusehen.

## 1.4 ZUSATZ-Ziele

ZUSATZ-Ziele (Should-Haves und Could-Haves) repräsentieren Funktionen, die den Komfort erhöhen, die Administration erleichtern oder das optische Erscheinungsbild aufwerten ("Quality of Life"-Features), jedoch für den reinen Betrieb der Kernfunktion entbehrlich sind:

- **Manuelle Zeiterfassung & Nachtragung:** Falls ein Mitarbeiter das Stempeln vergisst, soll eine Maske existieren, um Zeiten manuell über ein Datum- und Uhrzeit-Interface nachzutragen. Auch diese Zeiten müssen in der Auswertung berücksichtigt werden.
- **Erweitertes Berichts- & Billing-System:** Die Aggregation der gestempelten Zeiten zur Berechnung von Soll- und Ist-Stunden auf monatlicher Basis. Administratoren sollen globale Dashboards mit Statistiken (z. B. verbrachte Arbeitsstunden pro Abteilung) aufrufen können.
- **Dynamische Benutzeroberfläche:** Implementierung von ansprechenden "Micro-Animations", interaktiven Tooltips und einem flüssigen Routing-Verhalten, um die User Experience (UX) auf das Niveau moderner Produktivitäts-Apps zu heben.
- **Cloud Deployment:** Die automatische und lauffähige Bereitstellung des Backends, Frontends und der Datenbank in einer realen Cloud-Umgebung, anstatt lediglich auf lokalen Entwicklungsservern (`localhost`). Dies ermöglicht die Nutzung von jedem Gerät aus mit einer festen URL.
- **NFC-Vorbereitung:** Die softwareseitige Vorbereitung des Datenmodells (Speichern von NFC-Tag-IDs bei den Nutzern), um zukünftig auf Smartphones mit Web-NFC-API oder echten physischen Scannern basierend stempeln zu können (Proof of Concept).

Zusammenfassend verfolgt dieses Projekt den Anspruch, eine durchgängige Fullstack-Anwendung im stark gefragten MEVN-Stack (MongoDB, Express, Vue, Node) zu realisieren, die sowohl architektonisch sauber als auch praxisnah zur Lösung aktueller Workflow-Hürden konzipiert ist. Im folgenden Kapitel wird dargelegt, wie die Konzeption der Benutzeroberfläche und die Definition der Design-Philosophie diesen Zielen Rechnung tragen.
