"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { Profile } from "@/lib/types";
import { modalityLabel } from "@/lib/catalog";
import { formatRub } from "@/lib/util";
import { readLocalFavorites } from "./FavoriteButton";

export function FavoritesView() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const favs = readLocalFavorites();
    const scoreMap: Record<string, number> = {};
    favs.forEach((f) => {
      if (typeof f.matchScore === "number") scoreMap[f.profileId] = f.matchScore;
    });
    setScores(scoreMap);
    if (favs.length === 0) {
      setProfiles([]);
      setLoading(false);
      return;
    }
    const ids = favs.map((f) => f.profileId).join(",");
    const res = await fetch(`/api/profiles?ids=${encodeURIComponent(ids)}`);
    const data = await res.json();
    setProfiles(data.profiles ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const h = () => load();
    window.addEventListener("mm-favorites-changed", h);
    return () => window.removeEventListener("mm-favorites-changed", h);
  }, [load]);

  function remove(id: string) {
    const next = readLocalFavorites().filter((f) => f.profileId !== id);
    localStorage.setItem("mm_favorites", JSON.stringify(next));
    window.dispatchEvent(new Event("mm-favorites-changed"));
    fetch("/api/favorites", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId: id }),
    }).catch(() => {});
  }

  if (loading) return <p className="text-secondary">Загрузка…</p>;

  if (profiles.length === 0)
    return (
      <p className="text-body">
        В избранном пока пусто.{" "}
        <Link href="/therapists" className="text-accent hover:underline">
          Открыть каталог
        </Link>{" "}
        или{" "}
        <Link href="/match" className="text-accent hover:underline">
          подобрать с AI
        </Link>
        .
      </p>
    );

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {profiles.map((p) => {
        const photo = (p.media ?? []).find((m) => m.type === "profile_photo");
        return (
          <div key={p.id} className="card flex gap-4">
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photo.url}
                alt={p.full_name}
                className="h-20 w-20 rounded-lg object-cover bg-surface"
              />
            ) : (
              <div className="h-20 w-20 rounded-lg bg-accent-soft flex items-center justify-center text-xl font-semibold text-accent">
                {p.full_name.slice(0, 1)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Link
                  href={`/therapist/${p.slug}`}
                  className="h3 hover:text-accent transition-colors"
                >
                  {p.full_name}
                </Link>
                {scores[p.id] != null && (
                  <span className="badge">
                    {scores[p.id]}%
                  </span>
                )}
              </div>
              <p className="text-sm text-secondary mt-1">
                {[p.city, p.district].filter(Boolean).join(", ")}
              </p>
              <div className="mt-1 flex flex-wrap gap-1">
                {(p.services ?? []).slice(0, 3).map((s) => (
                  <span key={s.id} className="chip">
                    {modalityLabel(s.modality)}
                  </span>
                ))}
              </div>
              <p className="text-sm text-body mt-1">от {formatRub(p.price_from)}</p>
              {p.headline && (
                <p className="text-xs text-secondary line-clamp-2 mt-1">
                  {p.headline}
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href={`/therapist/${p.slug}`} className="btn-ghost btn-sm">
                  Открыть профиль
                </Link>
                <Link
                  href={`/therapist/${p.slug}/booking`}
                  className="btn-primary btn-sm"
                >
                  Записаться
                </Link>
                <button
                  onClick={() => remove(p.id)}
                  className="btn-ghost btn-sm text-accent"
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
