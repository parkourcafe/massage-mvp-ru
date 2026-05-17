import type { Metadata } from "next";
import Link from "next/link";
import { listPublicProfiles } from "@/lib/db";
import { computeQualityScore } from "@/lib/quality";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Примеры профилей",
  description:
    "Примеры качественно заполненных профилей профессиональных массажистов.",
  path: "/examples",
});

export default function ExamplesPage() {
  const profiles = listPublicProfiles().slice(0, 4);
  return (
    <div className="container-px py-10">
      <h1 className="text-2xl font-bold text-slate-900">Примеры профилей</h1>
      <p className="mt-1 text-slate-600">
        Так выглядит сильный профиль специалиста. Чем выше показатель качества,
        тем выше позиции и SEO-видимость.
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {profiles.map((p) => {
          const q = computeQualityScore(p);
          return (
            <div key={p.id} className="card">
              <div className="flex items-center justify-between">
                <Link
                  href={`/therapist/${p.slug}`}
                  className="font-semibold hover:text-brand-700"
                >
                  {p.full_name}
                </Link>
                <span className="badge bg-brand-100 text-brand-800">
                  Качество {q.score}/100
                </span>
              </div>
              <p className="text-sm text-slate-600 mt-1">{p.headline}</p>
              <ul className="mt-3 text-xs grid grid-cols-2 gap-1">
                {q.parts.map((part) => (
                  <li
                    key={part.key}
                    className={part.ok ? "text-emerald-700" : "text-slate-400"}
                  >
                    {part.ok ? "✓" : "○"} {part.label}
                  </li>
                ))}
              </ul>
              <Link
                href={`/therapist/${p.slug}`}
                className="btn-secondary mt-4"
              >
                Смотреть профиль
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
