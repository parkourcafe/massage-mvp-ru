import Link from "next/link";
import { getI18n } from "@/lib/i18n/server";

export async function SubscriptionCTA({
  price,
  modelName,
}: {
  price: number;
  modelName: string;
}) {
  const { locale, messages } = await getI18n();
  const copy =
    locale === "ru"
      ? `Оформите подписку на ${modelName}, чтобы открыть одобренные приватные медиа и сохранять доступ, пока подписка активна.`
      : `Subscribe to ${modelName} to view approved private media and retain access while your subscription remains active.`;

  return (
    <div className="rounded-[28px] border border-[#d7c3a2]/25 bg-[#d7c3a2]/10 p-6 shadow-soft">
      <p className="eyebrow text-[#f0e2c7]">{messages.common.subscriberAccess}</p>
      <h3 className="mt-3 text-3xl text-heading">{messages.common.unlockPrivateGallery}</h3>
      <p className="mt-3 text-sm leading-7 text-body">{copy}</p>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-3xl text-heading">${price}</p>
          <p className="text-sm text-secondary">{messages.common.monthlySubscriptionPlaceholder}</p>
        </div>
        <Link href="/account/subscriptions" className="btn-primary">
          {messages.common.viewSubscriptionStates}
        </Link>
      </div>
    </div>
  );
}
