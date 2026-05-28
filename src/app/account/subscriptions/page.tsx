import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { getI18n } from "@/lib/i18n/server";
import { getSubscriptionStatusLabel } from "@/lib/i18n/labels";
import { listClientSubscriptions } from "@/lib/strand/repository";

export default async function AccountSubscriptionsPage() {
  const { locale } = await getI18n();
  const clientSubscriptions = await listClientSubscriptions();

  return (
    <AppShell
      eyebrow={locale === "ru" ? "Кабинет клиента" : "Client account"}
      title={locale === "ru" ? "Состояния доступа по подписке" : "Subscription access states"}
      intro={
        locale === "ru"
          ? "Состояния active, expired и cancelled должны считываться сразу, потому что access control - ключевая часть MVP."
          : "Active, expired, and cancelled states should be immediately legible because access control is a core part of the MVP."
      }
    >
      <div className="grid gap-4">
        {clientSubscriptions.map((subscription) => (
          <div key={subscription.id} className="panel p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl text-heading">{subscription.modelName}</h2>
                <p className="mt-2 text-sm text-body">{subscription.city}</p>
              </div>
              <StatusBadge tone={subscription.status === "active" ? "success" : subscription.status === "expired" ? "warning" : "danger"}>
                {getSubscriptionStatusLabel(locale, subscription.status)}
              </StatusBadge>
            </div>
            <p className="mt-4 text-sm leading-7 text-body">
              {locale === "ru"
                ? `Статус доступа: ${getSubscriptionStatusLabel(locale, subscription.status)}. Entitlement для private gallery должно следовать этой записи, а не client-side предположениям.`
                : `Access status is ${subscription.status}. Private gallery entitlement should follow this record rather than client-side assumptions.`}
            </p>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
