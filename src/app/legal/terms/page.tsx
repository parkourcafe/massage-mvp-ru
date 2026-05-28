import { AppShell } from "@/components/AppShell";
import { getI18n } from "@/lib/i18n/server";

export default async function TermsPage() {
  const { locale } = await getI18n();

  return (
    <AppShell
      eyebrow={locale === "ru" ? "Legal" : "Legal"}
      title={locale === "ru" ? "Условия" : "Terms"}
      intro={
        locale === "ru"
          ? "Этот placeholder описывает структуру platform terms, acceptable use, условий подписки, полномочий модерации и контролей доступа к аккаунту."
          : "This placeholder outlines the structure for platform terms, acceptable use, subscription conditions, moderation powers, and account access controls."
      }
    >
      <div className="panel p-6 text-sm leading-7 text-body">
        {locale === "ru"
          ? "Финальный юридический текст должен быть подготовлен и проверен до запуска. Phase 1 задаёт только route, layout и структуру контента."
          : "Final legal text must be drafted and reviewed before launch. Phase 1 establishes the route, layout, and content structure only."}
      </div>
    </AppShell>
  );
}
