import { useState } from "react";
import { LogIn, UserPlus } from "lucide-react";
import { useAuth } from "../lib/auth";
import { ApiError } from "../lib/api";
import { useLanguage } from "../lib/i18n";

export default function LoginForm({ title, subtitle }: { title: string; subtitle: string }) {
  const { t } = useLanguage();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "login") await login(phone, password);
      else await register(name, phone, password);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("auth_generic_error"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-brand-900">{title}</h2>
      <p className="mt-1 text-sm text-brand-900/60">{subtitle}</p>

      <div className="mt-4 flex rounded-full bg-earth-100 p-1 text-sm font-medium">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`flex-1 rounded-full py-1.5 transition-colors ${mode === "login" ? "bg-white text-brand-900 shadow-sm" : "text-brand-900/50"}`}
        >
          {t("auth_login_tab")}
        </button>
        <button
          type="button"
          onClick={() => setMode("register")}
          className={`flex-1 rounded-full py-1.5 transition-colors ${mode === "register" ? "bg-white text-brand-900 shadow-sm" : "text-brand-900/50"}`}
        >
          {t("auth_register_tab")}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        {mode === "register" && (
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("auth_full_name_ph")}
            className="input"
          />
        )}
        <input
          required
          type="tel"
          pattern="[0-9]{10}"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={t("auth_phone_ph")}
          className="input"
        />
        <input
          required
          type="password"
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t("auth_password_ph")}
          className="input"
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {mode === "login" ? <LogIn size={16} /> : <UserPlus size={16} />}
          {busy ? t("auth_please_wait") : mode === "login" ? t("auth_login_tab") : t("auth_register_tab")}
        </button>
      </form>
    </div>
  );
}
