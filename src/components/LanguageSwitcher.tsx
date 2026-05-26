"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { Locale } from "@/lib/i18n/types";
import { useLocaleMessages } from "./LocaleProvider";

export function LanguageSwitcher() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { locale, messages } = useLocaleMessages();

  async function setLocale(nextLocale: Locale) {
    await fetch("/api/i18n/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: nextLocale }),
    });

    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2">
      <span className="hidden text-xs uppercase tracking-[0.18em] text-secondary sm:inline">
        {messages.header.localeLabel}
      </span>
      {(["ru", "en"] as Locale[]).map((value) => (
        <button
          key={value}
          type="button"
          disabled={isPending}
          onClick={() => setLocale(value)}
          className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.18em] transition-colors ${
            locale === value
              ? "border-[#d7c3a2]/40 bg-[#d7c3a2]/10 text-heading"
              : "border-white/10 text-secondary"
          }`}
        >
          {value}
        </button>
      ))}
    </div>
  );
}

