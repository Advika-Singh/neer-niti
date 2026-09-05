import { Link } from "react-router-dom";
import { ArrowRight, CloudRain, HandCoins, Newspaper, MessageCircle, Satellite, Sprout } from "lucide-react";
import { DISTRICTS } from "../lib/districts";
import { RISK_COLORS } from "../lib/sensorEngine";
import { useAllDistrictsRisk } from "../lib/useDistrictRisk";
import { RISK_KEY, useLanguage } from "../lib/i18n";
import SpeakButton from "../components/SpeakButton";

const FEATURES = [
  { icon: CloudRain, titleKey: "feat_dashboard_title", descKey: "feat_dashboard_desc", to: "/dashboard" },
  { icon: HandCoins, titleKey: "feat_loan_title", descKey: "feat_loan_desc", to: "/loans" },
  { icon: Newspaper, titleKey: "feat_news_title", descKey: "feat_news_desc", to: "/news" },
  { icon: MessageCircle, titleKey: "feat_chatbot_title", descKey: "feat_chatbot_desc", to: "/dashboard" },
] as const;

const STATS = [
  { value: "68%", labelKey: "stat_land_label" },
  { value: "25", labelKey: "stat_droughts_label" },
  { value: "4.19 cr", labelKey: "stat_pmfby_label" },
  { value: "~29%", labelKey: "stat_payout_label" },
] as const;

export default function Home() {
  const { t } = useLanguage();
  const { risk } = useAllDistrictsRisk();
  const riskiest = DISTRICTS.map((d) => ({ d, idx: risk[d.id] }))
    .filter((row): row is { d: (typeof DISTRICTS)[number]; idx: NonNullable<typeof row.idx> } => Boolean(row.idx))
    .sort((a, b) => a.idx.spei - b.idx.spei)
    .slice(0, 3);

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 to-earth-50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-700">
              <Satellite size={13} /> {t("hero_badge")}
            </span>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-brand-900 sm:text-5xl">
              {t("hero_title_1")}<br className="hidden sm:block" /> {t("hero_title_2")}
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-brand-900/70">{t("hero_tagline")}</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-900/10 hover:bg-brand-700"
              >
                {t("hero_cta_dashboard")} <ArrowRight size={16} />
              </Link>
              <Link
                to="/loans"
                className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-5 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-50"
              >
                <Sprout size={16} /> {t("hero_cta_loan")}
              </Link>
              <SpeakButton text={`${t("hero_title_1")} ${t("hero_title_2")} ${t("hero_tagline")}`} />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.labelKey} className="rounded-2xl border border-black/5 bg-white p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-brand-700">{s.value}</p>
              <p className="mt-1 text-xs text-brand-900/60">{t(s.labelKey)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h2 className="text-center text-2xl font-semibold text-brand-900">{t("home_features_heading")}</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <Link
              key={f.titleKey}
              to={f.to}
              className="group rounded-2xl border border-black/5 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                <f.icon size={20} />
              </span>
              <h3 className="mt-4 font-semibold text-brand-900">{t(f.titleKey)}</h3>
              <p className="mt-1.5 text-sm text-brand-900/65">{t(f.descKey)}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand-600 group-hover:gap-2">
                {t("home_explore")} <ArrowRight size={14} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-brand-900">{t("home_watch_heading")}</h2>
          <Link to="/dashboard" className="text-sm font-medium text-brand-600 hover:underline">
            {t("home_full_dashboard")} →
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {riskiest.map(({ d, idx }) => {
            const c = RISK_COLORS[idx.risk];
            return (
              <Link
                key={d.id}
                to="/dashboard"
                className={`rounded-2xl border border-black/5 p-5 shadow-sm ${c.bg}`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-brand-900">{d.name}</h3>
                  <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${c.text}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} /> {t(RISK_KEY[idx.risk])}
                  </span>
                </div>
                <p className="text-xs text-brand-900/50">{d.state}</p>
                <p className="mt-3 text-sm text-brand-900/70">SPEI: {idx.spei} · SPI: {idx.spi}</p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
