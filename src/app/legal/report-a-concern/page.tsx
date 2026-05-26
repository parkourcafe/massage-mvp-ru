import { AppShell } from "@/components/AppShell";
import { ReportConcernForm } from "@/components/ReportConcernForm";
import { getI18n } from "@/lib/i18n/server";

export default async function ReportConcernPage() {
  const { locale } = await getI18n();

  return (
    <AppShell
      eyebrow={locale === "ru" ? "Trust и safety" : "Trust and safety"}
      title={locale === "ru" ? "Сообщить о проблеме" : "Report a concern"}
      intro={
        locale === "ru"
          ? "Phase 1 включает отдельный маршрут для concern-reporting, чтобы сигналы по модерации и безопасности имели понятную точку входа с публичных страниц профилей."
          : "Phase 1 includes a dedicated concern-reporting route so moderation and safety signals have a clear entry point from public profile pages."
      }
    >
      <ReportConcernForm />
    </AppShell>
  );
}
