"use client";

import { useEffect, useState } from "react";

const KEY = "mm_favorites";

type StoredFav = { profileId: string; source: string; matchScore?: number };

export function readLocalFavorites(): StoredFav[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function writeLocalFavorites(list: StoredFav[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("mm-favorites-changed"));
}

export function FavoriteButton({
  profileId,
  source = "directory",
  matchScore,
  className = "",
}: {
  profileId: string;
  source?: "directory" | "profile" | "match";
  matchScore?: number;
  className?: string;
}) {
  const [active, setActive] = useState(false);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    setActive(readLocalFavorites().some((f) => f.profileId === profileId));
  }, [profileId]);

  async function toggle() {
    const list = readLocalFavorites();
    const exists = list.some((f) => f.profileId === profileId);
    let next: StoredFav[];
    if (exists) {
      next = list.filter((f) => f.profileId !== profileId);
      setActive(false);
    } else {
      next = [...list, { profileId, source, matchScore }];
      setActive(true);
    }
    writeLocalFavorites(next);
    // Best-effort sync for authenticated users (no-op for guests).
    try {
      await fetch("/api/favorites", {
        method: exists ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId, source, matchScore }),
      });
    } catch {
      /* offline / guest — localStorage already updated */
    }
  }

  const label = active
    ? hover
      ? "Удалить из избранного"
      : "В избранном"
    : "Добавить в избранное";

  return (
    <button
      type="button"
      onClick={toggle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-pressed={active}
      className={`btn ${
        active
          ? "border border-brand-600 text-brand-700 hover:bg-red-50 hover:border-red-300 hover:text-red-600"
          : "border border-slate-300 text-slate-600 hover:bg-slate-50"
      } ${className}`}
    >
      <span aria-hidden>{active ? "♥" : "♡"}</span>
      {label}
    </button>
  );
}
