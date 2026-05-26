"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useLocaleMessages } from "@/components/LocaleProvider";
import { getPublicationStatusLabel } from "@/lib/i18n/labels";
import type { StudioProfileDraft, StudioStatusSnapshot } from "@/lib/strand/types";

export function StudioProfileEditor({
  initialProfile,
  snapshot,
}: {
  initialProfile: StudioProfileDraft;
  snapshot: StudioStatusSnapshot;
}) {
  const router = useRouter();
  const { locale } = useLocaleMessages();
  const [form, setForm] = useState(initialProfile);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const copy =
    locale === "ru"
      ? {
          save: "Сохранить черновик",
          submit: "Отправить на проверку",
          preview: "Предпросмотр",
          currentStatus: "Текущий статус",
          checklist: "Готовность к публикации",
          ready: "Готово",
          pending: "Требует внимания",
          labels: {
            displayName: "Отображаемое имя",
            state: "Штат",
            city: "Город",
            shortBio: "Короткое био",
            longBio: "Длинное био",
            subscriptionPrice: "Цена подписки",
            availability: "Доступность",
          },
        }
      : {
          save: "Save draft",
          submit: "Submit for review",
          preview: "Preview",
          currentStatus: "Current status",
          checklist: "Publishing readiness",
          ready: "Ready",
          pending: "Needs attention",
          labels: {
            displayName: "Display name",
            state: "State",
            city: "City",
            shortBio: "Short bio",
            longBio: "Long bio",
            subscriptionPrice: "Subscription price",
            availability: "Availability",
          },
        };

  const checklist = [
    ["profileComplete", locale === "ru" ? "Профиль заполнен" : "Profile complete"],
    ["kycReady", locale === "ru" ? "KYC одобрен" : "KYC approved"],
    ["mediaReady", locale === "ru" ? "Медиа одобрены" : "Media approved"],
    ["pricingReady", locale === "ru" ? "Цена настроена" : "Pricing configured"],
    ["locationReady", locale === "ru" ? "Локация сохранена" : "Location saved"],
  ] as const;

  async function submit(intent: "save" | "submit") {
    setMessage(null);
    const response = await fetch("/api/studio/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName: form.displayName,
        state: form.state,
        city: form.city,
        shortBio: form.shortBio,
        longBio: form.longBio,
        availability: form.availability,
        subscriptionPrice: Number(form.subscriptionPrice),
        intent,
      }),
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
    <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
      <section className="panel grid gap-5 p-6">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-heading">{copy.labels.displayName}</span>
          <input
            className="field"
            value={form.displayName}
            onChange={(event) => setForm((current) => ({ ...current, displayName: event.target.value }))}
          />
        </label>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-heading">{copy.labels.state}</span>
            <input
              className="field"
              value={form.state}
              onChange={(event) => setForm((current) => ({ ...current, state: event.target.value }))}
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-heading">{copy.labels.city}</span>
            <input
              className="field"
              value={form.city}
              onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
            />
          </label>
        </div>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-heading">{copy.labels.shortBio}</span>
          <textarea
            className="field min-h-24"
            value={form.shortBio}
            onChange={(event) => setForm((current) => ({ ...current, shortBio: event.target.value }))}
          />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-heading">{copy.labels.longBio}</span>
          <textarea
            className="field min-h-36"
            value={form.longBio}
            onChange={(event) => setForm((current) => ({ ...current, longBio: event.target.value }))}
          />
        </label>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-heading">{copy.labels.subscriptionPrice}</span>
            <input
              className="field"
              type="number"
              min="0"
              value={form.subscriptionPrice}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  subscriptionPrice: Number(event.target.value),
                }))
              }
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-heading">{copy.labels.availability}</span>
            <input
              className="field"
              value={form.availability}
              onChange={(event) => setForm((current) => ({ ...current, availability: event.target.value }))}
            />
          </label>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" className="btn-secondary" disabled={isPending} onClick={() => submit("save")}>
            {copy.save}
          </button>
          <button type="button" className="btn-primary" disabled={isPending} onClick={() => submit("submit")}>
            {copy.submit}
          </button>
        </div>
        {message ? (
          <div className="rounded-[22px] border border-[#d7c3a2]/25 bg-[#d7c3a2]/10 p-4 text-sm text-body">
            {message}
          </div>
        ) : null}
      </section>
      <div className="space-y-6">
        <section className="panel p-6">
          <p className="eyebrow">{copy.preview}</p>
          <h2 className="mt-3 text-4xl text-heading">{form.displayName}</h2>
          <p className="mt-3 text-sm leading-7 text-body">{form.shortBio}</p>
          <p className="mt-4 text-xs uppercase tracking-[0.18em] text-secondary">
            {copy.currentStatus}: {getPublicationStatusLabel(locale, snapshot.status)}
          </p>
        </section>
        <section className="panel p-6">
          <h3 className="text-2xl text-heading">{copy.checklist}</h3>
          <div className="mt-4 grid gap-3">
            {checklist.map(([key, label]) => (
              <div
                key={key}
                className="flex items-center justify-between gap-4 rounded-[20px] border border-white/10 p-4 text-sm text-body"
              >
                <span>{label}</span>
                <span className="text-secondary">
                  {snapshot.checklist[key] ? copy.ready : copy.pending}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
