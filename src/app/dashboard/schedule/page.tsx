"use client";

import { useEffect, useState } from "react";
import type { AvailabilitySlot } from "@/lib/types";
import { formatSlot } from "@/lib/util";

export default function SchedulePage() {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(0);

  async function load() {
    const res = await fetch("/api/dashboard/schedule");
    const data = await res.json();
    setSlots(data.slots ?? []);
  }
  useEffect(() => {
    load();
    setNow(Date.now());
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
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Календарь · свободные окна</p>
          <h1 className="h1 mt-3">Расписание</h1>
          <p className="small mt-3 max-w-xl">
            Опубликуйте свободные окна — клиенты смогут забронировать конкретное
            время в один клик, и оно сразу подтвердится. Занятые слоты удалить
            нельзя.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="card px-5 py-4 text-center">
            <p className="eyebrow text-secondary">Окон</p>
            <p className="num-label text-3xl mt-1">{slots.length}</p>
          </div>
          <div className="card px-5 py-4 text-center bg-accent-soft border-accent">
            <p className="eyebrow text-secondary">Свободно</p>
            <p className="num-label text-3xl mt-1 text-accent">
              {slots.filter((s) => s.status === "open").length}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <p className="rounded-xl bg-accent-soft text-mag-300 text-sm px-4 py-3 border border-line">
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

      <div className="card p-0 overflow-hidden">
        {slots.map((s, i) => {
          const booked = s.status === "booked";
          const start = new Date(s.starts_at).getTime();
          const end = start + (s.duration ?? 0) * 60_000;
          const isNow = booked && now >= start && now < end;
          return (
            <div
              key={s.id}
              className={`relative flex items-center justify-between gap-4 px-6 py-5 ${
                i === slots.length - 1 ? "" : "border-b border-line"
              } ${
                isNow
                  ? "bg-accent-soft border-l-2 border-accent"
                  : booked
                    ? "bg-surface"
                    : ""
              }`}
            >
              <div className="flex items-center gap-4">
                <span
                  className={`chip ${
                    isNow
                      ? "bg-accent text-white"
                      : booked
                        ? "bg-surface text-secondary line-through"
                        : ""
                  }`}
                >
                  {formatSlot(s.starts_at)}
                </span>
                <div>
                  <p className="text-sm text-heading serif">
                    {s.duration} мин
                  </p>
                  <p className="text-xs">
                    {isNow ? (
                      <span className="text-accent font-semibold">сейчас</span>
                    ) : booked ? (
                      <span className="text-secondary">забронировано</span>
                    ) : (
                      <span className="text-accent">свободно</span>
                    )}
                  </p>
                </div>
              </div>
              {s.status === "open" ? (
                <button
                  onClick={() => remove(s.id)}
                  className="text-mag-300 text-xs hover:underline"
                >
                  Удалить
                </button>
              ) : (
                <span className="text-xs text-secondary">занят клиентом</span>
              )}
            </div>
          );
        })}
        {slots.length === 0 && (
          <p className="text-sm text-secondary px-6 py-10 text-center">
            Пока нет опубликованных окон. Добавьте первое — и вы появитесь в
            фильтре «Доступны сегодня».
          </p>
        )}
      </div>
    </div>
  );
}
