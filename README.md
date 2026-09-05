# Neer-Niti — Drought Early Warning & Parametric Crop Finance

A district-level meteorological drought early-warning platform for Indian farmers, paired with a
fast-tracked crop-loan portal and an **index-based (parametric) payout engine**.

- **Real weather data.** SPI/SPEI/RDI drought indices are computed server-side from live Open-Meteo/ERA5
  rainfall, temperature, humidity, and soil-moisture data — a 5-year climatological normal per district
  fetched and cached on the backend, not a random-number simulation.
- **Parametric payouts.** The backend continuously scans every district's live SPEI. The moment it crosses
  the severe-drought threshold (-1.0), an automatic payout-eligibility event fires and every pending loan in
  that district is fast-tracked — no claims adjuster, no proof-of-loss required.
- **B2B risk API.** Insurers and government departments can be issued an API key (from the admin dashboard)
  to pull the same live risk data via `/api/v1/risk` — the SaaS side of the business model.
- **SukhaRakshak chatbot**, farmer accounts, and a loan-application pipeline that mirrors a real
  claims/approval workflow.

Field IoT hardware (ESP32 + rain gauge + DHT22/BME280) is a proposed pilot, not yet deployed — see
`/concept` in the app. Until it is, live rainfall/temperature/humidity/soil-moisture readings are sourced
directly from Open-Meteo's ERA5 reanalysis per district, with light simulated jitter for the "live" feel and
simulated battery telemetry (the one thing that genuinely can't exist without real hardware).

## Architecture

- `src/` — React + TypeScript + Vite frontend (Tailwind, Recharts, react-router).
- `server/` — Node.js + Express + TypeScript backend. SQLite (`node:sqlite`, no native build step),
  JWT auth, a WebSocket feed for live sensor ticks, and the risk/payout engines described above.

## Running locally

Two processes: the API server and the Vite dev server.

```bash
# one-time setup
npm install
npm run server:install
npm run server:seed        # creates an admin account + a demo B2B API key (see console output)

# day-to-day
npm run dev:all            # runs both the API (port 8787) and the web app (port 5180)
```

Or run them separately: `npm run server` (backend) and `npm run dev` (frontend) in two terminals.

The frontend reads `VITE_API_URL` (see `.env`, defaults to `http://localhost:8787`). The backend reads
`server/.env` (copy `server/.env.example`) — in particular `ADMIN_SEED_PHONE`/`ADMIN_SEED_PASSWORD` for the
seeded admin login used on the `/admin` page.

## React + TypeScript + Vite template notes

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

### React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

### Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
