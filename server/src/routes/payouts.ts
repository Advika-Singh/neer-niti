import { Router } from "express";
import { getDistrict } from "../lib/districts.js";
import { listPayoutEventsForDistrict, listRecentPayoutEvents } from "../lib/payoutEngine.js";

export const payoutsRouter = Router();

payoutsRouter.get("/", (_req, res) => {
  res.json(listRecentPayoutEvents());
});

payoutsRouter.get("/:districtId", (req, res) => {
  if (!getDistrict(req.params.districtId)) return res.status(404).json({ error: "Unknown district" });
  res.json(listPayoutEventsForDistrict(req.params.districtId));
});
