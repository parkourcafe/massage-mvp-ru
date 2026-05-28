import { AppShell } from "@/components/AppShell";
import { StudioMediaManager } from "@/components/StudioMediaManager";
import { getI18n } from "@/lib/i18n/server";
import { listStudioMediaAssets } from "@/lib/strand/repository";

export default async function StudioMediaPage() {
  const { locale } = await getI18n();
  const mediaRows = await listStudioMediaAssets();

  return (
    <AppShell
      eyebrow={locale === "ru" ? "Кабинет модели" : "Model studio"}
      title={locale === "ru" ? "Медиатека" : "Media library"}
      intro={
        locale === "ru"
          ? "Все медиа проходят проверку до публикации. MVP включает состояния пустой загрузки, обработки, результатов модерации, видимости и заблокированных private previews."
          : "All media is reviewed before publication. The MVP includes states for empty uploads, processing, moderation outcomes, visibility, and locked private previews."
      }
    >
      <StudioMediaManager initialAssets={mediaRows} />
    </AppShell>
  );
}
