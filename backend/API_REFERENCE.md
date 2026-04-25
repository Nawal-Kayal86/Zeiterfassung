# REST API Reference

Basis-URL: `/api`

## Designstatus

Kanonische Ressourcenpfade:

- `/auth`-nahe Endpunkte bleiben flach: `/login`, `/me`
- Sammlungen sind plural und kebab-case: `/users`, `/work-sessions`, `/leave-requests`
- Legacy-Aliasse wie `/workSessions`, `/schedule` und `/workflow` bleiben vorerst erreichbar, senden aber Deprecation-Header

Fehlerformat:

```json
{
  "error": "Ungueltiges Token",
  "status": 401
}
```

## Auth

### `POST /login`

Request:

```json
{
  "name": "alice",
  "password": "secret123"
}
```

Erfolg `200 OK`:

```json
{
  "token": "jwt-token",
  "user": {
    "id": "680b8d...",
    "name": "alice",
    "role": "admin",
    "department": "IT",
    "start_date": "2026-01-01T00:00:00.000Z",
    "end_date": null,
    "is_active": true,
    "vacation_days_per_year": 25
  }
}
```

Fehler:

- `400` bei fehlendem `name` oder `password`
- `401` bei falschen Zugangsdaten
- `403` bei inaktivem Benutzer

### `GET /me`

Header:

```text
Authorization: Bearer <token>
```

Erfolg `200 OK`:

```json
{
  "user": {
    "id": "680b8d...",
    "name": "alice",
    "role": "admin",
    "department": "IT",
    "start_date": "2026-01-01T00:00:00.000Z",
    "end_date": null,
    "vacation_days_per_year": 25,
    "is_active": true
  }
}
```

## Users

### `GET /users`

Nur Admin. Erfolg `200 OK`.

### `POST /users`

Nur Admin. Erfolg `201 Created` mit `Location: /api/users/{id}`.

Request:

```json
{
  "name": "Alice Example",
  "email": "alice@example.com",
  "password": "secret123",
  "role": "user",
  "department": "IT",
  "weekly_hours": 38.5
}
```

Fehler:

- `400` bei Validierungsfehlern
- `409` bei doppelter E-Mail oder NFC-Tag

### `PUT /users/:id`

Nur Admin. Erfolg `200 OK`.

### `DELETE /users/:id`

Nur Admin. Erfolg `200 OK`.

Hinweis:

- Aktuell liefert der Endpunkt eine JSON-Bestaetigung statt `204 No Content`

## Work Sessions

Kanonischer Pfad: `/work-sessions`

### `GET /work-sessions`

Erfolg `200 OK`.

Optionale Query-Parameter:

- `userId` nur fuer Admin
- `startDate`
- `endDate`

### `GET /work-sessions/summary`

Erfolg `200 OK`.

### `POST /work-sessions/start`

Erfolg `200 OK`.

Beispielantwort:

```json
{
  "message": "Arbeitsbeginn erfasst",
  "session": {
    "_id": "680b8d..."
  }
}
```

### `POST /work-sessions/stop`

Request:

```json
{
  "pause": "0:30"
}
```

Erfolg `200 OK`.

### `POST /work-sessions/manual-time`

Gemischter Endpunkt fuer drei Faelle:

- Start manuell erfassen
- offenes Ende setzen
- vollstaendige Session anlegen oder aktualisieren

Request:

```json
{
  "date": "2026-04-25",
  "start": "08:00",
  "end": "16:30",
  "pause": "0:30"
}
```

Hinweis:

- Aus REST-Sicht ist dieser Endpunkt eher eine Kommando-Operation als eine reine Ressourcenanlage

### `PUT /work-sessions/:id`

Erfolg `200 OK`.

### `DELETE /work-sessions/:id`

Erfolg `200 OK`.

## Leave Requests

Kanonischer Pfad: `/leave-requests`

### `POST /leave-requests`

Erfolg `201 Created` mit `Location: /api/leave-requests/{id}`.

Request:

```json
{
  "from": "2026-08-01",
  "to": "2026-08-10",
  "type": "vacation",
  "reason": "Sommerurlaub"
}
```

### `GET /leave-requests`

Eigene Antraege. Erfolg `200 OK`.

### `GET /leave-requests/calendar`

Freigegebene Antraege. Erfolg `200 OK`.

### `PUT /leave-requests/:id/approve`

Nur Admin. Erfolg `200 OK`.

### `PUT /leave-requests/:id/reject`

Nur Admin. Erfolg `200 OK`.

Hinweis:

- REST-strenger waere `PATCH /leave-requests/:id` mit `{ "status": "approved" }`

## Schedules

Kanonischer Pfad: `/schedules`

### `GET /schedules/:userId`

Erfolg `200 OK`.

Hinweis:

- Fachlich waere auch `/users/:userId/schedule` gut lesbar

### `POST /schedules`

Nur Admin. Erstellt oder aktualisiert den Dienstplan. Erfolg `200 OK`.

Request:

```json
{
  "user_id": "680b8d...",
  "weekly_hours": 40,
  "schedule": {
    "mon": { "from": "08:00", "to": "16:00", "active": true },
    "tue": { "from": "08:00", "to": "16:00", "active": true }
  }
}
```

Hinweis:

- Da hier Upsert-Verhalten implementiert ist, ist `PUT /schedules/:userId` langfristig der klarere Pfad

## Workflows

Kanonischer Pfad: `/workflows`

### `POST /workflows`

Erfolg `201 Created` mit `Location: /api/workflows/{id}`.

### `PUT /workflows/:id/done`

Erfolg `200 OK`.

Hinweis:

- REST-strenger waere `PATCH /workflows/:id` mit `{ "status": "done" }`

## Status-Code-Regeln

Aktuell verwendet:

- `200` fuer erfolgreiche Reads, Updates, Deletes und Aktions-Endpunkte
- `201` fuer echte Create-Endpunkte
- `400` fuer Validierungsfehler
- `401` fuer fehlende oder ungueltige Authentifizierung
- `403` fuer verbotene Zugriffe
- `404` fuer nicht gefundene Ressourcen
- `409` fuer Konflikte wie doppelte E-Mail oder Abteilung
- `429` fuer Login-Rate-Limit
- `500` fuer Serverfehler oder fehlende Serverkonfiguration

Empfehlungen fuer die naechste Evolutionsstufe:

- `204 No Content` fuer Deletes ohne Rueckgabekorper
- `PATCH` fuer Statuswechsel wie `approve`, `reject`, `done`
- weniger Legacy-Aliasse und ein klarer Sunset-Plan
