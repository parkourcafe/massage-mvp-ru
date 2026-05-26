import { getAppUserContext } from "./authz";
import { getLocale } from "@/lib/i18n/server";
import { getServiceClient } from "@/lib/supabase";
import { newId } from "@/lib/util";
import {
  adminKycApplicants,
  adminMediaQueue,
  auditLog,
  billingHistory,
  complianceRules,
  clientSubscriptions,
  directoryProfiles,
  filterProfiles,
  getProfileBySlug,
  moderationCases,
  privacySettings,
  savedProfiles,
  studioKycVerification,
  studioMediaAssets,
  studioProfileDraft,
  studioSubscriptionSettings,
} from "./data";
import type {
  AdminKycApplicant,
  AdminMediaQueueItem,
  AdminMetrics,
  AuditLogEntry,
  BillingEvent,
  ClientSubscription,
  DirectoryProfile,
  ModerationCase,
  PrivacySettings,
  ProfileMediaItem,
  PublicationStatus,
  SavedProfile,
  StateComplianceRule,
  StudioKycVerification,
  StudioMediaAsset,
  StudioProfileDraft,
  StudioStatusSnapshot,
  StudioSubscriptionSettings,
} from "./types";

function cloneValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function isMissingTableError(error: { message?: string } | null | undefined) {
  return Boolean(
    error?.message?.includes("Could not find the table") ||
      error?.message?.includes("relation") ||
      error?.message?.includes("schema cache"),
  );
}

function hasLiveBackend() {
  return Boolean(getServiceClient());
}

const defaultPrivacySettings: PrivacySettings = {
  discreetBilling: true,
  marketingOptIn: false,
  showActiveSubscriptions: false,
  notifyOnModerationActions: true,
};

const defaultStudioSubscriptionSettings: StudioSubscriptionSettings = {
  monthlyPrice: 0,
  entitlementSummary:
    "Active subscribers can access approved private media while their subscription remains active. Additional media entitlements may be introduced later.",
};

function createEmptyStudioStatusSnapshot(): StudioStatusSnapshot {
  return {
    status: "draft",
    checklist: {
      profileComplete: false,
      kycReady: false,
      mediaReady: false,
      pricingReady: false,
      locationReady: false,
    },
  };
}

function createEmptyStudioKycVerification(): StudioKycVerification {
  return {
    id: "live-kyc-draft",
    status: "not_started",
    governmentIdLabel: "Government ID placeholder",
    selfieLabel: "Selfie placeholder",
  };
}

const demoState = {
  savedProfiles: cloneValue(savedProfiles),
  privacySettings: cloneValue(privacySettings),
  studioProfileDraft: cloneValue(studioProfileDraft),
  studioMediaAssets: cloneValue(studioMediaAssets),
  studioKycVerification: cloneValue(studioKycVerification),
  studioSubscriptionSettings: cloneValue(studioSubscriptionSettings),
  moderationCases: cloneValue(moderationCases),
  auditLog: cloneValue(auditLog),
  adminKycApplicants: cloneValue(adminKycApplicants),
  adminMediaQueue: cloneValue(adminMediaQueue),
  billingHistory: cloneValue(billingHistory),
  clientSubscriptions: cloneValue(clientSubscriptions),
  directoryProfiles: cloneValue(directoryProfiles),
};

function localizeDirectoryProfile(profile: DirectoryProfile, locale: "en" | "ru") {
  if (locale === "en") return profile;

  const translatedBySlug: Record<
    string,
    Pick<
      DirectoryProfile,
      "shortBio" | "longBio" | "headline" | "availability" | "tags"
    > & {
      publicMediaTitles?: string[];
      privateMediaTitles?: string[];
    }
  > = {
    "ava-mercer-sydney": {
      shortBio:
        "Приватный, polished-профиль с акцентом на discretion, presentation и понятные ожидания.",
      longBio:
        "Профиль Ava показывает спокойную, премиальную структуру для приватного просмотра. Его подача делает акцент на verified-статусе, moderation review и уважительных границах, а не на сенсационном copy.",
      headline: "Editorial presence, private access, Sydney",
      availability: "Вечера и отдельные выходные",
      tags: ["Проверено", "Private gallery", "Sydney"],
      publicMediaTitles: ["Портрет профиля", "Editorial detail"],
      privateMediaTitles: ["Приватный сет 01", "Приватный сет 02"],
    },
    "clara-vale-melbourne": {
      shortBio:
        "Премиальный профиль, построенный вокруг privacy, элегантной подачи и структурированного subscription experience.",
      longBio:
        "Профиль Clara демонстрирует publication gate: подтверждённая личность, одобренные медиа и премиальный narrative, который остаётся сдержанным и профессиональным.",
      headline: "Verified profile, refined presentation, Melbourne",
      availability: "Будние дни после полудня",
      tags: ["Проверено", "Melbourne", "Доступ по подписке"],
      publicMediaTitles: ["Студийный портрет", "Detail frame"],
      privateMediaTitles: ["Приватная коллекция"],
    },
    "isla-rowe-brisbane": {
      shortBio:
        "Профиль на проверке, показывающий pre-live состояния для KYC и одобрения медиа.",
      longBio:
        "Демо-профиль Isla намеренно не является live. Он показывает, как MVP должен подавать polished draft, не создавая впечатления полной верификации или публичной публикации.",
      headline: "Основа в ожидании проверки, Brisbane",
      availability: "Ожидает публикации",
      tags: ["KYC на проверке", "Brisbane", "Черновик"],
      publicMediaTitles: ["Hero-ассет на проверке"],
      privateMediaTitles: ["Приватный pending-сет"],
    },
    "nina-hart-perth": {
      shortBio:
        "Сдержанный листинг из Perth с subscriber-only media states и показанными moderation controls.",
      longBio:
        "Страница Nina демонстрирует gating приватной галереи, moderation labels и спокойную compliance-коммуникацию в премиальном каталоге.",
      headline: "Приватный доступ, готово к модерации, Perth",
      availability: "С пятницы по воскресенье",
      tags: ["Perth", "Private gallery", "Проверено"],
      publicMediaTitles: ["Обложка профиля"],
      privateMediaTitles: ["Приватный reel", "Приватный портрет"],
    },
  };

  const translated = translatedBySlug[profile.slug];
  if (!translated) return profile;

  return {
    ...profile,
    shortBio: translated.shortBio,
    longBio: translated.longBio,
    headline: translated.headline,
    availability: translated.availability,
    tags: translated.tags,
    publicMedia: profile.publicMedia.map((item, index) => ({
      ...item,
      title: translated.publicMediaTitles?.[index] ?? item.title,
    })),
    privateMedia: profile.privateMedia.map((item, index) => ({
      ...item,
      title: translated.privateMediaTitles?.[index] ?? item.title,
    })),
  };
}

function localizeClientSubscription(
  subscription: ClientSubscription,
  locale: "en" | "ru",
) {
  if (locale === "en") return subscription;

  return {
    ...subscription,
    tier: "Месячный доступ",
  };
}

function localizeSavedProfile(profile: SavedProfile, locale: "en" | "ru") {
  if (locale === "en") return profile;

  const translatedHeadline =
    demoState.directoryProfiles.find((item) => item.slug === profile.slug)?.headline ??
    profile.headline;

  return {
    ...profile,
    headline: translatedHeadline,
  };
}

function localizeStudioMediaAsset(asset: StudioMediaAsset, locale: "en" | "ru") {
  if (locale === "en") return asset;

  const noteMap: Record<string, string> = {
    "Visible on profile": "Виден на профиле",
    "Awaiting moderation review": "Ожидает проверки модерации",
    "Reason: framing requires resubmission": "Причина: требуется переснять кадрирование",
    "Hidden after publication review": "Скрыт после проверки публикации",
    "Upload queued for moderation review": "Загрузка поставлена в очередь модерации",
  };

  return {
    ...asset,
    note: noteMap[asset.note] ?? asset.note,
    reason:
      asset.reason === "Framing requires resubmission."
        ? "Требуется повторная подача из-за кадрирования."
        : asset.reason,
  };
}

function localizeStudioKyc(verification: StudioKycVerification, locale: "en" | "ru") {
  if (locale === "en") return verification;

  return {
    ...verification,
    governmentIdLabel: "Плейсхолдер удостоверения личности",
    selfieLabel: "Плейсхолдер selfie",
    rejectionReason:
      verification.rejectionReason ===
      "ID image placeholder does not meet review requirements."
        ? "Плейсхолдер изображения ID не соответствует требованиям проверки."
        : verification.rejectionReason,
  };
}

function localizeAdminKycApplicant(applicant: AdminKycApplicant, locale: "en" | "ru") {
  if (locale === "en") return applicant;
  return {
    ...applicant,
    governmentIdLabel: "Плейсхолдер удостоверения личности",
    selfieLabel: "Плейсхолдер selfie",
    rejectionReason:
      applicant.rejectionReason ===
      "ID image placeholder does not meet review requirements."
        ? "Плейсхолдер изображения ID не соответствует требованиям проверки."
        : applicant.rejectionReason,
  };
}

function localizeAdminMediaQueueItem(item: AdminMediaQueueItem, locale: "en" | "ru") {
  if (locale === "en") return item;

  const noteMap: Record<string, string> = {
    "Awaiting moderation review": "Ожидает проверки модерации",
    "Rejected during moderation review": "Отклонён во время модерации",
    "Hidden after publication review": "Скрыт после проверки публикации",
  };

  return {
    ...item,
    note: noteMap[item.note] ?? item.note,
  };
}

function isProfileLive(profile: DirectoryProfile) {
  return profile.publicationStatus === "live" && profile.kycStatus === "approved";
}

function deriveStudioStatusFromState(
  profile: StudioProfileDraft,
  kyc: StudioKycVerification,
  media: StudioMediaAsset[],
): StudioStatusSnapshot {
  const checklist = {
    profileComplete: Boolean(
      profile.displayName &&
        profile.shortBio &&
        profile.longBio,
    ),
    kycReady: kyc.status === "approved",
    mediaReady:
      media.length > 0 &&
      media.every((item) => item.status === "approved" || item.status === "hidden"),
    pricingReady: profile.subscriptionPrice > 0,
    locationReady: Boolean(profile.state && profile.city && profile.availability),
  };

  let status: PublicationStatus = profile.publicationStatus;

  if (status === "live" || status === "suspended") {
    return { status, checklist };
  }

  if (!checklist.profileComplete || !checklist.pricingReady || !checklist.locationReady) {
    status = "draft";
  } else if (!checklist.kycReady) {
    status = "pending_kyc";
  } else if (!checklist.mediaReady) {
    status = "pending_media_review";
  } else {
    status = "ready_to_publish";
  }

  return { status, checklist };
}

function syncDemoStudioStatus() {
  demoState.studioProfileDraft.kycStatus = demoState.studioKycVerification.status;
  const snapshot = deriveStudioStatusFromState(
    demoState.studioProfileDraft,
    demoState.studioKycVerification,
    demoState.studioMediaAssets,
  );
  demoState.studioProfileDraft.publicationStatus = snapshot.status;
  return snapshot;
}

function demoAdminMetrics(): AdminMetrics {
  const pendingKyc = demoState.adminKycApplicants.filter(
    (item) => item.status === "pending",
  ).length;
  const pendingMedia = demoState.adminMediaQueue.filter(
    (item) => item.status === "pending",
  ).length;
  const failedPayments = demoState.billingHistory.filter(
    (item) => item.status === "failed" || item.status === "renewal_due",
  ).length;
  const chargebacks = demoState.billingHistory.filter(
    (item) => item.status === "chargeback",
  ).length;
  const reportedProfiles = demoState.moderationCases.length;

  return {
    pendingKyc,
    pendingMedia,
    failedPayments,
    reportedProfiles,
    chargebacks,
    suspendedUsers: demoState.directoryProfiles.filter(
      (item) => item.publicationStatus === "suspended",
    ).length,
  };
}

function appendDemoAuditLog(action: string, target: string, actor = "System") {
  demoState.auditLog.unshift({
    id: newId(),
    actor,
    action,
    target,
    createdAt: new Date().toISOString(),
  });
}

async function appendAuditLog(
  action: string,
  targetTable: string,
  targetId: string | null,
  payload: unknown,
) {
  const client = getServiceClient();
  const actor = await getAppUserContext();

  if (client && actor.userId) {
    const { error } = await client.from("audit_logs").insert({
      actor_user_id: actor.userId,
      action,
      target_table: targetTable,
      target_id: targetId,
      payload,
    });

    if (!error || isMissingTableError(error)) {
      return;
    }

    return;
  }

  appendDemoAuditLog(action, `${targetTable}:${targetId ?? "n/a"}`, actor.role);
}

function localizeBillingEvent(event: BillingEvent, locale: "en" | "ru") {
  if (locale === "en") return event;

  const descriptions: Record<string, string> = {
    "bill-1": "Месячная подписка на Ava Mercer",
    "bill-2": "Попытка продления Clara Vale",
    "bill-3": "Возврат после отмены Nina Hart",
    "bill-4": "Проверка платёжного спора",
  };

  return {
    ...event,
    description: descriptions[event.id] ?? event.description,
  };
}

function localizeModerationCase(caseItem: ModerationCase, locale: "en" | "ru") {
  if (locale === "en") return caseItem;

  const translations: Record<
    string,
    Pick<ModerationCase, "subject" | "reason" | "assignedReviewer">
  > = {
    "case-1": {
      subject: "Приостановка публикации профиля Isla Rowe",
      reason: "Проверка KYC не завершена до запроса на публикацию.",
      assignedReviewer: "Jordan P.",
    },
    "case-2": {
      subject: "Запрос на скрытие приватного ассета Nina Hart",
      reason: "Постпубликационная проверка модерации изменила видимость.",
      assignedReviewer: "Casey L.",
    },
    "case-3": {
      subject: "Плейсхолдер клиентского репорта",
      reason: "Модерация сообщений вне scope Phase 1, но структура очереди присутствует.",
      assignedReviewer: "Очередь поддержки",
    },
  };

  return {
    ...caseItem,
    ...translations[caseItem.id],
  };
}

function localizeAuditLogEntry(entry: AuditLogEntry, locale: "en" | "ru") {
  if (locale === "en") return entry;

  const translations: Record<string, Pick<AuditLogEntry, "actor" | "action" | "target">> = {
    "log-1": {
      actor: "Админ",
      action: "Одобрил KYC",
      target: "Ava Mercer",
    },
    "log-2": {
      actor: "Модератор",
      action: "Отклонил медиа-ассет",
      target: "Isla Rowe / Pending hero asset",
    },
    "log-3": {
      actor: "Платежи",
      action: "Пометил чарджбэк",
      target: "Client sub-3",
    },
  };

  return {
    ...entry,
    ...translations[entry.id],
  };
}

interface ModelProfileRow {
  id: string;
  slug: string;
  display_name: string;
  state: string;
  city: string;
  short_bio: string | null;
  long_bio: string | null;
  availability: string | null;
  subscription_price_aud: number;
  kyc_status: DirectoryProfile["kycStatus"];
  publication_status: DirectoryProfile["publicationStatus"];
  is_featured: boolean;
}

interface MediaAssetRow {
  id: string;
  visibility: "public" | "private";
  moderation_status: ProfileMediaItem["status"];
  media_kind: "image" | "video";
  rejection_reason: string | null;
}

function toMediaTitle(item: MediaAssetRow, index: number) {
  const base = item.visibility === "public" ? "Public asset" : "Private asset";
  return `${base} ${String(index + 1).padStart(2, "0")}`;
}

function mapProfileRow(
  row: ModelProfileRow,
  mediaAssets: MediaAssetRow[] = [],
): DirectoryProfile {
  const publicMedia = mediaAssets
    .filter((item) => item.visibility === "public")
    .map((item, index) => ({
      id: item.id,
      title: toMediaTitle(item, index),
      visibility: item.visibility,
      status: item.moderation_status,
      kind: item.media_kind,
      reason: item.rejection_reason ?? undefined,
    }));

  const privateMedia = mediaAssets
    .filter((item) => item.visibility === "private")
    .map((item, index) => ({
      id: item.id,
      title: toMediaTitle(item, index),
      visibility: item.visibility,
      status: item.moderation_status,
      kind: item.media_kind,
      reason: item.rejection_reason ?? undefined,
    }));

  return {
    id: row.id,
    slug: row.slug,
    displayName: row.display_name,
    state: row.state,
    city: row.city,
    shortBio: row.short_bio ?? "Profile summary pending completion.",
    longBio:
      row.long_bio ??
      "Profile details should be loaded from Supabase once the runtime foundation is connected.",
    headline: `${row.city} • moderated profile`,
    availability: row.availability ?? "Availability pending",
    subscriptionPrice: row.subscription_price_aud,
    privateGalleryCount: privateMedia.length,
    kycStatus: row.kyc_status,
    publicationStatus: row.publication_status,
    featured: row.is_featured,
    tags: [
      row.kyc_status === "approved" ? "Verified" : "Review required",
      row.city,
      row.publication_status.replaceAll("_", " "),
    ],
    publicMedia,
    privateMedia,
  };
}

export async function listDirectoryProfiles(input?: {
  stateSlug?: string;
  citySlug?: string;
  query?: string;
  featuredOnly?: boolean;
}) {
  const locale = await getLocale();
  const client = getServiceClient();

  if (client) {
    const { data, error } = await client
      .from("model_profiles")
      .select(
        "id, slug, display_name, state, city, short_bio, long_bio, availability, subscription_price_aud, kyc_status, publication_status, is_featured",
      )
      .eq("publication_status", "live")
      .eq("kyc_status", "approved");

    if (!error && data?.length) {
      const ids = data.map((row) => row.id);
      const { data: media } = await client
        .from("media_assets")
        .select("id, model_profile_id, visibility, moderation_status, media_kind, rejection_reason")
        .in("model_profile_id", ids);

      const mediaByProfile = new Map<string, MediaAssetRow[]>();
      for (const item of media ?? []) {
        const bucket = mediaByProfile.get(item.model_profile_id) ?? [];
        bucket.push(item);
        mediaByProfile.set(item.model_profile_id, bucket);
      }

      const mapped = data.map((row) =>
        mapProfileRow(row, mediaByProfile.get(row.id) ?? []),
      );

      return mapped.filter((profile) => {
        const featured = !input?.featuredOnly || profile.featured;
        const state =
          !input?.stateSlug ||
          profile.state.toLowerCase().replaceAll(" ", "-") === input.stateSlug;
        const city =
          !input?.citySlug ||
          profile.city.toLowerCase().replaceAll(" ", "-") === input.citySlug;
        const query =
          !input?.query ||
          [
            profile.displayName,
            profile.city,
            profile.state,
            profile.headline,
            ...profile.tags,
          ]
            .join(" ")
            .toLowerCase()
            .includes(input.query.toLowerCase());

        return featured && state && city && query;
      });
    }

    return [];
  }

  const filtered = filterProfiles({
    stateSlug: input?.stateSlug,
    citySlug: input?.citySlug,
    query: input?.query,
  }).filter(isProfileLive);

  const localized = filtered.map((profile) => localizeDirectoryProfile(profile, locale));

  return input?.featuredOnly
    ? localized.filter((profile) => profile.featured)
    : localized;
}

export async function getDirectoryProfile(slug: string) {
  const locale = await getLocale();
  const client = getServiceClient();

  if (client) {
    const { data, error } = await client
      .from("model_profiles")
      .select(
        "id, slug, display_name, state, city, short_bio, long_bio, availability, subscription_price_aud, kyc_status, publication_status, is_featured",
      )
      .eq("slug", slug)
      .eq("publication_status", "live")
      .eq("kyc_status", "approved")
      .maybeSingle();

    if (!error && data) {
      const { data: media } = await client
        .from("media_assets")
        .select("id, visibility, moderation_status, media_kind, rejection_reason")
        .eq("model_profile_id", data.id);

      return mapProfileRow(data, media ?? []);
    }

    return null;
  }

  const profile = getProfileBySlug(slug);
  if (!profile || !isProfileLive(profile)) return null;
  return profile ? localizeDirectoryProfile(profile, locale) : null;
}

export async function listClientSubscriptions() {
  const locale = await getLocale();
  const client = getServiceClient();
  const context = await getAppUserContext();

  if (client) {
    let query = client
      .from("client_subscriptions")
      .select(
        "id, status, ends_at, model_profiles:model_profile_id(display_name, city)",
      );

    if (context.role === "client" && context.userId) {
      query = query.eq("client_user_id", context.userId);
    }

    const { data, error } = await query;

    if (!error && data?.length) {
      return data.map((item) => {
        const modelProfile = Array.isArray(item.model_profiles)
          ? item.model_profiles[0]
          : item.model_profiles;

        return {
          id: item.id,
          modelName: modelProfile?.display_name ?? "Model profile",
          city: modelProfile?.city ?? "Australia",
          status: item.status,
          accessEndsAt: item.ends_at?.slice(0, 10) ?? "Pending",
          tier: "Subscription access",
        };
      }) as ClientSubscription[];
    }

    if (isMissingTableError(error)) {
      return demoState.clientSubscriptions.map((subscription) =>
        localizeClientSubscription(subscription, locale),
      );
    }

    return [];
  }

  if (hasLiveBackend()) {
    return [];
  }

  return demoState.clientSubscriptions.map((subscription) =>
    localizeClientSubscription(subscription, locale),
  );
}

export async function listBillingHistory() {
  const locale = await getLocale();
  const client = getServiceClient();
  const context = await getAppUserContext();

  if (client) {
    let query = client
      .from("payment_transactions")
      .select("id, amount_aud, status, occurred_at, provider")
      .order("occurred_at", { ascending: false });

    if (context.role === "client" && context.userId) {
      query = query.eq("client_user_id", context.userId);
    }

    const { data, error } = await query;

    if (!error && data?.length) {
      return data.map((item) => ({
        id: item.id,
        description: `${item.provider} transaction`,
        amountLabel: `$${(item.amount_aud ?? 0).toFixed(2)}`,
        status: item.status,
        date: item.occurred_at?.slice(0, 10) ?? "Pending",
      })) as BillingEvent[];
    }

    if (isMissingTableError(error)) {
      return demoState.billingHistory.map((event) => localizeBillingEvent(event, locale));
    }

    return [];
  }

  if (hasLiveBackend()) {
    return [];
  }

  return demoState.billingHistory.map((event) => localizeBillingEvent(event, locale));
}

export async function listModerationCases() {
  const locale = await getLocale();
  const client = getServiceClient();

  if (client) {
    const { data, error } = await client
      .from("moderation_cases")
      .select("id, target_type, reason, status, priority, action_taken")
      .order("created_at", { ascending: false });

    if (!error && data?.length) {
      return data.map((item) => ({
        id: item.id,
        targetType: item.target_type,
        subject: item.action_taken ?? "Moderation case",
        reason: item.reason,
        status: item.status,
        priority: item.priority,
        assignedReviewer: "Assigned in admin",
      })) as ModerationCase[];
    }

    return [];
  }

  return demoState.moderationCases.map((caseItem) =>
    localizeModerationCase(caseItem, locale),
  );
}

export async function listAuditLog() {
  const locale = await getLocale();
  const client = getServiceClient();

  if (client) {
    const { data, error } = await client
      .from("audit_logs")
      .select("id, action, target_table, target_id, created_at")
      .order("created_at", { ascending: false })
      .limit(20);

    if (!error && data?.length) {
      return data.map((item) => ({
        id: item.id,
        actor: "System",
        action: item.action,
        target: `${item.target_table}:${item.target_id ?? "n/a"}`,
        createdAt: item.created_at,
      })) as AuditLogEntry[];
    }

    if (isMissingTableError(error)) {
      return demoState.auditLog.map((entry) => localizeAuditLogEntry(entry, locale));
    }

    return [];
  }

  if (hasLiveBackend()) {
    return [];
  }

  return demoState.auditLog.map((entry) => localizeAuditLogEntry(entry, locale));
}

export async function listStateComplianceRules() {
  const client = getServiceClient();

  if (client) {
    const { data, error } = await client
      .from("state_compliance_rules")
      .select("state_code, state_name, city_name, disclaimer")
      .eq("is_active", true)
      .order("state_name", { ascending: true })
      .order("city_name", { ascending: true });

    if (!error && data?.length) {
      const grouped = new Map<string, StateComplianceRule>();

      for (const item of data) {
        const slug = item.state_code;
        const existing = grouped.get(slug) ?? {
          state: item.state_name,
          slug,
          disclaimer: item.disclaimer,
          cityNotes: {} as Record<string, string>,
        };

        if (item.city_name) {
          existing.cityNotes[item.city_name.toLowerCase().replaceAll(" ", "-")] =
            item.disclaimer;
        } else {
          existing.disclaimer = item.disclaimer;
        }

        grouped.set(slug, existing);
      }

      return Array.from(grouped.values());
    }

    if (isMissingTableError(error)) {
      return cloneValue(complianceRules);
    }

    return [];
  }

  if (hasLiveBackend()) {
    return [];
  }

  return cloneValue(complianceRules);
}

export async function listSavedProfiles() {
  const locale = await getLocale();
  const client = getServiceClient();
  const context = await getAppUserContext();

  if (client && context.userId) {
    const { data, error } = await client
      .from("saved_profiles")
      .select(
        "id, created_at, model_profiles:model_profile_id(id, slug, display_name, city, state, short_bio)",
      )
      .eq("client_user_id", context.userId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      return data
        .map((item) => {
          const profile = Array.isArray(item.model_profiles)
            ? item.model_profiles[0]
            : item.model_profiles;
          if (!profile) return null;
          return {
            id: item.id,
            profileId: profile.id,
            slug: profile.slug,
            displayName: profile.display_name,
            city: profile.city,
            state: profile.state,
            headline: profile.short_bio ?? "Profile summary",
            createdAt: item.created_at?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
          } satisfies SavedProfile;
        })
        .filter(Boolean)
        .map((item) => localizeSavedProfile(item as SavedProfile, locale));
    }

    return [];
  }

  if (hasLiveBackend()) {
    return [];
  }

  return demoState.savedProfiles.map((profile) => localizeSavedProfile(profile, locale));
}

export async function saveProfileToAccount(slug: string) {
  const client = getServiceClient();
  const context = await getAppUserContext("client");

  if (client && context.userId) {
    const { data: profile } = await client
      .from("model_profiles")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (!profile) {
      return { ok: false, message: "Profile not found." };
    }

    const { error } = await client.from("saved_profiles").upsert(
      {
        client_user_id: context.userId,
        model_profile_id: profile.id,
      },
      { onConflict: "client_user_id,model_profile_id" },
    );

    if (error) {
      return { ok: false, message: error.message };
    }

    await appendAuditLog("saved_profile_added", "saved_profiles", profile.id, { slug });
    return { ok: true };
  }

  if (hasLiveBackend()) {
    return { ok: false, message: "Authentication required." };
  }

  const existing = demoState.savedProfiles.find((item) => item.slug === slug);
  if (existing) {
    return { ok: true };
  }

  const profile = demoState.directoryProfiles.find((item) => item.slug === slug);
  if (!profile) {
    return { ok: false, message: "Profile not found." };
  }

  demoState.savedProfiles.unshift({
    id: newId(),
    profileId: profile.id,
    slug: profile.slug,
    displayName: profile.displayName,
    city: profile.city,
    state: profile.state,
    headline: profile.headline,
    createdAt: new Date().toISOString().slice(0, 10),
  });
  appendDemoAuditLog("saved_profile_added", slug, "Client");

  return { ok: true };
}

export async function removeSavedProfileFromAccount(slug: string) {
  const client = getServiceClient();
  const context = await getAppUserContext("client");

  if (client && context.userId) {
    const { data: profile } = await client
      .from("model_profiles")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (!profile) return { ok: false, message: "Profile not found." };

    const { error } = await client
      .from("saved_profiles")
      .delete()
      .eq("client_user_id", context.userId)
      .eq("model_profile_id", profile.id);

    if (error) return { ok: false, message: error.message };
    await appendAuditLog("saved_profile_removed", "saved_profiles", profile.id, { slug });
    return { ok: true };
  }

  if (hasLiveBackend()) {
    return { ok: false, message: "Authentication required." };
  }

  demoState.savedProfiles = demoState.savedProfiles.filter((item) => item.slug !== slug);
  appendDemoAuditLog("saved_profile_removed", slug, "Client");
  return { ok: true };
}

export async function getPrivacySettings() {
  const client = getServiceClient();
  const context = await getAppUserContext("client");

  if (client && context.userId) {
    const { data, error } = await client
      .from("clients")
      .select("privacy_settings")
      .eq("user_id", context.userId)
      .maybeSingle();

    if (!error && data?.privacy_settings) {
      return data.privacy_settings as PrivacySettings;
    }

    return cloneValue(defaultPrivacySettings);
  }

  if (hasLiveBackend()) {
    return cloneValue(defaultPrivacySettings);
  }

  return cloneValue(demoState.privacySettings);
}

export async function updatePrivacySettings(
  patch: Partial<PrivacySettings>,
) {
  const nextValue = {
    ...(await getPrivacySettings()),
    ...patch,
  };
  const client = getServiceClient();
  const context = await getAppUserContext("client");

  if (client && context.userId) {
    const { error } = await client
      .from("clients")
      .update({
        privacy_settings: nextValue,
      })
      .eq("user_id", context.userId);

    if (error) return { ok: false, message: error.message };
    await appendAuditLog("privacy_settings_updated", "clients", context.userId, nextValue);
    return { ok: true, settings: nextValue };
  }

  if (hasLiveBackend()) {
    return { ok: false, message: "Authentication required." };
  }

  demoState.privacySettings = nextValue;
  appendDemoAuditLog("privacy_settings_updated", "client-settings", "Client");
  return { ok: true, settings: nextValue };
}

export async function getStudioStatusSnapshot() {
  const client = getServiceClient();
  const context = await getAppUserContext("model");

  if (client && context.userId) {
    const profile = await getStudioProfileDraft();
    const kyc = await getStudioKycVerification();
    const media = await listStudioMediaAssets();
    if (profile) {
      return deriveStudioStatusFromState(profile, kyc, media);
    }

    return createEmptyStudioStatusSnapshot();
  }

  if (hasLiveBackend()) {
    return createEmptyStudioStatusSnapshot();
  }

  return syncDemoStudioStatus();
}

export async function getStudioProfileDraft() {
  const client = getServiceClient();
  const context = await getAppUserContext("model");

  if (client && context.userId) {
    const { data, error } = await client
      .from("model_profiles")
      .select(
        "id, user_id, slug, display_name, state, city, short_bio, long_bio, availability, subscription_price_aud, publication_status, kyc_status, is_featured",
      )
      .eq("user_id", context.userId)
      .maybeSingle();

    if (!error && data) {
      return {
        id: data.id,
        userId: data.user_id,
        slug: data.slug,
        displayName: data.display_name,
        state: data.state,
        city: data.city,
        shortBio: data.short_bio ?? "",
        longBio: data.long_bio ?? "",
        availability: data.availability ?? "",
        subscriptionPrice: data.subscription_price_aud ?? 0,
        publicationStatus: data.publication_status,
        kycStatus: data.kyc_status,
        featured: Boolean(data.is_featured),
      } satisfies StudioProfileDraft;
    }

    return null;
  }

  if (hasLiveBackend()) {
    return null;
  }

  return cloneValue(demoState.studioProfileDraft);
}

export async function saveStudioProfileDraft(input: {
  displayName: string;
  state: string;
  city: string;
  shortBio: string;
  longBio: string;
  availability: string;
  subscriptionPrice: number;
  intent: "save" | "submit";
}) {
  const client = getServiceClient();
  const context = await getAppUserContext("model");

  if (client && context.userId) {
    const current = await getStudioProfileDraft();
    if (!current) return { ok: false, message: "Studio profile not found." };

    const draft: StudioProfileDraft = {
      ...current,
      ...input,
      publicationStatus:
        input.intent === "save"
          ? "draft"
          : deriveStudioStatusFromState(
              {
                ...current,
                ...input,
                publicationStatus: current.publicationStatus,
                subscriptionPrice: input.subscriptionPrice,
              },
              await getStudioKycVerification(),
              await listStudioMediaAssets(),
            ).status,
    };

    const { error } = await client
      .from("model_profiles")
      .update({
        display_name: draft.displayName,
        state: draft.state,
        city: draft.city,
        short_bio: draft.shortBio,
        long_bio: draft.longBio,
        availability: draft.availability,
        subscription_price_aud: draft.subscriptionPrice,
        publication_status: draft.publicationStatus,
      })
      .eq("id", current.id);

    if (error) return { ok: false, message: error.message };
    await appendAuditLog(
      input.intent === "save" ? "studio_profile_saved" : "studio_profile_submitted",
      "model_profiles",
      current.id,
      { ...draft },
    );
    return { ok: true, profile: draft };
  }

  if (hasLiveBackend()) {
    return { ok: false, message: "Authentication required." };
  }

  demoState.studioProfileDraft = {
    ...demoState.studioProfileDraft,
    ...input,
    subscriptionPrice: input.subscriptionPrice,
    publicationStatus:
      input.intent === "save" ? "draft" : syncDemoStudioStatus().status,
  };
  if (input.intent === "submit") {
    demoState.studioProfileDraft.publicationStatus = syncDemoStudioStatus().status;
  }
  appendDemoAuditLog(
    input.intent === "save" ? "studio_profile_saved" : "studio_profile_submitted",
    demoState.studioProfileDraft.slug,
    "Model",
  );
  return { ok: true, profile: cloneValue(demoState.studioProfileDraft) };
}

export async function listStudioMediaAssets() {
  const locale = await getLocale();
  const client = getServiceClient();
  const context = await getAppUserContext("model");

  if (client && context.userId) {
    const profile = await getStudioProfileDraft();
    if (profile) {
      const { data, error } = await client
        .from("media_assets")
        .select("id, visibility, moderation_status, media_kind, rejection_reason, created_at")
        .eq("model_profile_id", profile.id)
        .order("created_at", { ascending: true });

      if (!error && data) {
        return data.map((item, index) =>
          localizeStudioMediaAsset(
            {
              id: item.id,
              name: `Media asset ${String(index + 1).padStart(2, "0")}`,
              status: item.moderation_status,
              visibility: item.visibility,
              kind: item.media_kind,
              note:
                item.moderation_status === "rejected"
                  ? `Reason: ${item.rejection_reason ?? "review required"}`
                  : item.moderation_status === "pending"
                    ? "Awaiting moderation review"
                    : item.moderation_status === "hidden"
                      ? "Hidden after publication review"
                      : "Visible on profile",
              reason: item.rejection_reason ?? undefined,
              createdAt: item.created_at?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
            },
            locale,
          ),
        );
      }

      return [];
    }
  }

  if (hasLiveBackend()) {
    return [];
  }

  return demoState.studioMediaAssets.map((asset) => localizeStudioMediaAsset(asset, locale));
}

export async function mutateStudioMedia(input: {
  assetId?: string;
  action: "upload_placeholder" | "toggle_visibility" | "resubmit";
}) {
  const client = getServiceClient();
  const context = await getAppUserContext("model");

  if (client && context.userId) {
    const profile = await getStudioProfileDraft();
    if (!profile) return { ok: false, message: "Studio profile not found." };

    if (input.action === "upload_placeholder") {
      const { data, error } = await client
        .from("media_assets")
        .insert({
          model_profile_id: profile.id,
          storage_path: `placeholder/${newId()}`,
          media_kind: "image",
          visibility: "private",
          moderation_status: "pending",
        })
        .select("id")
        .maybeSingle();

      if (error) return { ok: false, message: error.message };
      await appendAuditLog("studio_media_uploaded", "media_assets", data?.id ?? null, input);
      return { ok: true };
    }

    if (!input.assetId) return { ok: false, message: "Asset id is required." };

    const { data: asset, error: assetError } = await client
      .from("media_assets")
      .select("id, visibility")
      .eq("id", input.assetId)
      .maybeSingle();

    if (assetError || !asset) return { ok: false, message: "Media asset not found." };

    const payload =
      input.action === "toggle_visibility"
        ? { visibility: asset.visibility === "public" ? "private" : "public" }
        : { moderation_status: "pending", rejection_reason: null };

    const { error } = await client
      .from("media_assets")
      .update(payload)
      .eq("id", input.assetId);

    if (error) return { ok: false, message: error.message };
    await appendAuditLog("studio_media_updated", "media_assets", input.assetId, input);
    return { ok: true };
  }

  if (hasLiveBackend()) {
    return { ok: false, message: "Authentication required." };
  }

  if (input.action === "upload_placeholder") {
    demoState.studioMediaAssets.unshift({
      id: newId(),
      name: `Queued upload ${demoState.studioMediaAssets.length + 1}`,
      status: "pending",
      visibility: "private",
      note: "Upload queued for moderation review",
      kind: "image",
      createdAt: new Date().toISOString().slice(0, 10),
    });
    appendDemoAuditLog("studio_media_uploaded", "studio-media", "Model");
    syncDemoStudioStatus();
    return { ok: true };
  }

  const asset = demoState.studioMediaAssets.find((item) => item.id === input.assetId);
  if (!asset) return { ok: false, message: "Media asset not found." };

  if (input.action === "toggle_visibility") {
    asset.visibility = asset.visibility === "public" ? "private" : "public";
  }

  if (input.action === "resubmit") {
    asset.status = "pending";
    asset.reason = undefined;
    asset.note = "Awaiting moderation review";
  }

  appendDemoAuditLog("studio_media_updated", asset.id, "Model");
  syncDemoStudioStatus();
  return { ok: true };
}

export async function getStudioKycVerification() {
  const locale = await getLocale();
  const client = getServiceClient();
  const context = await getAppUserContext("model");

  if (client && context.userId) {
    const { data, error } = await client
      .from("kyc_verifications")
      .select(
        "id, status, government_id_file_path, selfie_file_path, submitted_at, reviewed_at, rejection_reason",
      )
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      return localizeStudioKyc(
        {
          id: data.id,
          status: data.status,
          governmentIdLabel: data.government_id_file_path ?? "Government ID placeholder",
          selfieLabel: data.selfie_file_path ?? "Selfie placeholder",
          submittedAt: data.submitted_at?.slice(0, 10) ?? undefined,
          reviewedAt: data.reviewed_at?.slice(0, 10) ?? undefined,
          rejectionReason: data.rejection_reason ?? undefined,
        },
        locale,
      );
    }

    return localizeStudioKyc(createEmptyStudioKycVerification(), locale);
  }

  if (hasLiveBackend()) {
    return localizeStudioKyc(createEmptyStudioKycVerification(), locale);
  }

  return localizeStudioKyc(demoState.studioKycVerification, locale);
}

export async function submitStudioKycVerification(input: {
  governmentIdLabel: string;
  selfieLabel: string;
  intent: "start" | "submit" | "resubmit";
}) {
  const client = getServiceClient();
  const context = await getAppUserContext("model");

  if (client && context.userId) {
    const current = await getStudioKycVerification();
    if (current?.id) {
      const { error } = await client
        .from("kyc_verifications")
        .update({
          status: input.intent === "start" ? "not_started" : "pending",
          government_id_file_path: input.governmentIdLabel,
          selfie_file_path: input.selfieLabel,
          rejection_reason: null,
          submitted_at:
            input.intent === "submit" || input.intent === "resubmit"
              ? new Date().toISOString()
              : null,
        })
        .eq("id", current.id);

      if (error) return { ok: false, message: error.message };
      await appendAuditLog("studio_kyc_submitted", "kyc_verifications", current.id, input);
      return { ok: true };
    }

    const { data, error } = await client
      .from("kyc_verifications")
      .insert({
        user_id: context.userId,
        status: input.intent === "start" ? "not_started" : "pending",
        government_id_file_path: input.governmentIdLabel,
        selfie_file_path: input.selfieLabel,
        submitted_at:
          input.intent === "submit" || input.intent === "resubmit"
            ? new Date().toISOString()
            : null,
      })
      .select("id")
      .maybeSingle();

    if (error) return { ok: false, message: error.message };
    await appendAuditLog("studio_kyc_submitted", "kyc_verifications", data?.id ?? null, input);
    return { ok: true };
  }

  if (hasLiveBackend()) {
    return { ok: false, message: "Authentication required." };
  }

  demoState.studioKycVerification = {
    ...demoState.studioKycVerification,
    governmentIdLabel: input.governmentIdLabel,
    selfieLabel: input.selfieLabel,
    status: input.intent === "start" ? "not_started" : "pending",
    rejectionReason: undefined,
    submittedAt:
      input.intent === "submit" || input.intent === "resubmit"
        ? new Date().toISOString().slice(0, 10)
        : demoState.studioKycVerification.submittedAt,
  };
  syncDemoStudioStatus();
  appendDemoAuditLog("studio_kyc_submitted", demoState.studioKycVerification.id, "Model");
  return { ok: true };
}

export async function getStudioSubscriptionSettings() {
  const client = getServiceClient();
  const context = await getAppUserContext("model");

  if (client && context.userId) {
    const { data, error } = await client
      .from("model_profiles")
      .select("subscription_price_aud, subscription_summary")
      .eq("user_id", context.userId)
      .maybeSingle();

    if (!error && data) {
      return {
        monthlyPrice: data.subscription_price_aud ?? 0,
        entitlementSummary:
          (data as { subscription_summary?: string | null }).subscription_summary ??
          defaultStudioSubscriptionSettings.entitlementSummary,
      } satisfies StudioSubscriptionSettings;
    }

    return cloneValue(defaultStudioSubscriptionSettings);
  }

  if (hasLiveBackend()) {
    return cloneValue(defaultStudioSubscriptionSettings);
  }

  return cloneValue(demoState.studioSubscriptionSettings);
}

export async function updateStudioSubscriptionSettings(
  input: StudioSubscriptionSettings,
) {
  const client = getServiceClient();
  const context = await getAppUserContext("model");

  if (client && context.userId) {
    const { error } = await client
      .from("model_profiles")
      .update({
        subscription_price_aud: input.monthlyPrice,
        subscription_summary: input.entitlementSummary,
      })
      .eq("user_id", context.userId);

    if (error) return { ok: false, message: error.message };
    await appendAuditLog("studio_subscription_settings_updated", "model_profiles", context.userId, {
      ...input,
    });
    return { ok: true, settings: input };
  }

  if (hasLiveBackend()) {
    return { ok: false, message: "Authentication required." };
  }

  demoState.studioSubscriptionSettings = cloneValue(input);
  demoState.studioProfileDraft.subscriptionPrice = input.monthlyPrice;
  syncDemoStudioStatus();
  appendDemoAuditLog("studio_subscription_settings_updated", "studio-subscriptions", "Model");
  return { ok: true, settings: input };
}

export async function listAdminKycApplicants() {
  const locale = await getLocale();
  const client = getServiceClient();

  if (client) {
    const { data, error } = await client
      .from("kyc_verifications")
      .select(
        "id, user_id, status, government_id_file_path, selfie_file_path, submitted_at, reviewed_at, rejection_reason, users!kyc_verifications_user_id_fkey(display_name)",
      )
      .order("created_at", { ascending: false });

    if (!error && data) {
      return data.map((item) => {
        const userPayload = item.users as
          | { display_name?: string | null }
          | Array<{ display_name?: string | null }>
          | null;

        return localizeAdminKycApplicant(
          {
            id: item.id,
            userId: item.user_id,
            displayName:
              (Array.isArray(userPayload)
                ? userPayload[0]?.display_name
                : userPayload?.display_name) ?? "Applicant",
            status: item.status,
            governmentIdLabel: item.government_id_file_path ?? "Government ID placeholder",
            selfieLabel: item.selfie_file_path ?? "Selfie placeholder",
            submittedAt: item.submitted_at?.slice(0, 10) ?? undefined,
            reviewedAt: item.reviewed_at?.slice(0, 10) ?? undefined,
            rejectionReason: item.rejection_reason ?? undefined,
          },
          locale,
        );
      });
    }

    return [];
  }

  if (hasLiveBackend()) {
    return [];
  }

  return demoState.adminKycApplicants.map((item) =>
    localizeAdminKycApplicant(item, locale),
  );
}

export async function reviewAdminKycApplicant(input: {
  applicantId: string;
  decision: "approve" | "reject";
  rejectionReason?: string;
}) {
  const client = getServiceClient();

  if (client) {
    const nextStatus = input.decision === "approve" ? "approved" : "rejected";
    const { data, error } = await client
      .from("kyc_verifications")
      .update({
        status: nextStatus,
        rejection_reason: input.decision === "reject" ? input.rejectionReason ?? "Review rejected." : null,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", input.applicantId)
      .select("id, user_id")
      .maybeSingle();

    if (error || !data) {
      return { ok: false, message: error?.message ?? "Applicant not found." };
    }

    await client
      .from("model_profiles")
      .update({
        kyc_status: nextStatus,
        publication_status: nextStatus === "approved" ? "pending_media_review" : "pending_kyc",
      })
      .eq("user_id", data.user_id);

    await appendAuditLog("admin_kyc_reviewed", "kyc_verifications", data.id, input);
    return { ok: true };
  }

  if (hasLiveBackend()) {
    return { ok: false, message: "Applicant not found." };
  }

  const applicant = demoState.adminKycApplicants.find((item) => item.id === input.applicantId);
  if (!applicant) return { ok: false, message: "Applicant not found." };
  applicant.status = input.decision === "approve" ? "approved" : "rejected";
  applicant.reviewedAt = new Date().toISOString().slice(0, 10);
  applicant.rejectionReason =
    input.decision === "reject"
      ? input.rejectionReason ?? "Review rejected."
      : undefined;

  demoState.studioKycVerification.status = applicant.status;
  demoState.studioKycVerification.reviewedAt = applicant.reviewedAt;
  demoState.studioKycVerification.rejectionReason = applicant.rejectionReason;
  syncDemoStudioStatus();
  appendDemoAuditLog("admin_kyc_reviewed", applicant.displayName, "Admin");
  return { ok: true };
}

export async function listAdminMediaQueue() {
  const locale = await getLocale();
  const client = getServiceClient();

  if (client) {
    const { data, error } = await client
      .from("media_assets")
      .select("id, visibility, moderation_status, media_kind, rejection_reason")
      .order("created_at", { ascending: false });

    if (!error && data) {
      return data.map((item, index) =>
        localizeAdminMediaQueueItem(
          {
            id: item.id,
            label: `Media asset ${String(index + 1).padStart(2, "0")}`,
            status: item.moderation_status,
            visibility: item.visibility,
            kind: item.media_kind,
            note:
              item.moderation_status === "rejected"
                ? item.rejection_reason ?? "Rejected during moderation review"
                : item.moderation_status === "hidden"
                  ? "Hidden after publication review"
                  : "Awaiting moderation review",
          },
          locale,
        ),
      );
    }

    return [];
  }

  if (hasLiveBackend()) {
    return [];
  }

  return demoState.adminMediaQueue.map((item) => localizeAdminMediaQueueItem(item, locale));
}

export async function reviewAdminMediaAsset(input: {
  assetId: string;
  decision: "approve" | "reject" | "hide";
  rejectionReason?: string;
}) {
  const client = getServiceClient();
  const status =
    input.decision === "approve"
      ? "approved"
      : input.decision === "hide"
        ? "hidden"
        : "rejected";

  if (client) {
    const { error } = await client
      .from("media_assets")
      .update({
        moderation_status: status,
        rejection_reason: input.decision === "reject" ? input.rejectionReason ?? "Rejected during moderation review." : null,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", input.assetId);

    if (error) return { ok: false, message: error.message };

    const queueResult = await client
      .from("media_moderation_queue")
      .upsert(
        {
          media_asset_id: input.assetId,
          queue_status: status,
          reviewed_at: new Date().toISOString(),
        },
        { onConflict: "media_asset_id" },
      );

    if (queueResult.error && !isMissingTableError(queueResult.error)) {
      return { ok: false, message: queueResult.error.message };
    }
    await appendAuditLog("admin_media_reviewed", "media_assets", input.assetId, input);
    return { ok: true };
  }

  if (hasLiveBackend()) {
    return { ok: false, message: "Media asset not found." };
  }

  const item = demoState.adminMediaQueue.find((entry) => entry.id === input.assetId);
  if (!item) return { ok: false, message: "Media asset not found." };
  item.status = status;
  item.note =
    input.decision === "reject"
      ? input.rejectionReason ?? "Rejected during moderation review"
      : input.decision === "hide"
        ? "Hidden after publication review"
        : "Approved for publication";

  const studioItem = demoState.studioMediaAssets.find((entry) => entry.id === input.assetId);
  if (studioItem) {
    studioItem.status = status;
    studioItem.reason = input.decision === "reject" ? input.rejectionReason : undefined;
    studioItem.note = item.note;
  }

  syncDemoStudioStatus();
  appendDemoAuditLog("admin_media_reviewed", input.assetId, "Admin");
  return { ok: true };
}

export async function getAdminMetrics() {
  const client = getServiceClient();

  if (client) {
    const [kycApplicants, mediaQueue, moderation, billing, suspended] = await Promise.all([
      listAdminKycApplicants(),
      listAdminMediaQueue(),
      listModerationCases(),
      listBillingHistory(),
      client
        .from("model_profiles")
        .select("id", { count: "exact", head: true })
        .eq("publication_status", "suspended"),
    ]);

    return {
      pendingKyc: kycApplicants.filter((item) => item.status === "pending").length,
      pendingMedia: mediaQueue.filter((item) => item.status === "pending").length,
      failedPayments: billing.filter(
        (item) => item.status === "failed" || item.status === "renewal_due",
      ).length,
      reportedProfiles: moderation.length,
      chargebacks: billing.filter((item) => item.status === "chargeback").length,
      suspendedUsers: suspended.count ?? 0,
    } satisfies AdminMetrics;
  }

  return demoAdminMetrics();
}

export async function updateModerationCase(input: {
  caseId: string;
  status?: ModerationCase["status"];
  priority?: ModerationCase["priority"];
  assignedReviewer?: string;
  actionTaken?: string;
}) {
  const client = getServiceClient();

  if (client) {
    const payload: Record<string, unknown> = {};
    if (input.status) payload.status = input.status;
    if (input.priority) payload.priority = input.priority;
    if (input.actionTaken) payload.action_taken = input.actionTaken;

    const { error } = await client
      .from("moderation_cases")
      .update(payload)
      .eq("id", input.caseId);

    if (error) return { ok: false, message: error.message };
    await appendAuditLog("moderation_case_updated", "moderation_cases", input.caseId, input);
    return { ok: true };
  }

  if (hasLiveBackend()) {
    return { ok: false, message: "Moderation case not found." };
  }

  const item = demoState.moderationCases.find((entry) => entry.id === input.caseId);
  if (!item) return { ok: false, message: "Moderation case not found." };
  if (input.status) item.status = input.status;
  if (input.priority) item.priority = input.priority;
  if (input.assignedReviewer) item.assignedReviewer = input.assignedReviewer;
  if (input.actionTaken) item.subject = input.actionTaken;
  appendDemoAuditLog("moderation_case_updated", input.caseId, "Admin");
  return { ok: true };
}

export async function createModerationCase(input: {
  targetType: ModerationCase["targetType"];
  reason: string;
  details: string;
}) {
  const client = getServiceClient();

  if (client) {
    const { data, error } = await client
      .from("moderation_cases")
      .insert({
        target_type: input.targetType,
        reason: input.reason,
        action_taken: input.details,
      })
      .select("id")
      .maybeSingle();

    if (error) return { ok: false, message: error.message };
    await appendAuditLog("moderation_case_created", "moderation_cases", data?.id ?? null, input);
    return { ok: true };
  }

  if (hasLiveBackend()) {
    return { ok: false, message: "Live moderation case creation is unavailable." };
  }

  demoState.moderationCases.unshift({
    id: newId(),
    targetType: input.targetType,
    subject: input.details,
    reason: input.reason,
    status: "open",
    priority: "medium",
    assignedReviewer: "Support queue",
  });
  appendDemoAuditLog("moderation_case_created", input.targetType, "System");
  return { ok: true };
}

export async function resolveMediaTokenAccess(mediaId: string) {
  const context = await getAppUserContext();
  const client = getServiceClient();

  if (client) {
    const { data: media, error } = await client
      .from("media_assets")
      .select("id, model_profile_id, visibility, moderation_status, media_kind")
      .eq("id", mediaId)
      .maybeSingle();

    if (error || !media) {
      return { ok: false, status: 404, message: "Media asset not found." };
    }

    if (media.visibility === "public" && media.moderation_status === "approved") {
      return {
        ok: true,
        status: 200,
        access: "public",
        token: `public-placeholder-${media.id}`,
        todo: "Issue signed playback or download tokens only after entitlement checks are enforced server-side.",
      };
    }

    if (context.role === "admin" || context.role === "support" || context.role === "model") {
      return {
        ok: true,
        status: 200,
        access: "privileged",
        token: `role-placeholder-${media.id}`,
        todo: "Issue signed playback or download tokens only after entitlement checks are enforced server-side.",
      };
    }

    if (context.userId) {
      const { data: subscription } = await client
        .from("client_subscriptions")
        .select("id")
        .eq("client_user_id", context.userId)
        .eq("model_profile_id", media.model_profile_id)
        .eq("status", "active")
        .maybeSingle();

      if (subscription) {
        return {
          ok: true,
          status: 200,
          access: "subscription_entitled",
          token: `subscription-placeholder-${media.id}`,
          todo: "Issue signed playback or download tokens only after entitlement checks are enforced server-side.",
        };
      }
    }

    return { ok: false, status: 403, message: "Media access requires active entitlement." };
  }

  const directoryMedia = demoState.directoryProfiles.flatMap((profile) => [
    ...profile.publicMedia,
    ...profile.privateMedia,
  ]);
  const studioMedia = demoState.studioMediaAssets.map((asset) => ({
    id: asset.id,
    visibility: asset.visibility,
    status: asset.status,
  }));
  const item = [...directoryMedia, ...studioMedia].find((entry) => entry.id === mediaId);

  if (!item) return { ok: false, status: 404, message: "Media asset not found." };

  if (item.visibility === "public" && item.status === "approved") {
    return {
      ok: true,
      status: 200,
      access: "public",
      token: `public-placeholder-${mediaId}`,
      todo: "Issue signed playback or download tokens only after entitlement checks are enforced server-side.",
    };
  }

  const hasActiveSubscription = demoState.clientSubscriptions.some(
    (item) => item.status === "active",
  );

  if (
    context.role === "admin" ||
    context.role === "support" ||
    context.role === "model" ||
    hasActiveSubscription
  ) {
    return {
      ok: true,
      status: 200,
      access: hasActiveSubscription ? "subscription_entitled" : "privileged",
      token: `demo-placeholder-${mediaId}`,
      todo: "Issue signed playback or download tokens only after entitlement checks are enforced server-side.",
    };
  }

  return { ok: false, status: 403, message: "Media access requires active entitlement." };
}
