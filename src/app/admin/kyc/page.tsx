import { AppShell } from "@/components/AppShell";
import { AdminKycQueueManager } from "@/components/AdminKycQueueManager";
import { AdminSidebar } from "@/components/AdminSidebar";
import { getI18n } from "@/lib/i18n/server";
import { listAdminKycApplicants } from "@/lib/strand/repository";

export default async function AdminKycPage() {
  const { locale } = await getI18n();
  const applicants = await listAdminKycApplicants();

  return (
    <AppShell
      eyebrow={locale === "ru" ? "Админ" : "Admin"}
      title={locale === "ru" ? "Очередь проверки KYC" : "KYC review queue"}
      intro={
        locale === "ru"
          ? "Очередь KYC поддерживает проверку заявителей, placeholder-панели документов, действия approve/reject и видимость для аудита."
          : "The KYC queue supports applicant review, placeholder document panels, approval and rejection actions, and audit visibility."
      }
    >
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <AdminSidebar />
        <AdminKycQueueManager initialApplicants={applicants} />
      </div>
    </AppShell>
  );
}
