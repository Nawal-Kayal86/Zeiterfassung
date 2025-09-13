# Zeiterfassung Project Wurde von Nawal Kayal & Ahmad Alalan entwickelt 

# Zeiterfassung (Vue + Node/Express + MySQL)

Dieses Projekt ist eine **Minimale Zeiterfassung**:
- Frontend: Vue 3 + Vite
- Backend: Node.js (Express)
- Datenbank: MySQL (Schema im Ordner `database/`)

## Struktur
```
zeiterfassung_project/
 ├─ backend/
 ├─ frontend/
 └─ database/
```

## Schnellstart (lokal)

### 1) MySQL
- Erstelle eine Datenbank `zeiterfassung`.
- Führe `database/schema.sql` aus, um Tabellen zu erzeugen.

### 2) Backend
```bash
cd backend
npm install
# .env anpassen (DB_HOST, DB_USER, DB_PASS, DB_NAME)
node server.js
```

### 3) Frontend
```bash
cd frontend
npm install
npm run dev
```

## Hinweise
- NFC ist als Platzhalter implementiert. Für Web-NFC auf Android kannst du später die Web NFC API einbauen.
- Diese Vorlage ist minimal und für Entwicklung / Demo gedacht. Bitte ergänze Authentifizierung (JWT/Password hashing), Validierung, Fehlerbehandlung und Produktionseinstellungen, bevor du es produktiv nutzt.
