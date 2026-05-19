import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata, SITE_NAME } from "@/lib/seo";

export function generateMetadata(): Metadata {
  return pageMetadata({
    title: "Условия подписки",
    description: `Условия подписки и автопродления ${SITE_NAME}.`,
    path: "/subscription-terms",
  });
}

export default function SubscriptionTermsPage() {
  return (
    <div className="container-px py-24 max-w-3xl">
      <div className="eyebrow">Документы</div>
      <h1 className="h1 mt-6">Условия подписки</h1>
      <p className="small mt-4 text-secondary">Редакция от 17.05.2026</p>
      <hr className="rule my-10" />

      <ul className="list-disc pl-6 text-body space-y-2">
        <li>
          Подписка (Pro / Expert) активируется на 30 дней после
          подтверждённой оплаты. Pro не активируется по фронтовому
          редиректу — только после верифицированного webhook.
        </li>
        <li>
          В MVP автопродление <strong>отключено</strong>. По окончании
          оплаченного периода тариф автоматически возвращается на Free
          без списаний.
        </li>
        <li>
          Отмена подписки доступна в личном кабинете и снимает
          автопродление; доступ сохраняется до конца оплаченного периода.
        </li>
        <li>
          При понижении до Free закрываются платные функции (SEO-
          индексация, расширенное медиа, AI-импорт/подбор, заявки, CRM,
          аналитика, поддержка менеджера).
        </li>
        <li>
          Платёжные данные карт обрабатываются провайдером YooKassa;
          платформа их не хранит.
        </li>
      </ul>

      <p className="text-body mt-6">
        См.{" "}
        <Link className="text-accent hover:underline" href="/offer">
          Публичную оферту
        </Link>{" "}
        и{" "}
        <Link className="text-accent hover:underline" href="/terms">
          Пользовательское соглашение
        </Link>
        .
      </p>
    </div>
  );
}
