import { AppShell } from "@/components/AppShell";
import { getI18n } from "@/lib/i18n/server";

export default async function PrivacyPage() {
  const { locale } = await getI18n();

  return (
    <AppShell
      eyebrow="Legal"
      title={locale === "ru" ? "Конфиденциальность" : "Privacy"}
      intro={
        locale === "ru"
          ? "Privacy settings - центральная часть продукта. Эта страница зарезервирована под формулировки о данных, хранении, раскрытии, безопасности и правах пользователей."
          : "Privacy settings are central to the product. This page is reserved for data handling, retention, disclosure, security, and user rights language."
      }
    >
      <div className="panel p-6 text-sm leading-7 text-body">
        {locale === "ru"
          ? "Финальные privacy-формулировки должны отдельно покрывать KYC-документы, moderation artifacts, subscription events и обработку репортов."
          : "Final privacy wording should specifically cover KYC documents, moderation artifacts, subscription events, and report handling."}
      </div>
    </AppShell>
  );
}
