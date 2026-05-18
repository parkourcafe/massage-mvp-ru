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
    <div className="container-px py-10">
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
      <span className="eyebrow">Каталог</span>
      <h1 className="mt-3 text-3xl sm:text-4xl font-bold">{title}</h1>
      {subtitle && (
        <p className="mt-2 text-lg text-ink-soft">{subtitle}</p>
      )}
      <p className="mt-3 text-sm font-medium text-brand-700">
        {PLATFORM_NOTICE}
      </p>

      <div className="mt-6">
        <Link
          href={toggleHref}
          className={
            todayActive
              ? "btn bg-brand-700 text-white shadow-soft hover:bg-brand-800"
              : "btn border border-brand-300 bg-white text-brand-800 hover:border-brand-400 hover:bg-brand-50"
          }
        >
          <span
            aria-hidden
            className={
              todayActive
                ? "h-2 w-2 rounded-full bg-white"
                : "h-2 w-2 rounded-full bg-brand-500"
            }
          />
          {todayActive ? "Доступны сегодня — сбросить" : "Доступны сегодня"}
        </Link>
      </div>

      {content && (
        <section className="mt-8 max-w-3xl space-y-3">
          <h2 className="text-xl font-semibold">{content.heading}</h2>
          {content.paragraphs.map((t, i) => (
            <p key={i} className="leading-relaxed text-ink-soft">
              {t}
            </p>
          ))}
        </section>
      )}

      <div className="mt-8 flex flex-wrap gap-2">
        <Link href="/therapists" className="chip-brand hover:bg-brand-100">
          Все
        </Link>
        {MODALITIES.slice(0, 10).map((m) => (
          <Link
            key={m.key}
            href={`/therapists/${m.slug}`}
            className="chip hover:bg-sand-200"
          >
            {m.label}
          </Link>
        ))}
      </div>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {CITIES.map((c) => (
          <Link
            key={c.slug}
            href={`/therapists/${c.slug}`}
            className="chip hover:bg-sand-200"
          >
            {c.label}
          </Link>
        ))}
      </div>

      {profiles.length === 0 ? (
        <div className="surface mt-10 text-center text-ink-muted">
          По заданным условиям специалисты не найдены. Попробуйте изменить
          фильтры или{" "}
          <Link
            href="/match"
            className="font-medium text-brand-700 underline underline-offset-2"
          >
            подобрать с помощью AI
          </Link>
          .
        </div>
      ) : (
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {profiles.map((p) => (
            <ProfileCard key={p.id} profile={p} source="directory" />
          ))}
        </div>
      )}

      {content && content.faq.length > 0 && (
        <section className="mt-14 max-w-3xl">
          <span className="eyebrow">FAQ</span>
          <h2 className="mt-3 text-xl font-semibold">Частые вопросы</h2>
          <div className="mt-4 space-y-4">
            {content.faq.map((f, i) => (
              <div key={i} className="surface">
                <p className="font-medium text-ink">{f.q}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
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
          className="mt-14 border-t border-sand-200 pt-8 space-y-5"
        >
          {related.map((g) => (
            <div key={g.title}>
              <h2 className="text-sm font-semibold text-ink">
                {g.title}
              </h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {g.links.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="chip hover:bg-brand-100"
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
  );
}
