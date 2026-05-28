import { AdminReportsManager } from "@/components/AdminReportsManager";
import { AppShell } from "@/components/AppShell";
import { AdminSidebar } from "@/components/AdminSidebar";
import { getI18n } from "@/lib/i18n/server";
import { listModerationCases } from "@/lib/strand/repository";

export default async function AdminReportsPage() {
  const { locale } = await getI18n();
  const moderationCases = await listModerationCases();

  return (
    <AppShell
      eyebrow={locale === "ru" ? "Админ" : "Admin"}
      title={locale === "ru" ? "Кейсы модерации" : "Moderation cases"}
      intro={
        locale === "ru"
          ? "Репорты представлены как структурированные moderation cases с target type, reason, status, priority, assignment и placeholder-history действий."
          : "Reports are represented as structured moderation cases with target type, reason, status, priority, assignment, and action history placeholders."
      }
    >
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <AdminSidebar />
        <AdminReportsManager initialCases={moderationCases} />
      </div>
    </AppShell>
  );
}
