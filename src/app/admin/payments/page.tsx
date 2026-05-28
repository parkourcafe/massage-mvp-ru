import { AppShell } from "@/components/AppShell";
import { AdminSidebar } from "@/components/AdminSidebar";
import { PaymentStatusBadge } from "@/components/PaymentStatusBadge";
import { getI18n } from "@/lib/i18n/server";
import { getSubscriptionStatusLabel } from "@/lib/i18n/labels";
import {
  listBillingHistory,
  listClientSubscriptions,
} from "@/lib/strand/repository";

export default async function AdminPaymentsPage() {
  const { locale } = await getI18n();
  const [billingHistory, clientSubscriptions] = await Promise.all([
    listBillingHistory(),
    listClientSubscriptions(),
  ]);

  return (
    <AppShell
      eyebrow={locale === "ru" ? "Админ" : "Admin"}
      title={locale === "ru" ? "Платежи и подписки" : "Payments and subscriptions"}
      intro={
        locale === "ru"
          ? "Платежи остаются placeholder-only в Phase 1, но admin shell должен ясно показывать subscription status, failed renewals, refunds и chargebacks."
          : "Payments remain placeholder-only in Phase 1, but the admin shell needs clear visibility into subscription status, failed renewals, refunds, and chargebacks."
      }
    >
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <AdminSidebar />
        <div className="grid gap-6">
          <section className="panel p-6">
            <h2 className="text-3xl text-heading">
              {locale === "ru" ? "Платёжные транзакции" : "Payment transactions"}
            </h2>
            <div className="mt-5 grid gap-3">
              {billingHistory.map((event) => (
                <div key={event.id} className="flex flex-wrap items-center justify-between gap-4 rounded-[20px] border border-white/10 p-4">
                  <div>
                    <p className="text-sm text-heading">{event.description}</p>
                    <p className="text-xs text-secondary">{event.date} • {event.amountLabel}</p>
                  </div>
                  <PaymentStatusBadge status={event.status} />
                </div>
              ))}
            </div>
          </section>
          <section className="panel p-6">
            <h2 className="text-3xl text-heading">
              {locale === "ru" ? "Статус клиентского доступа" : "Client access status"}
            </h2>
            <div className="mt-5 grid gap-3">
              {clientSubscriptions.map((subscription) => (
                <div key={subscription.id} className="rounded-[20px] border border-white/10 p-4 text-sm text-body">
                  {subscription.modelName} • {getSubscriptionStatusLabel(locale, subscription.status)} •{" "}
                  {locale === "ru" ? "доступ до" : "access ends"} {subscription.accessEndsAt}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
