import { useEffect, useRef, useState } from "react";
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
import { Battery, Droplets, Gauge, MapPin, Search, Thermometer, Wind, X, Zap } from "lucide-react";
import { DISTRICTS } from "../lib/districts";
import { RISK_COLORS } from "../lib/sensorEngine";
import { useAllDistrictsRisk, useMonthlyRainfall } from "../lib/useDistrictRisk";
import { useLiveSensors } from "../lib/useLiveSensors";
import { apiGeocode, apiGetLocationRainfall, apiGetLocationRisk, apiPayoutsForDistrict } from "../lib/api";
import type { District, DroughtIndex, GeocodeResult, LocationLatestReading, MonthlyRainfall, PayoutEvent } from "../lib/types";
import SmsPreview from "../components/SmsPreview";
import { RISK_KEY, useLanguage } from "../lib/i18n";

function locationLabel(r: GeocodeResult): string {
  return [r.name, r.admin1, r.country].filter(Boolean).join(", ");
}

export default function Dashboard() {
  const { t, tf } = useLanguage();
  const { readings } = useLiveSensors();
  const { risk } = useAllDistrictsRisk();

  const [selectedDistrictId, setSelectedDistrictId] = useState(DISTRICTS[0].id);
  const [customLocation, setCustomLocation] = useState<District | null>(null);
  const [payoutEvent, setPayoutEvent] = useState<PayoutEvent | null>(null);

  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GeocodeResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const [customIdx, setCustomIdx] = useState<DroughtIndex | null>(null);
  const [customLatest, setCustomLatest] = useState<LocationLatestReading | null>(null);
  const [customRainfall, setCustomRainfall] = useState<MonthlyRainfall[]>([]);
  const [customLoading, setCustomLoading] = useState(false);

  const isCustom = customLocation !== null;
  const searchBoxRef = useRef<HTMLDivElement>(null);

  const pilotDistrict = DISTRICTS.find((d) => d.id === selectedDistrictId)!;
  const district = isCustom ? customLocation! : pilotDistrict;
  const { rainfall: pilotRainfall } = useMonthlyRainfall(selectedDistrictId);

  const idx = isCustom ? customIdx ?? undefined : risk[selectedDistrictId];
  const rainfall = isCustom ? customRainfall : pilotRainfall;
  const colors = idx ? RISK_COLORS[idx.risk] : RISK_COLORS.Normal;

  // Debounced location search.
  useEffect(() => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    const id = setTimeout(() => {
      apiGeocode(query.trim())
        .then((results) => setSearchResults(results))
        .catch(() => setSearchResults([]))
        .finally(() => setSearching(false));
    }, 350);
    return () => clearTimeout(id);
  }, [query]);

  // Close the results dropdown on outside click.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) setShowResults(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function selectDistrict(id: string) {
    setCustomLocation(null);
    setSelectedDistrictId(id);
    setQuery("");
    setSearchResults([]);
  }

  function selectSearchResult(r: GeocodeResult) {
    setCustomLocation({
      id: "custom",
      name: r.name,
      state: [r.admin1, r.country].filter(Boolean).join(", "),
      lat: r.lat,
      lon: r.lon,
      population: "—",
      primaryCrops: [],
    });
    setQuery(locationLabel(r));
    setSearchResults([]);
    setShowResults(false);
  }

  useEffect(() => {
    if (!isCustom || !customLocation) return;
    let cancelled = false;
    setCustomLoading(true);
    Promise.all([
      apiGetLocationRisk(customLocation.lat, customLocation.lon),
      apiGetLocationRainfall(customLocation.lat, customLocation.lon),
    ])
      .then(([riskRes, rainfallRes]) => {
        if (cancelled) return;
        setCustomIdx(riskRes.risk);
        setCustomLatest(riskRes.latest);
        setCustomRainfall(rainfallRes);
      })
      .catch(() => {
        if (cancelled) return;
        setCustomIdx(null);
        setCustomLatest(null);
        setCustomRainfall([]);
      })
      .finally(() => {
        if (!cancelled) setCustomLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCustom, customLocation?.lat, customLocation?.lon]);

  useEffect(() => {
    if (isCustom) {
      setPayoutEvent(null);
      return;
    }
    let cancelled = false;
    apiPayoutsForDistrict(selectedDistrictId).then((events) => {
      if (!cancelled) setPayoutEvent(events[0] ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [isCustom, selectedDistrictId]);

  const reading = isCustom
    ? customLatest
      ? { rainfallMm: customLatest.rainfallMm, temperatureC: customLatest.temperatureC, humidityPct: customLatest.humidityPct, soilMoisturePct: customLatest.soilMoisturePct }
      : null
    : readings[selectedDistrictId];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-brand-900">{t("dash_title")}</h1>
          <p className="text-sm text-brand-900/60">{t("dash_subtitle")}</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-brand-900/50">
          <span className={`h-2 w-2 rounded-full ${isCustom ? "bg-amber-500" : "animate-pulse bg-brand-500"}`} />
          {isCustom ? t("dash_snapshot_label") : t("dash_live")}
        </div>
      </div>

      <div ref={searchBoxRef} className="relative mt-6">
        <div className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 shadow-sm">
          <Search size={16} className="shrink-0 text-brand-900/40" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            placeholder={t("location_search_placeholder")}
            className="w-full bg-transparent text-sm outline-none placeholder:text-brand-900/35"
          />
          {isCustom && (
            <button
              onClick={() => selectDistrict(DISTRICTS[0].id)}
              className="flex shrink-0 items-center gap-1 rounded-full bg-earth-100 px-2 py-1 text-xs text-brand-900/60 hover:bg-earth-100/80"
            >
              <X size={12} /> {t("common_clear")}
            </button>
          )}
        </div>

        {showResults && query.trim().length >= 2 && (
          <div className="absolute z-20 mt-1.5 w-full rounded-2xl border border-black/5 bg-white p-1.5 shadow-lg">
            {searching && <p className="px-3 py-2 text-xs text-brand-900/40">{t("common_loading")}</p>}
            {!searching && searchResults.length === 0 && (
              <p className="px-3 py-2 text-xs text-brand-900/40">{t("location_search_no_results")}</p>
            )}
            {!searching &&
              searchResults.map((r, i) => (
                <button
                  key={`${r.lat}-${r.lon}-${i}`}
                  onClick={() => selectSearchResult(r)}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-brand-900 hover:bg-earth-50"
                >
                  <MapPin size={14} className="shrink-0 text-brand-600" />
                  {locationLabel(r)}
                </button>
              ))}
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {DISTRICTS.map((d) => {
          const dIdx = risk[d.id];
          const c = dIdx ? RISK_COLORS[dIdx.risk] : RISK_COLORS.Normal;
          const active = !isCustom && d.id === selectedDistrictId;
          return (
            <button
              key={d.id}
              onClick={() => selectDistrict(d.id)}
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
        {isCustom && (
          <span className="flex items-center gap-2 rounded-full border border-brand-600 bg-brand-600 px-3.5 py-1.5 text-sm font-medium text-white">
            <MapPin size={13} /> {district.name}
          </span>
        )}
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
          <p className={`mt-1 text-3xl font-bold ${colors.text}`}>
            {customLoading ? "…" : idx ? t(RISK_KEY[idx.risk]) : "…"}
          </p>
          <p className="mt-1 text-sm text-brand-900/60">{district.name}{district.state ? `, ${district.state}` : ""}</p>
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
          <p className="text-xs font-medium uppercase tracking-wide text-brand-900/50">
            {isCustom ? t("dash_latest_observed") : t("dash_live_readings")}
          </p>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <ReadingTile icon={Droplets} label={t("reading_rainfall")} value={reading ? `${reading.rainfallMm} mm` : "…"} />
            <ReadingTile icon={Thermometer} label={t("reading_temp")} value={reading ? `${reading.temperatureC}°C` : "…"} />
            <ReadingTile icon={Wind} label={t("reading_humidity")} value={reading ? `${reading.humidityPct}%` : "…"} />
            <ReadingTile icon={Gauge} label={t("reading_soil")} value={reading ? `${reading.soilMoisturePct}%` : "…"} />
          </div>
          {!isCustom && (
            <div className="mt-3 flex items-center gap-1.5 text-xs text-brand-900/40">
              <Battery size={12} /> {t("dash_battery")} {readings[selectedDistrictId]?.batteryPct ?? "…"}%
            </div>
          )}
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

          {idx && !isCustom && <SmsPreview district={district} idx={idx} />}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-brand-900">{t("dash_station_metadata")}</p>
        <div className="mt-3 grid gap-3 text-sm text-brand-900/70 sm:grid-cols-3">
          {isCustom ? (
            <p className="sm:col-span-3 text-brand-900/50">{t("location_custom_note")}</p>
          ) : (
            <>
              <p><span className="text-brand-900/45">{t("dash_population")}</span> {district.population}</p>
              <p><span className="text-brand-900/45">{t("dash_crops")}</span> {district.primaryCrops.join(", ")}</p>
            </>
          )}
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
