import { getI18n } from "@/lib/i18n/server";
import { getMediaStatusLabel } from "@/lib/i18n/labels";
import type { MediaStatus } from "@/lib/strand/types";
import { StatusBadge } from "./StatusBadge";

export async function ModerationStatusBadge({ status }: { status: MediaStatus }) {
  const { locale } = await getI18n();
  const tone =
    status === "approved"
      ? "success"
      : status === "pending"
        ? "warning"
        : "danger";

  return <StatusBadge tone={tone}>{getMediaStatusLabel(locale, status)}</StatusBadge>;
}
