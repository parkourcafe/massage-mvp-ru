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
    <div className="container-px py-10 max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Условия подписки</h1>
      <p className="text-sm text-slate-500">Редакция от 17.05.2026</p>

      <ul className="list-disc pl-6 text-slate-700 space-y-2">
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

      <p className="text-slate-700">
        См.{" "}
        <Link className="text-brand-700 underline" href="/offer">
          Публичную оферту
        </Link>{" "}
        и{" "}
        <Link className="text-brand-700 underline" href="/terms">
          Пользовательское соглашение
        </Link>
        .
      </p>
    </div>
  );
}
