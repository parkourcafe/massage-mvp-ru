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
      <div className="card bg-gradient-to-br from-accent to-plum-700 border-line-strong max-w-xl">
        <p className="eyebrow text-white/65">Поддержка</p>
        <h1 className="h2 mt-2 text-white">Помощь менеджера</h1>
        <p className="mt-3 text-white/85">
          Заявка отправлена. Менеджер свяжется с вами в указанное время.
        </p>
      </div>
    );

  return (
    <div className="space-y-10">
      <div>
        <p className="eyebrow">Кабинет · поддержка</p>
        <h1 className="h1 mt-3">Помощь менеджера</h1>
        <p className="mt-3 text-body body-lg">
          Поможем заполнить профиль, загрузить сертификаты, оформить услуги и
          подключить тариф.
        </p>
      </div>
      {error && (
        <p className="rounded-lg bg-accent-soft border border-line text-accent text-sm px-4 py-3">
          {error}
        </p>
      )}
      <form onSubmit={submit} className="card grid sm:grid-cols-2 gap-5">
        <div className="sm:col-span-2">
          <p className="eyebrow text-secondary">Заявка в поддержку</p>
          <hr className="rule mt-4" />
        </div>
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
