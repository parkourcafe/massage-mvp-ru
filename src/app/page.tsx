import Link from "next/link";
import type { Metadata } from "next";
import { ComplianceDisclaimer } from "@/components/ComplianceDisclaimer";
import { ProfileCard } from "@/components/ProfileCard";
import { TrustStrip } from "@/components/TrustStrip";
import { getI18n } from "@/lib/i18n/server";
import { states } from "@/lib/strand/data";
import { listDirectoryProfiles } from "@/lib/strand/repository";

export const metadata: Metadata = {
  title: "Premium private directory",
  description:
    "Subscription-first Australian 18+ companion marketplace foundation with editorial presentation, moderation states, and compliance structure.",
};

export default async function HomePage() {
  const { locale, messages } = await getI18n();
  const featuredProfiles = await listDirectoryProfiles({ featuredOnly: true });
  const copy =
    locale === "ru"
      ? {
          eyebrow: "Премиальный editorial marketplace",
          title: "Приватный просмотр verified 18+ профилей.",
          intro:
            "STRAND - это subscription-first MVP foundation для премиального австралийского companion marketplace. До chat или booking здесь в приоритете публичный каталог, презентация профилей, онбординг, модерация и privacy controls.",
          searchEntry: "Точка входа в поиск",
          searchPlaceholder: "Искать по городу, штату или verified-профилю",
          trust: "Trust",
          trustText:
            "KYC approval обязателен до того, как профиль сможет отображаться как verified или live.",
          accessModel: "Модель доступа",
          accessText:
            "Private galleries остаются закрытыми, пока не активировано entitlement по подписке.",
          editorial: "Editorial presentation",
          editorialItems: ["Hero профиля", "Абстрактная галерея", "Блок compliance"],
          editorialBody:
            "Премиальная placeholder-стилистика без explicit imagery и explicit copy.",
          featuredEyebrow: "Избранные профили",
          featuredTitle: "Editorial-карточки профилей",
          seeAll: "Смотреть все профили",
          steps: [
            [
              "1. Смотреть публично",
              "Поиск по всей Австралии, фильтрация по штатам и городам и проверка verified-статуса до оформления подписки.",
            ],
            [
              "2. Подписываться приватно",
              "Состояния private gallery и access labels понятны, а entitlement-aware UI отрабатывает до показа чувствительных медиа.",
            ],
            [
              "3. Управлять безопасно",
              "Модели проходят онбординг, KYC и media review, а admin tools сфокусированы на moderation, risk и payment control.",
            ],
          ],
          complianceBody:
            "Страницы каталогов по штатам и городам подготовлены для локализованных compliance-placeholder блоков. Финальные раскрытия, правила модерации и операционные ограничения должны быть подтверждены с австралийским юристом до запуска.",
          ctas: "Основные CTA",
          deferred:
            "Booking и chat намеренно отложены. Этот MVP построен вокруг листингов, профилей, статусов подписки, модерации и compliance-контролей.",
        }
      : {
          eyebrow: "Premium editorial marketplace",
          title: "Private browsing for verified 18+ profiles.",
          intro:
            "STRAND is a subscription-first MVP foundation for a premium Australian companion marketplace. Public directory access, profile presentation, onboarding, moderation, and privacy controls are prioritised before chat or booking.",
          searchEntry: "Search entry",
          searchPlaceholder: "Search city, state or verified profile",
          trust: "Trust",
          trustText:
            "KYC approval is required before a profile can appear as verified or live.",
          accessModel: "Access model",
          accessText:
            "Private galleries remain locked until subscription entitlement is active.",
          editorial: "Editorial presentation",
          editorialItems: ["Profile hero", "Abstract gallery", "Compliance block"],
          editorialBody:
            "Premium placeholder styling without explicit imagery or copy.",
          featuredEyebrow: "Featured profiles",
          featuredTitle: "Editorial profile cards",
          seeAll: "See all profiles",
          steps: [
            [
              "1. Browse publicly",
              "Search Australia-wide, narrow by state and city, and review verified status before subscribing.",
            ],
            [
              "2. Subscribe privately",
              "Private gallery states and access labels are clear, with entitlement-aware UI before any sensitive media is shown.",
            ],
            [
              "3. Manage safely",
              "Models complete onboarding, KYC, and media review while admin tools focus on moderation, risk, and payment control.",
            ],
          ],
          complianceBody:
            "State and city level directory pages are structured to render localised compliance placeholders. Final disclosures, moderation rules, and operational constraints must be confirmed with Australian counsel before launch.",
          ctas: "Primary CTAs",
          deferred:
            "Booking and chat are intentionally deferred. This MVP is built around listings, profiles, subscription states, moderation, and compliance controls.",
        };

  return (
    <div className="pb-16">
      <section className="container-px py-12 sm:py-16">
        <div className="hero-grid grid gap-10 rounded-[36px] border border-white/10 px-6 py-10 shadow-lift sm:px-10 sm:py-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="eyebrow">{copy.eyebrow}</p>
            <h1 className="display mt-6 max-w-3xl text-balance">
              {copy.title}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-body sm:text-lg">
              {copy.intro}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/directory" className="btn-primary">
                Browse directory
              </Link>
              <Link href="/studio" className="btn-secondary">
                Join as model
              </Link>
            </div>
            <div className="mt-8 rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-secondary">
                {copy.searchEntry}
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-[1.3fr_0.9fr_auto]">
                <input className="field" placeholder={copy.searchPlaceholder} />
                <select className="field">
                  <option>{messages.common.allStates}</option>
                  {states.map((state) => (
                    <option key={state.slug}>{state.name}</option>
                  ))}
                </select>
                <Link href="/directory" className="btn-primary justify-center">
                  Open directory
                </Link>
              </div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
              <p className="eyebrow">{copy.trust}</p>
              <p className="mt-4 font-serif text-3xl text-heading">
                {copy.trustText}
              </p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
              <p className="eyebrow">{copy.accessModel}</p>
              <p className="mt-4 font-serif text-3xl text-heading">
                {copy.accessText}
              </p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 sm:col-span-2">
              <p className="eyebrow">{copy.editorial}</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                {copy.editorialItems.map((item) => (
                  <div
                    key={item}
                    className="rounded-[24px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(215,195,162,0.14),_transparent_42%),linear-gradient(180deg,_rgba(255,255,255,0.08),_rgba(255,255,255,0.02))] p-5"
                  >
                    <p className="font-serif text-2xl text-heading">{item}</p>
                    <p className="mt-3 text-sm leading-7 text-body">
                      {copy.editorialBody}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      <TrustStrip messages={messages} />
      <section className="container-px py-14">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow">{copy.featuredEyebrow}</p>
            <h2 className="mt-3 text-4xl text-heading">{copy.featuredTitle}</h2>
          </div>
          <Link href="/directory" className="btn-ghost hidden sm:inline-flex">
            {copy.seeAll}
          </Link>
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {featuredProfiles.map((profile) => (
            <ProfileCard key={profile.id} profile={profile} />
          ))}
        </div>
      </section>
      <section className="container-px grid gap-6 py-8 lg:grid-cols-3">
        {copy.steps.map(([title, text]) => (
          <div key={title} className="panel p-6">
            <h3 className="text-3xl text-heading">{title}</h3>
            <p className="mt-3 text-sm leading-7 text-body">{text}</p>
          </div>
        ))}
      </section>
      <section className="container-px grid gap-6 py-8 lg:grid-cols-[1.1fr_0.9fr]">
        <ComplianceDisclaimer body={copy.complianceBody} />
        <div className="panel p-6">
          <p className="eyebrow">{copy.ctas}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/directory" className="btn-primary">
              Browse directory
            </Link>
            <Link href="/studio" className="btn-secondary">
              Join as model
            </Link>
          </div>
          <p className="mt-4 text-sm leading-7 text-body">
            {copy.deferred}
          </p>
        </div>
      </section>
    </div>
  );
}
