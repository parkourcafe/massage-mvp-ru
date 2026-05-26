export type UserRole =
  | "guest"
  | "client"
  | "model"
  | "kyc_reviewer"
  | "support"
  | "admin";

export type KycStatus = "not_started" | "pending" | "approved" | "rejected";
export type MediaStatus = "pending" | "approved" | "rejected" | "hidden";
export type PublicationStatus =
  | "draft"
  | "pending_kyc"
  | "pending_media_review"
  | "ready_to_publish"
  | "live"
  | "suspended";
export type SubscriptionStatus =
  | "active"
  | "expired"
  | "cancelled"
  | "pending"
  | "past_due";
export type PaymentStatus =
  | "succeeded"
  | "failed"
  | "renewal_due"
  | "refunded"
  | "chargeback"
  | "pending";
export type ModerationCaseStatus =
  | "open"
  | "in_review"
  | "resolved"
  | "escalated";
export type Priority = "low" | "medium" | "high" | "critical";

export interface StateComplianceRule {
  state: string;
  slug: string;
  disclaimer: string;
  cityNotes: Record<string, string>;
}

export interface ProfileMediaItem {
  id: string;
  title: string;
  visibility: "public" | "private";
  status: MediaStatus;
  kind: "image" | "video";
  reason?: string;
}

export interface DirectoryProfile {
  id: string;
  slug: string;
  displayName: string;
  state: string;
  city: string;
  shortBio: string;
  longBio: string;
  headline: string;
  availability: string;
  subscriptionPrice: number;
  privateGalleryCount: number;
  kycStatus: KycStatus;
  publicationStatus: PublicationStatus;
  featured: boolean;
  tags: string[];
  publicMedia: ProfileMediaItem[];
  privateMedia: ProfileMediaItem[];
}

export interface ClientSubscription {
  id: string;
  modelName: string;
  city: string;
  status: SubscriptionStatus;
  accessEndsAt: string;
  tier: string;
}

export interface SavedProfile {
  id: string;
  profileId: string;
  slug: string;
  displayName: string;
  city: string;
  state: string;
  headline: string;
  createdAt: string;
}

export interface PrivacySettings {
  discreetBilling: boolean;
  marketingOptIn: boolean;
  showActiveSubscriptions: boolean;
  notifyOnModerationActions: boolean;
}

export interface BillingEvent {
  id: string;
  description: string;
  amountLabel: string;
  status: PaymentStatus;
  date: string;
}

export interface ModerationCase {
  id: string;
  targetType: "profile" | "media" | "message";
  subject: string;
  reason: string;
  status: ModerationCaseStatus;
  priority: Priority;
  assignedReviewer: string;
}

export interface AuditLogEntry {
  id: string;
  actor: string;
  action: string;
  target: string;
  createdAt: string;
}

export interface StudioProfileDraft {
  id: string;
  userId: string;
  slug: string;
  displayName: string;
  state: string;
  city: string;
  shortBio: string;
  longBio: string;
  availability: string;
  subscriptionPrice: number;
  publicationStatus: PublicationStatus;
  kycStatus: KycStatus;
  featured: boolean;
}

export interface StudioMediaAsset {
  id: string;
  name: string;
  status: MediaStatus;
  visibility: "public" | "private";
  note: string;
  kind: "image" | "video";
  createdAt: string;
  reason?: string;
}

export interface StudioKycVerification {
  id: string;
  status: KycStatus;
  governmentIdLabel: string;
  selfieLabel: string;
  submittedAt?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export interface StudioSubscriptionSettings {
  monthlyPrice: number;
  entitlementSummary: string;
}

export interface StudioStatusSnapshot {
  status: PublicationStatus;
  checklist: {
    profileComplete: boolean;
    kycReady: boolean;
    mediaReady: boolean;
    pricingReady: boolean;
    locationReady: boolean;
  };
}

export interface AdminKycApplicant {
  id: string;
  userId: string;
  displayName: string;
  status: KycStatus;
  governmentIdLabel: string;
  selfieLabel: string;
  submittedAt?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export interface AdminMediaQueueItem {
  id: string;
  label: string;
  status: MediaStatus;
  visibility: "public" | "private";
  kind: "image" | "video";
  note: string;
}

export interface AdminMetrics {
  pendingKyc: number;
  pendingMedia: number;
  failedPayments: number;
  reportedProfiles: number;
  chargebacks: number;
  suspendedUsers: number;
}
