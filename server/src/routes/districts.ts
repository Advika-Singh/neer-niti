import { Router } from "express";
import { DISTRICTS, getDistrict } from "../lib/districts.js";
import { computeDroughtIndex, getMonthlyRainfall } from "../lib/riskEngine.js";
import { getLiveReading } from "../lib/sensorSim.js";

export const districtsRouter = Router();

districtsRouter.get("/", (_req, res) => {
  res.json(DISTRICTS);
});

districtsRouter.get("/:id/risk", async (req, res) => {
  if (!getDistrict(req.params.id)) return res.status(404).json({ error: "Unknown district" });
  const idx = await computeDroughtIndex(req.params.id);
  res.json(idx);
});

districtsRouter.get("/:id/rainfall", async (req, res) => {
  if (!getDistrict(req.params.id)) return res.status(404).json({ error: "Unknown district" });
  const rainfall = await getMonthlyRainfall(req.params.id);
  res.json(rainfall);
});

districtsRouter.get("/:id/sensor", (req, res) => {
  if (!getDistrict(req.params.id)) return res.status(404).json({ error: "Unknown district" });
  const reading = getLiveReading(req.params.id);
  if (!reading) return res.status(503).json({ error: "Sensor simulation still warming up" });
  res.json(reading);
});
