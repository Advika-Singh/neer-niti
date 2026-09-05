import http from "node:http";
import express from "express";
import cors from "cors";
import { config } from "./config.js";
import "./db.js";
import { districtsRouter } from "./routes/districts.js";
import { newsRouter } from "./routes/news.js";
import { authRouter } from "./routes/auth.js";
import { loansRouter, progressLoanStatuses } from "./routes/loans.js";
import { payoutsRouter } from "./routes/payouts.js";
import { apiKeysRouter } from "./routes/apiKeys.js";
import { v1Router } from "./routes/v1.js";
import { initSensorSim, stepSensors, refreshAnchor } from "./lib/sensorSim.js";
import { warmAllDistrictsClimate } from "./lib/weatherService.js";
import { scanAllDistrictsForPayoutTriggers } from "./lib/payoutEngine.js";
import { DISTRICTS } from "./lib/districts.js";
import { attachWebSocketServer, broadcastPayoutEvent, broadcastSensorTick } from "./ws.js";

const app = express();
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "neer-niti-server" }));

app.use("/api/districts", districtsRouter);
app.use("/api/news", newsRouter);
app.use("/api/auth", authRouter);
app.use("/api/loans", loansRouter);
app.use("/api/payouts", payoutsRouter);
app.use("/api/admin/api-keys", apiKeysRouter);
app.use("/api/v1", v1Router);

const server = http.createServer(app);
attachWebSocketServer(server);

async function main() {
  console.log("[startup] warming live weather cache for all districts…");
  await warmAllDistrictsClimate();
  await initSensorSim();

  server.listen(config.port, () => {
    console.log(`[startup] neer-niti-server listening on http://localhost:${config.port}`);
  });

  setInterval(() => {
    const readings = stepSensors();
    broadcastSensorTick(readings);
  }, config.sensorTickMs);

  // Re-anchor the simulated jitter to fresh live data every 30 minutes so it never drifts far from reality.
  setInterval(() => {
    for (const d of DISTRICTS) void refreshAnchor(d.id);
  }, 30 * 60 * 1000);

  setInterval(() => {
    void scanAllDistrictsForPayoutTriggers((event) => broadcastPayoutEvent(event));
  }, config.riskScanIntervalMs);

  setInterval(() => {
    progressLoanStatuses();
  }, config.loanProgressionIntervalMs);
}

main().catch((err) => {
  console.error("[startup] fatal error:", err);
  process.exit(1);
});
