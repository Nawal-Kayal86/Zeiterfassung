# 2. Benutzeroberfläche und Design

Die Benutzeroberfläche (User Interface, UI) ist das Aushängeschild jeder modernen Anwendung. Im Rahmen unseres Zeiterfassungssystems wurde besonderer Wert auf eine intuitive, barrierearme und optisch ansprechende Gestaltung gelegt. Wenn ein Zeiterfassungssystem von Mitarbeitenden als lästige Pflicht empfunden wird, sinkt die Datenqualität rapide. Ziel war es daher, ein System zu schaffen, welches sich nahtlos in den Arbeitsalltag einfügt und durch ein "frictionless" Design (reibungslose Bedienung) besticht.

Die Gestaltung der Benutzeroberfläche ist für ein Zeiterfassungstool von besonderer Bedeutung, da es sich um ein Werkzeug handelt, das von sämtlichen Mitarbeitenden eines Unternehmens – unabhängig von deren technischer Kompetenz – mehrmals täglich verwendet wird. Ein schlecht gestaltetes Interface führt unweigerlich zu Eingabefehlern, Frustration und letztlich zu einer Unterminierung der Datenqualität. Daher wurde im Vorfeld der Implementierung eine systematische Anforderungsanalyse durchgeführt, deren Ergebnisse in konkrete Designentscheidungen überführt wurden.

## 2.1 Anforderungsanalyse und Design-Philosophie

Bevor mit der konkreten Implementierung der Vue-Komponenten begonnen wurde, war eine fundierte Anforderungsanalyse unerlässlich. Hierbei wurden sowohl die Bedürfnisse der Endanwender als auch die der Administration erfasst. Die Analyse orientierte sich an etablierten UX-Methoden, insbesondere an der Erstellung von Nutzer-Personas und der Definition von User-Stories.

### 2.1.1 Identifikation der Nutzergruppen

Das System differenziert strikt zwischen drei iterativen Nutzergruppen, deren Dashboards sich funktional und visuell unterscheiden:

1. **Standard-Benutzer (User):** Mitarbeiter, deren primäre Interaktion aus dem täglichen Ein- und Ausstempeln sowie dem Einreichen von Urlaubsanträgen besteht. Für diese Gruppe muss die primäre Call-to-Action (der Stempel-Button) stets omnipräsent sein. Die typische Nutzung umfasst: Arbeitsbeginn stempeln, Pause starten/beenden, Arbeitsende stempeln, gelegentlich einen Urlaubsantrag einreichen und den eigenen Kalender einsehen.
2. **Abteilungsleiter (Employee / Manager):** Anwender mit erweiterten Rechten, die Einsicht in die Dienstpläne ihrer spezifischen Abteilung haben und Urlaubsanträge der untergeordneten Mitarbeiter validieren können. Diese Gruppe benötigt zusätzlich Übersichten über die Anwesenheit ihrer Teammitglieder und die Möglichkeit, Dienstpläne zu konfigurieren.
3. **Administratoren (Admin):** Die höchste Berechtigungsstufe. Administratoren haben Zugriff auf das vollumfängliche Rechtemanagement, die globale Workflow-Kontrolle und die systemweiten Abrechnungsberichte (Billing). Sie verwalten Benutzerkonten, Abteilungen, Feiertage und systemweite Konfigurationen. Für diese Gruppe sind Dashboard-Widgets mit aggregierten KPIs (Key Performance Indicators) besonders relevant.

### 2.1.2 Detaillierte Benutzeranforderungen

Aus der Nutzergruppenanalyse wurden konkrete Anforderungen abgeleitet, die als Leitplanken für sämtliche Design-Entscheidungen dienten:

- **Minimalistische Interaktion:** Ein Stempelvorgang darf nicht mehr als einen Klick nach dem Login erfordern. Der primäre Aktionsbutton muss visuell dominant platziert sein und sofort ins Auge fallen.
- **Visuelles Feedback:** Echtzeit-Rückmeldungen, wie eine animierte Live-Uhr und `Success/Error`-Toasts (mittels der Bibliothek `vue3-toastify`), sind zwingend erforderlich, um dem Nutzer Systemzustände (z.B. "Live Sitzung läuft") unmissverständlich zu kommunizieren. Jede Benutzeraktion muss innerhalb von 200 Millisekunden eine visuelle Bestätigung auslösen.
- **Transparenz:** Jeder Nutzer muss seine eigene Historie (wann wurde gestempelt, wie lange dauerte die Pause) jederzeit einsehen können. Darüber hinaus soll das Urlaubskonto mit Restanspruch, verbrauchten und geplanten Tagen transparent dargestellt werden.
- **Fehlervermeidung:** Das Interface muss durch geschickte Zustandssteuerung Fehleingaben verhindern. Beispielsweise darf ein "Kommen"-Button nicht anklickbar sein, wenn bereits eine aktive Sitzung vorliegt.
- **Kontextsensitivität:** Navigationseinträge und Dashboard-Elemente sollen rollenbasiert ein- und ausgeblendet werden, um die kognitive Last für den jeweiligen Nutzer zu minimieren.

### 2.1.3 Leitende Designprinzipien

Die grafische Umsetzung orientiert sich am modernen _Flat Design_ unter Einbeziehung leichter Schatten (Soft-Shadows) und runder Kanten (`border-radius`), was der Applikation eine "weiche" und moderne Anmutung verleiht. Große, farblich abgesetzte Informationskacheln (Cards) strukturieren die Inhalte. Die Primärfarbe ist ein moderner Indigoton (`#6366f1`), der Vertrauen und Professionalität ausstrahlt, akzentuiert durch deutliche Signal-Farben für Aktionen (Grün für "Kommen", Rot für "Gehen").

Die Design-Prinzipien lassen sich in vier Kernaussagen zusammenfassen:

1. **Klarheit vor Dekoration:** Jedes visuelle Element muss einen funktionalen Zweck erfüllen. Dekorative Elemente sind nur then erlaubt, wenn sie die Benutzbarkeit nicht beeinträchtigen.
2. **Konsistenz:** Gleiche Aktionen werden stets durch gleiche visuelle Muster repräsentiert. Ein Button, der eine destruktive Aktion auslöst (Löschen), ist immer rot. Ein bestätigender Button ist immer grün oder Indigo.
3. **Feedback-Orientierung:** Jede Zustandsänderung wird visuell kommuniziert – sei es durch Toast-Nachrichten, Farb-Transitions oder animierte Icons.
4. **Progressive Disclosure:** Komplexe Informationen werden schrittweise offengelegt. Das Dashboard zeigt zunächst nur die wichtigsten KPIs; detaillierte Listen und Tabellen befinden sich in separaten Ansichten.

### 2.1.4 Technische Design-Grundlagen

Technisch wurde das Design mit dem CSS-Framework Bootstrap 5 realisiert, erweitert durch großflächiges Custom-CSS (Vanilla CSS) direkt in den Single-File-Components (SFC) von Vue.js (`<style scoped>`). Dies erlaubte die Kombination aus schnellem Prototyping durch Bootstraps Grid-System (Flexbox) und tiefgreifenden optischen Anpassungen für Premium-Look-Effekte. Zu den Custom-CSS-Erweiterungen gehören:

- **Hover-States und Transitionen:** Buttons erhöhen sich beim Überfahren optisch durch `transform: translateY(-2px)` und einen verstärkten Box-Shadow, was eine haptische Dreidimensionalität simuliert.
- **Gradient-Buttons:** Die primären Aktions-Buttons verwenden lineare Farbverläufe (z.B. `linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)`), die das moderne Erscheinungsbild unterstreichen.
- **Benutzerdefinierte Input-Felder:** Formularelemente erhalten bei Fokussierung einen farbigen Schatten (`box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1)`), der dem Nutzer visuell signalisiert, welches Feld gerade aktiv ist.
- **Animationen:** CSS-Keyframe-Animationen wie die `pulse-animation` für den Live-Indikator erzeugen ein Gefühl von Lebendigkeit und Aktivität.

## 2.2 Kernkomponenten der Benutzeroberfläche

Die Single Page Application ist modular aufgebaut und in verschiedene Kernkomponenten (Views) unterteilt, welche über den Vue Router dynamisch in den Main-Layout-Container geladen werden. Insgesamt umfasst die Applikation 17 Vue-Komponenten, die in der Verzeichnisstruktur `frontend/src/views/` organisiert sind.

### 2.2.1 Navigationsstruktur und Sidebar-Konzept

Als zentrales Navigationselement fungiert eine dynamische Sidebar (verkörpert in `Layout.vue`). Die Sidebar skaliert auf großen Bildschirmen vertikal, schiebt sich auf mobilen Endgeräten jedoch als "Offcanvas"-Menü aus dem Blickfeld oder mutiert zu einer simplen Bottom-Navigation, um wertvollen Screen-Space freizugeben. Die Navigationseinträge werden reaktiv basierend auf der JWT-Payload (Role) gerendert. So sieht ein Admin Navigationseinträge für "Personalwesen" und "Berichte", die für normale User gänzlich unsichtbar ("hidden") sind.

Die Sidebar enthält folgende Navigationsgruppen, die je nach Rolle sichtbar sind:

- **Allgemein (alle Rollen):** Dashboard, Kalender, Urlaubsantrag
- **Verwaltung (Admin/Manager):** Mitarbeiter anlegen, Abteilungen, Dienstplan, Arbeitszeitmodelle
- **Berichte (Admin):** Billing, Reports, System-Logs
- **System (Admin):** Konfiguration, Terminal

### 2.2.2 Dashboard-Design mit Informationskacheln

Das Dashboard ist das Herzstück der Applikation. Es begrüßt den Nutzer mit den relevantesten KPIs des Tages. Die Ansicht ist in zwei Modi unterteilt, die über einen zentralen Toggle-Switch (als Pill-förmiger Segmented-Control) umgeschaltet werden können:

1. **Stempel-Terminal:** Die primäre Ansicht mit den Aktions-Buttons für "Arbeitsbeginn", "Pause machen", "Arzttermin" und "Arbeitsende". Bei einer aktiven Sitzung wandelt sich die primäre Ansicht zu einem Hero-Element mit einer pulsierenden Live-Uhr.
2. **Manuelle Erfassung:** Ein Formular mit Datum-, Uhrzeit- und Pausen-Feldern für die nachträgliche Erfassung vergessener Buchungen. Dieses Formular dient zugleich als Bearbeitungsmaske für bestehende Einträge.

Die zentralen Elemente sind "Informationskacheln", welche den Status des "Letzten Beginns" und "Letzten Endes" großflächig via Typografie und Icons (Bootstrap Icons) kommunizieren. Jede Kachel verfügt über ein farblich abgesetztes Icon-Feld (z.B. grüner Hintergrund für "Start", roter für "Ende") und kontraststarke Zeitangaben in Monospace-Schrift.

Eine besondere technische und optische Finesse ist das **Live-Stempel-Terminal**. Sobald eine Sitzung aktiv ist, erscheint ein zentrales Widget mit folgenden Elementen:
- Ein pulsierender grüner Punkt mit dem Label "LIVE SITZUNG"
- Die laufende Sitzungsdauer in großer Monospace-Schrift (z.B. "04:32:17")
- Der Startzeitpunkt der Sitzung als Zusatzinformation
- Die Pausenzeit wird während einer aktiven Pause hochgezählt und vom Gesamtsaldo abgezogen

### 2.2.3 Kalender- und Dienstplan-Ansicht

Eine weitere maßgebliche Komponente ist der integrierte FullCalendar (`@fullcalendar/vue3`). Er transformiert trockene JSON-Daten über Arbeitszeiten in eine visuell ansprechende Monats- oder Wochenübersicht. Schichten und gebilligte Urlaube werden farblich codiert als Badges visualisiert (z. B. Blau für Arbeit, Grün für gebilligten Urlaub, Orange für offene Anträge). Die Kalenderkomponente zeigt zudem Feiertage als rot hinterlegte Zellen an, die aus der separaten Holiday-Collection der Datenbank geladen werden.

### 2.2.4 Urlaubsantrag-Komponente

Die `LeaveRequest.vue` Komponente stellt das umfangreichste Einzelformular der Applikation dar. Sie ist zweispaltig aufgebaut:

- **Linke Spalte – Urlaubskonto:** Zeigt den Gesamtanspruch, verbrauchte Tage, geplante Tage und den Restanspruch als Tabelle mit Fortschrittsbalken an. Zusätzlich werden der Überstundensaldo (1:1) und das Zeitguthaben (ZGÜ) dargestellt. Ein PDF-Export-Button ermöglicht den Download eines offiziellen Urlaubskonto-Auszugs.
- **Rechte Spalte – Antragsformular & Historie:** Enthält das Formular für neue Anträge (Von/Bis-Datum, Urlaubsart, Begründung) mit einer Vorschau-Berechnung der beantragten Arbeitstage. Darunter befindet sich die chronologische Liste aller bisherigen Anträge mit farbcodierten Status-Badges.

### 2.2.5 Übersicht der Arbeitszeiten und Abrechnungstabellen

Listen und Tabellen wurden bewusst hochgradig leserlich (hoher Kontrast, Zeilenhervorhebung durch Hover) gehalten. Die Abrechnungstabelle (Billing) enthält pro Zeile: Datum, Zeitmodell, Stempelungen, Bewertung, Ist-Stunden, Soll-Stunden, Übertrag, 1:1-Tag, 1:1-Gesamt, ZGÜ, Saldo gesamt und weitere administrative Felder. Diese komplexe Tabelle wurde mit `overflow-x: auto` horizontal scrollbar gemacht, um auf schmalen Bildschirmen nutzbar zu bleiben.

## 2.3 Benutzerinteraktion und Workflows

Die Benutzeroberfläche orchestriert komplexe Hintergrundprozesse in simple Front-End-Workflows. Jeder Workflow wurde so gestaltet, dass der Benutzer zu jedem Zeitpunkt den aktuellen Systemzustand erkennen und die nächste erwartete Aktion intuitiv ableiten kann.

### 2.3.1 Zeiterfassungs-Prozess (Stempeln)

Der primäre Workflow ist das Stempeln. Um die Robustheit zu erhöhen, existiert neben dem "Live-Stempel-Button" ein Toggle-Mechanismus, der dem User das Aufrufen der "Manuellen Erfassung" erlaubt. Hier kann der User ein HTML5-Formular (Date, Time, Duration) nutzen, um vergessene Buchungen unter Angabe von Pausen nachzutragen. Die Button-Zustände (`disabled`-State) reagieren live auf das Vorhandensein einer "Active Session", ein "Kommen" ist unmöglich, wenn die laufende Schicht nicht zuvor beendet ("Gehen") wurde.

Der Workflow unterstützt zudem das Bearbeiten bestehender Einträge: Über einen Stift-Button in der Eintrags-Tabelle wird der betreffende Eintrag in das manuelle Erfassungsformular geladen, und der Benutzer kann Start-, Endzeit und Pause korrigieren. Ein erfolgreicher Save wird durch einen grünen Toast bestätigt.

### 2.3.2 Urlaubs- und Abwesenheitsverwaltung

Der Urlaubsantrags-Workflow bedient sich zweier reaktiver Datenströme: Der Nutzer trägt den gewünschten Zeitraum (Start Date -> End Date) ein. Das System validiert bereits via reaktiver Vue-Zustände (Refs) und Computed-Properties, ob das Startdatum chronologisch vor dem Enddatum liegt. Erst dann wird der Submit-Button aktiviert. Dieses Client-Side-Validation-Paradigma reduziert unnötige Netzwerklastanfragen drastisch.

Besonders hervorzuheben ist die Vorschau-Berechnung: Sobald der Nutzer ein Datum-Paar für einen Jahresurlaub eingibt, berechnet eine Computed-Property in Echtzeit die Anzahl der betroffenen Arbeitstage – unter automatischem Ausschluss von Wochenenden und Feiertagen. Diese Berechnung basiert auf einer lokal zwischengespeicherten Feiertags-Map, die beim Laden der Komponente vom Backend abgerufen wird.

### 2.3.3 Benutzer- und Abteilungsverwaltung

Das Onboarding neuer Mitarbeitender findet in der `NewUser.vue`-Komponente statt. Das Formular umfasst alle relevanten Stammdaten: Name, E-Mail, Passwort, Rolle, Abteilung, Eintrittsdatum, Urlaubsanspruch, Wochenstunden und den individuellen Arbeitszeitplan (Schichtzeiten pro Wochentag mit Aktiv/Inaktiv-Toggle). Die `DepartmentsAdmin.vue` Komponente ermöglicht das Anlegen und Verwalten von Abteilungen als organisatorische Einheiten.

## 2.4 Responsive Design und Zugänglichkeit

Da Zeiterfassung heutzutage genauso häufig über das Smartphone auf dem Arbeitsweg wie über den Desktop-PC im Büro stattfindet, ist ein strikter Mobile-First-Ansatz unverhandelbar.

### 2.4.1 Grundlegende Responsive-Strategie

Bootstraps 12-Spalten-Grid wurde genutzt, um Fluid-Layouts zu erstellen. Eingabeelemente (Inputs) wurden bewusst vergrößert (`padding: 10px 12px`), um die "Touch-Target-Size" für Smartphone-Nutzer gemäß den Apple Human Interface Guidelines und Google Material Design Vorgaben (mindestens 44x44 Pixel) zu erfüllen. Die Aktions-Buttons im Dashboard haben eine Mindesthöhe von 42 Pixeln und eine Mindestbreite von 160 Pixeln.

### 2.4.2 Komponentenspezifische Anpassungen

Komplexe Tabellen (wie die Abrechnungsübersicht mit bis zu 15 Spalten) stellen auf extrem schmalen Bildschirmen eine Herausforderung dar. Hier wurde mit `overflow-x: auto` (Scrollable Tables) gearbeitet. Bestimmte sekundäre Spalten werden via `@media (max-width: 768px) { display: none; }` ausgeblendet, um die Informationsdichte kognitiv bewältigbar zu halten. Das Stempel-Terminal passt seine Button-Anordnung von einer horizontalen Reihe (Desktop: `d-flex gap-3`) zu einer gestapelten vertikalen Anordnung (Mobile: `flex-wrap`) an.

### 2.4.3 Barrierefreiheit und Usability

Darüber hinaus wurde durch semantisches HTML (`<nav>`, `<main>`, `<section>`) sowie adäquate Kontrastverhältnisse der Grundstein für Barrierefreiheit (a11y) gelegt. Optische Rückmeldungen stützen sich nie alleinig auf Farben (wie etwa Rot für Fehler), sondern sind stets von korrespondierenden Icons (z.B. Warn-Dreieck, Häkchen, Kreuz) und textuellen Fehlermeldungen begleitet. Dies gewährleistet, dass auch Benutzer mit Rot-Grün-Schwäche die Applikation uneingeschränkt und sicher bedienen können. Toast-Benachrichtigungen enthalten neben Farbcodierung immer auch ein Emoji-Symbol als zusätzlichen visuellen Indikator (z.B. 🚀 für Erfolg, ☕ für Pause, ❌ für Fehler).
