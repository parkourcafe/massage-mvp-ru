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
    <div className="container-px py-24 max-w-3xl">
      <div className="eyebrow">Документы</div>
      <h1 className="h1 mt-6">Публичная оферта</h1>
      <p className="small mt-4 text-secondary">Редакция от 17.05.2026</p>
      <hr className="rule my-10" />

      <p className="text-body">
        Настоящая оферта определяет условия предоставления платного доступа
        к расширенным возможностям платформы {SITE_NAME} (тарифы Pro и
        Expert) для специалистов по профессиональному оздоровительному
        массажу.
      </p>

      <h2 className="h3 mt-10 mb-3">1. Предмет</h2>
      <p className="text-body">
        Исполнитель предоставляет специалисту доступ к функциям выбранного
        тарифа на срок 30 дней с момента подтверждённой оплаты. Оплата
        сеансов массажа клиентами через платформу не производится.
      </p>

      <h2 className="h3 mt-10 mb-3">2. Стоимость и оплата</h2>
      <p className="text-body">
        Стоимость указана на странице{" "}
        <Link className="text-accent hover:underline" href="/pricing">
          тарифов
        </Link>{" "}
        и в личном кабинете. Оплата — через платёжный сервис YooKassa.
        Доступ активируется только после подтверждения платежа на стороне
        сервера (webhook).
      </p>

      <h2 className="h3 mt-10 mb-3">3. Возврат</h2>
      <p className="text-body">
        Возврат за неиспользованный период рассматривается по обращению
        в поддержку. Автопродление в MVP отключено: по окончании периода
        тариф возвращается на Free.
      </p>

      <h2 className="h3 mt-10 mb-3">4. Акцепт</h2>
      <p className="text-body">
        Оплата тарифа означает полное и безоговорочное принятие условий
        настоящей оферты,{" "}
        <Link className="text-accent hover:underline" href="/terms">
          Пользовательского соглашения
        </Link>{" "}
        и{" "}
        <Link className="text-accent hover:underline" href="/subscription-terms">
          Условий подписки
        </Link>
        .
      </p>
    </div>
  );
}
