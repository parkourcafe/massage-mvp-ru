"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useLocaleMessages } from "@/components/LocaleProvider";
import type { StudioSubscriptionSettings } from "@/lib/strand/types";

export function StudioSubscriptionManager({
  initialSettings,
}: {
  initialSettings: StudioSubscriptionSettings;
}) {
  const router = useRouter();
  const { locale } = useLocaleMessages();
  const [settings, setSettings] = useState(initialSettings);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const copy =
    locale === "ru"
      ? {
          save: "Сохранить настройки",
          price: "Цена месячной подписки",
          summary: "Описание entitlement",
        }
      : {
          save: "Save settings",
          price: "Monthly subscription price",
          summary: "Entitlement summary",
        };

  async function save() {
    setMessage(null);
    const response = await fetch("/api/studio/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    const payload = (await response.json().catch(() => null)) as
      | { error?: string; message?: string }
      | null;

    setMessage(payload?.message ?? payload?.error ?? (response.ok ? "OK" : "Request failed."));
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <section className="panel grid gap-5 p-6">
      <label className="grid gap-2">
        <span className="text-sm font-medium text-heading">{copy.price}</span>
        <input
          className="field"
          type="number"
          min="0"
          value={settings.monthlyPrice}
          onChange={(event) =>
            setSettings((current) => ({ ...current, monthlyPrice: Number(event.target.value) }))
          }
        />
      </label>
      <label className="grid gap-2">
        <span className="text-sm font-medium text-heading">{copy.summary}</span>
        <textarea
          className="field min-h-32"
          value={settings.entitlementSummary}
          onChange={(event) =>
            setSettings((current) => ({ ...current, entitlementSummary: event.target.value }))
          }
        />
      </label>
      <div>
        <button type="button" className="btn-primary" disabled={isPending} onClick={save}>
          {copy.save}
        </button>
      </div>
      {message ? (
        <div className="rounded-[22px] border border-[#d7c3a2]/25 bg-[#d7c3a2]/10 p-4 text-sm text-body">
          {message}
        </div>
      ) : null}
    </section>
  );
}
