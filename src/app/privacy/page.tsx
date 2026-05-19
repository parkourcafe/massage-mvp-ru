import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata, SITE_NAME } from "@/lib/seo";

export function generateMetadata(): Metadata {
  return pageMetadata({
    title: "Политика конфиденциальности",
    description: `Как ${SITE_NAME} обрабатывает персональные данные.`,
    path: "/privacy",
  });
}

export default function PrivacyPage() {
  return (
    <div className="container-px py-24 max-w-3xl">
      <div className="eyebrow">Документы</div>
      <h1 className="h1 mt-6">Политика конфиденциальности</h1>
      <p className="small mt-4 text-secondary">Редакция от 17.05.2026</p>
      <hr className="rule my-10" />

      <h2 className="h3 mt-10 mb-3">1. Какие данные обрабатываются</h2>
      <p className="text-body">
        Данные аккаунта (email), данные профиля специалиста, заявки на
        запись (имя клиента, контакт, пожелания), переписка по заявке,
        приватные заметки специалиста и обратная связь клиента, данные
        о подписке и платежах.
      </p>

      <h2 className="h3 mt-10 mb-3">2. Принципы приватности</h2>
      <ul className="list-disc pl-6 text-body space-y-1">
        <li>
          Точный адрес специалиста и клиента, контактные данные клиента
          публично <strong>никогда</strong> не раскрываются.
        </li>
        <li>
          Приватные заметки специалиста и обратная связь клиента
          <strong> не публикуются</strong> и доступны только владельцу
          профиля и (для своего отзыва) клиенту по защищённой ссылке.
        </li>
        <li>
          Не храните в платформе медицинские диагнозы — это не медицинская
          система.
        </li>
      </ul>

      <h2 className="h3 mt-10 mb-3">3. Передача третьим лицам</h2>
      <p className="text-body">
        Данные передаются только инфраструктурным провайдерам, необходимым
        для работы сервиса (хостинг, база данных, платёжный провайдер
        YooKassa). Платёжные реквизиты карт платформа не хранит.
      </p>

      <h2 className="h3 mt-10 mb-3">4. Права пользователя</h2>
      <p className="text-body">
        Вы можете запросить удаление аккаунта и связанных данных через
        форму поддержки в личном кабинете.
      </p>

      <p className="text-body mt-6">
        См. также{" "}
        <Link className="text-accent hover:underline" href="/terms">
          Пользовательское соглашение
        </Link>
        .
      </p>
    </div>
  );
}
