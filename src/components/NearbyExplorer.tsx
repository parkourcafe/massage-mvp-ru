"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { NearbyMap } from "@/components/NearbyMap";
import { citiesWithAreas } from "@/lib/geo";
import { MODALITIES } from "@/lib/catalog";
import { buildWhatsAppLink, formatRub } from "@/lib/util";
import type { NearbyCard } from "@/lib/nearby";

type GeoState = "idle" | "asking" | "granted" | "denied";

interface Filters {
  availableNow: boolean;
  massageType: string;
  gender: "" | "female" | "male";
  visit: "" | "villa" | "hotel" | "home" | "own";
  language: string;
  priceMax: string;
}

const EMPTY: Filters = {
  availableNow: false,
  massageType: "",
  gender: "",
  visit: "",
  language: "",
  priceMax: "",
};

export function NearbyExplorer() {
  const cities = useMemo(() => citiesWithAreas(), []);
  const [geo, setGeo] = useState<GeoState>("idle");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [area, setArea] = useState("");
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [cards, setCards] = useState<NearbyCard[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(
    async (
      body: {
        lat?: number;
        lng?: number;
        area?: string;
      },
      f: Filters
    ) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/nearby", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...body,
            filters: {
              availableNow: f.availableNow || undefined,
              massageType: f.massageType || undefined,
              gender: f.gender || undefined,
              visit: f.visit || undefined,
              language: f.language || undefined,
              priceMax: f.priceMax ? Number(f.priceMax) : undefined,
            },
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Не удалось загрузить");
          setCards([]);
        } else {
          setCards(data.cards as NearbyCard[]);
        }
      } catch {
        setError("Сеть недоступна, попробуйте ещё раз");
        setCards([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const askLocation = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setGeo("denied");
      return;
    }
    setGeo("asking");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setCoords(c);
        setGeo("granted");
        search(c, filters);
      },
      () => setGeo("denied"),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, search]);

  // Re-run search when filters change after an initial search.
  useEffect(() => {
    if (cards === null) return;
    if (geo === "granted" && coords) search(coords, filters);
    else if (area) search({ area }, filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const set = <K extends keyof Filters>(k: K, v: Filters[K]) =>
    setFilters((p) => ({ ...p, [k]: v }));

  return (
    <div>
      {/* Location gate */}
      {cards === null && (
        <div className="card mx-auto max-w-xl text-center">
          <h2 className="font-serif text-2xl font-semibold text-ink">
            Найти массаж рядом
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            Покажем проверенных мастеров, которые сейчас работают рядом с
            вами. Точное местоположение мастера никогда не раскрывается —
            только примерное расстояние и зона выезда.
          </p>
          {geo !== "denied" ? (
            <>
              <button
                onClick={askLocation}
                disabled={geo === "asking"}
                className="btn-primary mt-6 w-full sm:w-auto"
              >
                {geo === "asking"
                  ? "Определяем геолокацию…"
                  : "Разрешить геолокацию"}
              </button>
              <button
                onClick={() => setGeo("denied")}
                className="btn-ghost mt-2 w-full text-xs sm:w-auto"
              >
                Выбрать район вручную
              </button>
            </>
          ) : (
            <div className="mt-6 text-left">
              <label className="label" htmlFor="area-pick">
                Ваш район
              </label>
              <select
                id="area-pick"
                className="input"
                value={area}
                onChange={(e) => setArea(e.target.value)}
              >
                <option value="">— выберите район —</option>
                {cities.map((c) => (
                  <optgroup key={c.city} label={c.city}>
                    {c.areas.map((a) => (
                      <option key={a.key} value={a.label}>
                        {a.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <button
                disabled={!area}
                onClick={() => search({ area }, filters)}
                className="btn-primary mt-4 w-full"
              >
                Показать мастеров
              </button>
            </div>
          )}
        </div>
      )}

      {cards !== null && (
        <>
          {/* Filters */}
          <div className="card mb-5 flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-ink-soft">
              <input
                type="checkbox"
                checked={filters.availableNow}
                onChange={(e) => set("availableNow", e.target.checked)}
              />
              Доступны сейчас
            </label>
            <select
              className="input w-auto"
              value={filters.massageType}
              onChange={(e) => set("massageType", e.target.value)}
              aria-label="Услуга"
            >
              <option value="">Услуга: любая</option>
              {MODALITIES.map((m) => (
                <option key={m.key} value={m.key}>
                  {m.label}
                </option>
              ))}
            </select>
            <select
              className="input w-auto"
              value={filters.gender}
              onChange={(e) =>
                set("gender", e.target.value as Filters["gender"])
              }
            >
              <option value="">Пол: любой</option>
              <option value="female">Женщина</option>
              <option value="male">Мужчина</option>
            </select>
            <select
              className="input w-auto"
              value={filters.visit}
              onChange={(e) =>
                set("visit", e.target.value as Filters["visit"])
              }
            >
              <option value="">Формат: любой</option>
              <option value="home">Выезд к клиенту</option>
              <option value="villa">Вилла / загородный дом</option>
              <option value="hotel">Отель</option>
              <option value="own">У мастера</option>
            </select>
            <input
              className="input w-36"
              placeholder="Язык"
              value={filters.language}
              onChange={(e) => set("language", e.target.value)}
            />
            <input
              className="input w-40"
              type="number"
              min={0}
              placeholder="Цена до, ₽"
              value={filters.priceMax}
              onChange={(e) => set("priceMax", e.target.value)}
            />
            {(filters.availableNow ||
              filters.massageType ||
              filters.gender ||
              filters.visit ||
              filters.language ||
              filters.priceMax) && (
              <button
                onClick={() => setFilters(EMPTY)}
                className="btn-ghost text-xs"
              >
                Сбросить
              </button>
            )}
          </div>

          {/* Map */}
          <div className="mb-6 h-[300px]">
            <NearbyMap client={coords} cards={cards} />
          </div>

          {error && (
            <p className="mb-4 rounded-xl border border-clay-100 bg-clay-50 px-4 py-3 text-sm text-clay-600">
              {error}
            </p>
          )}

          {loading && (
            <p className="py-8 text-center text-sm text-ink-muted">
              Ищем мастеров рядом…
            </p>
          )}

          {!loading && cards.length === 0 && (
            <div className="card text-center text-sm text-ink-muted">
              Сейчас рядом нет активных мастеров. Мастера появляются здесь
              только когда сами включают доступность — загляните позже или
              расширьте район.
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {cards.map((c) => (
              <NearbyCardView key={c.profile_id} c={c} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function NearbyCardView({ c }: { c: NearbyCard }) {
  const wa = buildWhatsAppLink(
    c.whatsapp,
    `Здравствуйте! Хочу записаться на массаж.\n\nМастер: ${c.full_name}\nЗона: ${c.area_label}\nПлатформа: MassageMatch`
  );
  return (
    <article className="card flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-sand-200">
          {c.photo_url && (
            <img
              src={c.photo_url}
              alt={c.full_name}
              className="h-full w-full object-cover"
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-serif text-lg font-semibold text-ink">
              {c.full_name}
            </h3>
            {c.verified && (
              <span className="chip-brand shrink-0">✓ проверен</span>
            )}
          </div>
          <p className="mt-0.5 truncate text-xs text-ink-muted">
            {c.massage_types.join(" · ") || "Профессиональный массаж"}
          </p>
          {c.years_experience > 0 && (
            <p className="mt-0.5 text-xs text-ink-muted">
              {c.years_experience} лет опыта
            </p>
          )}
          <p className="mt-1 text-xs text-ink-soft">
            {c.available_now ? (
              <span className="font-medium text-brand-700">
                Доступен сейчас
              </span>
            ) : (
              <span>Сегодня</span>
            )}{" "}
            · до {c.available_until}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-soft">
        <span>
          {c.approx_distance_km != null
            ? `≈ ${c.approx_distance_km} км от вас`
            : "Обслуживает ваш район"}
        </span>
        {c.arrival_min != null && (
          <span>
            Приедет за {c.arrival_min}–{c.arrival_max} мин
          </span>
        )}
        <span>Зона: {c.area_label}</span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-ink">
          {c.price_from != null
            ? `от ${formatRub(c.price_from)}`
            : "цена по запросу"}
        </span>
        {c.visit_types[0] && (
          <span className="chip">{c.visit_types[0]}</span>
        )}
      </div>

      <div className="mt-1 flex gap-2">
        <Link
          href={`/therapist/${c.slug}`}
          className="btn-secondary flex-1 text-center text-sm"
        >
          Профиль
        </Link>
        {wa ? (
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary flex-1 text-center text-sm"
          >
            Записаться в WhatsApp
          </a>
        ) : (
          <Link
            href={`/therapist/${c.slug}`}
            className="btn-primary flex-1 text-center text-sm"
          >
            Записаться
          </Link>
        )}
      </div>
    </article>
  );
}
