# Deployment Best Practices

## Render setup

Kanonische Basis in diesem Repo:

- `render.yaml` fuer eine Git-basierte Web Service Definition
- `healthCheckPath: /readyz` fuer echte Readiness statt reinem Port-Binding
- Build aus `backend/`, inklusive Frontend-Build nach `frontend/dist`

Empfohlene Render-Einstellungen:

1. Web Service statt Static Site + API getrennt, solange dein Express-Server das gebaute Frontend selbst ausliefert.
2. `healthCheckPath` auf `/readyz` setzen.
3. Auto-Deploy nur auf den produktiven Branch.
4. Pull Request Previews nur dann aktivieren, wenn Preview-Secrets und Preview-DB sauber getrennt sind.
5. Kein Persistent Disk anhaengen, solange du Zero-Downtime Deploys behalten willst.

## Environment Variablen

Pflichtvariablen:

- `MONGO_URI`
- `JWT_SECRET`
- `CORS_ORIGIN`

Stark empfohlen:

- `NODE_ENV=production`
- `JWT_ISSUER`
- `JWT_AUDIENCE`
- `JWT_EXPIRES_IN`
- `SHUTDOWN_TIMEOUT_MS`
- `SENTRY_DSN`
- `SENTRY_ENVIRONMENT`
- `SENTRY_RELEASE`

Regeln:

- Keine echten Secrets in `.env` committen.
- Produktion, Staging und Preview mit getrennten Secrets fahren.
- `CORS_ORIGIN` exakt setzen, nicht wildcard-basiert.
- `JWT_SECRET` lang und zufaellig halten.

## Logging

Dieses Repo loggt jetzt strukturiert als JSON nach `stdout` / `stderr`.

Enthalten sind unter anderem:

- `timestamp`
- `level`
- `service`
- `environment`
- `requestId`
- `method`
- `path`
- `statusCode`
- `durationMs`

Best Practices:

1. App-Logs immer strukturiert schreiben.
2. Keine Passwoerter, Tokens oder personenbezogenen Inhalte loggen.
3. Die `Rndr-Id` / `X-Request-Id` in Fehleranalysen mitziehen.
4. Fuer laengere Retention Log Streams von Render an einen zentralen Provider haengen.

## Error Monitoring

Das Repo hat vorbereitete Sentry-Hooks:

- Initialisierung ueber `SENTRY_DSN`
- `SENTRY_RELEASE` fuer Release-Zuordnung
- `SENTRY_ENVIRONMENT` fuer Produktions-/Staging-Trennung

Empfehlungen:

1. Backend-Fehler an Sentry senden, Frontend optional separat.
2. Sampling fuer Tracing konservativ starten, z. B. `0.05` oder `0.1`.
3. Release auf Commit-SHA setzen, entweder explizit als `SENTRY_RELEASE` oder indirekt ueber `RENDER_GIT_COMMIT`.
4. Alerts nur fuer echte Produktionsfehler und Error-Spikes aktivieren.

## Health und Shutdown

Verfuegbar:

- `/healthz`: Liveness
- `/readyz`: Readiness mit Datenbankpruefung

Best Practices:

1. Render-Healthcheck auf `/readyz`.
2. `SIGTERM` sauber behandeln, damit Zero-Downtime Deploys keine Requests abschneiden.
3. Monitoring vor dem Exit flushen.

## Aktuelle externe Referenzen

- Render Health Checks: https://render.com/docs/health-checks
- Render Blueprint YAML: https://render.com/docs/blueprint-spec
- Render Logging: https://render.com/docs/logging
- Render Log Streams: https://render.com/docs/log-streams
- Render Deploys / Zero Downtime: https://render.com/docs/deploys/
- Sentry Node Optionen: https://docs.sentry.io/platforms/javascript/guides/node/configuration/environments/
- Sentry Express Tracing: https://docs.sentry.io/platforms/javascript/guides/express/tracing
