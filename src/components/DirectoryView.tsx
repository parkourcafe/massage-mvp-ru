import Link from "next/link";
import { ProfileCard } from "@/components/ProfileCard";
import { JsonLd } from "@/components/JsonLd";
import { listPublicProfiles, type DirectoryFilter } from "@/lib/db";
import { CITIES, MODALITIES, PLATFORM_NOTICE } from "@/lib/catalog";
import { breadcrumbJsonLd, itemListJsonLd } from "@/lib/jsonld";

export async function DirectoryView({
  title,
  subtitle,
  filter,
  path,
  breadcrumb,
}: {
  title: string;
  subtitle?: string;
  filter: DirectoryFilter;
  path: string;
  breadcrumb?: { name: string; path: string }[];
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
          ]}
        />
      )}
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      {subtitle && <p className="mt-1 text-slate-600">{subtitle}</p>}
      <p className="mt-2 text-sm text-brand-700">{PLATFORM_NOTICE}</p>

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
    </div>
  );
}
