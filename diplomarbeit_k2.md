# 2. Benutzeroberfläche und Design / Nawal & Ahmad /

Die Benutzeroberfläche (User Interface, UI) ist das Aushängeschild jeder modernen Anwendung. Im Rahmen unseres Zeiterfassungssystems wurde besonderer Wert auf eine intuitive, barrierearme und optisch ansprechende Gestaltung gelegt. Wenn ein Zeiterfassungssystem von Mitarbeitenden als lästige Pflicht empfunden wird, sinkt die Datenqualität rapide. Ziel war es daher, ein System zu schaffen, welches sich nahtlos in den Arbeitsalltag einfügt und durch ein "frictionless" Design (reibungslose Bedienung) besticht.

## 2.1 Anforderungsanalyse und Design-Philosophie

Bevor mit der konkreten Implementierung der Vue-Komponenten begonnen wurde, war eine fundierte Anforderungsanalyse unerlässlich. Hierbei wurden sowohl die Bedürfnisse der Endanwender als auch die der Administration erfasst.

### 2.1.1 Identifikation der Nutzergruppen

Das System differenziert strikt zwischen drei iterativen Nutzergruppen, deren Dashboards sich funktional und visuell unterscheiden:
1. **Standard-Benutzer (User):** Mitarbeiter, deren primäre Interaktion aus dem täglichen Ein- und Ausstempeln sowie dem Einreichen von Urlaubsanträgen besteht. Für diese Gruppe muss die primäre Call-to-Action (der Stempel-Button) stets omnipräsent sein.
2. **Abteilungsleiter (Employee / Manager):** Anwender mit erweiterten Rechten, die Einsicht in die Dienstpläne ihrer spezifischen Abteilung haben und Urlaubsanträge der untergeordneten Mitarbeiter validieren können.
3. **Administratoren (Admin):** Die höchste Berechtigungsstufe. Administratoren haben Zugriff auf das vollumfängliche Rechtemanagement, die globale Workflow-Kontrolle und die systemweiten Abrechnungsberichte (Billing).

### 2.1.2 Detaillierte Benutzeranforderungen

Aus der Nutzergruppenanalyse wurden konkrete Anforderungen abgeleitet:
*   **Minimalistische Interaktion:** Ein Stempelvorgang darf nicht mehr als einen Klick nach dem Login erfordern.
*   **Visuelles Feedback:** Echtzeit-Rückmeldungen, wie eine animierte Live-Uhr und `Success/Error`-Toasts, sind zwingend erforderlich, um dem Nutzer Systemzustände (z.B. "Live Sitzung läuft") unmissverständlich zu kommunizieren.
*   **Transparenz:** Jeder Nutzer muss seine eigene Historie (wann wurde gestempelt, wie lange dauerte die Pause) jederzeit einsehen können.

### 2.1.3 Leitende Designprinzipien

Die grafische Umsetzung orientiert sich am modernen *Flat Design* unter Einbeziehung leichter Schatten (Soft-Shadows) und runder Kanten (`border-radius`), was der Applikation eine "weiche" und moderne Anmutung verleiht. Große, farblich abgesetzte Informationskacheln (Cards) strukturieren die Inhalte. Die Primärfarbe ist ein moderner Indigoton (`#6366f1`), der Vertrauen und Professionalität ausstrahlt, akzentuiert durch deutliche Signal-Farben für Aktionen (Grün für "Kommen", Rot für "Gehen"). 

### 2.1.4 Technische Design-Grundlagen

Technisch wurde das Design mit dem CSS-Framework Bootstrap 5 realisiert, erweitert durch großflächiges Custom-CSS (Vanilla CSS) direkt in den Single-File-Components (SFC) von Vue.js (`<style scoped>`). Dies erlaubte die Kombination aus schnellem Prototyping durch Bootstraps Grid-System (Flexbox) und tiefgreifenden optischen Anpassungen für Premium-Look-Effekte (z.B. Hover-States und Transitionen).

## 2.2 Kernkomponenten der Benutzeroberfläche

Die Single Page Application ist modular aufgebaut und in verschiedene Kernkomponenten (Views) unterteilt, welche über den Vue Router dynamisch in den Main-Layout-Container geladen werden.

### 2.2.1 Navigationsstruktur und Sidebar-Konzept

Als zentrales Navigationselement fungiert eine dynamische Sidebar (verkörpert in `Layout.vue`). Die Sidebar skaliert auf großen Bildschirmen vertikal, schiebt sich auf mobilen Endgeräten jedoch als "Offcanvas"-Menü aus dem Blickfeld oder mutiert zu einer simplen Bottom-Navigation, um wertvollen Screen-Space freizugeben. Die Navigationseinträge werden reaktiv basierend auf der JWT-Payload (Role) gerendert. So sieht ein Admin Navigationseinträge für "Personalwesen" und "Berichte", die für normale User gänzlich unsichtbar ("hidden") sind.

### 2.2.2 Dashboard-Design mit Informationskacheln

Das Dashboard ist das Herzstück der Applikation. Es begrüßt den Nutzer mit den relevantesten KPI (Key Performance Indicators) des Tages.
Die zentralen Elemente sind "Informationskacheln", welche den Status des "Letzten Beginns" und "Letzten Endes" großflächig via Typografie und Icons (Bootstrap Icons) kommunizieren.
Eine besondere technische und optische Finesse ist das **Live-Stempel-Terminal**. Sobald eine Sitzung aktiv ist, wandelt sich die primäre Ansicht zu einem `Hero-Element` mit einer pulsierenden Live-Uhr (`requestAnimationFrame` oder `setInterval` gesteuert). Diese "Pulse-Animation" signalisiert dem Hirn instinktiv: *Die Uhr läuft*.

### 2.2.3 Kalender- und Dienstplan-Ansicht

Eine weitere maßgebliche Komponente ist der integrierte FullCalendar (`@fullcalendar/vue3`). Er transformiert trockene JSON-Daten über Arbeitszeiten in eine visuell ansprechende Monats- oder Wochenübersicht. Schichten und gebilligte Urlaube werden farblich codiert als Badges visualisiert (z. B. Blau für Arbeit, Grün für gebilligten Urlaub). Der Kalender unterstützt zudem die Drag-and-Drop-Mechanik für Admins zur intuitiven Dienstplanerstellung, was die Usability massiv erhöht.

### 2.2.4 Übersicht der Arbeitszeiten und Urlaubsanträge

Listen und Tabellen wurden bewusst rudimentär, aber hochgradig leserlich (hoher Kontrast, Zeilenhervorhebung durch Hover) gehalten. Die "Leave Requests Component" (Urlaubsanträge) teilt das Interface in eine "Beantragungs-Form" und eine "Historien-Liste". Für die Administration existiert zudem ein Approval-Dashboard, in welchem Anträge über prägnante Bestätigungs-Buttons asynchron (mittels Axios) freigegeben oder abgelehnt werden.

## 2.3 Benutzerinteraktion und Workflows

Die Benutzeroberfläche orchestriert komplexe Hintergrundprozesse in simple Front-End-Workflows.

### 2.3.1 Zeiterfassungs-Prozess (Stempeln)

Der primäre Workflow ist das Stempeln. Um die Robustheit zu erhöhen, existiert neben dem "Live-Stempel-Button" ein Toggle-Mechanismus, der dem User das Aufrufen der "Manuellen Erfassung" erlaubt. Hier kann der User ein HTML5-Formular (Date, Time, Duration) nutzen, um vergessene Buchungen unter Angabe von Pausen nachzutragen. Die Button-Zustände (`disabled`-State) reagieren live auf das Vorhandensein einer "Active Session", ein "Kommen" ist unmöglich, wenn die laufende Schicht nicht zuvor beendet ("Gehen") wurde.

### 2.3.2 Urlaubs- und Abwesenheitsverwaltung

Der Urlaubsantrags-Workflow bedient sich zweier reaktiver Datenströme: Der Nutzer trägt den gewünschten Zeitraum (Start Date -> End Date) ein. Das System validiert bereits via Vuelidate/Vue-Ref, ob Startdatum chronologisch vor dem Enddatum liegt. Erst dann wird der Submit-Button aktiviert. Dieses Client-Side-Validation-Paradigma reduziert unnötige Netzwerklastanfragen drastisch.

### 2.3.3 Benutzer- und Abteilungsverwaltung

Das Onboarding neuer Mitarbeitender findet in der `Admin.vue`-Komponente statt. Formulare zur Dateneingabe sind in asynchrone Modals ausgelagert, um den Benutzer nicht von der listenartigen Übersicht wegzuleiten (Context-Switching vermeiden). 

## 2.4 Responsive Design und Zugänglichkeit

Da Zeiterfassung heutzutage genauso häufig über das Smartphone auf dem Arbeitsweg wie über den Desktop-PC im Büro stattfindet, ist ein strikter Mobile-First-Ansatz unverhandelbar.

### 2.4.1 Grundlegende Responsive-Strategie

Bootstraps 12-Spalten-Grid wurde genutzt, um Fluid-Layouts zu erstellen. Eingabeelemente (Inputs) wurden bewusst vergrößert (`padding: 10px 12px`), um die "Touch-Target-Size" für Smartphone-Nutzer gemäß den Apple HIG (Human Interface Guidelines) und Google Material Vorgaben (mindestens 44x44 Pixel) zu erfüllen.

### 2.4.2 Komponentenspezifische Anpassungen

Komplexe Tabellen (wie die Abrechnungsübersicht) stellen auf extrem schmalen Bildschirmen eine Herausforderung dar. Hier wurde mit CSS Container-Queries und `overflow-x: auto` (Scrollable Tables) gearbeitet. Bestimmte sekundäre Spalten (wie eine exakte Sekundenangabe) werden via `@media (max-width: 768px) { display: none; }` ausgeblendet, um die Informationsdichte kognitiv bewältigbar zu halten.

### 2.4.3 Barrierefreiheit und Usability

Darüber hinaus wurde durch semantisches HTML (`<nav>`, `<main>`, `<section>`) sowie adäquate Kontrastverhältnisse der Grundstein für Barrierefreiheit (a11y) gelegt. Optische Rückmeldungen stützen sich nie alleinig auf Farben (wie etwa Rot für Fehler), sondern sind stets von korrespondierenden Icons (z.B. Warn-Dreieck) und textuellen Fehlermeldungen (ARIA-live-Bereiche) begleitet. Dies gewährleistet, dass auch Benutzer mit Rot-Grün-Schwäche die Applikation uneingeschränkt und sicher bedienen können.
