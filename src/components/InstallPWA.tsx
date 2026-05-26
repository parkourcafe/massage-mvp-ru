"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

// Install affordance for the mobile app view. On Chromium (Android /
// desktop) it surfaces the native install prompt; on iOS Safari, which
// has no programmatic prompt, it shows Add-to-Home-Screen instructions.
// Renders nothing when already installed or when installation is not
// available.
export function InstallPWA() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null
  );
  const [hidden, setHidden] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) {
      setHidden(true);
      return;
    }

    const ua = navigator.userAgent || "";
    const ios = /iphone|ipad|ipod/i.test(ua);
    const isSafari = /safari/i.test(ua) && !/crios|fxios|edgios/i.test(ua);
    if (ios && isSafari) setIsIOS(true);

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setHidden(true);
      setDeferred(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (hidden) return null;
  if (!deferred && !isIOS) return null;

  return (
    <div className="px-5 pb-1 pt-3">
      <div className="flex items-center gap-3 rounded-2xl border border-line bg-card px-4 py-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface text-accent">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            className="h-5 w-5"
          >
            <path d="M12 3v12" />
            <path d="M7 10l5 5 5-5" />
            <path d="M5 21h14" />
          </svg>
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-medium text-heading">
            Установить приложение
          </div>
          <div className="text-[11px] text-secondary">
            {isIOS
              ? "Откройте в Safari меню «Поделиться»"
              : "Быстрый доступ с телефона, как обычное приложение"}
          </div>
        </div>
        {deferred ? (
          <button
            type="button"
            onClick={async () => {
              await deferred.prompt();
              await deferred.userChoice;
              setDeferred(null);
            }}
            className="shrink-0 rounded-full bg-accent px-4 py-2 text-[13px] font-medium text-[color:var(--on-accent)]"
          >
            Установить
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setShowHint((v) => !v)}
            className="shrink-0 rounded-full border border-line-strong px-4 py-2 text-[13px] font-medium text-heading"
          >
            Как?
          </button>
        )}
      </div>
      {isIOS && showHint && (
        <p className="mt-2 px-1 text-[11px] leading-relaxed text-secondary">
          В Safari нажмите «Поделиться» (квадрат со стрелкой вверх), затем
          выберите «На экран „Домой“». Приложение появится отдельной иконкой.
        </p>
      )}
    </div>
  );
}
