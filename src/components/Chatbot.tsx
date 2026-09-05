import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X, Sparkles } from "lucide-react";
import { getBotResponse, suggestedPrompts, type ChatMessage } from "../lib/chatbotEngine";
import { useLanguage } from "../lib/i18n";

let idCounter = 0;
function nextId() {
  idCounter += 1;
  return `msg-${idCounter}`;
}

export default function Chatbot() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: nextId(),
      role: "bot",
      text: t("bot_greeting"),
    },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const userMsg: ChatMessage = { id: nextId(), role: "user", text: trimmed };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTimeout(async () => {
      const reply = await getBotResponse(trimmed);
      setMessages((m) => [...m, { id: nextId(), role: "bot", text: reply }]);
    }, 400);
  }

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg shadow-brand-900/20 transition-transform hover:scale-105"
        aria-label="Open chatbot"
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-50 flex h-[28rem] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl">
          <div className="flex items-center gap-2 bg-brand-600 px-4 py-3 text-white">
            <Sparkles size={18} />
            <div>
              <p className="text-sm font-semibold leading-tight">{t("bot_title")}</p>
              <p className="text-[11px] text-brand-100">{t("bot_subtitle")}</p>
            </div>
          </div>

          <div ref={scrollRef} className="scrollbar-thin flex-1 space-y-3 overflow-y-auto bg-earth-50 px-3 py-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3 py-2 text-sm ${
                  m.role === "bot"
                    ? "mr-auto rounded-tl-sm bg-white text-brand-900 shadow-sm"
                    : "ml-auto rounded-tr-sm bg-brand-600 text-white"
                }`}
              >
                {m.text}
              </div>
            ))}

            {messages.length <= 1 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {suggestedPrompts().map((p) => (
                  <button
                    key={p}
                    onClick={() => send(p)}
                    className="rounded-full border border-brand-200 bg-white px-2.5 py-1 text-[11px] text-brand-700 hover:bg-brand-50"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t border-black/5 bg-white p-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("bot_placeholder")}
              className="flex-1 rounded-full border border-black/10 bg-earth-50 px-3 py-2 text-sm outline-none focus:border-brand-400"
            />
            <button
              type="submit"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white disabled:opacity-40"
              disabled={!input.trim()}
              aria-label="Send"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
