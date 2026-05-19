import Link from "next/link";
import type { Metadata } from "next";
import { MODALITIES, PLATFORM_NOTICE, SAFETY_RULES } from "@/lib/catalog";
import { listPublicProfiles } from "@/lib/db";
import { ProfileCard } from "@/components/ProfileCard";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Профессиональный массаж — подбор специалиста",
  description:
    "AI-платформа для независимых профессиональных массажистов. Найдите проверенного специалиста или подберите с помощью AI.",
  path: "/",
});

const TRUST = [
  {
    title: "Только оздоровление",
    text: "Лечебный и расслабляющий массаж. Без эротического и «специального» контента.",
  },
  {
    title: "Проверенные профили",
    text: "Модерация, профессиональные границы и безопасность у каждого специалиста.",
  },
  {
    title: "Бронь онлайн",
    text: "Свободные окна видно сразу — запись подтверждается без долгих переписок.",
  },
  {
    title: "AI-подбор",
    text: "Опишите задачу — AI предложит подходящих специалистов и техники.",
  },
];

export default async function HomePage() {
  const featured = (await listPublicProfiles()).slice(0, 3);
  return (
    <div>
      <section className="bg-calm-hero">
        <div className="container-px py-20 sm:py-28">
          <div className="max-w-3xl">
            <span className="eyebrow">Профессиональный массаж</span>
            <h1 className="mt-5 text-4xl sm:text-6xl font-bold leading-[1.05]">
              Спокойствие тела начинается с правильного специалиста
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-ink-soft max-w-2xl">
              Каталог независимых сертифицированных массажистов. Подберите
              вручную или с помощью AI, сохраните в избранное и запишитесь на
              свободное время прямо на платформе.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/nearby" className="btn-accent">
                Найти массаж рядом
              </Link>
              <Link href="/match" className="btn-secondary">
                Подобрать с AI
              </Link>
              <Link href="/therapists" className="btn-secondary">
                Смотреть каталог
              </Link>
            </div>
            <p className="mt-7 text-sm font-medium text-brand-700">
              {PLATFORM_NOTICE}
            </p>
          </div>
        </div>
      </section>

      <section className="container-px py-14">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST.map((t) => (
            <div key={t.title} className="surface">
              <p className="font-serif text-lg font-semibold text-ink">
                {t.title}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                {t.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-px py-6">
        <span className="eyebrow">Направления</span>
        <h2 className="mt-3 text-2xl font-semibold">Виды массажа</h2>
        <div className="mt-5 flex flex-wrap gap-2.5">
          {MODALITIES.map((m) => (
            <Link
              key={m.key}
              href={`/therapists/${m.slug}`}
              className="chip-brand transition-colors hover:bg-brand-100"
            >
              {m.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="container-px py-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="eyebrow">Специалисты</span>
            <h2 className="mt-3 text-2xl font-semibold">
              Рекомендуем присмотреться
            </h2>
          </div>
          <Link
            href="/therapists"
            className="text-sm font-medium text-brand-700 hover:text-brand-800 whitespace-nowrap"
          >
            Все специалисты →
          </Link>
        </div>
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <ProfileCard key={p.id} profile={p} />
          ))}
        </div>
      </section>

      <section className="container-px py-14">
        <div className="surface bg-brand-50/70 border-brand-100">
          <span className="eyebrow">Безопасность</span>
          <h2 className="mt-3 text-xl font-semibold text-brand-900">
            Профессиональные стандарты
          </h2>
          <ul className="mt-5 grid gap-x-8 gap-y-2.5 sm:grid-cols-2 text-sm text-ink-soft">
            {SAFETY_RULES.map((r) => (
              <li key={r} className="flex gap-2.5">
                <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
