import Link from "next/link";
import { getI18n } from "@/lib/i18n/server";
import { getRoleLabel } from "@/lib/i18n/labels";
import { type RoleAccessResult } from "@/lib/strand/authz";

export async function AccessGateNotice({
  access,
  title,
}: {
  access: RoleAccessResult;
  title: string;
}) {
  const { locale, messages } = await getI18n();

  if (!access.hasAccess) {
    return (
      <div className="container-px pt-8">
        <div className="panel p-6">
          <p className="eyebrow">{messages.common.accessRequired}</p>
          <h1 className="mt-3 text-4xl text-heading">{title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-body">
            {locale === "ru"
              ? `Для этого раздела требуется одна из следующих ролей: ${access.allowed
                  .map((role) => getRoleLabel(locale, role))
                  .join(", ")}. Текущая роль: ${getRoleLabel(locale, access.role)}.`
              : `This section requires one of the following roles: ${access.allowed
                  .map((role) => getRoleLabel(locale, role))
                  .join(", ")}. Current role: ${getRoleLabel(locale, access.role)}.`}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/auth" className="btn-primary">
              {messages.common.goToAuth}
            </Link>
            <Link href="/" className="btn-secondary">
              {messages.common.returnHome}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!access.isPreview) return null;

  return (
    <div className="container-px pt-8">
      <div className="rounded-[24px] border border-[#d7c3a2]/25 bg-[#d7c3a2]/10 px-5 py-4 text-sm text-body">
        {locale === "ru" ? "Включён preview-доступ." : "Preview access active."}{" "}
        {locale === "ru" ? "Рендерим" : "Rendering"}{" "}
        <span className="text-heading">{title}</span>{" "}
        {locale === "ru" ? "с ролью" : "with role"}{" "}
        <span className="text-heading">{getRoleLabel(locale, access.role)}</span>.{" "}
        {locale === "ru"
          ? "Перед запуском это нужно заменить на реальное Supabase-определение ролей."
          : "Replace this with real Supabase-authenticated role resolution before launch."}
      </div>
    </div>
  );
}
