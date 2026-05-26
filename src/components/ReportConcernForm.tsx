"use client";

import { useState, useTransition } from "react";
import { useLocaleMessages } from "@/components/LocaleProvider";

export function ReportConcernForm() {
  const { locale } = useLocaleMessages();
  const [targetType, setTargetType] = useState<"profile" | "media" | "message">("profile");
  const [reason, setReason] = useState(
    locale === "ru" ? "Проблема безопасности" : "Safety concern",
  );
  const [details, setDetails] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const copy =
    locale === "ru"
      ? {
          targetType: "Тип цели",
          reason: "Причина",
          details: "Детали",
          placeholder: "Опишите проблему ясно и по фактам.",
          submit: "Отправить репорт",
          success:
            "Кейс принят в moderation queue foundation. Юридические и операционные процедуры требуют отдельной верификации до запуска.",
        }
      : {
          targetType: "Target type",
          reason: "Reason",
          details: "Details",
          placeholder: "Summarise the concern clearly and factually.",
          submit: "Submit report",
          success:
            "The case has been added to the moderation queue foundation. Legal and operational procedures still require separate verification before launch.",
        };

  async function submit() {
    setMessage(null);
    const response = await fetch("/api/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetType, reason, details }),
    });
    const payload = (await response.json().catch(() => null)) as
      | { error?: string; message?: string; ok?: boolean }
      | null;

    setMessage(payload?.message ?? payload?.error ?? (response.ok ? copy.success : "Request failed."));
    if (response.ok) {
      startTransition(() => {
        setDetails("");
      });
    }
  }

  return (
    <div className="panel grid gap-5 p-6">
      <label className="grid gap-2">
        <span className="text-sm font-medium text-heading">{copy.targetType}</span>
        <select className="field" value={targetType} onChange={(event) => setTargetType(event.target.value as "profile" | "media" | "message")}>
          <option value="profile">{locale === "ru" ? "Профиль" : "Profile"}</option>
          <option value="media">{locale === "ru" ? "Медиа" : "Media"}</option>
          <option value="message">{locale === "ru" ? "Сообщение" : "Message"}</option>
        </select>
      </label>
      <label className="grid gap-2">
        <span className="text-sm font-medium text-heading">{copy.reason}</span>
        <select className="field" value={reason} onChange={(event) => setReason(event.target.value)}>
          <option>{locale === "ru" ? "Проблема безопасности" : "Safety concern"}</option>
          <option>{locale === "ru" ? "Мошенничество или impersonation" : "Fraud or impersonation"}</option>
          <option>{locale === "ru" ? "Нарушение политики" : "Policy concern"}</option>
          <option>{locale === "ru" ? "Проблема конфиденциальности" : "Privacy issue"}</option>
        </select>
      </label>
      <label className="grid gap-2">
        <span className="text-sm font-medium text-heading">{copy.details}</span>
        <textarea
          className="field min-h-36"
          value={details}
          onChange={(event) => setDetails(event.target.value)}
          placeholder={copy.placeholder}
        />
      </label>
      <div>
        <button type="button" className="btn-primary" disabled={isPending} onClick={submit}>
          {copy.submit}
        </button>
      </div>
      {message ? (
        <div className="rounded-[22px] border border-[#d7c3a2]/25 bg-[#d7c3a2]/10 p-4 text-sm text-body">
          {message}
        </div>
      ) : null}
    </div>
  );
}
