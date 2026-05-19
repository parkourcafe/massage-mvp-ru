"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FavoriteButton } from "./FavoriteButton";
import { formatRub } from "@/lib/util";

type Result = {
  profileId: string;
  slug: string;
  name: string;
  city: string | null;
  district: string | null;
  price: number | null;
  score: number;
  reasons: string[];
  risks: string[];
  serviceRecommendation: string;
  why: string;
};

export function MatchResultsView() {
  const [data, setData] = useState<{
    results: Result[];
    disclaimer: string;
  } | null>(null);
  const [empty, setEmpty] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("mm_match");
      if (!raw) {
        setEmpty(true);
        return;
      }
      setData(JSON.parse(raw));
    } catch {
      setEmpty(true);
    }
  }, []);

  if (empty)
    return (
      <p className="text-body">
        Нет результатов.{" "}
        <Link href="/match" className="text-accent hover:underline">
          Пройти анкету
        </Link>
        .
      </p>
    );

  if (!data) return <p className="text-secondary">Загрузка…</p>;

  if (data.results.length === 0)
    return (
      <p className="text-body">
        Подходящих специалистов не найдено. Попробуйте смягчить условия в{" "}
        <Link href="/match" className="text-accent hover:underline">
          анкете
        </Link>
        .
      </p>
    );

  return (
    <div className="space-y-4">
      <p className="text-xs text-secondary">{data.disclaimer}</p>
      {data.results.map((r) => (
        <div key={r.profileId} className="card space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <Link
              href={`/therapist/${r.slug}`}
              className="h3 hover:text-accent transition-colors"
            >
              {r.name}
            </Link>
            <span className="badge">Совпадение {r.score}%</span>
          </div>
          <p className="text-sm text-secondary">
            {[r.city, r.district].filter(Boolean).join(", ")} · от{" "}
            {formatRub(r.price)}
          </p>
          <p className="text-sm text-body">{r.why}</p>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div>
              <p className="font-medium text-accent">Почему подходит</p>
              <ul className="list-disc list-inside text-body">
                {r.reasons.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-medium text-secondary">Что уточнить</p>
              <ul className="list-disc list-inside text-body">
                {r.risks.length ? (
                  r.risks.map((x, i) => <li key={i}>{x}</li>)
                ) : (
                  <li>Существенных рисков не выявлено</li>
                )}
              </ul>
            </div>
          </div>
          <p className="text-sm text-body">
            <span className="text-secondary">Рекомендуемая услуга:</span>{" "}
            {r.serviceRecommendation}
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href={`/therapist/${r.slug}/booking`} className="btn-primary">
              Записаться
            </Link>
            <Link
              href={`/therapist/${r.slug}/booking?intent=message`}
              className="btn-secondary"
            >
              Написать специалисту
            </Link>
            <FavoriteButton
              profileId={r.profileId}
              source="match"
              matchScore={r.score}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
