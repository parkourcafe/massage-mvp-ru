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

export default async function ExamplesPage() {
  const profiles = (await listPublicProfiles()).slice(0, 4);
  return (
    <div className="container-px py-24">
      <div className="eyebrow">
        <span className="num-label">02</span> Примеры
      </div>
      <h1 className="h1 mt-6">Так выглядит сильный профиль.</h1>
      <p className="body-lg mt-6 max-w-xl">
        Чем выше показатель качества, тем выше позиции и SEO-видимость.
      </p>
      <div className="mt-16 grid gap-6 md:grid-cols-2">
        {profiles.map((p) => {
          const q = computeQualityScore(p);
          return (
            <div key={p.id} className="card-interactive flex flex-col">
              <div className="flex items-center justify-between gap-3">
                <Link
                  href={`/therapist/${p.slug}`}
                  className="h3 hover:text-accent transition-colors"
                >
                  {p.full_name}
                </Link>
                <span className="badge">Качество {q.score}/100</span>
              </div>
              <p className="body-lg mt-2">{p.headline}</p>
              <ul className="mt-4 text-xs grid grid-cols-2 gap-1.5">
                {q.parts.map((part) => (
                  <li
                    key={part.key}
                    className={part.ok ? "text-accent" : "text-secondary"}
                  >
                    {part.ok ? "✓" : "○"} {part.label}
                  </li>
                ))}
              </ul>
              <Link
                href={`/therapist/${p.slug}`}
                className="btn-secondary btn-sm mt-6 self-start"
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
