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

export default async function HomePage() {
  const featured = (await listPublicProfiles()).slice(0, 3);
  return (
    <div>
      <section className="bg-gradient-to-b from-brand-50 to-slate-50">
        <div className="container-px py-16 text-center">
          <h1 className="text-3xl sm:text-5xl font-bold text-slate-900 max-w-3xl mx-auto">
            Профессиональный массаж рядом с вами
          </h1>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            Независимые сертифицированные массажисты. Подберите специалиста
            вручную или с помощью AI, сохраните в избранное и запишитесь на
            сеанс прямо на платформе.
          </p>
          <div className="mt-8 flex justify-center gap-3 flex-wrap">
            <Link href="/match" className="btn-primary">
              Подобрать с AI
            </Link>
            <Link href="/therapists" className="btn-secondary">
              Каталог специалистов
            </Link>
          </div>
          <p className="mt-6 text-sm text-brand-700 font-medium">
            {PLATFORM_NOTICE}
          </p>
        </div>
      </section>

      <section className="container-px py-12">
        <h2 className="text-xl font-semibold text-slate-900">
          Виды массажа
        </h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {MODALITIES.map((m) => (
            <Link
              key={m.key}
              href={`/therapists/${m.slug}`}
              className="chip hover:bg-brand-100"
            >
              {m.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="container-px py-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">
            Специалисты
          </h2>
          <Link href="/therapists" className="text-sm text-brand-700">
            Все специалисты →
          </Link>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <ProfileCard key={p.id} profile={p} />
          ))}
        </div>
      </section>

      <section className="container-px py-12">
        <div className="card bg-brand-50 border-brand-100">
          <h2 className="text-lg font-semibold text-brand-800">
            Профессиональные стандарты и безопасность
          </h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2 text-sm text-slate-700 list-disc list-inside">
            {SAFETY_RULES.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
