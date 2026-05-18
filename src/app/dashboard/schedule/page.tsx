"use client";

import { useEffect, useState } from "react";
import type { AvailabilitySlot } from "@/lib/types";
import { formatSlot } from "@/lib/util";

export default function SchedulePage() {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const res = await fetch("/api/dashboard/schedule");
    const data = await res.json();
    setSlots(data.slots ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  async function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formEl = e.currentTarget;
    const fd = new FormData(formEl);
    setBusy(true);
    try {
      const res = await fetch("/api/dashboard/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: fd.get("date"),
          time: fd.get("time"),
          duration: fd.get("duration"),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Не удалось добавить слот");
        return;
      }
      formEl.reset();
      load();
    } finally {
      setBusy(false);
    }
  }

  async function remove(slot_id: string) {
    const res = await fetch("/api/dashboard/schedule", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slot_id }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Не удалось удалить слот");
      return;
    }
    setError(null);
    load();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Расписание</h1>
      <p className="text-sm text-slate-600">
        Опубликуйте свободные окна — клиенты смогут забронировать конкретное
        время в один клик, и оно сразу подтвердится. Занятые слоты удалить
        нельзя.
      </p>

      {error && (
        <p className="rounded-lg bg-red-50 text-red-700 text-sm px-3 py-2">
          {error}
        </p>
      )}

      <form onSubmit={add} className="card grid sm:grid-cols-4 gap-3">
        <div>
          <label className="label">Дата</label>
          <input name="date" type="date" required className="input" />
        </div>
        <div>
          <label className="label">Время</label>
          <input name="time" type="time" required className="input" />
        </div>
        <div>
          <label className="label">Длительность (мин)</label>
          <input
            name="duration"
            type="number"
            min={30}
            step={15}
            defaultValue={60}
            className="input"
          />
        </div>
        <div className="flex items-end">
          <button className="btn-primary w-full" disabled={busy}>
            {busy ? "Добавление…" : "Добавить слот"}
          </button>
        </div>
      </form>

      <div className="space-y-2">
        {slots.map((s) => (
          <div
            key={s.id}
            className="card flex items-center justify-between py-3"
          >
            <div>
              <p className="text-sm font-medium text-slate-900">
                {formatSlot(s.starts_at)}
              </p>
              <p className="text-xs text-slate-500">
                {s.duration} мин ·{" "}
                {s.status === "booked" ? (
                  <span className="text-amber-700">забронировано</span>
                ) : (
                  <span className="text-brand-700">свободно</span>
                )}
              </p>
            </div>
            {s.status === "open" ? (
              <button
                onClick={() => remove(s.id)}
                className="text-red-600 text-xs"
              >
                Удалить
              </button>
            ) : (
              <span className="text-xs text-slate-400">занят клиентом</span>
            )}
          </div>
        ))}
        {slots.length === 0 && (
          <p className="text-sm text-slate-500">
            Пока нет опубликованных окон. Добавьте первое — и вы появитесь в
            фильтре «Доступны сегодня».
          </p>
        )}
      </div>
    </div>
  );
}
