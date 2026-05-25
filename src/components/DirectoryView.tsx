import Link from "next/link";
import { ProfileCard } from "@/components/ProfileCard";
import { JsonLd } from "@/components/JsonLd";
import { listPublicProfiles, type DirectoryFilter } from "@/lib/db";
import { CITIES, MODALITIES, PLATFORM_NOTICE } from "@/lib/catalog";
import { breadcrumbJsonLd, faqJsonLd, itemListJsonLd } from "@/lib/jsonld";
import type { LandingContent, RelatedGroup } from "@/lib/landing-content";

export async function DirectoryView({
  title,
  subtitle,
  filter,
  path,
  breadcrumb,
  content,
  related,
  extraSchema,
}: {
  title: string;
  subtitle?: string;
  filter: DirectoryFilter;
  path: string;
  breadcrumb?: { name: string; path: string }[];
  content?: LandingContent;
  related?: RelatedGroup[];
  extraSchema?: object[];
}) {
  const profiles = await listPublicProfiles(filter);
  const todayActive = !!filter.availableToday;
  const toggleHref = todayActive ? path : `${path}?today=1`;
  const crumbs = breadcrumb ?? [
    { name: "Главная", path: "/" },
    { name: "Каталог специалистов", path: "/therapists" },
  ];
  return (
    <div>
      {profiles.length > 0 && (
        <JsonLd
          data={[
            breadcrumbJsonLd(crumbs),
            itemListJsonLd({ name: title, path, profiles }),
            ...(content && content.faq.length > 0
              ? [faqJsonLd(content.faq)]
              : []),
            ...(extraSchema ?? []),
          ]}
        />
      )}

      {/* HEADER */}
      <section className="border-b border-line">
        <div className="container-px py-10">
          <span className="eyebrow">
            Каталог · {profiles.length} специалистов
          </span>
          <div className="mt-4 grid items-end gap-8 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
            <h1 className="h1 m-0">{title}</h1>
            {subtitle && (
              <p className="body-lg mb-2">{subtitle}</p>
            )}
          </div>
          <p className="hot mt-4 text-sm font-medium">{PLATFORM_NOTICE}</p>
        </div>
      </section>

      {/* SPECIALTY CHIPS */}
      <section className="border-b border-line">
        <div className="container-px flex gap-2 overflow-x-auto py-6">
          <Link
            href="/therapists"
            className="chip-brand flex-shrink-0 whitespace-nowrap"
          >
            Все
          </Link>
          {MODALITIES.slice(0, 10).map((m) => (
            <Link
              key={m.key}
              href={`/therapists/${m.slug}`}
              className="chip flex-shrink-0 whitespace-nowrap"
            >
              {m.label}
            </Link>
          ))}
        </div>
      </section>

      {/* BODY */}
      <section className="container-px py-10 pb-20">
        <div className="grid items-start gap-10 lg:grid-cols-[260px_1fr]">
          {/* Sidebar filters */}
          <aside className="lg:sticky lg:top-24 space-y-6">
            <div className="eyebrow">Фильтры</div>

            <div className="border-b border-line pb-6">
              <div className="mb-3 text-xs font-semibold tracking-wide text-heading">
                Доступность
              </div>
              <Link
                href={toggleHref}
                className={
                  todayActive ? "btn-primary btn-sm w-full" : "btn-ghost btn-sm w-full"
                }
              >
                <span
                  aria-hidden
                  className={
                    todayActive
                      ? "h-2 w-2 rounded-full bg-white"
                      : "h-2 w-2 rounded-full bg-accent"
                  }
                />
                {todayActive ? "Сегодня — сбросить" : "Доступны сегодня"}
              </Link>
            </div>

            <div className="border-b border-line pb-6">
              <div className="mb-3 text-xs font-semibold tracking-wide text-heading">
                Города
              </div>
              <div className="flex flex-wrap gap-2">
                {CITIES.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/therapists/${c.slug}`}
                    className="chip flex-shrink-0 whitespace-nowrap"
                  >
                    {c.label}
                  </Link>
                ))}
              </div>
            </div>

            <Link href="/therapists" className="btn-secondary btn-sm w-full">
              Сбросить
            </Link>
          </aside>

          {/* Results */}
          <div>
            <div className="mb-6 flex items-center justify-between gap-4">
              <div className="small">
                {profiles.length === 0 ? (
                  "Каталог пополняется — новые мастера появляются регулярно"
                ) : (
                  <>
                    Показываем{" "}
                    <span className="serif text-base text-heading">
                      {profiles.length}
                    </span>{" "}
                    {profiles.length === 1 ? "специалиста" : "специалистов"}
                  </>
                )}
              </div>
            </div>

            {content && (
              <section className="mb-8 max-w-3xl space-y-3">
                <h2 className="h3">{content.heading}</h2>
                {content.paragraphs.map((t, i) => (
                  <p key={i} className="leading-relaxed text-body">
                    {t}
                  </p>
                ))}
              </section>
            )}

            {profiles.length === 0 ? (
              <div className="surface text-center text-secondary">
                Мы только запускаемся — каталог наполняется каждый день.
                Загляните чуть позже, измените фильтры или{" "}
                <Link
                  href="/match"
                  className="hot font-medium underline underline-offset-2"
                >
                  подберите с помощью AI
                </Link>
                .
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {profiles.map((p) => (
                  <ProfileCard key={p.id} profile={p} source="directory" />
                ))}
              </div>
            )}

            {/* See services link */}
            <div className="surface mt-14 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
              <div>
                <span className="eyebrow">Не уверены, что вам нужно?</span>
                <h3 className="h3 mt-3">
                  Сначала выберите вид массажа — мы покажем специалистов
                </h3>
              </div>
              <Link href="/match" className="btn-primary whitespace-nowrap">
                Подобрать с помощью AI
              </Link>
            </div>

            {content && content.faq.length > 0 && (
              <section className="mt-14 max-w-3xl">
                <span className="eyebrow">FAQ</span>
                <h2 className="h3 mt-3">Частые вопросы</h2>
                <div className="mt-4 space-y-4">
                  {content.faq.map((f, i) => (
                    <div key={i} className="card">
                      <p className="font-medium text-heading">{f.q}</p>
                      <p className="mt-1.5 text-sm leading-relaxed text-secondary">
                        {f.a}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {related && related.length > 0 && (
              <nav
                aria-label="Смотрите также"
                className="mt-14 space-y-5 border-t border-line pt-8"
              >
                {related.map((g) => (
                  <div key={g.title}>
                    <h2 className="text-sm font-semibold text-heading">
                      {g.title}
                    </h2>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {g.links.map((l) => (
                        <Link
                          key={l.href}
                          href={l.href}
                          className="chip"
                        >
                          {l.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </nav>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
