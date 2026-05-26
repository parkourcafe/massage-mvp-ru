"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { EmptyState } from "@/components/EmptyState";
import { useLocaleMessages } from "@/components/LocaleProvider";
import { StatusBadge } from "@/components/StatusBadge";
import { getMediaStatusLabel } from "@/lib/i18n/labels";
import type { StudioMediaAsset } from "@/lib/strand/types";

function mediaTone(status: StudioMediaAsset["status"]) {
  if (status === "approved") return "success" as const;
  if (status === "pending") return "warning" as const;
  if (status === "hidden") return "accent" as const;
  return "danger" as const;
}

export function StudioMediaManager({
  initialAssets,
}: {
  initialAssets: StudioMediaAsset[];
}) {
  const router = useRouter();
  const { locale } = useLocaleMessages();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const uploadStates =
    locale === "ru"
      ? ["Пусто", "Загрузка", "Обработка видео", "Ожидает проверки"]
      : ["Empty", "Uploading", "Video processing", "Pending review"];

  const copy =
    locale === "ru"
      ? {
          uploadPlaceholder: "Добавить placeholder upload",
          toggleVisibility: "Переключить public/private",
          resubmit: "Повторно отправить",
          lockedTitle: "Заблокированный private preview",
          lockedText:
            "Подписка и entitlement должны проверяться на сервере до открытия approved private media.",
        }
      : {
          uploadPlaceholder: "Add placeholder upload",
          toggleVisibility: "Toggle public/private",
          resubmit: "Resubmit",
          lockedTitle: "Locked private preview",
          lockedText:
            "Subscription and entitlement checks must happen server-side before approved private media opens.",
        };

  async function mutate(body: {
    action: "upload_placeholder" | "toggle_visibility" | "resubmit";
    assetId?: string;
  }) {
    setMessage(null);
    const response = await fetch("/api/studio/media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
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
      <div className="panel p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-3xl text-heading">
            {locale === "ru" ? "Состояния загрузки" : "Upload states"}
          </h2>
          <button
            type="button"
            className="btn-primary"
            disabled={isPending}
            onClick={() => mutate({ action: "upload_placeholder" })}
          >
            {copy.uploadPlaceholder}
          </button>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {uploadStates.map((state) => (
            <div key={state} className="rounded-[22px] border border-white/10 p-4 text-sm text-body">
              {state}
            </div>
          ))}
        </div>
      </div>
      <div className="panel p-6">
        <h2 className="text-3xl text-heading">
          {locale === "ru" ? "Медиа-ассеты" : "Media items"}
        </h2>
        <div className="mt-5 grid gap-4">
          {initialAssets.map((item) => (
            <div
              key={item.id}
              className="rounded-[22px] border border-white/10 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-heading">{item.name}</p>
                  <p className="mt-1 text-xs text-secondary">
                    {item.visibility} • {item.note}
                  </p>
                </div>
                <StatusBadge tone={mediaTone(item.status)}>
                  {getMediaStatusLabel(locale, item.status)}
                </StatusBadge>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="btn-ghost"
                  disabled={isPending}
                  onClick={() => mutate({ action: "toggle_visibility", assetId: item.id })}
                >
                  {copy.toggleVisibility}
                </button>
                {item.status === "rejected" ? (
                  <button
                    type="button"
                    className="btn-secondary"
                    disabled={isPending}
                    onClick={() => mutate({ action: "resubmit", assetId: item.id })}
                  >
                    {copy.resubmit}
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
      <EmptyState title={copy.lockedTitle} text={copy.lockedText} />
      {message ? (
        <div className="rounded-[22px] border border-[#d7c3a2]/25 bg-[#d7c3a2]/10 p-4 text-sm text-body">
          {message}
        </div>
      ) : null}
    </div>
  );
}
