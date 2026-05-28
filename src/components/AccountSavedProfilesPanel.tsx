"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { EmptyState } from "@/components/EmptyState";
import { useLocaleMessages } from "@/components/LocaleProvider";
import type { SavedProfile } from "@/lib/strand/types";

export function AccountSavedProfilesPanel({
  initialProfiles,
}: {
  initialProfiles: SavedProfile[];
}) {
  const router = useRouter();
  const { locale } = useLocaleMessages();
  const [slug, setSlug] = useState("ava-mercer-sydney");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const copy =
    locale === "ru"
      ? {
          title: "Сохранённые профили",
          intro:
            "Saved profiles уже подключены к repository layer и могут использоваться как лёгкий client-side shortlist до появления более глубоких follow flows.",
          addPlaceholder: "slug профиля, например ava-mercer-sydney",
          save: "Сохранить профиль",
          remove: "Удалить",
          savedAt: "Сохранён",
          emptyTitle: "Сохранённых профилей пока нет",
          emptyText:
            "Добавьте профиль по slug, чтобы проверить сохранение, чтение и удаление в Phase 1 runtime.",
        }
      : {
          title: "Saved profiles",
          intro:
            "Saved profiles are now connected to the repository layer and can act as a lightweight shortlist before deeper follow flows arrive.",
          addPlaceholder: "profile slug, e.g. ava-mercer-sydney",
          save: "Save profile",
          remove: "Remove",
          savedAt: "Saved",
          emptyTitle: "No saved profiles yet",
          emptyText:
            "Add a profile by slug to verify create, read, and remove behavior in the Phase 1 runtime.",
        };

  async function mutate(method: "POST" | "DELETE", nextSlug: string) {
    setMessage(null);
    const response = await fetch("/api/account/saved-profiles", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: nextSlug }),
    });
    const payload = (await response.json().catch(() => null)) as
      | { ok?: boolean; message?: string; error?: string }
      | null;

    setMessage(payload?.message ?? payload?.error ?? (response.ok ? "OK" : "Request failed."));
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <section className="panel p-6">
      <h2 className="text-3xl text-heading">{copy.title}</h2>
      <p className="mt-3 text-sm leading-7 text-body">{copy.intro}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
        <input
          className="field"
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
          placeholder={copy.addPlaceholder}
        />
        <button
          type="button"
          className="btn-primary"
          disabled={isPending}
          onClick={() => mutate("POST", slug)}
        >
          {copy.save}
        </button>
      </div>
      <div className="mt-5 grid gap-3">
        {initialProfiles.length ? (
          initialProfiles.map((profile) => (
            <div
              key={profile.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-[22px] border border-white/10 p-4"
            >
              <div>
                <p className="text-sm text-heading">{profile.displayName}</p>
                <p className="mt-1 text-xs text-secondary">
                  {profile.city}, {profile.state} • {profile.headline}
                </p>
                <p className="mt-1 text-xs text-secondary">
                  {copy.savedAt}: {profile.createdAt}
                </p>
              </div>
              <button
                type="button"
                className="btn-ghost"
                disabled={isPending}
                onClick={() => mutate("DELETE", profile.slug)}
              >
                {copy.remove}
              </button>
            </div>
          ))
        ) : (
          <EmptyState title={copy.emptyTitle} text={copy.emptyText} />
        )}
      </div>
      {message ? (
        <div className="mt-4 rounded-[22px] border border-[#d7c3a2]/25 bg-[#d7c3a2]/10 p-4 text-sm text-body">
          {message}
        </div>
      ) : null}
    </section>
  );
}
