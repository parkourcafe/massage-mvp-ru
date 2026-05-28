import { AppShell } from "@/components/AppShell";
import { ComplianceDisclaimer } from "@/components/ComplianceDisclaimer";
import { StudioProfileEditor } from "@/components/StudioProfileEditor";
import { getI18n } from "@/lib/i18n/server";
import {
  getStudioProfileDraft,
  getStudioStatusSnapshot,
} from "@/lib/strand/repository";

export default async function StudioProfilePage() {
  const { locale } = await getI18n();
  const [profile, snapshot] = await Promise.all([
    getStudioProfileDraft(),
    getStudioStatusSnapshot(),
  ]);

  if (!profile) return null;

  return (
    <AppShell
      eyebrow={locale === "ru" ? "Кабинет модели" : "Model studio"}
      title={locale === "ru" ? "Редактор профиля" : "Profile editor"}
      intro={
        locale === "ru"
          ? "Редактор разделён между деталями профиля и сдержанным preview. Публикация должна оставаться заблокированной, пока не выполнены требования KYC и moderation."
          : "The editor is split between profile details and a restrained preview. Publication should stay blocked until KYC and moderation requirements are satisfied."
      }
    >
      <StudioProfileEditor initialProfile={profile} snapshot={snapshot} />
      <div className="mt-6">
        <ComplianceDisclaimer
          body={
            locale === "ru"
              ? "На небольших экранах split editor могут заменить mobile tabs. Публикация должна оставаться gated, пока не завершены проверки профиля, KYC и медиа."
              : "Mobile tabs can replace the split editor on smaller screens. Publication should remain gated until profile, KYC, and media checks are complete."
          }
        />
      </div>
    </AppShell>
  );
}
