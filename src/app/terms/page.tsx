import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata, SITE_NAME } from "@/lib/seo";

export function generateMetadata(): Metadata {
  return pageMetadata({
    title: "Пользовательское соглашение",
    description: `Условия использования сервиса ${SITE_NAME}.`,
    path: "/terms",
  });
}

export default function TermsPage() {
  return (
    <div className="container-px py-10 max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">
        Пользовательское соглашение
      </h1>
      <p className="text-sm text-slate-500">Редакция от 17.05.2026</p>

      <h2 className="font-semibold mt-6">1. Предмет</h2>
      <p className="text-slate-700">
        {SITE_NAME} — информационная платформа, позволяющая независимым
        специалистам по профессиональному оздоровительному массажу
        размещать профиль и принимать заявки на запись от клиентов.
        Платформа не оказывает массажные услуги, не является работодателем
        специалистов и стороной расчётов между специалистом и клиентом.
      </p>

      <h2 className="font-semibold mt-6">2. Допустимый контент</h2>
      <p className="text-slate-700">
        Разрешён только профессиональный wellness / лечебный / спортивный /
        СПА массаж. Эротический, интимный, сексуальный контент и «спец-
        услуги» категорически запрещены и удаляются, аккаунт блокируется.
        Платформа не является медицинской организацией; информация на
        профилях не является медицинской консультацией.
      </p>

      <h2 className="font-semibold mt-6">3. Аккаунт специалиста</h2>
      <p className="text-slate-700">
        Специалист отвечает за достоверность данных профиля, наличие
        необходимого образования и права вести деятельность, за соблюдение
        санитарных норм и профессиональных границ, а также за налоговые
        обязательства. Профиль публикуется после прохождения модерации.
      </p>

      <h2 className="font-semibold mt-6">4. Ответственность</h2>
      <p className="text-slate-700">
        Платформа предоставляется «как есть». {SITE_NAME} не несёт
        ответственности за качество услуг специалистов и за договорённости
        между специалистом и клиентом. Споры решаются сторонами
        самостоятельно.
      </p>

      <h2 className="font-semibold mt-6">5. Документы</h2>
      <p className="text-slate-700">
        См. также{" "}
        <Link className="text-brand-700 underline" href="/privacy">
          Политику конфиденциальности
        </Link>
        ,{" "}
        <Link className="text-brand-700 underline" href="/offer">
          Публичную оферту
        </Link>{" "}
        и{" "}
        <Link className="text-brand-700 underline" href="/subscription-terms">
          Условия подписки
        </Link>
        .
      </p>
    </div>
  );
}
