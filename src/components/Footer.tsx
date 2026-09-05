import { useLanguage } from "../lib/i18n";

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="border-t border-black/5 bg-earth-100/60">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-brand-900/60 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p>{t("footer_tagline")}</p>
          <p>{t("footer_helpline")}</p>
        </div>
      </div>
    </footer>
  );
}
