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
    <div className="container-px py-24 max-w-3xl">
      <div className="eyebrow">Документы</div>
      <h1 className="h1 mt-6">Пользовательское соглашение</h1>
      <p className="small mt-4 text-secondary">Редакция от 17.05.2026</p>
      <hr className="rule my-10" />

      <h2 className="h3 mt-10 mb-3">1. Предмет</h2>
      <p className="text-body">
        {SITE_NAME} — информационная платформа, позволяющая независимым
        специалистам по профессиональному оздоровительному массажу
        размещать профиль и принимать заявки на запись от клиентов.
        Платформа не оказывает массажные услуги, не является работодателем
        специалистов и стороной расчётов между специалистом и клиентом.
      </p>

      <h2 className="h3 mt-10 mb-3">2. Допустимый контент</h2>
      <p className="text-body">
        Разрешён только профессиональный wellness / лечебный / спортивный /
        СПА массаж. Эротический, интимный, сексуальный контент и «спец-
        услуги» категорически запрещены и удаляются, аккаунт блокируется.
        Платформа не является медицинской организацией; информация на
        профилях не является медицинской консультацией.
      </p>

      <h2 className="h3 mt-10 mb-3">3. Аккаунт специалиста</h2>
      <p className="text-body">
        Специалист отвечает за достоверность данных профиля, наличие
        необходимого образования и права вести деятельность, за соблюдение
        санитарных норм и профессиональных границ, а также за налоговые
        обязательства. Профиль публикуется после прохождения модерации.
      </p>

      <h2 className="h3 mt-10 mb-3">4. Ответственность</h2>
      <p className="text-body">
        Платформа предоставляется «как есть». {SITE_NAME} не несёт
        ответственности за качество услуг специалистов и за договорённости
        между специалистом и клиентом. Споры решаются сторонами
        самостоятельно.
      </p>

      <h2 className="h3 mt-10 mb-3">5. Документы</h2>
      <p className="text-body">
        См. также{" "}
        <Link className="text-accent hover:underline" href="/privacy">
          Политику конфиденциальности
        </Link>
        ,{" "}
        <Link className="text-accent hover:underline" href="/offer">
          Публичную оферту
        </Link>{" "}
        и{" "}
        <Link className="text-accent hover:underline" href="/subscription-terms">
          Условия подписки
        </Link>
        .
      </p>
    </div>
  );
}
