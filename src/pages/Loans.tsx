import { useEffect, useState } from "react";
import { CheckCircle2, Clock, Landmark, LogOut, ShieldCheck, TimerReset, Zap } from "lucide-react";
import { DISTRICTS, getDistrict } from "../lib/districts";
import { apiCreateLoan, apiGetRisk, apiMyLoans, ApiError } from "../lib/api";
import type { DroughtIndex, LoanApplication } from "../lib/types";
import { RISK_KEY, STATUS_KEY, useLanguage } from "../lib/i18n";
import { useAuth } from "../lib/auth";
import SpeakButton from "../components/SpeakButton";
import LoginForm from "../components/LoginForm";

const CROPS = [
  { value: "Soybean", key: "crop_soybean" },
  { value: "Cotton", key: "crop_cotton" },
  { value: "Bajra", key: "crop_bajra" },
  { value: "Groundnut", key: "crop_groundnut" },
  { value: "Tur (Pigeon Pea)", key: "crop_tur" },
  { value: "Paddy", key: "crop_paddy" },
  { value: "Jowar", key: "crop_jowar" },
  { value: "Sugarcane", key: "crop_sugarcane" },
  { value: "Other", key: "crop_other" },
] as const;

const PURPOSES = [
  { value: "Seeds & inputs", key: "purpose_seeds" },
  { value: "Irrigation equipment", key: "purpose_irrigation" },
  { value: "Crop insurance premium", key: "purpose_insurance" },
  { value: "Post-drought recovery", key: "purpose_recovery" },
  { value: "Land preparation", key: "purpose_land" },
] as const;

const STATUS_STYLE: Record<LoanApplication["status"], { icon: typeof Clock; color: string }> = {
  Pending: { icon: Clock, color: "text-amber-600 bg-amber-50" },
  "Under Review": { icon: TimerReset, color: "text-sky-700 bg-sky-50" },
  Approved: { icon: CheckCircle2, color: "text-brand-700 bg-brand-50" },
  Disbursed: { icon: ShieldCheck, color: "text-brand-800 bg-brand-100" },
};

export default function Loans() {
  const { t, tf } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [districtRisk, setDistrictRisk] = useState<DroughtIndex | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [form, setForm] = useState({
    farmerName: "",
    phone: "",
    districtId: DISTRICTS[0].id,
    village: "",
    landSizeAcres: "",
    cropType: CROPS[0].value as string,
    loanAmount: "",
    purpose: PURPOSES[0].value as string,
  });

  useEffect(() => {
    if (!user) return;
    setForm((f) => ({ ...f, farmerName: f.farmerName || user.name, phone: f.phone || user.phone }));
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    async function load() {
      const data = await apiMyLoans();
      if (!cancelled) setApplications(data);
    }
    load();
    const id = setInterval(load, 2000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [isAuthenticated]);

  useEffect(() => {
    let cancelled = false;
    apiGetRisk(form.districtId).then((idx) => {
      if (!cancelled) setDistrictRisk(idx);
    });
    return () => {
      cancelled = true;
    };
  }, [form.districtId]);

  const isPriority = districtRisk?.risk === "Severe" || districtRisk?.risk === "Extreme";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    try {
      await apiCreateLoan({
        farmerName: form.farmerName,
        phone: form.phone,
        districtId: form.districtId,
        village: form.village,
        landSizeAcres: Number(form.landSizeAcres) || 0,
        cropType: form.cropType,
        loanAmount: Number(form.loanAmount) || 0,
        purpose: form.purpose,
      });
      const data = await apiMyLoans();
      setApplications(data);
      setSubmitted(true);
      setForm({ ...form, village: "", landSizeAcres: "", loanAmount: "" });
      setTimeout(() => setSubmitted(false), 4000);
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "Could not submit the application. Please try again.");
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
            <Landmark size={20} />
          </span>
          <div>
            <h1 className="text-2xl font-semibold text-brand-900">{t("loan_title")}</h1>
            <p className="text-sm text-brand-900/60">{t("loan_subtitle")}</p>
          </div>
        </div>
        {isAuthenticated && (
          <button
            onClick={logout}
            className="flex items-center gap-1.5 rounded-full border border-black/10 px-3 py-1.5 text-xs font-medium text-brand-900/60 hover:bg-white"
          >
            <LogOut size={13} /> {tf("auth_logout", { name: user?.name ?? "" })}
          </button>
        )}
      </div>

      {!isAuthenticated ? (
        <div className="mt-8">
          <LoginForm title={t("loan_login_title")} subtitle={t("loan_login_subtitle")} />
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-5">
          <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-black/5 bg-white p-5 shadow-sm lg:col-span-3">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("loan_full_name")}>
                <input
                  required
                  value={form.farmerName}
                  onChange={(e) => setForm({ ...form, farmerName: e.target.value })}
                  className="input"
                  placeholder="e.g. Ramesh Patil"
                />
              </Field>
              <Field label={t("loan_phone")}>
                <input
                  required
                  type="tel"
                  pattern="[0-9]{10}"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="input"
                  placeholder="10-digit mobile number"
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("loan_district")}>
                <select
                  value={form.districtId}
                  onChange={(e) => setForm({ ...form, districtId: e.target.value })}
                  className="input"
                >
                  {DISTRICTS.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}, {d.state}</option>
                  ))}
                </select>
              </Field>
              <Field label={t("loan_village")}>
                <input
                  required
                  value={form.village}
                  onChange={(e) => setForm({ ...form, village: e.target.value })}
                  className="input"
                  placeholder="Village name"
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("loan_land_size")}>
                <input
                  required
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={form.landSizeAcres}
                  onChange={(e) => setForm({ ...form, landSizeAcres: e.target.value })}
                  className="input"
                  placeholder="e.g. 3.5"
                />
              </Field>
              <Field label={t("loan_primary_crop")}>
                <select
                  value={form.cropType}
                  onChange={(e) => setForm({ ...form, cropType: e.target.value })}
                  className="input"
                >
                  {CROPS.map((c) => <option key={c.value} value={c.value}>{t(c.key)}</option>)}
                </select>
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("loan_amount")}>
                <input
                  required
                  type="number"
                  min="1000"
                  step="500"
                  value={form.loanAmount}
                  onChange={(e) => setForm({ ...form, loanAmount: e.target.value })}
                  className="input"
                  placeholder="e.g. 50000"
                />
              </Field>
              <Field label={t("loan_purpose")}>
                <select
                  value={form.purpose}
                  onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                  className="input"
                >
                  {PURPOSES.map((p) => <option key={p.value} value={p.value}>{t(p.key)}</option>)}
                </select>
              </Field>
            </div>

            {isPriority && districtRisk && (
              <div className="flex flex-wrap items-center gap-2 rounded-xl bg-drought-50 px-3 py-2.5 text-sm text-drought-700">
                <ShieldCheck size={16} className="shrink-0" />
                <span>
                  <strong>{t("loan_priority_label")}</strong>{" "}
                  {tf("loan_priority", {
                    district: getDistrict(form.districtId)?.name ?? "",
                    risk: t(RISK_KEY[districtRisk.risk]),
                  })}
                </span>
                <SpeakButton
                  text={tf("loan_priority", {
                    district: getDistrict(form.districtId)?.name ?? "",
                    risk: t(RISK_KEY[districtRisk.risk]),
                  })}
                />
              </div>
            )}

            {submitError && <p className="text-sm text-red-600">{submitError}</p>}

            <button
              type="submit"
              className="w-full rounded-full bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
            >
              {t("loan_submit")}
            </button>

            {submitted && (
              <p className="text-center text-sm font-medium text-brand-700">{t("loan_submitted")}</p>
            )}
          </form>

          <div className="lg:col-span-2">
            <h2 className="text-sm font-semibold text-brand-900">{t("loan_your_applications")}</h2>
            <div className="mt-3 space-y-3">
              {applications.length === 0 && (
                <p className="rounded-xl border border-dashed border-black/10 p-6 text-center text-sm text-brand-900/50">
                  {t("loan_none_yet")}
                </p>
              )}
              {applications.map((app) => {
                const StatusIcon = STATUS_STYLE[app.status].icon;
                const district = getDistrict(app.districtId);
                const cropLabel = CROPS.find((c) => c.value === app.cropType);
                return (
                  <div key={app.id} className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-brand-900">{app.farmerName || t("loan_farmer_fallback")}</p>
                        <p className="text-xs text-brand-900/50">
                          {district?.name} · {cropLabel ? t(cropLabel.key) : app.cropType} · {app.landSizeAcres} acres
                        </p>
                      </div>
                      <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLE[app.status].color}`}>
                        <StatusIcon size={12} /> {t(STATUS_KEY[app.status])}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="text-brand-900/60">{t("loan_requested")} ₹{app.loanAmount.toLocaleString("en-IN")}</span>
                      <span className="font-semibold text-brand-700">{t("loan_est_payout")} ₹{app.estimatedPayout.toLocaleString("en-IN")}</span>
                    </div>
                    {app.priority && (
                      <p className="mt-2 text-xs font-medium text-drought-600">⚡ {t("loan_fasttracked")}</p>
                    )}
                    {app.parametricEligible && (
                      <p className="mt-1 flex items-center gap-1 text-xs font-medium text-brand-700">
                        <Zap size={11} /> {t("loan_parametric_badge")}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-brand-900/80">{label}</span>
      {children}
    </label>
  );
}
