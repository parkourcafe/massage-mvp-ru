import { getI18n } from "@/lib/i18n/server";
import { getPaymentStatusLabel } from "@/lib/i18n/labels";
import type { PaymentStatus } from "@/lib/strand/types";
import { StatusBadge } from "./StatusBadge";

export async function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const { locale } = await getI18n();
  const tone =
    status === "succeeded"
      ? "success"
      : status === "pending" || status === "renewal_due"
        ? "warning"
        : status === "refunded"
          ? "accent"
          : "danger";

  return <StatusBadge tone={tone}>{getPaymentStatusLabel(locale, status)}</StatusBadge>;
}
