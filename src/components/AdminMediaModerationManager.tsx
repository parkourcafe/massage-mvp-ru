"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useLocaleMessages } from "@/components/LocaleProvider";
import { StatusBadge } from "@/components/StatusBadge";
import { getMediaStatusLabel } from "@/lib/i18n/labels";
import type { AdminMediaQueueItem } from "@/lib/strand/types";

function mediaTone(status: AdminMediaQueueItem["status"]) {
  if (status === "approved") return "success" as const;
  if (status === "pending") return "warning" as const;
  if (status === "hidden") return "accent" as const;
  return "danger" as const;
}

export function AdminMediaModerationManager({
  initialAssets,
}: {
  initialAssets: AdminMediaQueueItem[];
}) {
  const router = useRouter();
  const { locale } = useLocaleMessages();
  const [selectedId, setSelectedId] = useState(initialAssets[0]?.id ?? "");
  const [rejectionReason, setRejectionReason] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selected = initialAssets.find((item) => item.id === selectedId) ?? initialAssets[0];

  const copy =
    locale === "ru"
      ? {
          reviewActions: "Действия проверки",
          approve: "Одобрить",
          reject: "Отклонить с причиной",
          hide: "Скрыть после публикации",
          rejectionReason: "Причина отклонения",
        }
      : {
          reviewActions: "Review actions",
          approve: "Approve",
          reject: "Reject with reason",
          hide: "Hide after publication",
          rejectionReason: "Rejection reason",
        };

  async function review(decision: "approve" | "reject" | "hide") {
    if (!selected) return;
    setMessage(null);
    const response = await fetch("/api/admin/media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        assetId: selected.id,
        decision,
        rejectionReason,
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
    <div className="grid gap-6">
      <section className="panel p-6">
        <h2 className="text-3xl text-heading">
          {locale === "ru" ? "Сетка ожидающих медиа" : "Pending media grid"}
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {initialAssets.map((asset) => (
            <button
              key={asset.id}
              type="button"
              onClick={() => setSelectedId(asset.id)}
              className={`rounded-[24px] border p-4 text-left ${
                asset.id === selected?.id
                  ? "border-[#d7c3a2]/35 bg-[#d7c3a2]/10"
                  : "border-white/10"
              }`}
            >
              <div className="h-40 rounded-[18px] bg-white/[0.04]" />
              <p className="mt-4 text-sm text-heading">{asset.label}</p>
              <p className="mt-1 text-xs text-secondary">{asset.visibility} • {asset.note}</p>
              <div className="mt-3">
                <StatusBadge tone={mediaTone(asset.status)}>
                  {getMediaStatusLabel(locale, asset.status)}
                </StatusBadge>
              </div>
            </button>
          ))}
        </div>
      </section>
      {selected ? (
        <section className="panel p-6">
          <h2 className="text-3xl text-heading">{copy.reviewActions}</h2>
          <input
            className="field mt-4"
            value={rejectionReason}
            onChange={(event) => setRejectionReason(event.target.value)}
            placeholder={copy.rejectionReason}
          />
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" className="btn-primary" disabled={isPending} onClick={() => review("approve")}>
              {copy.approve}
            </button>
            <button type="button" className="btn-secondary" disabled={isPending} onClick={() => review("reject")}>
              {copy.reject}
            </button>
            <button type="button" className="btn-ghost" disabled={isPending} onClick={() => review("hide")}>
              {copy.hide}
            </button>
          </div>
        </section>
      ) : null}
      {message ? (
        <div className="rounded-[22px] border border-[#d7c3a2]/25 bg-[#d7c3a2]/10 p-4 text-sm text-body">
          {message}
        </div>
      ) : null}
    </div>
  );
}
