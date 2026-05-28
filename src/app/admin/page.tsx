import { AppShell } from "@/components/AppShell";
import { AdminMetricCard } from "@/components/AdminMetricCard";
import { AdminSidebar } from "@/components/AdminSidebar";
import { getI18n } from "@/lib/i18n/server";
import {
  getModerationCaseStatusLabel,
  getPriorityLabel,
} from "@/lib/i18n/labels";
import {
  getAdminMetrics,
  listAuditLog,
  listModerationCases,
} from "@/lib/strand/repository";

export default async function AdminPage() {
  const { locale } = await getI18n();
  const [metrics, moderationCases, auditLog] = await Promise.all([
    getAdminMetrics(),
    listModerationCases(),
    listAuditLog(),
  ]);

  return (
    <AppShell
      eyebrow={locale === "ru" ? "Админ" : "Admin"}
      title={locale === "ru" ? "Дашборд риска и compliance" : "Risk and compliance dashboard"}
      intro={
        locale === "ru"
          ? "Admin shell ставит в приоритет операционный риск: pending KYC, backlog модерации, reports, failed payments, chargebacks, suspensions и audit logs."
          : "The admin shell prioritises operational risk: pending KYC, moderation backlog, reports, failed payments, chargebacks, suspensions, and audit logs."
      }
    >
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <AdminSidebar />
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <AdminMetricCard label={locale === "ru" ? "Ожидает KYC" : "Pending KYC"} value={String(metrics.pendingKyc)} detail={locale === "ru" ? "Профили, ожидающие approve или reject." : "Profiles waiting for approval or rejection."} />
            <AdminMetricCard label={locale === "ru" ? "Проверка медиа" : "Media review"} value={String(metrics.pendingMedia)} detail={locale === "ru" ? "Ассеты, требующие решения модерации." : "Assets requiring moderation decisions."} />
            <AdminMetricCard label={locale === "ru" ? "Проблемные платежи" : "Failed payments"} value={String(metrics.failedPayments)} detail={locale === "ru" ? "Продления, ошибки, возвраты и чарджбэки." : "Renewals, failures, refunds, and chargebacks."} />
            <AdminMetricCard label={locale === "ru" ? "Репорты" : "Reported cases"} value={String(metrics.reportedProfiles)} detail={locale === "ru" ? "Открытые и эскалированные сигналы trust and safety." : "Open and escalated trust and safety signals."} />
            <AdminMetricCard label={locale === "ru" ? "Чарджбэки" : "Chargebacks"} value={String(metrics.chargebacks)} detail={locale === "ru" ? "Платёжные споры, влияющие на доступ и риск." : "Payment disputes affecting access and risk."} />
            <AdminMetricCard label={locale === "ru" ? "Suspended users" : "Suspended users"} value={String(metrics.suspendedUsers)} detail={locale === "ru" ? "Приостановленные профили и доступы." : "Suspended profiles and access states."} />
          </div>
          <section className="panel p-6">
            <h2 className="text-3xl text-heading">
              {locale === "ru" ? "Репорты и эскалированные кейсы" : "Reported and escalated cases"}
            </h2>
            <div className="mt-5 grid gap-3">
              {moderationCases.map((item) => (
                <div key={item.id} className="rounded-[20px] border border-white/10 p-4 text-sm text-body">
                  {item.subject} • {getModerationCaseStatusLabel(locale, item.status)} • {getPriorityLabel(locale, item.priority)}
                </div>
              ))}
            </div>
          </section>
          <section className="panel p-6">
            <h2 className="text-3xl text-heading">{locale === "ru" ? "Аудит-лог" : "Audit log"}</h2>
            <div className="mt-5 grid gap-3">
              {auditLog.map((entry) => (
                <div key={entry.id} className="rounded-[20px] border border-white/10 p-4 text-sm text-body">
                  {entry.createdAt} • {entry.actor} • {entry.action} • {entry.target}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
