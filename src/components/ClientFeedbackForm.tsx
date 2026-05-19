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
      <div className="card text-center py-16">
        <span
          aria-hidden
          className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-accent-soft text-accent serif text-3xl"
        >
          ✓
        </span>
        <span className="eyebrow">Готово</span>
        <h2 className="h2 mt-4">Спасибо за отзыв.</h2>
        <p className="body-lg mt-3 max-w-md mx-auto">
          Ваша обратная связь отправлена специалисту. Она не публикуется на
          сайте.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card space-y-6">
      {error && (
        <p className="rounded-[var(--r-control)] bg-accent-soft text-accent text-sm px-4 py-3">
          {error}
        </p>
      )}

      <div className="flex items-baseline gap-3">
        <span className="num-label text-2xl">01</span>
        <div>
          <span className="eyebrow">Оценки</span>
          <h2 className="h3 mt-1">Как всё прошло</h2>
        </div>
      </div>

      {SCORE_FIELDS.map((f) => (
        <div key={f.name}>
          <label className="label">{f.label}</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <label
                key={n}
                className="flex items-center justify-center w-11 h-11 rounded-full border border-line-strong text-body text-sm cursor-pointer transition-colors hover:border-accent has-[:checked]:bg-accent has-[:checked]:text-white has-[:checked]:border-accent"
              >
                <input
                  type="radio"
                  name={f.name}
                  value={n}
                  className="sr-only"
                />
                {n}
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

      <div className="space-y-3 border-t border-line pt-5">
        <button className="btn-primary btn-lg" disabled={busy}>
          {busy ? "Отправка…" : "Отправить обратную связь"}
        </button>
        <p className="small">
          Видно только специалисту. Не публикуется на сайте.
        </p>
      </div>
    </form>
  );
}
