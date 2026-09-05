import { randomUUID } from "node:crypto";
import { db } from "../db.js";
import { DISTRICTS } from "./districts.js";
import { computeDroughtIndex } from "./riskEngine.js";
import type { DroughtIndex, PayoutEvent } from "../types.js";

const SPEI_TRIGGER_THRESHOLD = -1.0; // Severe or worse

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Returns the open (most recent, still-active-today) payout event for a district, if any. */
export function getOpenPayoutEvent(districtId: string): PayoutEvent | null {
  const row = db
    .prepare(
      `SELECT * FROM payout_events WHERE district_id = ? AND triggered_at LIKE ? ORDER BY triggered_at DESC LIMIT 1`
    )
    .get(districtId, `${todayKey()}%`) as
    | { id: string; district_id: string; risk: string; spei: number; threshold: number; triggered_at: string; note: string }
    | undefined;
  if (!row) return null;
  return toPayoutEvent(row);
}

function toPayoutEvent(row: {
  id: string;
  district_id: string;
  risk: string;
  spei: number;
  threshold: number;
  triggered_at: string;
  note: string;
}): PayoutEvent {
  return {
    id: row.id,
    districtId: row.district_id,
    risk: row.risk as PayoutEvent["risk"],
    spei: row.spei,
    threshold: row.threshold,
    triggeredAt: row.triggered_at,
    note: row.note,
  };
}

/**
 * The core parametric-insurance differentiator: instead of waiting for a farmer to file a
 * claim after harvest failure, the platform fires an *index-based* payout-eligibility event
 * the moment a district's real, live-computed SPEI crosses the severe-drought threshold.
 * Every pending/under-review loan in that district is retroactively flagged eligible and
 * fast-tracked — no claims adjuster required.
 */
export function evaluatePayoutTrigger(districtId: string, idx: DroughtIndex): { event: PayoutEvent; isNew: boolean } | null {
  if (idx.spei > SPEI_TRIGGER_THRESHOLD) return null;

  const existing = getOpenPayoutEvent(districtId);
  if (existing) return { event: existing, isNew: false };

  const event: PayoutEvent = {
    id: `pay-${randomUUID()}`,
    districtId,
    risk: idx.risk,
    spei: idx.spei,
    threshold: SPEI_TRIGGER_THRESHOLD,
    triggeredAt: new Date().toISOString(),
    note: `Automatic index trigger: SPEI ${idx.spei} crossed the ${SPEI_TRIGGER_THRESHOLD} severe-drought threshold (${idx.dataSource === "live" ? "live Open-Meteo/ERA5 feed" : "offline calibrated estimate"}).`,
  };

  db.prepare(
    `INSERT INTO payout_events (id, district_id, risk, spei, threshold, triggered_at, note) VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(event.id, event.districtId, event.risk, event.spei, event.threshold, event.triggeredAt, event.note);

  // Fast-track every open application already sitting in this district.
  db.prepare(
    `UPDATE loan_applications
     SET priority = 1, parametric_eligible = 1, payout_event_id = ?, updated_at = ?
     WHERE district_id = ? AND status IN ('Pending', 'Under Review') AND parametric_eligible = 0`
  ).run(event.id, new Date().toISOString(), districtId);

  return { event, isNew: true };
}

export function listRecentPayoutEvents(limit = 50): PayoutEvent[] {
  const rows = db
    .prepare(`SELECT * FROM payout_events ORDER BY triggered_at DESC LIMIT ?`)
    .all(limit) as Array<{
    id: string;
    district_id: string;
    risk: string;
    spei: number;
    threshold: number;
    triggered_at: string;
    note: string;
  }>;
  return rows.map(toPayoutEvent);
}

export function listPayoutEventsForDistrict(districtId: string): PayoutEvent[] {
  const rows = db
    .prepare(`SELECT * FROM payout_events WHERE district_id = ? ORDER BY triggered_at DESC`)
    .all(districtId) as Array<{
    id: string;
    district_id: string;
    risk: string;
    spei: number;
    threshold: number;
    triggered_at: string;
    note: string;
  }>;
  return rows.map(toPayoutEvent);
}

/** Periodic sweep across all districts using real, live-computed risk. */
export async function scanAllDistrictsForPayoutTriggers(onNewEvent?: (event: PayoutEvent) => void): Promise<void> {
  for (const d of DISTRICTS) {
    try {
      const idx = await computeDroughtIndex(d.id);
      const result = evaluatePayoutTrigger(d.id, idx);
      if (result?.isNew) onNewEvent?.(result.event);
    } catch (err) {
      console.error(`[payout] scan failed for ${d.id}:`, (err as Error).message);
    }
  }
}
