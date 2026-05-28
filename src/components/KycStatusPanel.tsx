import { getI18n } from "@/lib/i18n/server";
import { getKycStatusLabel } from "@/lib/i18n/labels";
import { StatusBadge } from "./StatusBadge";

export async function KycStatusPanel({
  status,
  reason,
}: {
  status: "not_started" | "pending" | "approved" | "rejected";
  reason?: string;
}) {
  const { locale } = await getI18n();
  const tone =
    status === "approved"
      ? "success"
      : status === "pending"
        ? "warning"
        : status === "rejected"
          ? "danger"
          : "neutral";

  return (
    <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-2xl text-heading">{locale === "ru" ? "Статус KYC" : "KYC status"}</h3>
        <StatusBadge tone={tone}>{getKycStatusLabel(locale, status)}</StatusBadge>
      </div>
      <p className="mt-3 text-sm leading-7 text-body">
        {locale === "ru"
          ? "Проверка личности должна быть одобрена до того, как профиль модели можно будет показать как опубликованный или verified."
          : "Identity verification must be approved before a model profile can be shown as live or verified."}
      </p>
      {reason ? (
        <p className="mt-4 text-sm text-secondary">
          {locale === "ru" ? "Причина" : "Reason"}: {reason}
        </p>
      ) : null}
    </div>
  );
}
