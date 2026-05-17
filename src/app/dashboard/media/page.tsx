"use client";

import { useEffect, useState } from "react";
import type { ProfileMedia } from "@/lib/types";
import { VIDEO_PROVIDERS } from "@/lib/catalog";

const TYPES: { key: ProfileMedia["type"]; label: string }[] = [
  { key: "profile_photo", label: "Фото профиля" },
  { key: "gallery_photo", label: "Фото галереи" },
  { key: "workspace_photo", label: "Фото кабинета" },
  { key: "equipment_photo", label: "Фото оборудования/стола" },
  { key: "intro_video", label: "Видео-визитка" },
  { key: "session_video", label: "Видео о сеансе" },
  { key: "certificate", label: "Сертификат" },
  { key: "diploma", label: "Диплом" },
  { key: "review_screenshot", label: "Скриншот отзыва" },
  { key: "document", label: "Документ" },
];

export default function MediaPage() {
  const [media, setMedia] = useState<ProfileMedia[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/dashboard/media");
    const data = await res.json();
    setMedia(data.media ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  async function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/dashboard/media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(fd.entries())),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Ошибка");
      return;
    }
    (e.target as HTMLFormElement).reset();
    load();
  }

  async function remove(id: string) {
    await fetch("/api/dashboard/media", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Медиа</h1>
      <p className="text-sm text-slate-600">
        Видео добавляются по ссылке ({VIDEO_PROVIDERS.join(", ")}). Прямая
        загрузка видео в MVP не поддерживается. Запрещены провокационные,
        обнажённые и интимные материалы.
      </p>

      {error && (
        <p className="rounded-lg bg-red-50 text-red-700 text-sm px-3 py-2">
          {error}
        </p>
      )}

      <form onSubmit={add} className="card grid sm:grid-cols-2 gap-3">
        <div>
          <label className="label">Тип</label>
          <select name="type" className="input">
            {TYPES.map((t) => (
              <option key={t.key} value={t.key}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Ссылка (URL)</label>
          <input name="url" className="input" placeholder="https://…" required />
        </div>
        <div>
          <label className="label">Заголовок</label>
          <input name="title" className="input" />
        </div>
        <div>
          <label className="label">Alt-текст</label>
          <input name="alt_text" className="input" />
        </div>
        <div className="sm:col-span-2">
          <button className="btn-primary">Добавить</button>
        </div>
      </form>

      <div className="grid sm:grid-cols-2 gap-3">
        {media.map((m) => (
          <div key={m.id} className="card flex items-start justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium">
                {TYPES.find((t) => t.key === m.type)?.label ?? m.type}
              </p>
              <a
                href={m.url}
                className="text-xs text-brand-700 underline break-all"
              >
                {m.url}
              </a>
              {m.title && (
                <p className="text-xs text-slate-500">{m.title}</p>
              )}
            </div>
            <button
              onClick={() => remove(m.id)}
              className="text-red-600 text-xs"
            >
              Удалить
            </button>
          </div>
        ))}
        {media.length === 0 && (
          <p className="text-sm text-slate-500">Медиа не добавлено.</p>
        )}
      </div>
    </div>
  );
}
