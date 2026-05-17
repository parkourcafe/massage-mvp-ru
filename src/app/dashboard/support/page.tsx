"use client";

import { useState } from "react";
import { CONTACT_METHODS, SUPPORT_TOPICS } from "@/lib/catalog";

export default function SupportPage() {
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(fd.entries())),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Ошибка отправки");
      return;
    }
    setDone(true);
  }

  if (done)
    return (
      <div className="card">
        <h1 className="text-xl font-bold">Помощь менеджера</h1>
        <p className="mt-2 text-emerald-700">
          Заявка отправлена. Менеджер свяжется с вами в указанное время.
        </p>
      </div>
    );

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Помощь менеджера</h1>
      <p className="text-sm text-slate-600">
        Поможем заполнить профиль, загрузить сертификаты, оформить услуги и
        подключить тариф.
      </p>
      {error && (
        <p className="rounded-lg bg-red-50 text-red-700 text-sm px-3 py-2">
          {error}
        </p>
      )}
      <form onSubmit={submit} className="card grid sm:grid-cols-2 gap-3">
        <div>
          <label className="label">Имя</label>
          <input name="name" required className="input" />
        </div>
        <div>
          <label className="label">Способ связи</label>
          <select name="contact_method" className="input">
            {CONTACT_METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Контакт</label>
          <input name="contact_value" className="input" />
        </div>
        <div>
          <label className="label">Удобное время связи</label>
          <input name="preferred_contact_time" className="input" />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Тема</label>
          <select name="topic" className="input">
            {SUPPORT_TOPICS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="label">Сообщение</label>
          <textarea name="message" rows={3} className="input" />
        </div>
        <div>
          <button className="btn-primary" disabled={busy}>
            {busy ? "Отправка…" : "Отправить заявку"}
          </button>
        </div>
      </form>
    </div>
  );
}
