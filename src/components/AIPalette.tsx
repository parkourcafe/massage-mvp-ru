"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// ⌘K AI match palette. Ported from the design's ai-features.jsx, wired
// to the real /api/match endpoint (the design's window.claude shim does
// not exist in production). Mounted once globally; opens on ⌘/Ctrl-K or
// via the floating launcher.

interface MatchResult {
  profileId: string;
  slug: string;
  name: string;
  city?: string | null;
  district?: string | null;
  price?: number | null;
  score: number;
  why?: string | null;
  serviceRecommendation?: string | null;
}

const QUICK_PROMPTS = [
  "Болит шея от ноутбука",
  "Готовлюсь к марафону",
  "После операции — лимфодренаж",
  "Беременность, второй триместр",
  "Хронический стресс, плохой сон",
];

function StreamingText({ text, speed = 12 }: { text: string; speed?: number }) {
  const [shown, setShown] = useState("");
  useEffect(() => {
    setShown("");
    if (!text) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setShown(text);
      return;
    }
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return <span>{shown}</span>;
}

export function AIPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [thinking, setThinking] = useState(false);
  const [intro, setIntro] = useState("");
  const [results, setResults] = useState<MatchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const pathname = usePathname();
  // The /app screen has its own bottom bar and dashboard/admin are
  // utility surfaces — keep ⌘K everywhere but hide the floating pill there.
  const hideLauncher =
    pathname?.startsWith("/app") ||
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/admin");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const cmd = e.metaKey || e.ctrlKey;
      if (cmd && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 80);
  }, [open]);

  const submit = useCallback(async (text: string) => {
    const query = text.trim();
    if (!query) return;
    setThinking(true);
    setError(null);
    setIntro("");
    setResults([]);
    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ massage_goal: query }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(
          data.error ??
            "Не получилось подобрать. Попробуйте переформулировать запрос."
        );
        return;
      }
      const r = (data.results ?? []) as MatchResult[];
      setResults(r);
      setIntro(
        r.length
          ? `Понял запрос. Подобрал ${r.length === 1 ? "мастера" : `${r.length} мастеров`}, которые лучше всего подходят под «${query}».`
          : `По запросу «${query}» пока нет точных совпадений. Откройте полный каталог или уточните задачу.`
      );
    } catch {
      setError("Сеть недоступна — попробуйте ещё раз.");
    } finally {
      setThinking(false);
    }
  }, []);

  const reset = () => {
    setQ("");
    setIntro("");
    setResults([]);
    setError(null);
  };

  return (
    <>
      {/* Floating launcher (keyboard-free entry point) */}
      {!hideLauncher && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Спросить AI-подбор"
          className="fixed bottom-5 right-5 z-[90] inline-flex items-center gap-2 rounded-full border border-line-strong bg-card/90 px-4 py-3 text-sm text-heading shadow-lift backdrop-blur-md transition-transform hover:-translate-y-0.5"
        >
          <span aria-hidden className="hot">
            ✦
          </span>
          Спросить AI
          <kbd className="ml-1 hidden rounded bg-surface px-1.5 py-0.5 text-[10px] text-secondary sm:inline">
            ⌘K
          </kbd>
        </button>
      )}

      {!open ? null : (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[200] flex items-start justify-center px-4 pt-[12vh]"
          style={{
            background: "rgba(8,4,10,0.7)",
            backdropFilter: "blur(20px) saturate(140%)",
            WebkitBackdropFilter: "blur(20px) saturate(140%)",
            animation: "aip-fade 0.2s ease",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="AI-подбор мастера"
            className="w-full max-w-[720px] overflow-hidden rounded-xl2 border border-line"
            style={{
              background:
                "linear-gradient(180deg, rgba(28,14,28,0.95), rgba(20,16,26,0.95))",
              boxShadow:
                "0 60px 120px -20px rgba(0,0,0,0.7), 0 0 0 1px var(--accent), 0 30px 100px -10px rgba(236,72,137,0.35)",
              animation: "aip-rise 0.3s cubic-bezier(0.2,0.8,0.2,1)",
            }}
          >
            <div className="flex items-center gap-3 px-6 pt-5">
              <span className="chip">
                <span aria-hidden>✦</span> Massaje AI
              </span>
              <span className="ml-auto text-[11px] text-secondary">
                ⌘K · ESC чтобы закрыть
              </span>
            </div>

            <div className="px-6 py-4">
              <textarea
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submit(q);
                  }
                }}
                rows={2}
                placeholder="Что беспокоит, какая задача, к какому времени…"
                className="w-full resize-none border-0 bg-transparent p-0 font-serif text-[22px] leading-snug text-heading outline-none placeholder:text-secondary"
              />
            </div>

            {!intro && !thinking && !error && (
              <>
                <div className="flex flex-wrap gap-2 px-6 pb-4">
                  {QUICK_PROMPTS.map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        setQ(p);
                        submit(p);
                      }}
                      className="rounded-full border border-line px-3 py-2 text-xs text-body transition-colors hover:border-accent hover:text-accent"
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-between border-t border-line px-6 py-4 text-[11px] text-secondary">
                  <span>↵ Спросить — опишите задачу, подберу мастеров</span>
                  <button
                    onClick={() => submit(q)}
                    className="btn-primary btn-sm"
                  >
                    Подобрать →
                  </button>
                </div>
              </>
            )}

            {thinking && (
              <div className="flex items-center gap-3 border-t border-line px-6 py-6">
                <span className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-2 w-2 rounded-full bg-accent"
                      style={{
                        animation: `aip-pulse 1.4s ease ${i * 0.2}s infinite`,
                      }}
                    />
                  ))}
                </span>
                <span className="font-serif text-[15px] italic text-body">
                  Подбираю мастеров под ваш запрос…
                </span>
              </div>
            )}

            {error && (
              <div className="border-t border-line px-6 py-5 text-sm text-secondary">
                {error}{" "}
                <Link
                  href="/match"
                  onClick={() => setOpen(false)}
                  className="text-accent underline-offset-4 hover:underline"
                >
                  Открыть полный подбор
                </Link>
              </div>
            )}

            {intro && (
              <div className="max-h-[52vh] overflow-auto border-t border-line px-6 pb-6 pt-5">
                <div className="eyebrow mb-3 !text-accent">✦ Ответ AI</div>
                <p className="mb-5 whitespace-pre-wrap font-serif text-[17px] leading-relaxed text-heading">
                  <StreamingText text={intro} />
                </p>

                <div className="flex flex-col gap-2">
                  {results.map((m) => (
                    <Link
                      key={m.profileId}
                      href={`/therapist/${m.slug}`}
                      onClick={() => setOpen(false)}
                      className="card-interactive flex items-start gap-3 !p-4"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="font-serif text-base text-heading">
                            {m.name}
                          </span>
                          <span className="chip-brand shrink-0">
                            {m.score}%
                          </span>
                        </div>
                        <div className="mt-0.5 text-xs text-secondary">
                          {[m.city, m.district].filter(Boolean).join(", ")}
                          {m.price ? ` · от ${m.price.toLocaleString("ru-RU")} ₽` : ""}
                        </div>
                        {(m.why || m.serviceRecommendation) && (
                          <p className="mt-1.5 line-clamp-3 text-sm text-body">
                            {m.why || m.serviceRecommendation}
                          </p>
                        )}
                      </div>
                      <span aria-hidden className="hot mt-1">
                        →
                      </span>
                    </Link>
                  ))}
                </div>

                <div className="mt-5 flex gap-2">
                  <button onClick={reset} className="btn-secondary btn-sm">
                    Спросить ещё
                  </button>
                  <Link
                    href="/match"
                    onClick={() => setOpen(false)}
                    className="btn-secondary btn-sm"
                  >
                    Полный подбор
                  </Link>
                  <Link
                    href="/therapists"
                    onClick={() => setOpen(false)}
                    className="btn-secondary btn-sm"
                  >
                    Весь каталог
                  </Link>
                </div>
              </div>
            )}
          </div>

          <style>{`
            @keyframes aip-fade { from { opacity: 0 } to { opacity: 1 } }
            @keyframes aip-rise { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }
            @keyframes aip-pulse { 0%,80%,100% { transform: scale(0.6); opacity: 0.5 } 40% { transform: scale(1); opacity: 1 } }
          `}</style>
        </div>
      )}
    </>
  );
}
