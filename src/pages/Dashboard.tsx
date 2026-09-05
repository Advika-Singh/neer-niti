import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Battery, Droplets, Gauge, Thermometer, Wind, Zap } from "lucide-react";
import { DISTRICTS } from "../lib/districts";
import { RISK_COLORS } from "../lib/sensorEngine";
import { useAllDistrictsRisk, useMonthlyRainfall } from "../lib/useDistrictRisk";
import { useLiveSensors } from "../lib/useLiveSensors";
import { apiPayoutsForDistrict } from "../lib/api";
import type { PayoutEvent } from "../lib/types";
import SmsPreview from "../components/SmsPreview";
import { RISK_KEY, useLanguage } from "../lib/i18n";

export default function Dashboard() {
  const { t, tf } = useLanguage();
  const { readings } = useLiveSensors();
  const { risk } = useAllDistrictsRisk();
  const [selected, setSelected] = useState(DISTRICTS[0].id);
  const [payoutEvent, setPayoutEvent] = useState<PayoutEvent | null>(null);

  const district = DISTRICTS.find((d) => d.id === selected)!;
  const reading = readings[selected];
  const idx = risk[selected];
  const { rainfall } = useMonthlyRainfall(selected);
  const colors = idx ? RISK_COLORS[idx.risk] : RISK_COLORS.Normal;

  useEffect(() => {
    let cancelled = false;
    apiPayoutsForDistrict(selected).then((events) => {
      if (!cancelled) setPayoutEvent(events[0] ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [selected]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-brand-900">{t("dash_title")}</h1>
          <p className="text-sm text-brand-900/60">{t("dash_subtitle")}</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-brand-900/50">
          <span className="h-2 w-2 animate-pulse rounded-full bg-brand-500" /> {t("dash_live")}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {DISTRICTS.map((d) => {
          const dIdx = risk[d.id];
          const c = dIdx ? RISK_COLORS[dIdx.risk] : RISK_COLORS.Normal;
          const active = d.id === selected;
          return (
            <button
              key={d.id}
              onClick={() => setSelected(d.id)}
              className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-black/10 bg-white text-brand-900/70 hover:border-brand-300"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-white" : c.dot}`} />
              {d.name}
            </button>
          );
        })}
      </div>

      {payoutEvent && (
        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-drought-100 bg-drought-50 px-4 py-3 text-sm text-drought-700">
          <Zap size={16} className="shrink-0" />
          <span>
            {tf("dash_payout_banner", {
              district: district.name,
              spei: payoutEvent.spei,
              threshold: payoutEvent.threshold,
              date: new Date(payoutEvent.triggeredAt).toLocaleDateString(),
            })}
          </span>
        </div>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className={`rounded-2xl border border-black/5 p-5 shadow-sm ${colors.bg}`}>
          <p className="text-xs font-medium uppercase tracking-wide text-brand-900/50">{t("dash_current_risk")}</p>
          <p className={`mt-1 text-3xl font-bold ${colors.text}`}>{idx ? t(RISK_KEY[idx.risk]) : "…"}</p>
          <p className="mt-1 text-sm text-brand-900/60">{district.name}, {district.state}</p>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-xs text-brand-900/50">SPI</p>
              <p className="font-semibold text-brand-900">{idx?.spi ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-brand-900/50">SPEI</p>
              <p className="font-semibold text-brand-900">{idx?.spei ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-brand-900/50">RDI</p>
              <p className="font-semibold text-brand-900">{idx?.rdi ?? "—"}</p>
            </div>
          </div>
          {idx && (
            <p className="mt-3 text-[11px] text-brand-900/40">
              {idx.dataSource === "live" ? t("dash_live_data_note") : t("dash_fallback_data_note")}
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-brand-900/50">{t("dash_forecast")}</p>
          <div className="mt-2 flex items-center gap-6">
            <div>
              <p className="text-xs text-brand-900/50">{t("dash_forecast_t1")}</p>
              <p className="text-2xl font-bold text-brand-900">{idx?.forecastT1 ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-brand-900/50">{t("dash_forecast_t3")}</p>
              <p className="text-2xl font-bold text-brand-900">{idx?.forecastT3 ?? "—"}</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-brand-900/50">{idx ? t("dash_forecast_method_desc") : t("dash_forecast_note")}</p>
        </div>

        <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-brand-900/50">{t("dash_live_readings")}</p>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <ReadingTile icon={Droplets} label={t("reading_rainfall")} value={reading ? `${reading.rainfallMm} mm` : "…"} />
            <ReadingTile icon={Thermometer} label={t("reading_temp")} value={reading ? `${reading.temperatureC}°C` : "…"} />
            <ReadingTile icon={Wind} label={t("reading_humidity")} value={reading ? `${reading.humidityPct}%` : "…"} />
            <ReadingTile icon={Gauge} label={t("reading_soil")} value={reading ? `${reading.soilMoisturePct}%` : "…"} />
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-brand-900/40">
            <Battery size={12} /> {t("dash_battery")} {reading?.batteryPct ?? "…"}%
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm lg:col-span-2">
          <p className="text-sm font-semibold text-brand-900">{t("dash_rainfall_chart")} {district.name}</p>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={rainfall} margin={{ left: -20, right: 10 }}>
                <defs>
                  <linearGradient id="actual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#357a35" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#357a35" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e4dc" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} unit="mm" />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="normal"
                  name={t("chart_normal")}
                  stroke="#c2570f"
                  fill="transparent"
                  strokeDasharray="5 4"
                />
                <Area
                  type="monotone"
                  dataKey="actual"
                  name={t("chart_actual")}
                  stroke="#357a35"
                  fill="url(#actual)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-[11px] text-brand-900/40">
            "Normal" is the district's 5-year climatological average per month (Open-Meteo/ERA5 archive); "Actual" is this year's real observed rainfall.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-brand-900">{t("dash_why_forecast")}</p>
            <ul className="mt-3 space-y-2.5">
              {(idx?.drivers ?? []).map((d) => (
                <li key={d} className="flex gap-2 text-sm text-brand-900/70">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                  {d}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-brand-900/40">{t("dash_explain_note")}</p>
          </div>

          {idx && <SmsPreview district={district} idx={idx} />}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-brand-900">{t("dash_station_metadata")}</p>
        <div className="mt-3 grid gap-3 text-sm text-brand-900/70 sm:grid-cols-3">
          <p><span className="text-brand-900/45">{t("dash_population")}</span> {district.population}</p>
          <p><span className="text-brand-900/45">{t("dash_crops")}</span> {district.primaryCrops.join(", ")}</p>
          <p><span className="text-brand-900/45">{t("dash_coordinates")}</span> {district.lat.toFixed(2)}, {district.lon.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}

function ReadingTile({ icon: Icon, label, value }: { icon: typeof Droplets; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-earth-50 p-3">
      <Icon size={16} className="text-brand-600" />
      <p className="mt-1.5 text-xs text-brand-900/50">{label}</p>
      <p className="text-sm font-semibold text-brand-900">{value}</p>
    </div>
  );
}
