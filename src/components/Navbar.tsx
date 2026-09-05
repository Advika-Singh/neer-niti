import { NavLink } from "react-router-dom";
import { Droplets, Menu, X } from "lucide-react";
import { useState } from "react";
import { useLanguage, type Lang } from "../lib/i18n";

const LANG_OPTIONS: { code: Lang; short: string; full: string }[] = [
  { code: "en", short: "EN", full: "English" },
  { code: "hi", short: "हि", full: "हिंदी" },
  { code: "ta", short: "த", full: "தமிழ்" },
];

const LINKS = [
  { to: "/", key: "nav_home" },
  { to: "/dashboard", key: "nav_dashboard" },
  { to: "/map", key: "nav_map" },
  { to: "/loans", key: "nav_loans" },
  { to: "/admin", key: "nav_admin" },
  { to: "/news", key: "nav_news" },
  { to: "/concept", key: "nav_concept" },
] as const;

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { lang, setLang, t } = useLanguage();

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-earth-50/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <NavLink to="/" className="flex items-center gap-2 font-semibold text-brand-700">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
            <Droplets size={18} />
          </span>
          <span className="text-lg tracking-tight">Neer-Niti</span>
        </NavLink>

        <nav className="hidden items-center gap-0.5 lg:flex">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                `rounded-full px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-brand-600 text-white"
                    : "text-brand-900/70 hover:bg-brand-100 hover:text-brand-800"
                }`
              }
            >
              {t(link.key)}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5 rounded-full border border-black/10 bg-white p-0.5">
            {LANG_OPTIONS.map((opt) => (
              <button
                key={opt.code}
                onClick={() => setLang(opt.code)}
                title={opt.full}
                aria-label={`Switch to ${opt.full}`}
                aria-pressed={lang === opt.code}
                className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
                  lang === opt.code ? "bg-brand-600 text-white" : "text-brand-700 hover:bg-brand-50"
                }`}
              >
                {opt.short}
              </button>
            ))}
          </div>

          <button
            className="rounded-lg p-2 text-brand-800 lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-black/5 px-4 pb-3 lg:hidden">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium ${
                  isActive ? "bg-brand-600 text-white" : "text-brand-900/80 hover:bg-brand-100"
                }`
              }
            >
              {t(link.key)}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
