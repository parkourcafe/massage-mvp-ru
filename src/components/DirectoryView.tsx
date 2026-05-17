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
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      {subtitle && <p className="mt-1 text-slate-600">{subtitle}</p>}
      <p className="mt-2 text-sm text-brand-700">{PLATFORM_NOTICE}</p>

      {content && (
        <section className="mt-6 max-w-3xl space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">
            {content.heading}
          </h2>
          {content.paragraphs.map((t, i) => (
            <p key={i} className="text-slate-700">
              {t}
            </p>
          ))}
        </section>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        <Link href="/therapists" className="chip hover:bg-brand-100">
          Все
        </Link>
        {MODALITIES.slice(0, 10).map((m) => (
          <Link
            key={m.key}
            href={`/therapists/${m.slug}`}
            className="chip hover:bg-brand-100"
          >
            {m.label}
          </Link>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {CITIES.map((c) => (
          <Link
            key={c.slug}
            href={`/therapists/${c.slug}`}
            className="chip hover:bg-brand-100"
          >
            {c.label}
          </Link>
        ))}
      </div>

      {profiles.length === 0 ? (
        <p className="mt-10 text-slate-500">
          По заданным условиям специалисты не найдены. Попробуйте изменить
          фильтры или{" "}
          <Link href="/match" className="text-brand-700 underline">
            подобрать с помощью AI
          </Link>
          .
        </p>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {profiles.map((p) => (
            <ProfileCard key={p.id} profile={p} source="directory" />
          ))}
        </div>
      )}

      {content && content.faq.length > 0 && (
        <section className="mt-12 max-w-3xl">
          <h2 className="text-lg font-semibold text-slate-900">
            Частые вопросы
          </h2>
          <div className="mt-3 space-y-3">
            {content.faq.map((f, i) => (
              <div key={i}>
                <p className="font-medium text-slate-800">{f.q}</p>
                <p className="text-sm text-slate-600">{f.a}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {related && related.length > 0 && (
        <nav
          aria-label="Смотрите также"
          className="mt-12 border-t pt-8 space-y-5"
        >
          {related.map((g) => (
            <div key={g.title}>
              <h2 className="text-sm font-semibold text-slate-900">
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
