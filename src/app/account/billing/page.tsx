import { AppShell } from "@/components/AppShell";
import { PaymentStatusBadge } from "@/components/PaymentStatusBadge";
import { getI18n } from "@/lib/i18n/server";
import { listBillingHistory } from "@/lib/strand/repository";

export default async function BillingPage() {
  const { locale } = await getI18n();
  const billingHistory = await listBillingHistory();

  return (
    <AppShell
      eyebrow={locale === "ru" ? "Кабинет клиента" : "Client account"}
      title={locale === "ru" ? "История биллинга" : "Billing history"}
      intro={
        locale === "ru"
          ? "UI платёжных статусов входит в Phase 1, хотя live payment capture отложен. Renewal, refund, failure и chargeback states должны иметь видимое представление."
          : "Payment status UI is part of Phase 1, even though live payment capture is deferred. Renewal, refund, failure, and chargeback states all need visible treatment."
      }
    >
      <div className="grid gap-4">
        {billingHistory.map((event) => (
          <div key={event.id} className="panel flex flex-wrap items-center justify-between gap-4 p-6">
            <div>
              <h2 className="text-2xl text-heading">{event.description}</h2>
              <p className="mt-2 text-sm text-body">{event.amountLabel} • {event.date}</p>
            </div>
            <PaymentStatusBadge status={event.status} />
          </div>
        ))}
      </div>
    </AppShell>
  );
}
