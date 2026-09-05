import "dotenv/config";

function num(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

function withScheme(url: string): string {
  return /^https?:\/\//.test(url) ? url : `https://${url}`;
}

export const config = {
  port: num("PORT", 8787),
  jwtSecret: process.env.JWT_SECRET ?? "dev-secret-change-me",
  corsOrigin: process.env.CORS_ORIGIN ? withScheme(process.env.CORS_ORIGIN) : "http://localhost:5180",
  adminSeedPhone: process.env.ADMIN_SEED_PHONE ?? "9999999999",
  adminSeedPassword: process.env.ADMIN_SEED_PASSWORD ?? "admin1234",
  weatherCacheTtlMinutes: num("WEATHER_CACHE_TTL_MINUTES", 60),
  sensorTickMs: num("SENSOR_TICK_MS", 3500),
  riskScanIntervalMs: num("RISK_SCAN_INTERVAL_MS", 15000),
  loanProgressionIntervalMs: num("LOAN_PROGRESSION_INTERVAL_MS", 2000),
};
