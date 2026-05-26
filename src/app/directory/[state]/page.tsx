import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { ComplianceDisclaimer } from "@/components/ComplianceDisclaimer";
import { EmptyState } from "@/components/EmptyState";
import { ProfileCard } from "@/components/ProfileCard";
import { getI18n } from "@/lib/i18n/server";
import { getStateBySlug } from "@/lib/strand/data";
import { getStateDisclaimer } from "@/lib/strand/compliance";
import { listDirectoryProfiles } from "@/lib/strand/repository";

export default async function StateDirectoryPage({
  params,
}: {
  params: { state: string };
}) {
  const { locale } = await getI18n();
  const state = getStateBySlug(params.state);
  if (!state) notFound();

  const profiles = await listDirectoryProfiles({ stateSlug: params.state });

  return (
    <AppShell
      eyebrow={locale === "ru" ? "Каталог по штату" : "State directory"}
      title={
        locale === "ru"
          ? `${state.name}: каталог профилей`
          : `${state.name} companion directory`
      }
      intro={
        locale === "ru"
          ? "Страницы уровня штата дают локализованный заголовок, структуру дисклеймера и инвентарь профилей внутри той же премиальной системы."
          : "State-level pages provide a localised heading, disclaimer structure, and profile inventory while staying within the same premium system."
      }
    >
      <ComplianceDisclaimer body={await getStateDisclaimer(params.state, undefined, locale)} />
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        {profiles.length ? (
          profiles.map((profile) => <ProfileCard key={profile.id} profile={profile} />)
        ) : (
          <div className="xl:col-span-2">
            <EmptyState
              title={
                locale === "ru"
                  ? "В этом штате пока нет опубликованных профилей"
                  : "No published profiles in this state yet"
              }
              text={
                locale === "ru"
                  ? "Страница остаётся готовой к запуску за счёт empty state и compliance-placeholder блока, а не слабого filler content."
                  : "The page remains launch-ready with an empty state and a compliance placeholder rather than thin filler content."
              }
            />
          </div>
        )}
      </div>
      <section className="panel mt-6 p-6">
        <h2 className="text-3xl text-heading">
          {locale === "ru"
            ? `О каталоге ${state.name}`
            : `About the ${state.name} directory`}
        </h2>
        <p className="mt-3 text-sm leading-7 text-body">
          {locale === "ru"
            ? "Этот SEO-блок намеренно сдержанный. Он нужен для discoverability на уровне штата без спамного или explicit-copy."
            : "This SEO text block is intentionally restrained. It exists to support state-specific discoverability without relying on spammy or explicit copy."}
        </p>
      </section>
    </AppShell>
  );
}
