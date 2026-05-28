import { AppShell } from "@/components/AppShell";
import { getI18n } from "@/lib/i18n/server";

export default async function Legal18PlusPage() {
  const { locale } = await getI18n();

  return (
    <AppShell
      eyebrow="Legal"
      title={locale === "ru" ? "Политика 18+" : "18+ policy"}
      intro={
        locale === "ru"
          ? "Эта страница поддерживает age-gate, обязанности посетителей и модель ограниченного доступа для adults-only marketplace."
          : "This page supports the age-gate, visitor responsibilities, and restricted-access framing for an adults-only marketplace."
      }
    >
      <div className="panel p-6 text-sm leading-7 text-body">
        {locale === "ru"
          ? "Финальная политика должна определить, как работает подтверждение возраста, какой контент ограничивается и что происходит при отказе в доступе."
          : "The final policy should define how age confirmation works, what content is restricted, and what happens when access is declined."}
      </div>
    </AppShell>
  );
}
