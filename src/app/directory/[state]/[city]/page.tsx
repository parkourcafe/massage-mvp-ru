import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { ComplianceDisclaimer } from "@/components/ComplianceDisclaimer";
import { EmptyState } from "@/components/EmptyState";
import { ProfileCard } from "@/components/ProfileCard";
import { getI18n } from "@/lib/i18n/server";
import { getStateBySlug } from "@/lib/strand/data";
import { getStateDisclaimer } from "@/lib/strand/compliance";
import { listDirectoryProfiles } from "@/lib/strand/repository";

export default async function CityDirectoryPage({
  params,
}: {
  params: { state: string; city: string };
}) {
  const { locale } = await getI18n();
  const state = getStateBySlug(params.state);
  if (!state) notFound();

  const city = state.cities.find(
    (entry) => entry.toLowerCase().replaceAll(" ", "-") === params.city,
  );
  if (!city) notFound();

  const profiles = await listDirectoryProfiles({
    stateSlug: params.state,
    citySlug: params.city,
  });

  return (
    <AppShell
      eyebrow={locale === "ru" ? "Городской каталог" : "City directory"}
      title={`${city}, ${state.name}`}
      intro={
        locale === "ru"
          ? "Каталоги уровня города включают локализованный заголовок, инвентарь, selector-ready структуру и зарезервированный SEO summary block."
          : "City-level directory pages include localised headings, inventory, a selector-ready structure, and a reserved SEO summary section."
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <select className="field">
          <option>{state.name}</option>
        </select>
        <select className="field">
          <option>{city}</option>
        </select>
      </div>
      <div className="mt-6">
        <ComplianceDisclaimer body={await getStateDisclaimer(params.state, params.city, locale)} />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        {profiles.length ? (
          profiles.map((profile) => <ProfileCard key={profile.id} profile={profile} />)
        ) : (
          <div className="xl:col-span-2">
            <EmptyState
              title={
                locale === "ru"
                  ? "В этом городе пока нет активных профилей"
                  : "No active profiles in this city yet"
              }
              text={
                locale === "ru"
                  ? "Городской каталог сохраняет фильтры и SEO-scaffolding до появления модерируемых листингов."
                  : "The city directory keeps the filter and SEO scaffolding in place until moderated listings are available."
              }
            />
          </div>
        )}
      </div>
      <section className="panel mt-6 p-6">
        <h2 className="text-3xl text-heading">
          {locale === "ru" ? `Обзор каталога ${city}` : `${city} directory overview`}
        </h2>
        <p className="mt-3 text-sm leading-7 text-body">
          {locale === "ru"
            ? "Эта SEO-зона должна оставаться фактической, модерируемой и compliant. Это placeholder для краткого city-level editorial copy после legal review."
            : "This reserved SEO text area should stay factual, moderated, and compliant. It is a placeholder for concise city-level editorial copy after legal review."}
        </p>
      </section>
    </AppShell>
  );
}
