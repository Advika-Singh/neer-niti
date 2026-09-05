import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

export const db = new DatabaseSync(path.join(dataDir, "neer-niti.sqlite"));

db.exec(`
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'farmer',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS loan_applications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    farmer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    district_id TEXT NOT NULL,
    village TEXT NOT NULL,
    land_size_acres REAL NOT NULL,
    crop_type TEXT NOT NULL,
    loan_amount REAL NOT NULL,
    purpose TEXT NOT NULL,
    submitted_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    status TEXT NOT NULL,
    priority INTEGER NOT NULL DEFAULT 0,
    estimated_payout REAL NOT NULL,
    risk_at_submission TEXT NOT NULL,
    parametric_eligible INTEGER NOT NULL DEFAULT 0,
    payout_event_id TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS payout_events (
    id TEXT PRIMARY KEY,
    district_id TEXT NOT NULL,
    risk TEXT NOT NULL,
    spei REAL NOT NULL,
    threshold REAL NOT NULL,
    triggered_at TEXT NOT NULL,
    note TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS api_keys (
    id TEXT PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    owner_name TEXT NOT NULL,
    owner_type TEXT NOT NULL,
    created_at TEXT NOT NULL,
    revoked INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS weather_cache (
    district_id TEXT PRIMARY KEY,
    payload_json TEXT NOT NULL,
    fetched_at TEXT NOT NULL
  );
`);
