import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { KycStatusPanel } from "@/components/KycStatusPanel";
import { StatusBadge } from "@/components/StatusBadge";
import { getPublicationStatusLabel } from "@/lib/i18n/labels";
import { getI18n } from "@/lib/i18n/server";
import {
  getStudioKycVerification,
  getStudioStatusSnapshot,
} from "@/lib/strand/repository";

export default async function StudioPage() {
  const { locale } = await getI18n();
  const [snapshot, verification] = await Promise.all([
    getStudioStatusSnapshot(),
    getStudioKycVerification(),
  ]);
  const checklist =
    locale === "ru"
      ? [
          ["profileComplete", "Детали профиля заполнены"],
          ["kycReady", "KYC одобрен"],
          ["mediaReady", "Медиа загружены и одобрены"],
          ["pricingReady", "Настроена цена подписки"],
          ["locationReady", "Сохранены локация и доступность"],
        ]
      : [
          ["profileComplete", "Profile details completed"],
          ["kycReady", "KYC approved"],
          ["mediaReady", "Media uploaded and approved"],
          ["pricingReady", "Subscription pricing configured"],
          ["locationReady", "Location and availability saved"],
        ];
  const quickLinks =
    locale === "ru"
      ? [
          ["/studio/profile", "Детали профиля"],
          ["/studio/media", "Медиатека"],
          ["/studio/kyc", "KYC-верификация"],
          ["/studio/subscriptions", "Настройки подписки"],
        ]
      : [
          ["/studio/profile", "Profile details"],
          ["/studio/media", "Media library"],
          ["/studio/kyc", "KYC verification"],
          ["/studio/subscriptions", "Subscription settings"],
        ];

  return (
    <AppShell
      eyebrow={locale === "ru" ? "Кабинет модели" : "Model studio"}
      title={locale === "ru" ? "Дашборд онбординга" : "Onboarding dashboard"}
      intro={
        locale === "ru"
          ? "Studio построен вокруг готовности к публикации: заполнить профиль, пройти KYC, отправить медиа на проверку, настроить цену и только потом переходить в live status."
          : "The studio is built around publishing readiness: complete profile fields, pass KYC, submit media for review, configure pricing, and only then move to live status."
      }
      actions={
        <StatusBadge
          tone={
            snapshot.status === "live"
              ? "success"
              : snapshot.status === "ready_to_publish"
                ? "accent"
                : snapshot.status === "suspended"
                  ? "danger"
                  : "warning"
          }
        >
          {getPublicationStatusLabel(locale, snapshot.status)}
        </StatusBadge>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <section className="panel p-6">
          <h2 className="text-3xl text-heading">
            {locale === "ru" ? "Чеклист прогресса" : "Progress checklist"}
          </h2>
          <div className="mt-5 grid gap-3">
            {checklist.map((item, index) => (
              <div key={item[0]} className="flex items-center gap-3 rounded-[20px] border border-white/10 px-4 py-3 text-sm text-body">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#d7c3a2]/25 text-[#f0e2c7]">
                  {index + 1}
                </span>
                <span className="flex-1">{item[1]}</span>
                <span className="text-secondary">
                  {snapshot.checklist[item[0] as keyof typeof snapshot.checklist]
                    ? locale === "ru"
                      ? "Готово"
                      : "Ready"
                    : locale === "ru"
                      ? "Требует внимания"
                      : "Needs attention"}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <StatusBadge tone="neutral">{locale === "ru" ? "Черновик" : "Draft"}</StatusBadge>
            <StatusBadge tone="warning">{locale === "ru" ? "Ожидает KYC" : "Pending KYC"}</StatusBadge>
            <StatusBadge tone="warning">{locale === "ru" ? "Ожидает проверки медиа" : "Pending media review"}</StatusBadge>
            <StatusBadge tone="accent">{locale === "ru" ? "Готово к публикации" : "Ready to publish"}</StatusBadge>
            <StatusBadge tone="success">{locale === "ru" ? "Опубликовано" : "Live"}</StatusBadge>
            <StatusBadge tone="danger">{locale === "ru" ? "Приостановлено" : "Suspended"}</StatusBadge>
          </div>
        </section>
        <div className="space-y-6">
          <KycStatusPanel status={verification.status} reason={verification.rejectionReason} />
          <section className="panel p-6">
            <h2 className="text-3xl text-heading">{locale === "ru" ? "Быстрые ссылки" : "Quick links"}</h2>
            <div className="mt-4 grid gap-3">
              {quickLinks.map(([href, label]) => (
                <Link key={href} href={href} className="rounded-[20px] border border-white/10 px-4 py-3 text-sm text-body hover:text-heading">
                  {label}
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
