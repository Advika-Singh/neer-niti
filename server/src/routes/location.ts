import { Router } from "express";
import { z } from "zod";
import {
  computeDroughtIndexForCoords,
  getMonthlyRainfallForCoords,
  getLatestReadingForCoords,
} from "../lib/riskEngine.js";

export const locationRouter = Router();

const coordsSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
});

function parseCoords(query: unknown) {
  return coordsSchema.safeParse(query);
}

locationRouter.get("/risk", async (req, res) => {
  const parsed = parseCoords(req.query);
  if (!parsed.success) return res.status(400).json({ error: "lat and lon query params are required" });

  try {
    const [risk, latest] = await Promise.all([
      computeDroughtIndexForCoords(parsed.data.lat, parsed.data.lon),
      getLatestReadingForCoords(parsed.data.lat, parsed.data.lon),
    ]);
    res.json({ risk, latest });
  } catch (err) {
    console.error("[location] risk lookup failed:", (err as Error).message);
    res.status(503).json({ error: "Live weather data is temporarily unavailable for this location" });
  }
});

locationRouter.get("/rainfall", async (req, res) => {
  const parsed = parseCoords(req.query);
  if (!parsed.success) return res.status(400).json({ error: "lat and lon query params are required" });

  try {
    const rainfall = await getMonthlyRainfallForCoords(parsed.data.lat, parsed.data.lon);
    res.json(rainfall);
  } catch (err) {
    console.error("[location] rainfall lookup failed:", (err as Error).message);
    res.status(503).json({ error: "Live weather data is temporarily unavailable for this location" });
  }
});
