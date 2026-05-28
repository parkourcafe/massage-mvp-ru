import { AppShell } from "@/components/AppShell";
import { AgeGateCard } from "@/components/AgeGateCard";
import { getI18n } from "@/lib/i18n/server";

export default async function AgeGatePage() {
  const { locale } = await getI18n();

  return (
    <AppShell
      eyebrow={locale === "ru" ? "Доступ 18+" : "18+ access"}
      title={locale === "ru" ? "Подтверждение возраста" : "Age confirmation"}
      intro={
        locale === "ru"
          ? "Профессиональный контроль доступа - часть foundation платформы. Посетители должны подтвердить, что им 18 или больше, прежде чем просматривать adult profile content."
          : "Professional access control is part of the platform foundation. Visitors should confirm they are 18 or older before browsing adult profile content."
      }
    >
      <AgeGateCard />
    </AppShell>
  );
}
