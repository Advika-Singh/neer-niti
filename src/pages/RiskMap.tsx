import { useState } from "react";
import { MapPin } from "lucide-react";
import { DISTRICTS } from "../lib/districts";
import { RISK_COLORS, RISK_HEX } from "../lib/sensorEngine";
import { useAllDistrictsRisk } from "../lib/useDistrictRisk";
import type { RiskLevel } from "../lib/types";
import { RISK_KEY, useLanguage } from "../lib/i18n";

const LAT_MIN = 12.5;
const LAT_MAX = 27.9;
const LON_MIN = 69.2;
const LON_MAX = 85.3;

function toPosition(lat: number, lon: number) {
  const left = ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * 100;
  const top = 100 - ((lat - LAT_MIN) / (LAT_MAX - LAT_MIN)) * 100;
  return { left: `${left}%`, top: `${top}%` };
}

const LEGEND: RiskLevel[] = ["Normal", "Moderate", "Severe", "Extreme"];

export default function RiskMap() {
  const { t, tf } = useLanguage();
  const { risk } = useAllDistrictsRisk();
  const [selected, setSelected] = useState(DISTRICTS[0].id);

  const district = DISTRICTS.find((d) => d.id === selected)!;
  const idx = risk[selected];
  const colors = idx ? RISK_COLORS[idx.risk] : RISK_COLORS.Normal;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-brand-900">{t("map_title")}</h1>
          <p className="text-sm text-brand-900/60">{t("map_subtitle")}</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-brand-900/50">
          <span className="h-2 w-2 animate-pulse rounded-full bg-brand-500" /> {t("dash_live")}
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-black/5 bg-gradient-to-b from-sky-mist to-earth-100 shadow-sm sm:aspect-[3/4]">
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)",
                backgroundSize: "12.5% 12.5%",
              }}
            />
            <span className="absolute left-3 top-2 text-[10px] font-medium uppercase tracking-wider text-brand-900/30">N</span>
            <span className="absolute bottom-2 left-3 text-[10px] font-medium uppercase tracking-wider text-brand-900/30">S</span>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-medium uppercase tracking-wider text-brand-900/30">E</span>
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-medium uppercase tracking-wider text-brand-900/30">W</span>

            {DISTRICTS.map((d) => {
              const dIdx = risk[d.id];
              const pos = toPosition(d.lat, d.lon);
              const active = d.id === selected;
              const urgent = dIdx?.risk === "Severe" || dIdx?.risk === "Extreme";
              const hex = dIdx ? RISK_HEX[dIdx.risk] : "#9ca3af";
              return (
                <button
                  key={d.id}
                  onClick={() => setSelected(d.id)}
                  style={{ left: pos.left, top: pos.top }}
                  className="absolute -translate-x-1/2 -translate-y-full pb-1"
                  aria-label={`${d.name}, ${d.state} — ${dIdx ? t(RISK_KEY[dIdx.risk]) : "loading"}`}
                >
                  <span className="relative flex flex-col items-center">
                    {urgent && (
                      <span
                        className="absolute top-3.5 h-3.5 w-3.5 animate-ping rounded-full opacity-60"
                        style={{ backgroundColor: hex }}
                      />
                    )}
                    <MapPin
                      size={active ? 30 : 24}
                      style={{ color: hex }}
                      fill={hex}
                      className={`drop-shadow-sm transition-transform ${active ? "scale-110" : ""}`}
                    />
                    <span
                      className={`mt-0.5 rounded-full bg-white/90 px-1.5 py-0.5 text-[10px] font-medium shadow-sm ${
                        active ? "text-brand-900" : "text-brand-900/60"
                      }`}
                    >
                      {d.name}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-brand-900/40">
            <span>{t("map_caption")}</span>
            <div className="flex flex-wrap gap-3">
              {LEGEND.map((r) => (
                <span key={r} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: RISK_HEX[r] }} />
                  {t(RISK_KEY[r])}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className={`rounded-2xl border border-black/5 p-5 shadow-sm ${colors.bg}`}>
          <p className="text-xs font-medium uppercase tracking-wide text-brand-900/50">{t("map_selected_station")}</p>
          <p className="mt-1 text-xl font-bold text-brand-900">{district.name}</p>
          <p className="text-sm text-brand-900/60">{district.state} · {tf("map_residents", { population: district.population })}</p>

          <p className={`mt-4 text-2xl font-bold ${colors.text}`}>{idx ? t(RISK_KEY[idx.risk]) : "…"}</p>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
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

          <div className="mt-4 border-t border-black/10 pt-3">
            <p className="text-xs font-medium uppercase tracking-wide text-brand-900/50">{t("map_primary_crops")}</p>
            <p className="mt-1 text-sm text-brand-900/70">{district.primaryCrops.join(", ")}</p>
          </div>
          <div className="mt-3">
            <p className="text-xs font-medium uppercase tracking-wide text-brand-900/50">{t("map_coordinates")}</p>
            <p className="mt-1 font-mono text-sm text-brand-900/70">{district.lat.toFixed(2)}, {district.lon.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
