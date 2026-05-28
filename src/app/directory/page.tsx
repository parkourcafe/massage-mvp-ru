import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { MobileFilterDrawer } from "@/components/MobileFilterDrawer";
import { ProfileCard } from "@/components/ProfileCard";
import { getI18n } from "@/lib/i18n/server";
import { states } from "@/lib/strand/data";
import {
  listDirectoryProfiles,
  listStateComplianceRules,
} from "@/lib/strand/repository";

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  const { locale, messages } = await getI18n();
  const [profiles, complianceRules] = await Promise.all([
    listDirectoryProfiles({ query: searchParams?.q }),
    listStateComplianceRules(),
  ]);
  const copy =
    locale === "ru"
      ? {
          eyebrow: "Каталог по всей Австралии",
          title: "Смотреть verified и review-ready профили",
          intro:
            "Foundation каталога поддерживает публичный discovery, поиск, мобильные фильтры, навигацию по штатам и городам, а также понятные статусы KYC и публикации.",
          stateFilters: "Фильтры по штатам",
          complianceNote:
            "Страницы по городам и дисклеймеры заранее подготовлены под compliance-review.",
          searchPlaceholder: "Искать по городу, штату, verified, private gallery",
          search: "Поиск",
          emptyTitle: "По этому фильтру пока нет профилей",
          emptyText:
            "Каталог уже подготовлен под empty states, чтобы новые штаты и города можно было запускать без сломанной вёрстки.",
          complianceCoverage: "Покрытие compliance",
        }
      : {
          eyebrow: "Australia-wide directory",
          title: "Browse verified and review-ready profiles",
          intro:
            "The directory foundation supports public discovery, search, mobile filtering, state and city navigation, and clear KYC/publication states.",
          stateFilters: "State filters",
          complianceNote:
            "City-level pages and disclaimers are pre-structured for compliance review.",
          searchPlaceholder: "Search city, state, verified, private gallery",
          search: "Search",
          emptyTitle: "No profiles match this filter yet",
          emptyText:
            "The directory has been wired for empty states so new states and cities can launch without broken layouts.",
          complianceCoverage: "Compliance coverage",
        };

  return (
    <AppShell
      eyebrow={copy.eyebrow}
      title={copy.title}
      intro={copy.intro}
      actions={
        <Link href="/age-gate" className="btn-ghost">
          {locale === "ru" ? "Политика 18+" : "18+ policy"}
        </Link>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="panel hidden h-fit p-5 lg:block">
          <p className="eyebrow">{copy.stateFilters}</p>
          <div className="mt-4 grid gap-3">
            {states.map((state) => (
              <Link
                key={state.slug}
                href={`/directory/${state.slug}`}
                className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-body hover:text-heading"
              >
                {state.name}
              </Link>
            ))}
          </div>
          <div className="mt-6 rounded-[22px] border border-white/10 bg-white/[0.03] p-4 text-sm leading-7 text-body">
            {copy.complianceNote}
          </div>
        </aside>
        <div className="space-y-6">
          <div className="panel p-5">
            <div className="grid gap-3 sm:grid-cols-[1.4fr_0.9fr_auto]">
              <input defaultValue={searchParams?.q} className="field" placeholder={copy.searchPlaceholder} />
              <select className="field">
                <option>{messages.common.allStates}</option>
                {states.map((state) => (
                  <option key={state.slug}>{state.name}</option>
                ))}
              </select>
              <button type="button" className="btn-primary">
                {copy.search}
              </button>
            </div>
            <div className="mt-4">
              <MobileFilterDrawer states={states.map(({ name, slug }) => ({ name, slug }))} />
            </div>
          </div>
          <div className="grid gap-6 xl:grid-cols-2">
            {profiles.length ? (
              profiles.map((profile) => <ProfileCard key={profile.id} profile={profile} />)
            ) : (
              <div className="xl:col-span-2">
                <EmptyState
                  title={copy.emptyTitle}
                  text={copy.emptyText}
                />
              </div>
            )}
          </div>
          <div className="panel p-5">
            <p className="eyebrow">{copy.complianceCoverage}</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {complianceRules.map((rule) => (
                <div key={rule.slug} className="rounded-[22px] border border-white/10 p-4">
                  <p className="font-serif text-2xl text-heading">{rule.state}</p>
                  <p className="mt-2 text-sm leading-7 text-body">{rule.disclaimer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
