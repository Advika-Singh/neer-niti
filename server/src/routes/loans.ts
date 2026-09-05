import { randomUUID } from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import { db } from "../db.js";
import { getDistrict, DISTRICTS } from "../lib/districts.js";
import { computeDroughtIndex } from "../lib/riskEngine.js";
import { getOpenPayoutEvent } from "../lib/payoutEngine.js";
import { requireAuth, requireAdmin } from "../middleware/requireAuth.js";
import type { LoanApplication, LoanStatus } from "../types.js";

export const loansRouter = Router();

const createLoanSchema = z.object({
  farmerName: z.string().min(1).max(120),
  phone: z.string().regex(/^[0-9]{10}$/, "Phone must be a 10-digit number"),
  districtId: z.string(),
  village: z.string().min(1).max(120),
  landSizeAcres: z.number().positive(),
  cropType: z.string().min(1),
  loanAmount: z.number().positive(),
  purpose: z.string().min(1),
});

function estimatePayout(landSize: number, loanAmount: number, priority: boolean): number {
  const riskMultiplier = priority ? 1.25 : 1.0;
  return Math.round(Math.min(loanAmount, landSize * 18000 * riskMultiplier));
}

function rowToLoan(row: {
  id: string;
  user_id: string;
  farmer_name: string;
  phone: string;
  district_id: string;
  village: string;
  land_size_acres: number;
  crop_type: string;
  loan_amount: number;
  purpose: string;
  submitted_at: string;
  updated_at: string;
  status: string;
  priority: number;
  estimated_payout: number;
  risk_at_submission: string;
  parametric_eligible: number;
  payout_event_id: string | null;
}): LoanApplication {
  return {
    id: row.id,
    userId: row.user_id,
    farmerName: row.farmer_name,
    phone: row.phone,
    districtId: row.district_id,
    village: row.village,
    landSizeAcres: row.land_size_acres,
    cropType: row.crop_type,
    loanAmount: row.loan_amount,
    purpose: row.purpose,
    submittedAt: row.submitted_at,
    updatedAt: row.updated_at,
    status: row.status as LoanStatus,
    priority: Boolean(row.priority),
    estimatedPayout: row.estimated_payout,
    riskAtSubmission: row.risk_at_submission as LoanApplication["riskAtSubmission"],
    parametricEligible: Boolean(row.parametric_eligible),
    payoutEventId: row.payout_event_id,
  };
}

loansRouter.post("/", requireAuth, async (req, res) => {
  const parsed = createLoanSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
  const body = parsed.data;

  if (!getDistrict(body.districtId)) return res.status(400).json({ error: "Unknown district" });

  const idx = await computeDroughtIndex(body.districtId);
  const openEvent = getOpenPayoutEvent(body.districtId);
  const priority = idx.risk === "Severe" || idx.risk === "Extreme" || Boolean(openEvent);

  const now = new Date().toISOString();
  const loan: LoanApplication = {
    id: `app-${randomUUID()}`,
    userId: req.user!.sub,
    farmerName: body.farmerName,
    phone: body.phone,
    districtId: body.districtId,
    village: body.village,
    landSizeAcres: body.landSizeAcres,
    cropType: body.cropType,
    loanAmount: body.loanAmount,
    purpose: body.purpose,
    submittedAt: now,
    updatedAt: now,
    status: "Pending",
    priority,
    estimatedPayout: estimatePayout(body.landSizeAcres, body.loanAmount, priority),
    riskAtSubmission: idx.risk,
    parametricEligible: Boolean(openEvent),
    payoutEventId: openEvent?.id ?? null,
  };

  db.prepare(
    `INSERT INTO loan_applications
       (id, user_id, farmer_name, phone, district_id, village, land_size_acres, crop_type, loan_amount, purpose,
        submitted_at, updated_at, status, priority, estimated_payout, risk_at_submission, parametric_eligible, payout_event_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    loan.id, loan.userId, loan.farmerName, loan.phone, loan.districtId, loan.village, loan.landSizeAcres,
    loan.cropType, loan.loanAmount, loan.purpose, loan.submittedAt, loan.updatedAt, loan.status,
    loan.priority ? 1 : 0, loan.estimatedPayout, loan.riskAtSubmission, loan.parametricEligible ? 1 : 0, loan.payoutEventId
  );

  res.status(201).json(loan);
});

loansRouter.get("/mine", requireAuth, (req, res) => {
  const rows = db
    .prepare(`SELECT * FROM loan_applications WHERE user_id = ? ORDER BY submitted_at DESC`)
    .all(req.user!.sub) as Parameters<typeof rowToLoan>[0][];
  res.json(rows.map(rowToLoan));
});

loansRouter.get("/admin/all", requireAuth, requireAdmin, (_req, res) => {
  const rows = db.prepare(`SELECT * FROM loan_applications ORDER BY submitted_at DESC`).all() as Parameters<
    typeof rowToLoan
  >[0][];
  const applications = rows.map(rowToLoan);

  const total = applications.length;
  const priorityCount = applications.filter((a) => a.priority).length;
  const parametricCount = applications.filter((a) => a.parametricEligible).length;
  const totalRequested = applications.reduce((sum, a) => sum + a.loanAmount, 0);
  const totalEstPayout = applications.reduce((sum, a) => sum + a.estimatedPayout, 0);

  const byDistrict = DISTRICTS.map((d) => {
    const apps = applications.filter((a) => a.districtId === d.id);
    return {
      districtId: d.id,
      appCount: apps.length,
      requested: apps.reduce((sum, a) => sum + a.loanAmount, 0),
    };
  });

  res.json({ applications, stats: { total, priorityCount, parametricCount, totalRequested, totalEstPayout, byDistrict } });
});

/** Simulated approval-pipeline progression, called on a timer from index.ts. */
export function progressLoanStatuses(): void {
  const rows = db.prepare(`SELECT * FROM loan_applications WHERE status != 'Disbursed'`).all() as Parameters<
    typeof rowToLoan
  >[0][];
  const now = Date.now();

  for (const row of rows) {
    const submitted = new Date(row.submitted_at).getTime();
    const age = now - submitted;
    const stepMs = row.priority ? 8000 : 15000;

    let status: LoanStatus = row.status as LoanStatus;
    if (age > stepMs * 3) status = "Disbursed";
    else if (age > stepMs * 2) status = "Approved";
    else if (age > stepMs) status = "Under Review";

    if (status !== row.status) {
      db.prepare(`UPDATE loan_applications SET status = ?, updated_at = ? WHERE id = ?`).run(
        status, new Date().toISOString(), row.id
      );
    }
  }
}
