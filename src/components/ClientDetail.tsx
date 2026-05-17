"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CrmClient } from "@/lib/types";
import { modalityLabel } from "@/lib/catalog";

export function ClientDetail({ client }: { client: CrmClient }) {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);

  async function saveClient(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/dashboard/client", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: client.id,
        repeat_status: fd.get("repeat_status"),
        important_notes: fd.get("important_notes"),
        contraindication_notes: fd.get("contraindication_notes"),
      }),
    });
    setMsg(res.ok ? "Сохранено" : "Ошибка");
    router.refresh();
  }

  async function addSession(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/dashboard/client", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: client.id,
        ...Object.fromEntries(fd.entries()),
      }),
    });
    if (res.ok) {
      (e.target as HTMLFormElement).reset();
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      {msg && (
        <p className="rounded-lg bg-brand-50 text-brand-800 text-sm px-3 py-2">
          {msg}
        </p>
      )}

      <div className="card text-sm grid sm:grid-cols-2 gap-2">
        <p>
          <span className="text-slate-500">Контакт:</span>{" "}
          {client.contact_method ?? "—"}: {client.contact_value ?? "—"}
        </p>
        <p>
          <span className="text-slate-500">Город/район:</span>{" "}
          {[client.city, client.district].filter(Boolean).join(", ") || "—"}
        </p>
        <p>
          <span className="text-slate-500">Любимая услуга:</span>{" "}
          {client.preferred_service_type
            ? modalityLabel(client.preferred_service_type)
            : "—"}
        </p>
        <p>
          <span className="text-slate-500">Любимая длительность:</span>{" "}
          {client.favorite_duration ?? "—"} мин
        </p>
      </div>

      <form onSubmit={saveClient} className="card space-y-3">
        <h2 className="font-semibold">Карточка клиента</h2>
        <div>
          <label className="label">Статус</label>
          <select
            name="repeat_status"
            className="input"
            defaultValue={client.repeat_status}
          >
            {["active", "repeat", "paused", "inactive", "lost"].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Важные примечания</label>
          <textarea
            name="important_notes"
            rows={2}
            className="input"
            defaultValue={client.important_notes ?? ""}
          />
        </div>
        <div>
          <label className="label">
            Примечания о противопоказаниях (без диагнозов)
          </label>
          <textarea
            name="contraindication_notes"
            rows={2}
            className="input"
            defaultValue={client.contraindication_notes ?? ""}
          />
          <p className="text-xs text-slate-500 mt-1">
            Не храните медицинские диагнозы. Это не медицинская консультация.
          </p>
        </div>
        <button className="btn-primary">Сохранить</button>
      </form>

      <div className="card space-y-3">
        <h2 className="font-semibold">История сеансов</h2>
        {(client.sessions ?? []).length === 0 && (
          <p className="text-sm text-slate-500">Сеансов пока нет.</p>
        )}
        {(client.sessions ?? []).map((s) => (
          <div key={s.id} className="border rounded-lg px-3 py-2 text-sm">
            <p className="font-medium">
              {s.session_date} ·{" "}
              {s.service_type ? modalityLabel(s.service_type) : "—"} ·{" "}
              {s.duration ?? "—"} мин
            </p>
            <p className="text-slate-600">Зона: {s.focus_area ?? "—"}</p>
            <p className="text-slate-600">
              Приватная заметка: {s.private_note ?? "—"}
            </p>
            <p className="text-slate-600">
              Рекомендация: {s.next_recommendation ?? "—"}
            </p>
          </div>
        ))}

        <form onSubmit={addSession} className="grid sm:grid-cols-2 gap-3 pt-2 border-t">
          <div>
            <label className="label">Дата</label>
            <input name="session_date" type="date" className="input" />
          </div>
          <div>
            <label className="label">Услуга (ключ)</label>
            <input name="service_type" className="input" placeholder="classic" />
          </div>
          <div>
            <label className="label">Длительность</label>
            <input name="duration" type="number" className="input" />
          </div>
          <div>
            <label className="label">Нажим</label>
            <input name="pressure" className="input" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Зона внимания</label>
            <input name="focus_area" className="input" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Приватная заметка (только для вас)</label>
            <textarea name="private_note" rows={2} className="input" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Что повторить / следующий шаг</label>
            <input name="next_recommendation" className="input" />
          </div>
          <div>
            <button className="btn-secondary">Добавить сеанс</button>
          </div>
        </form>
      </div>
    </div>
  );
}
