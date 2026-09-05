import { MessageSquareText, Smartphone } from "lucide-react";
import type { District, DroughtIndex } from "../lib/types";
import { RISK_KEY, useLanguage } from "../lib/i18n";
import SpeakButton from "./SpeakButton";

export default function SmsPreview({ district, idx }: { district: District; idx: DroughtIndex }) {
  const { t, tf } = useLanguage();

  const text =
    idx.risk === "Normal"
      ? tf("sms_normal", { district: district.name, spei: idx.spei })
      : tf("sms_alert", { district: district.name, risk: t(RISK_KEY[idx.risk]), spei: idx.spei });

  return (
    <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-brand-900/50">
        <Smartphone size={14} /> {t("sms_label")}
      </div>
      <p className="mt-1.5 text-xs leading-relaxed text-brand-900/45">{t("sms_note")}</p>
      <div className="mt-4 flex justify-start">
        <div className="max-w-[92%] rounded-2xl rounded-bl-sm bg-earth-100 px-4 py-3 font-mono text-xs leading-relaxed text-brand-900">
          {text}
        </div>
      </div>
      <div className="mt-2.5 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-[10px] text-brand-900/35">
          <MessageSquareText size={11} /> {t("sms_sender")}
        </span>
        <SpeakButton text={text} />
      </div>
    </div>
  );
}
