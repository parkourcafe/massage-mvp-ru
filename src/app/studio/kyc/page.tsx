import { AppShell } from "@/components/AppShell";
import { KycStatusPanel } from "@/components/KycStatusPanel";
import { StudioKycManager } from "@/components/StudioKycManager";
import { getI18n } from "@/lib/i18n/server";
import { getStudioKycVerification } from "@/lib/strand/repository";

export default async function StudioKycPage() {
  const { locale } = await getI18n();
  const verification = await getStudioKycVerification();

  return (
    <AppShell
      eyebrow={locale === "ru" ? "Кабинет модели" : "Model studio"}
      title={locale === "ru" ? "KYC-верификация" : "KYC verification"}
      intro={
        locale === "ru"
          ? "KYC flow должен ощущаться профессионально и спокойно. Проверка личности - это publication gate, а не маркетинговый элемент."
          : "The KYC flow should feel professional and reassuring. Identity verification is a publication gate, not a marketing flourish."
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <StudioKycManager initialVerification={verification} />
        <div className="space-y-6">
          <KycStatusPanel status={verification.status} reason={verification.rejectionReason} />
        </div>
      </div>
    </AppShell>
  );
}
