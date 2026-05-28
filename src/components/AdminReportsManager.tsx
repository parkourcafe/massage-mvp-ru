"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useLocaleMessages } from "@/components/LocaleProvider";
import {
  getModerationCaseStatusLabel,
  getPriorityLabel,
} from "@/lib/i18n/labels";
import type { ModerationCase } from "@/lib/strand/types";

export function AdminReportsManager({
  initialCases,
}: {
  initialCases: ModerationCase[];
}) {
  const router = useRouter();
  const { locale } = useLocaleMessages();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function updateCase(input: {
    caseId: string;
    status: ModerationCase["status"];
    priority: ModerationCase["priority"];
    assignedReviewer: string;
    actionTaken: string;
  }) {
    setMessage(null);
    const response = await fetch("/api/admin/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update",
        ...input,
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
    <div className="grid gap-4">
      {initialCases.map((item) => (
        <AdminReportCaseCard
          key={item.id}
          item={item}
          locale={locale}
          onSave={updateCase}
          isPending={isPending}
        />
      ))}
      {message ? (
        <div className="rounded-[22px] border border-[#d7c3a2]/25 bg-[#d7c3a2]/10 p-4 text-sm text-body">
          {message}
        </div>
      ) : null}
    </div>
  );
}

function AdminReportCaseCard({
  item,
  locale,
  onSave,
  isPending,
}: {
  item: ModerationCase;
  locale: "en" | "ru";
  onSave: (input: {
    caseId: string;
    status: ModerationCase["status"];
    priority: ModerationCase["priority"];
    assignedReviewer: string;
    actionTaken: string;
  }) => void;
  isPending: boolean;
}) {
  const [status, setStatus] = useState(item.status);
  const [priority, setPriority] = useState(item.priority);
  const [assignedReviewer, setAssignedReviewer] = useState(item.assignedReviewer);
  const [actionTaken, setActionTaken] = useState(item.subject);

  return (
    <div className="panel p-6">
      <h2 className="text-2xl text-heading">{item.subject}</h2>
      <p className="mt-3 text-sm leading-7 text-body">
        {locale === "ru" ? "Цель" : "Target"}: {item.targetType} • {locale === "ru" ? "Причина" : "Reason"}:{" "}
        {item.reason}
      </p>
      <p className="mt-3 text-xs uppercase tracking-[0.18em] text-secondary">
        {getModerationCaseStatusLabel(locale, item.status)} • {getPriorityLabel(locale, item.priority)}
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <select className="field" value={status} onChange={(event) => setStatus(event.target.value as ModerationCase["status"])}>
          <option value="open">{getModerationCaseStatusLabel(locale, "open")}</option>
          <option value="in_review">{getModerationCaseStatusLabel(locale, "in_review")}</option>
          <option value="resolved">{getModerationCaseStatusLabel(locale, "resolved")}</option>
          <option value="escalated">{getModerationCaseStatusLabel(locale, "escalated")}</option>
        </select>
        <select className="field" value={priority} onChange={(event) => setPriority(event.target.value as ModerationCase["priority"])}>
          <option value="low">{getPriorityLabel(locale, "low")}</option>
          <option value="medium">{getPriorityLabel(locale, "medium")}</option>
          <option value="high">{getPriorityLabel(locale, "high")}</option>
          <option value="critical">{getPriorityLabel(locale, "critical")}</option>
        </select>
        <input
          className="field"
          value={assignedReviewer}
          onChange={(event) => setAssignedReviewer(event.target.value)}
          placeholder={locale === "ru" ? "Назначенный ревьюер" : "Assigned reviewer"}
        />
        <input
          className="field"
          value={actionTaken}
          onChange={(event) => setActionTaken(event.target.value)}
          placeholder={locale === "ru" ? "Предпринятое действие" : "Action taken"}
        />
      </div>
      <div className="mt-4">
        <button
          type="button"
          className="btn-primary"
          disabled={isPending}
          onClick={() =>
            onSave({
              caseId: item.id,
              status,
              priority,
              assignedReviewer,
              actionTaken,
            })
          }
        >
          {locale === "ru" ? "Сохранить кейс" : "Save case"}
        </button>
      </div>
    </div>
  );
}
