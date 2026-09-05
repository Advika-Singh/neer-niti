import { randomUUID } from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import { db } from "../db.js";
import { hashPassword, signToken, verifyPassword } from "../lib/auth.js";
import { requireAuth } from "../middleware/requireAuth.js";
import type { UserRecord } from "../types.js";

export const authRouter = Router();

const registerSchema = z.object({
  name: z.string().min(1).max(120),
  phone: z.string().regex(/^[0-9]{10}$/, "Phone must be a 10-digit number"),
  password: z.string().min(6).max(200),
});

const loginSchema = z.object({
  phone: z.string(),
  password: z.string(),
});

function findUserByPhone(phone: string): UserRecord | undefined {
  const row = db.prepare(`SELECT * FROM users WHERE phone = ?`).get(phone) as
    | { id: string; name: string; phone: string; password_hash: string; role: string; created_at: string }
    | undefined;
  if (!row) return undefined;
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    passwordHash: row.password_hash,
    role: row.role as UserRecord["role"],
    createdAt: row.created_at,
  };
}

function publicUser(user: UserRecord) {
  return { id: user.id, name: user.name, phone: user.phone, role: user.role };
}

authRouter.post("/register", (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
  const { name, phone, password } = parsed.data;

  if (findUserByPhone(phone)) return res.status(409).json({ error: "An account with this phone number already exists" });

  const user: UserRecord = {
    id: `user-${randomUUID()}`,
    name,
    phone,
    passwordHash: hashPassword(password),
    role: "farmer",
    createdAt: new Date().toISOString(),
  };
  db.prepare(`INSERT INTO users (id, name, phone, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?)`).run(
    user.id, user.name, user.phone, user.passwordHash, user.role, user.createdAt
  );

  const token = signToken({ sub: user.id, role: user.role, name: user.name });
  res.status(201).json({ token, user: publicUser(user) });
});

authRouter.post("/login", (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const { phone, password } = parsed.data;

  const user = findUserByPhone(phone);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ error: "Invalid phone number or password" });
  }

  const token = signToken({ sub: user.id, role: user.role, name: user.name });
  res.json({ token, user: publicUser(user) });
});

authRouter.get("/me", requireAuth, (req, res) => {
  const user = db.prepare(`SELECT id, name, phone, role FROM users WHERE id = ?`).get(req.user!.sub);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});
