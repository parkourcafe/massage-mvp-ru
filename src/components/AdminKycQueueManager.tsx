"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useLocaleMessages } from "@/components/LocaleProvider";
import { getKycStatusLabel } from "@/lib/i18n/labels";
import type { AdminKycApplicant } from "@/lib/strand/types";

export function AdminKycQueueManager({
  initialApplicants,
}: {
  initialApplicants: AdminKycApplicant[];
}) {
  const router = useRouter();
  const { locale } = useLocaleMessages();
  const [selectedId, setSelectedId] = useState(initialApplicants[0]?.id ?? "");
  const [rejectionReason, setRejectionReason] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selected = initialApplicants.find((item) => item.id === selectedId) ?? initialApplicants[0];

  const copy =
    locale === "ru"
      ? {
          applicants: "Заявители",
          approve: "Одобрить",
          reject: "Отклонить",
          rejectionReason: "Причина отклонения",
        }
      : {
          applicants: "Applicants",
          approve: "Approve",
          reject: "Reject",
          rejectionReason: "Rejection reason",
        };

  async function review(decision: "approve" | "reject") {
    if (!selected) return;
    setMessage(null);
    const response = await fetch("/api/admin/kyc", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        applicantId: selected.id,
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
        <h2 className="text-3xl text-heading">{copy.applicants}</h2>
        <div className="mt-5 grid gap-3">
          {initialApplicants.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedId(item.id)}
              className={`rounded-[20px] border p-4 text-left text-sm ${
                item.id === selected?.id
                  ? "border-[#d7c3a2]/35 bg-[#d7c3a2]/10 text-heading"
                  : "border-white/10 text-body"
              }`}
            >
              {item.displayName} • {getKycStatusLabel(locale, item.status)}
            </button>
          ))}
        </div>
      </section>
      {selected ? (
        <section className="panel grid gap-5 p-6 lg:grid-cols-[1fr_1fr]">
          <div className="field flex min-h-40 items-center justify-center">
            {selected.governmentIdLabel}
          </div>
          <div className="field flex min-h-40 items-center justify-center">
            {selected.selfieLabel}
          </div>
          <div className="grid gap-3 lg:col-span-2">
            <input
              className="field"
              value={rejectionReason}
              onChange={(event) => setRejectionReason(event.target.value)}
              placeholder={copy.rejectionReason}
            />
            <div className="flex flex-wrap gap-3">
              <button type="button" className="btn-primary" disabled={isPending} onClick={() => review("approve")}>
                {copy.approve}
              </button>
              <button type="button" className="btn-secondary" disabled={isPending} onClick={() => review("reject")}>
                {copy.reject}
              </button>
            </div>
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
