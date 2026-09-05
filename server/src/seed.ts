import { randomUUID, randomBytes } from "node:crypto";
import { db } from "./db.js";
import { config } from "./config.js";
import { hashPassword } from "./lib/auth.js";

function seedAdmin() {
  const existing = db.prepare(`SELECT id FROM users WHERE phone = ?`).get(config.adminSeedPhone);
  if (existing) {
    console.log(`[seed] admin ${config.adminSeedPhone} already exists`);
    return;
  }
  db.prepare(
    `INSERT INTO users (id, name, phone, password_hash, role, created_at) VALUES (?, ?, ?, ?, 'admin', ?)`
  ).run(`user-${randomUUID()}`, "Neer-Niti Admin", config.adminSeedPhone, hashPassword(config.adminSeedPassword), new Date().toISOString());
  console.log(`[seed] created admin account: phone=${config.adminSeedPhone} password=${config.adminSeedPassword}`);
}

function seedDemoApiKey() {
  const existing = db.prepare(`SELECT id FROM api_keys WHERE owner_name = ?`).get("Demo Insurer Pilot");
  if (existing) {
    console.log(`[seed] demo API key already exists`);
    return;
  }
  const key = `nn_live_${randomBytes(20).toString("hex")}`;
  db.prepare(
    `INSERT INTO api_keys (id, key, owner_name, owner_type, created_at, revoked) VALUES (?, ?, ?, 'insurer', ?, 0)`
  ).run(`key-${randomUUID()}`, key, "Demo Insurer Pilot", new Date().toISOString());
  console.log(`[seed] created demo B2B API key: ${key}`);
}

seedAdmin();
seedDemoApiKey();
console.log("[seed] done");
