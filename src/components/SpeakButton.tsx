import { Volume2 } from "lucide-react";
import { useLanguage } from "../lib/i18n";

const VOICE_LANG: Record<string, string> = { en: "en-IN", hi: "hi-IN", ta: "ta-IN" };

export default function SpeakButton({ text, className = "" }: { text: string; className?: string }) {
  const { lang, t } = useLanguage();

  function speak() {
    try {
      if (!("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = VOICE_LANG[lang] ?? "en-IN";
      window.speechSynthesis.speak(utterance);
    } catch {
      /* speech synthesis unavailable on this device — silently ignore */
    }
  }

  return (
    <button
      type="button"
      onClick={speak}
      className={`inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-white px-3 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-50 ${className}`}
    >
      <Volume2 size={13} /> {t("listen")}
    </button>
  );
}
