import type { NextFunction, Request, Response } from "express";
import { db } from "../db.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      apiKeyOwner?: { name: string; type: string };
    }
  }
}

/** Auth for the B2B risk API used by insurers / government departments. */
export function requireApiKey(req: Request, res: Response, next: NextFunction) {
  const key = req.header("X-API-Key");
  if (!key) return res.status(401).json({ error: "Missing X-API-Key header" });

  const row = db
    .prepare(`SELECT owner_name, owner_type, revoked FROM api_keys WHERE key = ?`)
    .get(key) as { owner_name: string; owner_type: string; revoked: number } | undefined;

  if (!row || row.revoked) return res.status(401).json({ error: "Invalid or revoked API key" });

  req.apiKeyOwner = { name: row.owner_name, type: row.owner_type };
  next();
}
