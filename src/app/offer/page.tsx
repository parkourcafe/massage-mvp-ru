import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata, SITE_NAME } from "@/lib/seo";

export function generateMetadata(): Metadata {
  return pageMetadata({
    title: "Публичная оферта",
    description: `Публичная оферта на оказание услуг подписки ${SITE_NAME}.`,
    path: "/offer",
  });
}

export default function OfferPage() {
  return (
    <div className="container-px py-10 max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Публичная оферта</h1>
      <p className="text-sm text-slate-500">Редакция от 17.05.2026</p>

      <p className="text-slate-700">
        Настоящая оферта определяет условия предоставления платного доступа
        к расширенным возможностям платформы {SITE_NAME} (тарифы Pro и
        Expert) для специалистов по профессиональному оздоровительному
        массажу.
      </p>

      <h2 className="font-semibold mt-6">1. Предмет</h2>
      <p className="text-slate-700">
        Исполнитель предоставляет специалисту доступ к функциям выбранного
        тарифа на срок 30 дней с момента подтверждённой оплаты. Оплата
        сеансов массажа клиентами через платформу не производится.
      </p>

      <h2 className="font-semibold mt-6">2. Стоимость и оплата</h2>
      <p className="text-slate-700">
        Стоимость указана на странице{" "}
        <Link className="text-brand-700 underline" href="/pricing">
          тарифов
        </Link>{" "}
        и в личном кабинете. Оплата — через платёжный сервис YooKassa.
        Доступ активируется только после подтверждения платежа на стороне
        сервера (webhook).
      </p>

      <h2 className="font-semibold mt-6">3. Возврат</h2>
      <p className="text-slate-700">
        Возврат за неиспользованный период рассматривается по обращению
        в поддержку. Автопродление в MVP отключено: по окончании периода
        тариф возвращается на Free.
      </p>

      <h2 className="font-semibold mt-6">4. Акцепт</h2>
      <p className="text-slate-700">
        Оплата тарифа означает полное и безоговорочное принятие условий
        настоящей оферты,{" "}
        <Link className="text-brand-700 underline" href="/terms">
          Пользовательского соглашения
        </Link>{" "}
        и{" "}
        <Link className="text-brand-700 underline" href="/subscription-terms">
          Условий подписки
        </Link>
        .
      </p>
    </div>
  );
}
