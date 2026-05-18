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
      <header>
        <p className="eyebrow"><span className="num-label">01</span> Кабинет специалиста</p>
        <h1 className="h1 mt-3">Медиа</h1>
        <p className="body-lg text-secondary mt-3 max-w-2xl">
          Фото загружаются файлом (JPG, PNG или WebP, до 5 МБ) либо по
          ссылке. Видео добавляются только по ссылке (
          {VIDEO_PROVIDERS.join(", ")}). Запрещены провокационные,
          обнажённые и интимные материалы.
        </p>
      </header>
      <p className="rounded-xl2 bg-accent-soft border border-line text-secondary text-xs px-4 py-3">
        Публикуя фото, вы подтверждаете, что имеете право на их
        использование. Не загружайте фото клиентов без их письменного
        согласия. Не размещайте чужие материалы и медицинские документы
        третьих лиц.
      </p>

      {error && (
        <p className="rounded-xl2 bg-accent-soft border border-line text-accent text-sm px-4 py-3">
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
            className="input border border-dashed border-line-strong bg-surface text-secondary"
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
          <div
            key={m.id}
            className="card card-interactive flex items-start justify-between gap-3"
          >
            <div className="min-w-0">
              <span className="badge">
                {TYPES.find((t) => t.key === m.type)?.label ?? m.type}
              </span>
              <a
                href={m.url}
                className="block mt-2 text-xs text-accent underline break-all"
              >
                {m.url}
              </a>
              {m.title && (
                <p className="text-xs text-secondary mt-1">{m.title}</p>
              )}
            </div>
            <button
              onClick={() => remove(m.id)}
              className="text-accent text-xs hover:opacity-80 shrink-0"
            >
              Удалить
            </button>
          </div>
        ))}
        {media.length === 0 && (
          <div className="img-ph sm:col-span-2">Медиа не добавлено.</div>
        )}
      </div>
    </div>
  );
}
