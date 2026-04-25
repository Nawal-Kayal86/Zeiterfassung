# Backend (Express)

## Lokal starten

1. `backend/.env.example` nach `backend/.env` kopieren
2. Werte setzen
3. Starten:

```bash
npm install
npm start
```

## Wichtige Betriebs-Endpunkte

- `GET /healthz` fuer Liveness
- `GET /readyz` fuer Readiness inklusive Datenbankstatus

## Deployment

Die Render-Basis liegt in [../render.yaml](../render.yaml) und die Betriebsdetails in [../DEPLOYMENT.md](../DEPLOYMENT.md).
