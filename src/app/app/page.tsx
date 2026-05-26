import Link from "next/link";
import type { Metadata } from "next";
import { MODALITIES, SAFETY_RULES, modalityLabel } from "@/lib/catalog";
import { listOpenSlots, listPublicProfiles } from "@/lib/db";
import type { Profile } from "@/lib/types";
import { formatRub, formatSlot, isSameDay } from "@/lib/util";
import { pageMetadata } from "@/lib/seo";
import { InstallPWA } from "@/components/InstallPWA";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: "Приложение — мастера рядом",
  description:
    "Мобильный вид платформы: проверенные массажисты, свободные окна сегодня и AI-подбор под вашу задачу.",
  path: "/app",
});

function priceFrom(p: Profile): number | null {
  if (p.price_from != null) return p.price_from;
  const prices = (p.services ?? [])
    .map((s) => s.price ?? Infinity)
    .filter((n) => Number.isFinite(n));
  return prices.length ? Math.min(...prices) : null;
}

const PinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-3.5 w-3.5">
    <path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-[18px] w-[18px]">
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.3-4.3" />
  </svg>
);

const TABS: { href: string; label: string; central?: boolean; icon: JSX.Element }[] = [
  {
    href: "/app",
    label: "Главная",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-[22px] w-[22px]">
        <path d="M3 11l9-8 9 8" />
        <path d="M5 10v10h14V10" />
      </svg>
    ),
  },
  {
    href: "/therapists",
    label: "Каталог",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-[22px] w-[22px]">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.3-4.3" />
      </svg>
    ),
  },
  {
    href: "/match",
    label: "Подбор",
    central: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
        <path d="M12 5v14M5 12h14" />
      </svg>
    ),
  },
  {
    href: "/favorites",
    label: "Избранное",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-[22px] w-[22px]">
        <path d="M12 21s-7-4.6-9.2-9A5 5 0 0 1 12 6a5 5 0 0 1 9.2 6c-2.2 4.4-9.2 9-9.2 9Z" />
      </svg>
    ),
  },
  {
    href: "/dashboard",
    label: "Кабинет",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-[22px] w-[22px]">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c1.6-4 5-6 8-6s6.4 2 8 6" />
      </svg>
    ),
  },
];

export default async function MobileAppPage() {
  const profiles = await listPublicProfiles();
  const featured = profiles.slice(0, 6);

  const enriched = await Promise.all(
    profiles.slice(0, 12).map(async (p) => {
      const slots = await listOpenSlots(p.id);
      return {
        p,
        next: slots[0] ?? null,
        today: slots.some((s) => isSameDay(new Date(s.starts_at), new Date())),
      };
    })
  );
  const freeToday = enriched.filter((e) => e.today).slice(0, 4);

  return (
    <div className="mx-auto min-h-screen max-w-[460px] pb-28">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-4">
        <Link
          href="/therapists"
          className="flex items-center gap-2 text-body transition-colors hover:text-heading"
        >
          <span className="hot">
            <PinIcon />
          </span>
          <span className="text-left">
            <span className="block text-[10px] tracking-[0.16em] text-secondary">
              МОСКВА · САНКТ-ПЕТЕРБУРГ
            </span>
            <span className="block text-[13px] font-medium text-heading">
              Все районы ▾
            </span>
          </span>
        </Link>
        <Link
          href="/dashboard"
          aria-label="Кабинет"
          className="grid h-9 w-9 place-items-center rounded-full border border-line-strong text-heading"
        >
          <span className="font-serif text-sm">Я</span>
        </Link>
      </div>

      {/* Install app */}
      <InstallPWA />

      {/* Greeting */}
      <div className="px-5 pb-2 pt-5">
        <h1 className="serif text-[34px] leading-none text-heading">
          Найдите своего
          <br />
          мастера.
        </h1>
        <p className="mt-2.5 text-sm text-body">
          {profiles.length} проверенных мастеров · оплата только мастеру
        </p>
      </div>

      {/* AI hero card */}
      <div className="px-5 py-3">
        <div
          className="relative overflow-hidden rounded-xl2 p-5 text-white"
          style={{
            background:
              "linear-gradient(135deg, var(--accent) 0%, var(--plum-700, #421e40) 100%)",
          }}
        >
          <div
            aria-hidden
            className="absolute -right-10 -top-10 h-48 w-48 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(255,255,255,0.18), transparent 70%)",
            }}
          />
          <div className="relative z-10">
            <div className="eyebrow !text-white/70">↳ Liza AI</div>
            <div className="mt-1.5 font-serif text-2xl leading-tight">
              Опишите задачу — подберём мастера
            </div>
            <p className="mt-1.5 text-[13px] text-white/85">
              Шея, спина, восстановление, беременность — AI предложит 3
              подходящих специалистов за минуту.
            </p>
            <div className="mt-4 flex gap-2">
              <Link
                href="/match"
                className="flex-1 rounded-full bg-white px-4 py-3 text-center text-[13px] font-medium text-obsidian-1"
              >
                Подобрать
              </Link>
              <Link
                href="/therapists"
                className="flex-1 rounded-full border border-white/30 bg-white/15 px-4 py-3 text-center text-[13px] font-medium backdrop-blur-sm"
              >
                Каталог
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-5 pb-5 pt-1">
        <Link
          href="/therapists"
          className="flex w-full items-center gap-3 rounded-2xl border border-line bg-card px-4 py-3.5 text-sm text-secondary"
        >
          <SearchIcon />
          <span>Услуга, мастер или район…</span>
        </Link>
      </div>

      {/* Category chips */}
      <div className="flex gap-2.5 overflow-x-auto px-5 pb-6">
        {MODALITIES.slice(0, 9).map((m) => (
          <Link
            key={m.key}
            href={`/therapists/${m.slug}`}
            className="shrink-0 whitespace-nowrap rounded-full border border-line bg-card px-3.5 py-2.5 text-xs font-medium text-heading transition-colors hover:border-accent hover:text-accent"
          >
            {m.label.replace(" массаж", "")}
          </Link>
        ))}
      </div>

      {/* For you */}
      <div className="flex items-baseline justify-between px-5 pb-3">
        <h2 className="serif text-xl text-heading">Рекомендуем</h2>
        <Link href="/therapists" className="text-[13px] text-accent">
          смотреть все
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto px-5 pb-6">
        {featured.map((m) => {
          const photo = (m.media ?? []).find(
            (x) => x.type === "profile_photo"
          );
          const pf = priceFrom(m);
          return (
            <Link
              key={m.id}
              href={`/therapist/${m.slug}`}
              className="flex w-[210px] shrink-0 flex-col overflow-hidden rounded-xl2 border border-line bg-card"
            >
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photo.url}
                  alt={photo.alt_text ?? m.full_name}
                  className="h-[230px] w-full object-cover"
                />
              ) : (
                <div className="img-ph grid h-[230px] w-full place-items-center font-serif text-3xl text-heading">
                  {m.full_name.slice(0, 1)}
                </div>
              )}
              <div className="p-3.5">
                <h3 className="serif text-[15px] text-heading">
                  {m.full_name}
                </h3>
                <p className="mt-0.5 text-[11px] text-secondary">
                  {[m.city, m.district].filter(Boolean).join(", ")}
                  {m.years_experience
                    ? ` · опыт ${m.years_experience} л.`
                    : ""}
                </p>
                <div className="mt-3 font-serif text-base text-heading">
                  {pf != null ? (
                    <>
                      от {formatRub(pf)}
                    </>
                  ) : (
                    <span className="text-sm text-secondary">
                      цена по запросу
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Free today */}
      {freeToday.length > 0 && (
        <>
          <div className="flex items-baseline justify-between px-5 pb-3">
            <div>
              <h2 className="serif text-xl text-heading">Свободны сегодня</h2>
              <p className="mt-0.5 text-[11px] text-secondary">
                окна доступны к записи прямо сейчас
              </p>
            </div>
            <span className="chip !text-[9px]">
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-full bg-accent"
              />
              live
            </span>
          </div>
          <div className="flex flex-col gap-2.5 px-5 pb-8">
            {freeToday.map(({ p, next }) => {
              const photo = (p.media ?? []).find(
                (x) => x.type === "profile_photo"
              );
              return (
                <Link
                  key={p.id}
                  href={`/therapist/${p.slug}`}
                  className="flex items-center gap-3.5 rounded-2xl border border-line bg-card p-3.5"
                >
                  {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photo.url}
                      alt={photo.alt_text ?? p.full_name}
                      className="h-14 w-14 shrink-0 rounded-full object-cover ring-1 ring-line-strong"
                    />
                  ) : (
                    <div className="img-ph grid h-14 w-14 shrink-0 place-items-center rounded-full font-serif text-heading">
                      {p.full_name.slice(0, 1)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="serif text-[15px] text-heading">
                        {p.full_name}
                      </h3>
                      {next && (
                        <span className="shrink-0 font-serif text-[15px] italic text-accent">
                          {formatSlot(next.starts_at)}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 line-clamp-1 text-xs text-body">
                      {(p.services ?? [])
                        .slice(0, 2)
                        .map((s) => modalityLabel(s.modality))
                        .join(" · ") ||
                        p.headline ||
                        "Профессиональный массаж"}
                    </p>
                    <p className="mt-1 text-[11px] text-secondary">
                      {[p.city, p.district].filter(Boolean).join(", ")}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}

      {/* Principles */}
      <div className="px-5 pb-10">
        <div className="rounded-xl2 border border-line bg-surface p-5">
          <div className="eyebrow">Принципы платформы</div>
          <ul className="mt-3 space-y-2.5">
            {SAFETY_RULES.slice(0, 3).map((r) => (
              <li key={r} className="flex gap-2.5 text-sm text-body">
                <span aria-hidden className="hot mt-2 block h-1 w-1 shrink-0 rounded-full bg-accent" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom tab bar */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 mx-auto grid max-w-[460px] grid-cols-5 border-t border-line px-2 pb-7 pt-3"
        style={{
          background: "rgba(12,8,13,0.9)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        {TABS.map((t) =>
          t.central ? (
            <Link
              key={t.href}
              href={t.href}
              aria-label={t.label}
              className="-translate-y-2 mx-auto grid h-12 w-12 place-items-center rounded-full bg-accent text-[color:var(--on-accent)]"
              style={{ boxShadow: "var(--glow)" }}
            >
              {t.icon}
            </Link>
          ) : (
            <Link
              key={t.href}
              href={t.href}
              className={`flex flex-col items-center gap-1 ${
                t.href === "/app" ? "text-heading" : "text-secondary"
              }`}
            >
              {t.icon}
              <span className="text-[10px] tracking-wide">{t.label}</span>
            </Link>
          )
        )}
      </nav>
    </div>
  );
}
