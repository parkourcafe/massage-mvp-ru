import type { Metadata } from "next";
import Link from "next/link";
import { PLANS } from "@/lib/plans";
import { formatRub } from "@/lib/util";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Тарифы",
  description:
    "Тарифы для массажистов: Free и Pro. Pro открывает SEO, медиа, AI-подбор, заявки, CRM и аналитику.",
  path: "/pricing",
});

const FEATURE_LABELS: Record<string, string> = {
  canUseSeoIndexing: "SEO-индексация профиля",
  canReceiveBookings: "Приём заявок на запись",
  canUseMediaFull: "Полная медиагалерея",
  canUseClientCRM: "CRM клиентов",
  canUseAnalytics: "Аналитика",
  canUseManagerSupport: "Поддержка менеджера",
  canUseAiImport: "AI-импорт профиля",
  canUseAiMatchVisibility: "Видимость в AI-подборе",
  canUseInternalMessaging: "Внутренние сообщения",
  canUsePrivateSessionNotes: "Приватные заметки о сеансах",
};

export default function PricingPage() {
  const plans = [PLANS.free, PLANS.pro, PLANS.expert];
  return (
    <div className="container-px py-24">
      <div className="eyebrow">
        <span className="num-label">01</span> Тарифы
      </div>
      <h1 className="h1 mt-6">Один профиль — три тарифа.</h1>
      <p className="body-lg mt-6 max-w-xl">
        Платформа монетизируется через подписку специалиста. Оплата клиентом
        сеансов в MVP не реализуется.
      </p>
      <div className="mt-16 grid gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          const featured = plan.id === "pro";
          return (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-[var(--r-card)] p-6 ${
                featured
                  ? "bg-gradient-to-br from-accent to-plum-700 text-white"
                  : "card"
              }`}
            >
              {featured && (
                <span className="absolute right-6 top-6 text-[10px] uppercase tracking-[0.14em] text-white/70">
                  ★ Рекомендуем
                </span>
              )}
              <h2
                className={`eyebrow ${
                  featured ? "text-white/70" : ""
                }`}
              >
                {plan.title}
              </h2>
              <p
                className={`serif mt-3 text-[40px] leading-none ${
                  featured ? "text-white" : "text-heading"
                }`}
              >
                {plan.price_rub === 0 ? "0 ₽" : formatRub(plan.price_rub)}
                {plan.price_rub > 0 && (
                  <span
                    className={`text-sm font-normal ${
                      featured ? "text-white/60" : "text-secondary"
                    }`}
                  >
                    {" "}
                    / мес
                  </span>
                )}
              </p>
              <ul className="mt-6 space-y-2 text-sm flex-1">
                {Object.keys(FEATURE_LABELS).map((k) => (
                  <li
                    key={k}
                    className={
                      featured
                        ? plan.features[k]
                          ? "text-white"
                          : "text-white/45"
                        : plan.features[k]
                          ? "text-body"
                          : "text-secondary"
                    }
                  >
                    {plan.features[k] ? "✓" : "—"} {FEATURE_LABELS[k]}
                  </li>
                ))}
                {plan.id === "expert" && (
                  <li className="text-body">
                    ✓ Приоритетное размещение, PDF-профиль, расширенная аналитика
                  </li>
                )}
              </ul>
              <Link
                href="/dashboard/billing"
                className={`mt-8 ${
                  featured
                    ? "btn bg-white text-obsidian-0 hover:brightness-95"
                    : plan.id === "free"
                      ? "btn-secondary"
                      : "btn-primary"
                }`}
              >
                {plan.id === "free"
                  ? "Начать бесплатно"
                  : `Подключить ${plan.title}`}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
