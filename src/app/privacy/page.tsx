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
    <div className="container-px py-10 max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">
        Политика конфиденциальности
      </h1>
      <p className="text-sm text-slate-500">Редакция от 17.05.2026</p>

      <h2 className="font-semibold mt-6">1. Какие данные обрабатываются</h2>
      <p className="text-slate-700">
        Данные аккаунта (email), данные профиля специалиста, заявки на
        запись (имя клиента, контакт, пожелания), переписка по заявке,
        приватные заметки специалиста и обратная связь клиента, данные
        о подписке и платежах.
      </p>

      <h2 className="font-semibold mt-6">2. Принципы приватности</h2>
      <ul className="list-disc pl-6 text-slate-700 space-y-1">
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

      <h2 className="font-semibold mt-6">3. Передача третьим лицам</h2>
      <p className="text-slate-700">
        Данные передаются только инфраструктурным провайдерам, необходимым
        для работы сервиса (хостинг, база данных, платёжный провайдер
        YooKassa). Платёжные реквизиты карт платформа не хранит.
      </p>

      <h2 className="font-semibold mt-6">4. Права пользователя</h2>
      <p className="text-slate-700">
        Вы можете запросить удаление аккаунта и связанных данных через
        форму поддержки в личном кабинете.
      </p>

      <p className="text-slate-700">
        См. также{" "}
        <Link className="text-brand-700 underline" href="/terms">
          Пользовательское соглашение
        </Link>
        .
      </p>
    </div>
  );
}
