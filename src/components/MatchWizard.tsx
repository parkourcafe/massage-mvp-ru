"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CITIES,
  LOCATION_TYPES,
  MODALITIES,
  PRESSURE_OPTIONS,
} from "@/lib/catalog";

export function MatchWizard() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());
    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Не удалось выполнить подбор");
        setBusy(false);
        return;
      }
      sessionStorage.setItem("mm_match", JSON.stringify(data));
      router.push("/match/results");
    } catch {
      setError("Сетевая ошибка");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <p className="rounded-lg bg-accent-soft text-accent text-sm px-3 py-2">
          {error}
        </p>
      )}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="label">Цель массажа</label>
          <input
            name="massage_goal"
            className="input"
            placeholder="Снять напряжение, восстановиться после нагрузок…"
          />
        </div>
        <div>
          <label className="label">Зона боли / внимания</label>
          <input name="pain_or_focus_area" className="input" />
        </div>
        <div>
          <label className="label">Предпочтительный вид</label>
          <select name="preferred_service_type" className="input" defaultValue="">
            <option value="">Не важно</option>
            {MODALITIES.map((m) => (
              <option key={m.key} value={m.key}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Нажим</label>
          <select name="pressure_preference" className="input" defaultValue="not_sure">
            {PRESSURE_OPTIONS.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Длительность (мин)</label>
          <input name="duration_preference" type="number" className="input" defaultValue={60} />
        </div>
        <div>
          <label className="label">Пол специалиста</label>
          <select
            name="therapist_gender_preference"
            className="input"
            defaultValue="no_preference"
          >
            <option value="no_preference">Не важно</option>
            <option value="female">Женщина</option>
            <option value="male">Мужчина</option>
          </select>
        </div>
        <div>
          <label className="label">Город</label>
          <select name="city" className="input" defaultValue="Москва">
            {CITIES.map((c) => (
              <option key={c.slug} value={c.label}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Район</label>
          <input name="district" className="input" />
        </div>
        <div>
          <label className="label">Формат</label>
          <select name="location_type" className="input" defaultValue="discuss">
            {LOCATION_TYPES.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Нужен выезд к клиенту</label>
          <select name="needs_travel_to_client" className="input" defaultValue="false">
            <option value="false">Нет</option>
            <option value="true">Да</option>
          </select>
        </div>
        <div>
          <label className="label">Дата</label>
          <input name="preferred_date" type="date" className="input" />
        </div>
        <div>
          <label className="label">Время</label>
          <input name="preferred_time" className="input" placeholder="18:00" />
        </div>
        <div>
          <label className="label">Бюджет (₽)</label>
          <input name="budget" type="number" className="input" />
        </div>
        <div>
          <label className="label">Язык</label>
          <input name="language_preference" className="input" placeholder="Русский" />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Важные примечания</label>
          <input name="important_notes" className="input" />
        </div>
        <div className="sm:col-span-2">
          <label className="label">
            Отметки о здоровье / противопоказаниях (необязательно)
          </label>
          <input name="contraindications_or_health_notes" className="input" />
          <p className="text-xs text-secondary mt-1">
            Это не медицинская консультация. При наличии заболеваний
            проконсультируйтесь с врачом.
          </p>
        </div>
      </div>
      <button className="btn-primary" disabled={busy}>
        {busy ? "Подбираем…" : "Подобрать специалистов"}
      </button>
    </form>
  );
}
