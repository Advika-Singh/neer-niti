import {
  ArrowRight,
  ArrowDown,
  Radio,
  Satellite,
  Cpu,
  Activity,
  Bell,
  HandCoins,
  MessageCircle,
  BrainCircuit,
  Wifi,
  Leaf,
  Landmark,
  ShieldAlert,
} from "lucide-react";
import { DISTRICTS } from "../lib/districts";
import { useLanguage } from "../lib/i18n";

const STATS = [
  { value: "68%", labelKey: "stat_land_label" },
  { value: "25", labelKey: "stat_droughts_label" },
  { value: "4.19 cr", labelKey: "stat_pmfby_label" },
  { value: "~29%", labelKey: "stat_payout_label" },
] as const;

const PILOT_RAINFALL: Record<string, number> = {
  latur: 850,
  beed: 720,
  barmer: 280,
  anantapur: 560,
  yavatmal: 910,
  kalahandi: 1350,
};

const DOMAIN_TAGS = [
  { tag: "Parametric Insurance", desc: "The backend fires an automatic index-based payout-eligibility event the moment a district's live SPEI crosses -1.0 — no claims adjuster, no proof-of-loss required." },
  { tag: "Applied Climate Data", desc: "SPI/SPEI/RDI are computed server-side from real Open-Meteo/ERA5 rainfall, temperature, humidity and soil-moisture data against each district's 5-year climatological normal — not a simulation." },
  { tag: "IoT (proposed pilot)", desc: "ESP32-based field mesh — tipping-bucket rain gauge, DHT22/BME280 temp-humidity, soil moisture, battery telemetry — to densify the live feed once deployed." },
];

const SDG_TAGS = [
  { tag: "SDG 1 · No Poverty", desc: "Earlier signal reduces distress borrowing ahead of a bad season, not after it." },
  { tag: "SDG 2 · Zero Hunger", desc: "Advance warning protects sowing and irrigation decisions before yield loss locks in." },
  { tag: "SDG 13 · Climate Action", desc: "Direct adaptive-capacity building against the primary climate risk facing rain-fed agriculture." },
];

const GOV_TAGS = [
  { tag: "PMFBY", desc: "Sits upstream as a risk-scoring layer feeding the existing claims workflow, not a replacement for it." },
  { tag: "NDMA drought manual", desc: "SPI/SPEI/RDI are the same indices NDMA's own drought management framework specifies." },
  { tag: "Open reanalysis data", desc: "Baseline rainfall, temperature, humidity and soil-moisture calibration draws on free, public Open-Meteo/ERA5 data — the same class of source IMD and NASA POWER publish from." },
];

const FACTS = [
  { k: "Payout engine", v: "Every district is scanned continuously against its live SPEI. Crossing the severe-drought threshold fires an on-record, timestamped payout-eligibility event and fast-tracks every pending loan in that district automatically." },
  { k: "Data", v: "Rainfall, temperature, humidity and soil moisture are pulled from free, already-public Open-Meteo/ERA5 reanalysis data per district — no proprietary weather-station contract, and forecast quality doesn't collapse where sensor density is still sparse." },
  { k: "Business model", v: "Free for farmers; insurers and government departments are issued a metered X-API-Key for the same live per-district risk feed (/api/v1/risk) — the SaaS side of the platform." },
  { k: "Integration", v: "Designed to sit in front of PMFBY's existing claims and loan workflow as a risk-scoring layer — not a parallel system farmers have to learn instead." },
  { k: "Rollout", v: "Validation cohort of 6 districts across 4 states, deliberately spanning arid to sub-humid rainfall regimes before any wider expansion is proposed." },
];

function FlowStep({ icon: Icon, title, sub }: { icon: typeof Radio; title: string; sub: string }) {
  return (
    <div className="flex min-w-[150px] flex-1 flex-col items-center rounded-2xl border border-black/5 bg-white p-4 text-center shadow-sm">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
        <Icon size={18} />
      </span>
      <p className="mt-2.5 text-sm font-semibold text-brand-900">{title}</p>
      <p className="mt-1 text-xs leading-snug text-brand-900/55">{sub}</p>
    </div>
  );
}

export default function Concept() {
  const { t } = useLanguage();
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-drought-50 px-3 py-1 text-xs font-medium text-drought-700">
        <ShieldAlert size={13} /> {t("concept_kicker")}
      </span>
      <h1 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-brand-900 sm:text-4xl">
        {t("concept_h1")}
      </h1>
      <p className="mt-3 max-w-2xl text-brand-900/70">{t("concept_tagline")}</p>

      {/* Problem */}
      <section className="mt-12">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-600">{t("concept_eyebrow_1")}</h2>
        <h3 className="mt-1.5 text-xl font-semibold text-brand-900">{t("concept_h_problem")}</h3>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.labelKey} className="rounded-2xl border border-black/5 bg-white p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-brand-700">{s.value}</p>
              <p className="mt-1 text-xs text-brand-900/60">{t(s.labelKey)}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 max-w-3xl text-sm leading-relaxed text-brand-900/75">
          India's flagship crop insurance scheme is <strong className="text-brand-900">claims-based</strong>: a
          farmer's loss is assessed after the harvest has already failed, and fewer than a third of enrolled
          applications convert into a payout. Meteorological drought — the rainfall and soil-moisture deficit that
          eventually becomes crop failure — is visible weeks to months earlier, but almost nowhere is it measured
          at the resolution a single field needs: the block level, in near real time. That gap between signal and
          response is the problem Neer-Niti closes.
        </p>
      </section>

      {/* Solution */}
      <section className="mt-14">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-600">{t("concept_eyebrow_2")}</h2>
        <h3 className="mt-1.5 text-xl font-semibold text-brand-900">{t("concept_h_solution")}</h3>

        <div className="mt-6 flex flex-col items-center gap-2">
          <div className="flex w-full flex-col items-stretch gap-2 sm:flex-row sm:items-center">
            <FlowStep icon={Radio} title="ESP32 Field Sensors" sub="Proposed pilot — rain, soil moisture, temp/humidity" />
            <ArrowRight className="mx-auto hidden shrink-0 text-brand-900/30 sm:block" size={18} />
            <ArrowDown className="mx-auto shrink-0 text-brand-900/30 sm:hidden" size={18} />
            <FlowStep icon={Satellite} title="Open-Meteo / ERA5" sub="Live per-district weather, running today" />
          </div>
          <ArrowDown className="my-1 shrink-0 text-brand-900/30" size={18} />
          <div className="w-full sm:w-2/3">
            <FlowStep icon={Cpu} title="Fusion & Forecast Engine" sub="t+1 / t+3 month projection (backend, live)" />
          </div>
          <ArrowDown className="my-1 shrink-0 text-brand-900/30" size={18} />
          <div className="w-full rounded-2xl border border-brand-200 bg-brand-50 p-4 text-center shadow-sm sm:w-2/3">
            <span className="flex items-center justify-center gap-2 text-sm font-semibold text-brand-800">
              <Activity size={16} /> SPI · SPEI · RDI — district-level risk tier
            </span>
          </div>
          <ArrowDown className="my-1 shrink-0 text-brand-900/30" size={18} />
          <p className="text-[11px] font-medium text-drought-600">parametric payout auto-fires when SPEI crosses -1.0 (Severe / Extreme)</p>
          <div className="mt-1 flex w-full flex-col gap-2 sm:flex-row">
            <FlowStep icon={Bell} title="Dashboard alerts" sub="Live district risk view" />
            <FlowStep icon={HandCoins} title="Index-based payout" sub="Auto-fired, no claims process needed" />
            <FlowStep icon={MessageCircle} title="SukhaRakshak chatbot" sub="Plain-language farmer Q&A" />
          </div>
        </div>
      </section>

      {/* Domain alignment */}
      <section className="mt-14">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-600">{t("concept_eyebrow_3")}</h2>
        <h3 className="mt-1.5 text-xl font-semibold text-brand-900">{t("concept_h_alignment")}</h3>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <AlignCard icon={BrainCircuit} label={t("concept_align_domain")} items={DOMAIN_TAGS} />
          <AlignCard icon={Leaf} label={t("concept_align_sdg")} items={SDG_TAGS} />
          <AlignCard icon={Landmark} label={t("concept_align_gov")} items={GOV_TAGS} />
        </div>
      </section>

      {/* Conceptual viability */}
      <section className="mt-14">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-600">{t("concept_eyebrow_4")}</h2>
        <h3 className="mt-1.5 text-xl font-semibold text-brand-900">{t("concept_h_viability")}</h3>

        <dl className="mt-5 divide-y divide-black/5 rounded-2xl border border-black/5 bg-white shadow-sm">
          {FACTS.map((f) => (
            <div key={f.k} className="grid gap-1 p-4 sm:grid-cols-[150px_1fr] sm:gap-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-brand-600">{f.k}</dt>
              <dd className="text-sm leading-relaxed text-brand-900/75">{f.v}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5 overflow-x-auto rounded-2xl border border-black/5 bg-white shadow-sm">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-black/5 bg-earth-100/60 text-left text-xs uppercase tracking-wide text-brand-900/50">
                <th className="px-4 py-3 font-medium">Pilot district</th>
                <th className="px-4 py-3 font-medium">Primary crops</th>
                <th className="px-4 py-3 font-medium">Normal annual rainfall</th>
              </tr>
            </thead>
            <tbody>
              {DISTRICTS.map((d) => (
                <tr key={d.id} className="border-b border-black/5 last:border-0">
                  <td className="px-4 py-3">
                    <span className="font-semibold text-brand-900">{d.name}</span>
                    <span className="block text-xs text-brand-900/50">{d.state}</span>
                  </td>
                  <td className="px-4 py-3 text-brand-900/75">{d.primaryCrops.join(", ")}</td>
                  <td className="px-4 py-3 font-medium text-brand-900">{PILOT_RAINFALL[d.id].toLocaleString("en-IN")} mm</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-5 rounded-2xl border border-drought-100 bg-drought-50 p-4 text-sm leading-relaxed text-drought-700">
          <strong>{t("concept_why_six_label")}</strong> Latur, Beed, and Yavatmal sit in Maharashtra's Marathwada belt — one of
          India's most persistent agrarian-distress regions. Validating there first means the earliest warning
          goes to the districts where it carries the most human stakes, before the model is generalized to the
          drier (Barmer) and wetter (Kalahandi) ends of the rainfall spectrum.
        </div>

        <p className="mt-5 max-w-3xl text-sm leading-relaxed text-brand-900/75">
          <strong className="text-brand-900">Socio-economic impact:</strong> shifting from a system where roughly
          7 in 10 PMFBY applications historically saw no payout, to one where a district's risk is visible 1–6
          months before the harvest is lost, changes the decision point from "prove the loss happened" to "act
          before it does."
        </p>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-brand-900/75">
          <strong className="text-brand-900">Environmental impact:</strong> soil-moisture-aware alerts support
          precision irrigation scheduling and reduce distress groundwater extraction during deficit years, and
          give farmers a window to shift toward drought-tolerant varieties before sowing rather than after failure.
        </p>
      </section>

      {/* Footer */}
      <section className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-black/5 pt-6 sm:flex-row sm:items-center">
        <p className="max-w-md text-sm font-semibold text-brand-900">{t("concept_footer_thesis")}</p>
        <div className="flex flex-wrap gap-2">
          {["React + Node/Express", "ESP32 / DHT22 / BME280 (pilot)", "SPI · SPEI · RDI", "Open-Meteo / ERA5 (live)"].map((c) => (
            <span key={c} className="flex items-center gap-1 rounded-full bg-earth-100 px-2.5 py-1 text-[11px] font-medium text-brand-900/60">
              <Wifi size={11} /> {c}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}

function AlignCard({
  icon: Icon,
  label,
  items,
}: {
  icon: typeof BrainCircuit;
  label: string;
  items: { tag: string; desc: string }[];
}) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
      <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-600">
        <Icon size={14} /> {label}
      </h4>
      <div className="mt-4 space-y-3.5">
        {items.map((it) => (
          <div key={it.tag}>
            <span className="inline-block rounded-md bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-800">
              {it.tag}
            </span>
            <p className="mt-1.5 text-xs leading-relaxed text-brand-900/60">{it.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
