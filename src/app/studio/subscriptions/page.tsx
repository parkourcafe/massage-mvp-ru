import { AppShell } from "@/components/AppShell";
import { StudioSubscriptionManager } from "@/components/StudioSubscriptionManager";
import { getI18n } from "@/lib/i18n/server";
import { getStudioSubscriptionSettings } from "@/lib/strand/repository";

export default async function StudioSubscriptionsPage() {
  const { locale } = await getI18n();
  const settings = await getStudioSubscriptionSettings();

  return (
    <AppShell
      eyebrow={locale === "ru" ? "Кабинет модели" : "Model studio"}
      title={locale === "ru" ? "Настройки подписки" : "Subscription settings"}
      intro={
        locale === "ru"
          ? "В Phase 1 входят только настройка цены и объяснение entitlement. Live billing и payouts отложены."
          : "Phase 1 includes pricing configuration and an entitlement explanation only. Live billing and payouts are deferred."
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <StudioSubscriptionManager initialSettings={settings} />
        <section className="panel p-6">
          <h2 className="text-3xl text-heading">
            {locale === "ru" ? "Структура entitlement" : "Entitlement structure"}
          </h2>
          <p className="mt-3 text-sm leading-7 text-body">
            {locale === "ru"
              ? "Правила доступа должны применяться на сервере через таблицы subscription и media entitlement, а не только через UI-state."
              : "Access rules should be enforced server-side through subscription and media entitlement tables, not UI state alone."}
          </p>
        </section>
      </div>
    </AppShell>
  );
}
