import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ClipboardList, HandCoins, Key, LogOut, ShieldCheck, Trash2, Zap } from "lucide-react";
import { DISTRICTS } from "../lib/districts";
import { RISK_COLORS, RISK_ORDER } from "../lib/sensorEngine";
import {
  apiAdminAllLoans,
  apiCreateApiKey,
  apiListApiKeys,
  apiRecentPayouts,
  apiRevokeApiKey,
  ApiError,
  type AdminLoansResponse,
  type ApiKeyRecord,
} from "../lib/api";
import { useAllDistrictsRisk } from "../lib/useDistrictRisk";
import type { LoanApplication, PayoutEvent } from "../lib/types";
import { RISK_KEY, STATUS_KEY, useLanguage } from "../lib/i18n";
import { useAuth } from "../lib/auth";
import LoginForm from "../components/LoginForm";

const STATUS_ORDER: LoanApplication["status"][] = ["Pending", "Under Review", "Approved", "Disbursed"];

const OWNER_TYPE_KEY: Record<ApiKeyRecord["owner_type"], "owner_type_insurer" | "owner_type_government" | "owner_type_research"> = {
  insurer: "owner_type_insurer",
  government: "owner_type_government",
  research: "owner_type_research",
};

export default function Admin() {
  const { t, tf } = useLanguage();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { risk } = useAllDistrictsRisk();
  const [data, setData] = useState<AdminLoansResponse | null>(null);
  const [payoutEvents, setPayoutEvents] = useState<PayoutEvent[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKeyRecord[]>([]);
  const [newKeyOwner, setNewKeyOwner] = useState("");
  const [newKeyType, setNewKeyType] = useState<ApiKeyRecord["owner_type"]>("insurer");
  const [issuedKey, setIssuedKey] = useState<string | null>(null);
  const [keyError, setKeyError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    async function load() {
      const [loans, payouts, keys] = await Promise.all([apiAdminAllLoans(), apiRecentPayouts(), apiListApiKeys()]);
      if (!cancelled) {
        setData(loans);
        setPayoutEvents(payouts);
        setApiKeys(keys);
      }
    }
    load();
    const id = setInterval(async () => {
      const [loans, payouts] = await Promise.all([apiAdminAllLoans(), apiRecentPayouts()]);
      if (!cancelled) {
        setData(loans);
        setPayoutEvents(payouts);
      }
    }, 3000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [isAdmin]);

  async function issueKey(e: React.FormEvent) {
    e.preventDefault();
    setKeyError(null);
    try {
      const record = await apiCreateApiKey(newKeyOwner, newKeyType);
      setApiKeys((prev) => [record, ...prev]);
      setIssuedKey(record.key);
      setNewKeyOwner("");
    } catch (err) {
      setKeyError(err instanceof ApiError ? err.message : t("admin_api_issue_error"));
    }
  }

  async function revokeKey(id: string) {
    await apiRevokeApiKey(id);
    setApiKeys((prev) => prev.map((k) => (k.id === id ? { ...k, revoked: 1 } : k)));
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <LoginForm title={t("admin_login_title")} subtitle={t("admin_login_subtitle")} />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <p className="rounded-2xl border border-dashed border-black/10 bg-white p-8 text-center text-sm text-brand-900/60">
          {tf("admin_not_admin", { name: user?.name ?? "" })}
        </p>
      </div>
    );
  }

  const applications = data?.applications ?? [];
  const stats = data?.stats;

  const statusCounts = STATUS_ORDER.map((status) => ({
    status,
    count: applications.filter((a) => a.status === status).length,
  }));

  const districtRows = DISTRICTS.map((d) => {
    const idx = risk[d.id];
    const byDistrict = stats?.byDistrict.find((b) => b.districtId === d.id);
    return { district: d, idx, appCount: byDistrict?.appCount ?? 0, requested: byDistrict?.requested ?? 0 };
  }).sort((a, b) => (a.idx && b.idx ? RISK_ORDER[a.idx.risk] - RISK_ORDER[b.idx.risk] : 0));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
            <ClipboardList size={20} />
          </span>
          <div>
            <h1 className="text-2xl font-semibold text-brand-900">{t("admin_title")}</h1>
            <p className="text-sm text-brand-900/60">{t("admin_subtitle")}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-1.5 rounded-full border border-black/10 px-3 py-1.5 text-xs font-medium text-brand-900/60 hover:bg-white"
        >
          <LogOut size={13} /> {tf("auth_logout", { name: user?.name ?? "" })}
        </button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile icon={ClipboardList} label={t("admin_total_apps")} value={(stats?.total ?? 0).toLocaleString("en-IN")} />
        <StatTile icon={Zap} label={t("admin_priority")} value={(stats?.priorityCount ?? 0).toLocaleString("en-IN")} />
        <StatTile icon={HandCoins} label={t("admin_total_requested")} value={`₹${(stats?.totalRequested ?? 0).toLocaleString("en-IN")}`} />
        <StatTile icon={ShieldCheck} label={t("admin_total_payout")} value={`₹${(stats?.totalEstPayout ?? 0).toLocaleString("en-IN")}`} />
      </div>

      {payoutEvents.length > 0 && (
        <div className="mt-6 rounded-2xl border border-drought-100 bg-drought-50 p-5 shadow-sm">
          <p className="flex items-center gap-2 text-sm font-semibold text-drought-700">
            <Zap size={15} /> {t("admin_payout_triggers_heading")}
          </p>
          <div className="mt-3 space-y-2">
            {payoutEvents.slice(0, 5).map((ev) => (
              <div key={ev.id} className="rounded-xl bg-white/70 p-3 text-xs text-brand-900/70">
                <span className="font-semibold text-brand-900">{DISTRICTS.find((d) => d.id === ev.districtId)?.name}</span>
                {" · "}SPEI {ev.spei} · {ev.risk} · {new Date(ev.triggeredAt).toLocaleString()}
              </div>
            ))}
          </div>
        </div>
      )}

      {(stats?.total ?? 0) === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-black/10 bg-white p-8 text-center text-sm text-brand-900/50">
          {t("admin_empty_pre")}{" "}
          <Link to="/loans" className="font-medium text-brand-600 hover:underline">
            {t("admin_empty_link")}
          </Link>{" "}
          {t("admin_empty_post")}
        </p>
      ) : (
        <div className="mt-6 rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-brand-900">{t("admin_by_status")}</p>
          <div className="mt-4 space-y-3">
            {statusCounts.map(({ status, count }) => (
              <div key={status} className="flex items-center gap-3">
                <span className="w-28 shrink-0 text-xs text-brand-900/60">{t(STATUS_KEY[status])}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-earth-100">
                  <div
                    className="h-full rounded-full bg-brand-500"
                    style={{ width: `${stats && stats.total ? (count / stats.total) * 100 : 0}%` }}
                  />
                </div>
                <span className="w-6 shrink-0 text-right text-xs font-medium text-brand-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-black/5 bg-white shadow-sm">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-black/5 bg-earth-100/60 text-left text-xs uppercase tracking-wide text-brand-900/50">
              <th className="px-4 py-3 font-medium">{t("admin_col_district")}</th>
              <th className="px-4 py-3 font-medium">{t("admin_col_risk")}</th>
              <th className="px-4 py-3 font-medium">{t("admin_col_spei")}</th>
              <th className="px-4 py-3 font-medium">{t("admin_col_apps")}</th>
              <th className="px-4 py-3 font-medium">{t("admin_col_requested")}</th>
            </tr>
          </thead>
          <tbody>
            {districtRows.map(({ district, idx, appCount, requested }) => {
              const c = idx ? RISK_COLORS[idx.risk] : RISK_COLORS.Normal;
              return (
                <tr key={district.id} className="border-b border-black/5 last:border-0">
                  <td className="px-4 py-3">
                    <span className="font-semibold text-brand-900">{district.name}</span>
                    <span className="block text-xs text-brand-900/50">{district.state}</span>
                  </td>
                  <td className="px-4 py-3">
                    {idx ? (
                      <span className={`flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${c.text} ${c.bg}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} /> {t(RISK_KEY[idx.risk])}
                      </span>
                    ) : (
                      <span className="text-xs text-brand-900/40">{t("common_loading")}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-brand-900/75">{idx?.spei ?? "—"}</td>
                  <td className="px-4 py-3 text-brand-900/75">{appCount}</td>
                  <td className="px-4 py-3 font-medium text-brand-900">₹{requested.toLocaleString("en-IN")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-6 rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
        <p className="flex items-center gap-2 text-sm font-semibold text-brand-900">
          <Key size={15} /> {t("admin_api_heading")}
        </p>
        <p className="mt-1 text-xs text-brand-900/50">{t("admin_api_desc")}</p>

        <form onSubmit={issueKey} className="mt-4 flex flex-wrap items-end gap-3">
          <label className="text-sm">
            <span className="mb-1 block text-xs font-medium text-brand-900/70">{t("admin_api_owner_name")}</span>
            <input
              required
              value={newKeyOwner}
              onChange={(e) => setNewKeyOwner(e.target.value)}
              placeholder={t("admin_api_owner_name_ph")}
              className="input"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-xs font-medium text-brand-900/70">{t("admin_api_owner_type")}</span>
            <select value={newKeyType} onChange={(e) => setNewKeyType(e.target.value as ApiKeyRecord["owner_type"])} className="input">
              <option value="insurer">{t("owner_type_insurer")}</option>
              <option value="government">{t("owner_type_government")}</option>
              <option value="research">{t("owner_type_research")}</option>
            </select>
          </label>
          <button type="submit" className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
            {t("admin_api_issue")}
          </button>
        </form>
        {keyError && <p className="mt-2 text-sm text-red-600">{keyError}</p>}
        {issuedKey && (
          <p className="mt-3 break-all rounded-lg bg-earth-100 p-2.5 font-mono text-xs text-brand-900">{issuedKey}</p>
        )}

        <div className="mt-4 space-y-2">
          {apiKeys.map((k) => (
            <div key={k.id} className="flex items-center justify-between gap-3 rounded-xl bg-earth-50 p-3 text-sm">
              <div>
                <p className="font-medium text-brand-900">{k.owner_name} <span className="text-xs font-normal text-brand-900/50">({t(OWNER_TYPE_KEY[k.owner_type])})</span></p>
                <p className="font-mono text-xs text-brand-900/50">{k.key.slice(0, 16)}…</p>
              </div>
              {k.revoked ? (
                <span className="text-xs text-brand-900/40">{t("admin_api_revoked")}</span>
              ) : (
                <button onClick={() => revokeKey(k.id)} className="flex items-center gap-1 text-xs text-red-600 hover:underline">
                  <Trash2 size={12} /> {t("admin_api_revoke")}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatTile({ icon: Icon, label, value }: { icon: typeof ClipboardList; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
      <Icon size={16} className="text-brand-600" />
      <p className="mt-2 text-lg font-bold text-brand-900">{value}</p>
      <p className="mt-0.5 text-xs text-brand-900/50">{label}</p>
    </div>
  );
}
