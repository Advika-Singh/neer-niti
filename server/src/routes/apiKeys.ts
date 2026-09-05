import { randomUUID, randomBytes } from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import { db } from "../db.js";
import { requireAuth, requireAdmin } from "../middleware/requireAuth.js";

export const apiKeysRouter = Router();
apiKeysRouter.use(requireAuth, requireAdmin);

const createKeySchema = z.object({
  ownerName: z.string().min(1).max(120),
  ownerType: z.enum(["insurer", "government", "research"]),
});

function generateKey(): string {
  return `nn_live_${randomBytes(20).toString("hex")}`;
}

apiKeysRouter.get("/", (_req, res) => {
  const rows = db.prepare(`SELECT * FROM api_keys ORDER BY created_at DESC`).all();
  res.json(rows);
});

apiKeysRouter.post("/", (req, res) => {
  const parsed = createKeySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });

  const record = {
    id: `key-${randomUUID()}`,
    key: generateKey(),
    ownerName: parsed.data.ownerName,
    ownerType: parsed.data.ownerType,
    createdAt: new Date().toISOString(),
  };

  db.prepare(
    `INSERT INTO api_keys (id, key, owner_name, owner_type, created_at, revoked) VALUES (?, ?, ?, ?, ?, 0)`
  ).run(record.id, record.key, record.ownerName, record.ownerType, record.createdAt);

  res.status(201).json(record);
});

apiKeysRouter.delete("/:id", (req, res) => {
  const result = db.prepare(`UPDATE api_keys SET revoked = 1 WHERE id = ?`).run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: "API key not found" });
  res.status(204).end();
});
