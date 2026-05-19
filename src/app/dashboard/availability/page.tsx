"use client";

import { useEffect, useState } from "react";
import type { LocationMode, TherapistAvailability } from "@/lib/types";

const MODES: { value: LocationMode; label: string; hint: string }[] = [
  {
    value: "current_location",
    label: "Использовать моё текущее местоположение",
    hint: "Браузер спросит геопозицию. Координаты используются только для расчёта расстояния и НЕ показываются клиентам.",
  },
  {
    value: "manual_area",
    label: "Выбрать район вручную",
    hint: "Клиенты увидят только указанный район, без точной точки.",
  },
  {
    value: "saved_service_area",
    label: "Мои сохранённые зоны выезда",
    hint: "Используются районы из вашего профиля.",
  },
  {
    value: "hidden_exact_location",
    label: "Скрыть точное местоположение",
    hint: "Показываем только «работает в районе …», без расстояния.",
  },
];

interface Defaults {
  home_base_area: string | null;
  default_service_radius_km: number;
  travel_districts: string[];
}

function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function AvailabilityPage() {
  const [current, setCurrent] = useState<TherapistAvailability | null>(null);
  const [defaults, setDefaults] = useState<Defaults | null>(null);
  const [mode, setMode] = useState<LocationMode>("hidden_exact_location");
  const [manualArea, setManualArea] = useState("");
  const [start, setStart] = useState("14:00");
  const [end, setEnd] = useState("18:00");
  const [radius, setRadius] = useState(5);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const live =
    current &&
    current.status === "active" &&
    new Date(current.expires_at).getTime() > Date.now();

  async function load() {
    const res = await fetch("/api/dashboard/availability");
    const data = await res.json();
    setCurrent(data.current ?? null);
    setDefaults(data.defaults ?? null);
    if (data.defaults?.default_service_radius_km)
      setRadius(data.defaults.default_service_radius_km);
    if (data.defaults?.home_base_area)
      setManualArea(data.defaults.home_base_area);
  }
  useEffect(() => {
    load();
  }, []);

  function getCoords(): Promise<{ lat: number; lng: number }> {
    return new Promise((resolve, reject) => {
      if (!("geolocation" in navigator))
        return reject(new Error("Геолокация недоступна"));
      navigator.geolocation.getCurrentPosition(
        (p) =>
          resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
        () => reject(new Error("Доступ к геолокации не разрешён")),
        { timeout: 8000, maximumAge: 60000 }
      );
    });
  }

  async function activate(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setBusy(true);
    try {
      const body: Record<string, unknown> = {
        date: today(),
        start_time: start,
        end_time: end,
        location_mode: mode,
        service_radius_km: radius,
      };
      if (mode === "current_location") {
        const c = await getCoords();
        body.latitude = c.lat;
        body.longitude = c.lng;
      }
      if (mode === "manual_area") body.manual_area = manualArea;

      const res = await fetch("/api/dashboard/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error ?? "Не удалось включить доступность");
      } else {
        setMsg("Готово — вы в поиске «Рядом» до " + end);
        await load();
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setBusy(false);
    }
  }

  async function deactivate() {
    setBusy(true);
    setErr(null);
    setMsg(null);
    const res = await fetch("/api/dashboard/availability", {
      method: "DELETE",
    });
    if (res.ok) {
      setMsg("Доступность выключена — вы больше не видны в поиске.");
      await load();
    } else {
      setErr("Не удалось выключить");
    }
    setBusy(false);
  }

  return (
    <div>
      <span className="eyebrow">Доступность</span>
      <h1 className="mt-3 text-2xl font-bold">Доступность «Рядом»</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-muted">
        По умолчанию вас нет в поиске «Рядом». Вы появляетесь там только
        пока вручную включена доступность — и автоматически исчезаете
        после времени окончания. Точный адрес клиентам не показывается
        никогда.
      </p>

      {msg && (
        <p className="mt-4 rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-700">
          {msg}
        </p>
      )}
      {err && (
        <p className="mt-4 rounded-xl border border-clay-100 bg-clay-50 px-4 py-3 text-sm text-clay-600">
          {err}
        </p>
      )}

      {live && current && (
        <div className="card mt-6 border-brand-200 bg-brand-50/50">
          <p className="text-sm font-medium text-brand-800">
            Сейчас активно
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            {current.date}, {current.start_time}–{current.end_time} ·
            режим: {MODES.find((m) => m.value === current.location_mode)
              ?.label ?? current.location_mode}
            {current.approximate_area
              ? ` · район: ${current.approximate_area}`
              : ""}
          </p>
          <button
            onClick={deactivate}
            disabled={busy}
            className="btn-secondary mt-4"
          >
            Выключить доступность
          </button>
        </div>
      )}

      <form onSubmit={activate} className="card mt-6 max-w-2xl">
        <p className="font-serif text-lg font-semibold text-ink">
          {live ? "Обновить доступность" : "Включить доступность"}
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label">Дата</label>
            <input className="input" value={today()} readOnly />
          </div>
          <div>
            <label className="label" htmlFor="st">
              Начало
            </label>
            <input
              id="st"
              type="time"
              className="input"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="et">
              Конец
            </label>
            <input
              id="et"
              type="time"
              className="input"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-6">
          <legend className="label">Как показывать ваше расположение</legend>
          <div className="space-y-2">
            {MODES.map((m) => (
              <label
                key={m.value}
                className="flex cursor-pointer items-start gap-3 rounded-xl border border-sand-200 p-3 text-sm hover:border-sand-300"
              >
                <input
                  type="radio"
                  name="mode"
                  className="mt-0.5"
                  checked={mode === m.value}
                  onChange={() => setMode(m.value)}
                />
                <span>
                  <span className="font-medium text-ink">{m.label}</span>
                  <span className="mt-0.5 block text-xs text-ink-muted">
                    {m.hint}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {mode === "manual_area" && (
          <div className="mt-4">
            <label className="label" htmlFor="ma">
              Район
            </label>
            <input
              id="ma"
              className="input"
              placeholder="например, Центральный"
              value={manualArea}
              onChange={(e) => setManualArea(e.target.value)}
            />
          </div>
        )}

        {mode === "saved_service_area" && defaults && (
          <p className="mt-4 text-xs text-ink-muted">
            Зоны из профиля:{" "}
            {[
              defaults.home_base_area,
              ...(defaults.travel_districts ?? []),
            ]
              .filter(Boolean)
              .join(", ") || "не заданы — добавьте в профиле"}
          </p>
        )}

        <div className="mt-4 max-w-[200px]">
          <label className="label" htmlFor="rad">
            Радиус выезда, км
          </label>
          <input
            id="rad"
            type="number"
            min={1}
            max={50}
            className="input"
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
          />
        </div>

        <button
          type="submit"
          disabled={busy}
          className="btn-primary mt-6"
        >
          {busy
            ? "Включаем…"
            : live
              ? "Обновить"
              : "Включить доступность"}
        </button>
      </form>
    </div>
  );
}
