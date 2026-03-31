# Zeiterfassung Project Wurde von Nawal Kayal & Ahmad Alalan entwickelt

# Zeiterfassung (Vue + Node/Express + MongoDB)

Dieses Projekt ist eine **Minimale Zeiterfassung**:

- Frontend: Vue 3 + Vite
- Backend: Node.js (Express)
- Datenbank: MongoDB (Mongoose)

## Struktur

```
zeiterfassung_project/
 ├─ backend/
 ├─ frontend/
```

## Schnellstart (lokal)

### 1) Datenbank (MongoDB)

- Stelle sicher, dass ein lokaler MongoDB Server läuft (z.B. mongodb://127.0.0.1:27017/zeiterfassung)
- Alternativ kannst du auch eine MongoDB Atlas Cloud-URL verwenden.

### 2) Backend

```bash
cd backend
npm install
# Erstelle ein .env File (MONGODB_URI, JWT_SECRET etc.)
npm start
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

mysql -u sql7803601 -p -h sql7.freesqldatabase.com sql7803601
