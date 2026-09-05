import { Router } from "express";
import { searchLocations } from "../lib/geocodeService.js";

export const geocodeRouter = Router();

geocodeRouter.get("/", async (req, res) => {
  const q = String(req.query.q ?? "").trim();
  if (q.length < 2) return res.json([]);

  try {
    const results = await searchLocations(q);
    res.json(results);
  } catch (err) {
    console.error("[geocode] search failed:", (err as Error).message);
    res.status(503).json({ error: "Location search is temporarily unavailable" });
  }
});
