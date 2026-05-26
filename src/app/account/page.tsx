import { AccountSavedProfilesPanel } from "@/components/AccountSavedProfilesPanel";
import { AppShell } from "@/components/AppShell";
import { PaymentStatusBadge } from "@/components/PaymentStatusBadge";
import { PrivacySettingsPanel } from "@/components/PrivacySettingsPanel";
import { StatusBadge } from "@/components/StatusBadge";
import { getI18n } from "@/lib/i18n/server";
import { getSubscriptionStatusLabel } from "@/lib/i18n/labels";
import {
  getPrivacySettings,
  listBillingHistory,
  listClientSubscriptions,
  listSavedProfiles,
} from "@/lib/strand/repository";

export default async function AccountPage() {
  const { locale, messages } = await getI18n();
  const [clientSubscriptions, billingHistory, savedProfiles, privacySettings] = await Promise.all([
    listClientSubscriptions(),
    listBillingHistory(),
    listSavedProfiles(),
    getPrivacySettings(),
  ]);

  return (
    <AppShell
      eyebrow={locale === "ru" ? "Кабинет клиента" : "Client account"}
      title={locale === "ru" ? "Дашборд клиента" : "Client dashboard"}
      intro={
        locale === "ru"
          ? "Клиентские flows в Phase 1 сфокусированы на подписках, сохранённых профилях, billing-плейсхолдерах, privacy controls и явном отделении от будущих chat или booking features."
          : "Client flows in Phase 1 focus on subscriptions, saved profiles, billing placeholders, privacy controls, and clear separation from future chat or booking features."
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="panel p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-3xl text-heading">
              {locale === "ru" ? "Активные подписки" : "Active subscriptions"}
            </h2>
            <StatusBadge tone="accent">
              {clientSubscriptions.length} {messages.common.records}
            </StatusBadge>
          </div>
          <div className="mt-5 grid gap-4">
            {clientSubscriptions.map((subscription) => (
              <div key={subscription.id} className="rounded-[22px] border border-white/10 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-serif text-2xl text-heading">{subscription.modelName}</p>
                    <p className="text-sm text-body">{subscription.city} • {subscription.tier}</p>
                  </div>
                  <StatusBadge tone={subscription.status === "active" ? "success" : subscription.status === "expired" ? "warning" : "danger"}>
                    {getSubscriptionStatusLabel(locale, subscription.status)}
                  </StatusBadge>
                </div>
                <p className="mt-3 text-sm text-secondary">
                  {messages.common.accessEnds}: {subscription.accessEndsAt}
                </p>
              </div>
            ))}
          </div>
        </section>
        <div className="space-y-6">
          <AccountSavedProfilesPanel initialProfiles={savedProfiles} />
          <section className="panel p-6">
            <h2 className="text-3xl text-heading">
              {locale === "ru" ? "История биллинга" : "Billing history"}
            </h2>
            <div className="mt-4 grid gap-3">
              {billingHistory.slice(0, 2).map((event) => (
                <div key={event.id} className="flex items-center justify-between gap-4 rounded-[20px] border border-white/10 p-4">
                  <div>
                    <p className="text-sm text-heading">{event.description}</p>
                    <p className="text-xs text-secondary">{event.date}</p>
                  </div>
                  <PaymentStatusBadge status={event.status} />
                </div>
              ))}
            </div>
          </section>
          <PrivacySettingsPanel initialSettings={privacySettings} />
        </div>
      </div>
    </AppShell>
  );
}
