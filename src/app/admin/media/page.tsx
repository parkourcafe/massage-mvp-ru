import { AdminMediaModerationManager } from "@/components/AdminMediaModerationManager";
import { AppShell } from "@/components/AppShell";
import { AdminSidebar } from "@/components/AdminSidebar";
import { getI18n } from "@/lib/i18n/server";
import { listAdminMediaQueue } from "@/lib/strand/repository";

export default async function AdminMediaPage() {
  const { locale } = await getI18n();
  const assets = await listAdminMediaQueue();

  return (
    <AppShell
      eyebrow={locale === "ru" ? "Админ" : "Admin"}
      title={locale === "ru" ? "Модерация медиа" : "Media moderation"}
      intro={
        locale === "ru"
          ? "Phase 1 включает очередь, статус на уровне ассета, review-действия и возможность скрывать уже опубликованные медиа после модерации."
          : "Phase 1 includes a queue, asset-level status, review actions, and the ability to hide already-published media after moderation."
      }
    >
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <AdminSidebar />
        <AdminMediaModerationManager initialAssets={assets} />
      </div>
    </AppShell>
  );
}
