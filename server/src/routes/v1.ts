import { Router } from "express";
import { DISTRICTS, getDistrict } from "../lib/districts.js";
import { computeDroughtIndex } from "../lib/riskEngine.js";
import { getOpenPayoutEvent } from "../lib/payoutEngine.js";
import { requireApiKey } from "../middleware/requireApiKey.js";

/**
 * B2B risk API for insurers and government departments — the SaaS side of the business
 * model referenced in the chatbot's pricing answer ("insurers access the platform via a
 * per-district API or annual SaaS license"). Auth is a simple X-API-Key header, issued by
 * an admin via /api/admin/api-keys.
 */
export const v1Router = Router();
v1Router.use(requireApiKey);

v1Router.get("/districts", (_req, res) => {
  res.json(DISTRICTS);
});

v1Router.get("/risk/:districtId", async (req, res) => {
  const district = getDistrict(req.params.districtId);
  if (!district) return res.status(404).json({ error: "Unknown district" });

  const idx = await computeDroughtIndex(district.id);
  const openPayoutEvent = getOpenPayoutEvent(district.id);

  res.json({ district, risk: idx, openPayoutEvent });
});

v1Router.get("/risk", async (_req, res) => {
  const results = await Promise.all(
    DISTRICTS.map(async (d) => ({
      district: d,
      risk: await computeDroughtIndex(d.id),
      openPayoutEvent: getOpenPayoutEvent(d.id),
    }))
  );
  res.json(results);
});
