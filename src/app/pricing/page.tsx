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
    <div className="container-px py-10">
      <h1 className="text-2xl font-bold text-slate-900">Тарифы</h1>
      <p className="mt-1 text-slate-600">
        Платформа монетизируется через подписку специалиста. Оплата клиентом
        сеансов в MVP не реализуется.
      </p>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`card flex flex-col ${
              plan.id === "pro" ? "ring-2 ring-brand-500" : ""
            }`}
          >
            <h2 className="text-lg font-semibold">{plan.title}</h2>
            <p className="mt-2 text-3xl font-bold">
              {plan.price_rub === 0 ? "0 ₽" : formatRub(plan.price_rub)}
              {plan.price_rub > 0 && (
                <span className="text-sm font-normal text-slate-500">
                  {" "}
                  / мес
                </span>
              )}
            </p>
            <ul className="mt-4 space-y-1.5 text-sm flex-1">
              {Object.keys(FEATURE_LABELS).map((k) => (
                <li
                  key={k}
                  className={
                    plan.features[k] ? "text-slate-700" : "text-slate-400"
                  }
                >
                  {plan.features[k] ? "✓" : "—"} {FEATURE_LABELS[k]}
                </li>
              ))}
              {plan.id === "expert" && (
                <li className="text-slate-700">
                  ✓ Приоритетное размещение, PDF-профиль, расширенная аналитика
                </li>
              )}
            </ul>
            <Link
              href="/dashboard/billing"
              className={`mt-6 ${
                plan.id === "free" ? "btn-secondary" : "btn-primary"
              }`}
            >
              {plan.id === "free" ? "Начать бесплатно" : `Подключить ${plan.title}`}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
