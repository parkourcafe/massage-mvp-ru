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

const VIDEO_TYPES = ["intro_video", "session_video"];

export default function MediaPage() {
  const [media, setMedia] = useState<ProfileMedia[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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
    const formEl = e.currentTarget;
    const fd = new FormData(formEl);
    const type = String(fd.get("type"));
    const file = fd.get("file") as File | null;
    let url = String(fd.get("url") || "").trim();

    setBusy(true);
    try {
      // Image types: prefer an uploaded file when provided.
      if (file && file.size > 0) {
        if (VIDEO_TYPES.includes(type)) {
          setError("Видео добавляется только по ссылке.");
          return;
        }
        const up = new FormData();
        up.append("file", file);
        const ur = await fetch("/api/dashboard/upload", {
          method: "POST",
          body: up,
        });
        const ud = await ur.json();
        if (!ur.ok) {
          setError(ud.error || "Не удалось загрузить файл");
          return;
        }
        url = ud.url;
      }
      if (!url) {
        setError("Загрузите файл или укажите ссылку.");
        return;
      }
      const res = await fetch("/api/dashboard/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          url,
          title: fd.get("title") || undefined,
          alt_text: fd.get("alt_text") || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Ошибка");
        return;
      }
      formEl.reset();
      load();
    } finally {
      setBusy(false);
    }
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
        Фото загружаются файлом (JPG, PNG или WebP, до 5 МБ) либо по
        ссылке. Видео добавляются только по ссылке (
        {VIDEO_PROVIDERS.join(", ")}). Запрещены провокационные,
        обнажённые и интимные материалы.
      </p>
      <p className="rounded-lg bg-amber-50 text-amber-800 text-xs px-3 py-2">
        Публикуя фото, вы подтверждаете, что имеете право на их
        использование. Не загружайте фото клиентов без их письменного
        согласия. Не размещайте чужие материалы и медицинские документы
        третьих лиц.
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
          <label className="label">Файл (фото: JPG/PNG/WebP, ≤5 МБ)</label>
          <input
            name="file"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="input"
          />
        </div>
        <div>
          <label className="label">или Ссылка (URL)</label>
          <input name="url" className="input" placeholder="https://…" />
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
          <button className="btn-primary" disabled={busy}>
            {busy ? "Загрузка…" : "Добавить"}
          </button>
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
