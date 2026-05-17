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
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">AI-импорт профиля</h1>
      <p className="text-sm text-slate-600">
        Вставьте текст о себе (из соцсетей, анкеты) — AI структурирует его в
        профиль. Любой интимный/эротический контекст будет удалён.
      </p>
      {error && (
        <p className="rounded-lg bg-red-50 text-red-700 text-sm px-3 py-2">
          {error}
        </p>
      )}
      <textarea
        className="input"
        rows={8}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Например: Я массажист с 8-летним опытом, делаю классический и расслабляющий массаж…"
      />
      <button className="btn-primary" disabled={busy || text.length < 10} onClick={run}>
        {busy ? "Обработка…" : "Сгенерировать черновик"}
      </button>

      {draft && (
        <div className="card space-y-3">
          <h2 className="font-semibold">Черновик</h2>
          <p>
            <span className="text-slate-500 text-sm">Заголовок:</span>{" "}
            {draft.headline}
          </p>
          <p className="text-sm whitespace-pre-line">
            {draft.professional_description}
          </p>
          <div className="flex flex-wrap gap-1">
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
