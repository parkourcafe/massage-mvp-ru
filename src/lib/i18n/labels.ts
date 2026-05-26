import type {
  KycStatus,
  MediaStatus,
  ModerationCaseStatus,
  PaymentStatus,
  Priority,
  PublicationStatus,
  SubscriptionStatus,
  UserRole,
} from "@/lib/strand/types";
import type { Locale } from "./types";

export function getRoleLabel(locale: Locale, role: UserRole) {
  const labels: Record<UserRole, { en: string; ru: string }> = {
    guest: { en: "Guest", ru: "Гость" },
    client: { en: "Client", ru: "Клиент" },
    model: { en: "Model", ru: "Модель" },
    kyc_reviewer: { en: "KYC reviewer", ru: "Проверяющий KYC" },
    support: { en: "Support", ru: "Поддержка" },
    admin: { en: "Admin", ru: "Админ" },
  };

  return labels[role][locale];
}

export function getKycStatusLabel(locale: Locale, status: KycStatus) {
  const labels: Record<KycStatus, { en: string; ru: string }> = {
    not_started: { en: "Not started", ru: "Не начато" },
    pending: { en: "Pending", ru: "На проверке" },
    approved: { en: "Approved", ru: "Подтверждено" },
    rejected: { en: "Rejected", ru: "Отклонено" },
  };

  return labels[status][locale];
}

export function getPublicationStatusLabel(locale: Locale, status: PublicationStatus) {
  const labels: Record<PublicationStatus, { en: string; ru: string }> = {
    draft: { en: "Draft", ru: "Черновик" },
    pending_kyc: { en: "Pending KYC", ru: "Ожидает KYC" },
    pending_media_review: { en: "Pending media review", ru: "Ожидает проверки медиа" },
    ready_to_publish: { en: "Ready to publish", ru: "Готово к публикации" },
    live: { en: "Live", ru: "Опубликовано" },
    suspended: { en: "Suspended", ru: "Приостановлено" },
  };

  return labels[status][locale];
}

export function getMediaStatusLabel(locale: Locale, status: MediaStatus) {
  const labels: Record<MediaStatus, { en: string; ru: string }> = {
    pending: { en: "Pending", ru: "На проверке" },
    approved: { en: "Approved", ru: "Одобрено" },
    rejected: { en: "Rejected", ru: "Отклонено" },
    hidden: { en: "Hidden", ru: "Скрыто" },
  };

  return labels[status][locale];
}

export function getSubscriptionStatusLabel(locale: Locale, status: SubscriptionStatus) {
  const labels: Record<SubscriptionStatus, { en: string; ru: string }> = {
    active: { en: "Active", ru: "Активна" },
    expired: { en: "Expired", ru: "Истекла" },
    cancelled: { en: "Cancelled", ru: "Отменена" },
    pending: { en: "Pending", ru: "Ожидает" },
    past_due: { en: "Past due", ru: "Просрочена" },
  };

  return labels[status][locale];
}

export function getPaymentStatusLabel(locale: Locale, status: PaymentStatus) {
  const labels: Record<PaymentStatus, { en: string; ru: string }> = {
    succeeded: { en: "Succeeded", ru: "Успешно" },
    failed: { en: "Failed", ru: "Неуспешно" },
    renewal_due: { en: "Renewal due", ru: "Скоро продление" },
    refunded: { en: "Refunded", ru: "Возврат" },
    chargeback: { en: "Chargeback", ru: "Чарджбэк" },
    pending: { en: "Pending", ru: "Ожидает" },
  };

  return labels[status][locale];
}

export function getModerationCaseStatusLabel(
  locale: Locale,
  status: ModerationCaseStatus,
) {
  const labels: Record<ModerationCaseStatus, { en: string; ru: string }> = {
    open: { en: "Open", ru: "Открыт" },
    in_review: { en: "In review", ru: "На рассмотрении" },
    resolved: { en: "Resolved", ru: "Решён" },
    escalated: { en: "Escalated", ru: "Эскалирован" },
  };

  return labels[status][locale];
}

export function getPriorityLabel(locale: Locale, priority: Priority) {
  const labels: Record<Priority, { en: string; ru: string }> = {
    low: { en: "Low", ru: "Низкий" },
    medium: { en: "Medium", ru: "Средний" },
    high: { en: "High", ru: "Высокий" },
    critical: { en: "Critical", ru: "Критический" },
  };

  return labels[priority][locale];
}
