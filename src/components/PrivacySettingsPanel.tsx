"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useLocaleMessages } from "@/components/LocaleProvider";
import type { PrivacySettings } from "@/lib/strand/types";

export function PrivacySettingsPanel({
  initialSettings,
}: {
  initialSettings: PrivacySettings;
}) {
  const router = useRouter();
  const { locale } = useLocaleMessages();
  const [settings, setSettings] = useState(initialSettings);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const copy =
    locale === "ru"
      ? {
          title: "Настройки приватности",
          save: "Сохранить настройки",
          fields: {
            discreetBilling: "Discreet billing labels",
            marketingOptIn: "Разрешить маркетинговые обновления",
            showActiveSubscriptions: "Показывать активные подписки в интерфейсе",
            notifyOnModerationActions: "Получать уведомления о moderation actions",
          },
        }
      : {
          title: "Privacy settings",
          save: "Save settings",
          fields: {
            discreetBilling: "Discreet billing labels",
            marketingOptIn: "Allow marketing updates",
            showActiveSubscriptions: "Show active subscriptions in the interface",
            notifyOnModerationActions: "Receive moderation action notices",
          },
        };

  async function save() {
    setMessage(null);
    const response = await fetch("/api/account/privacy", {
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
    <section className="panel p-6">
      <h2 className="text-3xl text-heading">{copy.title}</h2>
      <div className="mt-5 grid gap-4">
        {(Object.keys(settings) as Array<keyof PrivacySettings>).map((key) => (
          <label
            key={key}
            className="flex items-center justify-between gap-4 rounded-[22px] border border-white/10 p-4 text-sm text-body"
          >
            <span>{copy.fields[key]}</span>
            <input
              type="checkbox"
              checked={settings[key]}
              onChange={(event) =>
                setSettings((current) => ({ ...current, [key]: event.target.checked }))
              }
            />
          </label>
        ))}
      </div>
      <div className="mt-5">
        <button type="button" className="btn-primary" disabled={isPending} onClick={save}>
          {copy.save}
        </button>
      </div>
      {message ? (
        <div className="mt-4 rounded-[22px] border border-[#d7c3a2]/25 bg-[#d7c3a2]/10 p-4 text-sm text-body">
          {message}
        </div>
      ) : null}
    </section>
  );
}
