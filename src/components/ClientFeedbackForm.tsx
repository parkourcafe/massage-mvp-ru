"use client";

import { useState } from "react";

const SCORE_FIELDS = [
  { name: "comfort_score", label: "Комфорт во время сеанса" },
  { name: "professionalism_score", label: "Профессионализм" },
  { name: "cleanliness_score", label: "Чистота / гигиена" },
  { name: "punctuality_score", label: "Пунктуальность" },
] as const;

export function ClientFeedbackForm({ token }: { token: string }) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const body: Record<string, unknown> = { token };
    for (const f of SCORE_FIELDS) {
      const v = fd.get(f.name);
      if (v) body[f.name] = Number(v);
    }
    body.pressure_fit = fd.get("pressure_fit") || undefined;
    body.repeat_status = fd.get("repeat_status") || undefined;
    body.comment = (fd.get("comment") as string) || undefined;

    const res = await fetch("/api/client-feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(false);
    if (res.ok) {
      setDone(true);
    } else {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Не удалось отправить. Попробуйте ещё раз.");
    }
  }

  if (done) {
    return (
      <p className="rounded-lg bg-emerald-50 text-emerald-800 text-sm px-4 py-3">
        Спасибо! Ваша обратная связь отправлена специалисту. Она не
        публикуется на сайте.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="card space-y-4">
      {error && (
        <p className="rounded-lg bg-rose-50 text-rose-700 text-sm px-3 py-2">
          {error}
        </p>
      )}

      {SCORE_FIELDS.map((f) => (
        <div key={f.name}>
          <label className="label">{f.label}</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <label
                key={n}
                className="flex items-center gap-1 text-sm cursor-pointer"
              >
                <input type="radio" name={f.name} value={n} /> {n}
              </label>
            ))}
          </div>
        </div>
      ))}

      <div>
        <label className="label">Нажим был</label>
        <select name="pressure_fit" className="input" defaultValue="">
          <option value="">— не указывать —</option>
          <option value="too_soft">Слишком слабый</option>
          <option value="good">В самый раз</option>
          <option value="too_strong">Слишком сильный</option>
        </select>
      </div>

      <div>
        <label className="label">Хотите продолжать?</label>
        <select name="repeat_status" className="input" defaultValue="">
          <option value="">— не указывать —</option>
          <option value="repeat">Да, хочу повторить</option>
          <option value="not_sure">Пока думаю</option>
          <option value="no">Нет</option>
        </select>
      </div>

      <div>
        <label className="label">Комментарий или пожелание</label>
        <textarea
          name="comment"
          rows={3}
          className="input"
          maxLength={2000}
          placeholder="Что понравилось, что улучшить…"
        />
      </div>

      <button className="btn-primary" disabled={busy}>
        {busy ? "Отправка…" : "Отправить обратную связь"}
      </button>
      <p className="text-xs text-slate-500">
        Видно только специалисту. Не публикуется на сайте.
      </p>
    </form>
  );
}
