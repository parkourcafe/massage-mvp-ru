"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useLocaleMessages } from "@/components/LocaleProvider";
import type { StudioKycVerification } from "@/lib/strand/types";

export function StudioKycManager({
  initialVerification,
}: {
  initialVerification: StudioKycVerification;
}) {
  const router = useRouter();
  const { locale, messages } = useLocaleMessages();
  const [governmentIdLabel, setGovernmentIdLabel] = useState(initialVerification.governmentIdLabel);
  const [selfieLabel, setSelfieLabel] = useState(initialVerification.selfieLabel);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const copy =
    locale === "ru"
      ? {
          start: "Начать верификацию",
          submit: "Отправить",
          resubmit: "Отправить повторно",
          idLabel: "Загрузка удостоверения личности",
          selfieLabel: "Selfie / liveness",
        }
      : {
          start: "Start verification",
          submit: "Submit",
          resubmit: "Resubmit",
          idLabel: "Government ID upload",
          selfieLabel: "Selfie / liveness",
        };

  async function submit(intent: "start" | "submit" | "resubmit") {
    setMessage(null);
    const response = await fetch("/api/studio/kyc", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        governmentIdLabel,
        selfieLabel,
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
    <section className="panel grid gap-5 p-6">
      <label className="grid gap-2">
        <span className="text-sm font-medium text-heading">{copy.idLabel}</span>
        <input
          className="field"
          value={governmentIdLabel}
          onChange={(event) => setGovernmentIdLabel(event.target.value)}
          placeholder={messages.common.uploadPlaceholder}
        />
      </label>
      <label className="grid gap-2">
        <span className="text-sm font-medium text-heading">{copy.selfieLabel}</span>
        <input
          className="field"
          value={selfieLabel}
          onChange={(event) => setSelfieLabel(event.target.value)}
          placeholder={messages.common.selfiePlaceholder}
        />
      </label>
      <div className="flex flex-wrap gap-3">
        <button type="button" className="btn-secondary" disabled={isPending} onClick={() => submit("start")}>
          {copy.start}
        </button>
        <button type="button" className="btn-primary" disabled={isPending} onClick={() => submit("submit")}>
          {copy.submit}
        </button>
        <button type="button" className="btn-ghost" disabled={isPending} onClick={() => submit("resubmit")}>
          {copy.resubmit}
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
