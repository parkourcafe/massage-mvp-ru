"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { modalityLabel } from "@/lib/catalog";

export default function ImportPage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState<{
    headline: string;
    professional_description: string;
    suggested_modalities: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);

  async function run() {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Ошибка импорта");
      return;
    }
    setDraft(data.draft);
  }

  async function apply() {
    if (!draft) return;
    const res = await fetch("/api/dashboard/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        headline: draft.headline,
        professional_description: draft.professional_description,
      }),
    });
    if (res.ok) {
      setApplied(true);
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow"><span className="num-label">01</span> Кабинет специалиста</p>
        <h1 className="h1 mt-3">AI-импорт профиля</h1>
        <p className="body-lg text-secondary mt-3 max-w-2xl">
          Вставьте текст о себе (из соцсетей, анкеты) — AI структурирует его в
          профиль. Любой интимный/эротический контекст будет удалён.
        </p>
      </header>
      {error && (
        <p className="rounded-xl2 bg-accent-soft border border-line text-accent text-sm px-4 py-3">
          {error}
        </p>
      )}
      <div className="card space-y-4">
        <div>
          <label className="label">Текст о себе</label>
          <textarea
            className="input"
            rows={8}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Например: Я массажист с 8-летним опытом, делаю классический и расслабляющий массаж…"
          />
        </div>
        <button
          className="btn-primary"
          disabled={busy || text.length < 10}
          onClick={run}
        >
          {busy ? "Обработка…" : "Сгенерировать черновик"}
        </button>
      </div>

      {draft && (
        <div className="card space-y-4">
          <div>
            <p className="eyebrow"><span className="num-label">02</span> Результат</p>
            <h2 className="h3 mt-2">Черновик</h2>
          </div>
          <div>
            <p className="small text-secondary">Заголовок</p>
            <p className="serif text-heading text-lg mt-1">{draft.headline}</p>
          </div>
          <p className="body text-body whitespace-pre-line">
            {draft.professional_description}
          </p>
          <div className="flex flex-wrap gap-2">
            {draft.suggested_modalities.map((m) => (
              <span key={m} className="chip">
                {modalityLabel(m)}
              </span>
            ))}
          </div>
          <button className="btn-secondary" onClick={apply} disabled={applied}>
            {applied ? "Применено ✓" : "Применить к профилю"}
          </button>
        </div>
      )}
    </div>
  );
}
