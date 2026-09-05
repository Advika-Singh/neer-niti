import { useEffect, useState } from "react";
import { AlertTriangle, Newspaper, TrendingUp, FlaskConical, FileText } from "lucide-react";
import { DISTRICTS } from "../lib/districts";
import { useAllDistrictsRisk } from "../lib/useDistrictRisk";
import { apiGetNews } from "../lib/api";
import type { NewsArticle } from "../lib/types";
import { useLanguage, type TKey } from "../lib/i18n";

const CATEGORY_META: Record<NewsArticle["category"], { icon: typeof Newspaper; color: string; key: TKey }> = {
  Alert: { icon: AlertTriangle, color: "bg-drought-50 text-drought-700", key: "cat_alert" },
  Scheme: { icon: FileText, color: "bg-brand-50 text-brand-700", key: "cat_scheme" },
  Advisory: { icon: Newspaper, color: "bg-sky-50 text-sky-700", key: "cat_advisory" },
  Market: { icon: TrendingUp, color: "bg-amber-50 text-amber-700", key: "cat_market" },
  Research: { icon: FlaskConical, color: "bg-purple-50 text-purple-700", key: "cat_research" },
};

const FILTERS: Array<NewsArticle["category"] | "All"> = ["All", "Alert", "Scheme", "Advisory", "Market", "Research"];

export default function News() {
  const { t } = useLanguage();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const { risk } = useAllDistrictsRisk();
  const [staticNews, setStaticNews] = useState<NewsArticle[]>([]);

  useEffect(() => {
    apiGetNews().then(setStaticNews);
  }, []);

  const liveAlerts: NewsArticle[] = DISTRICTS.map((d) => ({ d, idx: risk[d.id] }))
    .filter((row): row is { d: (typeof DISTRICTS)[number]; idx: NonNullable<typeof row.idx> } =>
      Boolean(row.idx) && (row.idx!.risk === "Severe" || row.idx!.risk === "Extreme")
    )
    .map(({ d, idx }) => ({
      id: `alert-${d.id}`,
      category: "Alert" as const,
      title: `${d.name} district: ${idx.risk} drought risk detected`,
      summary: `Live Open-Meteo/ERA5 fusion flags ${idx.risk.toLowerCase()} meteorological drought conditions in ${d.name}, ${d.state}. SPEI at ${idx.spei}. ${idx.drivers[0]}.`,
      date: new Date().toISOString().slice(0, 10),
      districtId: d.id,
    }));

  const allArticles = [...liveAlerts, ...staticNews].sort((a, b) => (a.date < b.date ? 1 : -1));
  const filtered = filter === "All" ? allArticles : allArticles.filter((a) => a.category === filter);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold text-brand-900">{t("news_title")}</h1>
      <p className="text-sm text-brand-900/60">{t("news_subtitle")}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
              filter === f
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-black/10 bg-white text-brand-900/70 hover:border-brand-300"
            }`}
          >
            {f === "All" ? t("filter_all") : t(CATEGORY_META[f].key)}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {filtered.length === 0 && (
          <p className="rounded-xl border border-dashed border-black/10 p-8 text-center text-sm text-brand-900/50">
            {t("news_empty")}
          </p>
        )}
        {filtered.map((article) => {
          const meta = CATEGORY_META[article.category];
          const Icon = meta.icon;
          return (
            <article key={article.id} className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${meta.color}`}>
                  <Icon size={13} /> {t(meta.key)}
                </span>
                <span className="text-xs text-brand-900/40">{article.date}</span>
              </div>
              <h2 className="mt-3 font-semibold text-brand-900">{article.title}</h2>
              <p className="mt-1.5 text-sm text-brand-900/65">{article.summary}</p>
            </article>
          );
        })}
      </div>
    </div>
  );
}
