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
  SavedProfile,
  StudioKycVerification,
  StudioMediaAsset,
  StudioProfileDraft,
  StudioStatusSnapshot,
  StudioSubscriptionSettings,
  StateComplianceRule,
} from "./types";

export const states = [
  { name: "New South Wales", slug: "new-south-wales", cities: ["Sydney", "Newcastle", "Wollongong"] },
  { name: "Victoria", slug: "victoria", cities: ["Melbourne", "Geelong"] },
  { name: "Queensland", slug: "queensland", cities: ["Brisbane", "Gold Coast"] },
  { name: "Western Australia", slug: "western-australia", cities: ["Perth"] },
];

export const complianceRules: StateComplianceRule[] = [
  {
    state: "New South Wales",
    slug: "new-south-wales",
    disclaimer:
      "Listings, moderation, and profile settings for New South Wales should be reviewed against local advertising and platform obligations before launch.",
    cityNotes: {
      sydney:
        "Sydney launch copy and directory filters should be checked for local advertising, verification, and harm-minimisation requirements.",
    },
  },
  {
    state: "Victoria",
    slug: "victoria",
    disclaimer:
      "Victorian profile publication and moderation workflows may require state-specific review before public release.",
    cityNotes: {
      melbourne:
        "Melbourne category wording, disclaimers, and report flows should be validated before launch.",
    },
  },
  {
    state: "Queensland",
    slug: "queensland",
    disclaimer:
      "Queensland onboarding and marketing disclosures must be checked with counsel before launch.",
    cityNotes: {},
  },
  {
    state: "Western Australia",
    slug: "western-australia",
    disclaimer:
      "Western Australia listing visibility and moderation escalation requirements need legal verification before launch.",
    cityNotes: {},
  },
];

export const directoryProfiles: DirectoryProfile[] = [
  {
    id: "model-1",
    slug: "ava-mercer-sydney",
    displayName: "Ava Mercer",
    state: "New South Wales",
    city: "Sydney",
    shortBio: "Private, polished profile with a focus on discretion, presentation, and clear expectations.",
    longBio:
      "Ava presents a calm, premium profile designed for private browsing. Her profile structure emphasises verified status, moderation review, and respectful boundaries rather than sensational copy.",
    headline: "Editorial presence, private access, Sydney",
    availability: "Evenings and selected weekends",
    subscriptionPrice: 89,
    privateGalleryCount: 8,
    kycStatus: "approved",
    publicationStatus: "live",
    featured: true,
    tags: ["Verified", "Private gallery", "Sydney"],
    publicMedia: [
      { id: "ava-pub-1", title: "Profile portrait", visibility: "public", status: "approved", kind: "image" },
      { id: "ava-pub-2", title: "Editorial detail", visibility: "public", status: "approved", kind: "image" },
    ],
    privateMedia: [
      { id: "ava-pri-1", title: "Private set 01", visibility: "private", status: "approved", kind: "image" },
      { id: "ava-pri-2", title: "Private set 02", visibility: "private", status: "approved", kind: "video" },
    ],
  },
  {
    id: "model-2",
    slug: "clara-vale-melbourne",
    displayName: "Clara Vale",
    state: "Victoria",
    city: "Melbourne",
    shortBio: "Premium profile built around privacy, elegant presentation, and a structured subscription experience.",
    longBio:
      "Clara's profile demonstrates the publication gate: verified identity, approved media, and a premium profile narrative that remains restrained and professional.",
    headline: "Verified profile, refined presentation, Melbourne",
    availability: "Weekday afternoons",
    subscriptionPrice: 79,
    privateGalleryCount: 6,
    kycStatus: "approved",
    publicationStatus: "live",
    featured: true,
    tags: ["Verified", "Melbourne", "Subscriber access"],
    publicMedia: [
      { id: "clara-pub-1", title: "Studio portrait", visibility: "public", status: "approved", kind: "image" },
      { id: "clara-pub-2", title: "Detail frame", visibility: "public", status: "approved", kind: "image" },
    ],
    privateMedia: [
      { id: "clara-pri-1", title: "Private collection", visibility: "private", status: "approved", kind: "image" },
    ],
  },
  {
    id: "model-3",
    slug: "isla-rowe-brisbane",
    displayName: "Isla Rowe",
    state: "Queensland",
    city: "Brisbane",
    shortBio: "Under review profile showing the pre-live states for KYC and media approval.",
    longBio:
      "Isla's sample profile is intentionally not live. It illustrates how the MVP should present a polished draft without implying full verification or public publication.",
    headline: "Pending review foundation, Brisbane",
    availability: "Awaiting publication",
    subscriptionPrice: 69,
    privateGalleryCount: 4,
    kycStatus: "pending",
    publicationStatus: "pending_media_review",
    featured: false,
    tags: ["Pending KYC", "Brisbane", "Draft"],
    publicMedia: [
      { id: "isla-pub-1", title: "Pending hero asset", visibility: "public", status: "pending", kind: "image" },
    ],
    privateMedia: [
      { id: "isla-pri-1", title: "Private pending set", visibility: "private", status: "pending", kind: "video" },
    ],
  },
  {
    id: "model-4",
    slug: "nina-hart-perth",
    displayName: "Nina Hart",
    state: "Western Australia",
    city: "Perth",
    shortBio: "A discreet Perth listing with subscriber-only media states and moderation controls represented.",
    longBio:
      "Nina's page demonstrates private gallery gating, moderation labels, and calm compliance messaging for a premium directory experience.",
    headline: "Private access, moderation-ready, Perth",
    availability: "Fridays to Sundays",
    subscriptionPrice: 84,
    privateGalleryCount: 5,
    kycStatus: "approved",
    publicationStatus: "live",
    featured: false,
    tags: ["Perth", "Private gallery", "Verified"],
    publicMedia: [
      { id: "nina-pub-1", title: "Profile cover", visibility: "public", status: "approved", kind: "image" },
    ],
    privateMedia: [
      { id: "nina-pri-1", title: "Private reel", visibility: "private", status: "approved", kind: "video" },
      { id: "nina-pri-2", title: "Private portrait", visibility: "private", status: "hidden", kind: "image", reason: "Hidden after moderation review" },
    ],
  },
];

export const featuredProfiles = directoryProfiles.filter((profile) => profile.featured);

export const clientSubscriptions: ClientSubscription[] = [
  { id: "sub-1", modelName: "Ava Mercer", city: "Sydney", status: "active", accessEndsAt: "2026-06-18", tier: "Monthly access" },
  { id: "sub-2", modelName: "Clara Vale", city: "Melbourne", status: "expired", accessEndsAt: "2026-05-02", tier: "Monthly access" },
  { id: "sub-3", modelName: "Nina Hart", city: "Perth", status: "cancelled", accessEndsAt: "2026-05-28", tier: "Monthly access" },
];

export const billingHistory: BillingEvent[] = [
  { id: "bill-1", description: "Ava Mercer monthly subscription", amountLabel: "$89.00", status: "succeeded", date: "2026-05-18" },
  { id: "bill-2", description: "Clara Vale renewal attempt", amountLabel: "$79.00", status: "failed", date: "2026-05-05" },
  { id: "bill-3", description: "Nina Hart cancellation refund", amountLabel: "$84.00", status: "refunded", date: "2026-04-30" },
  { id: "bill-4", description: "Payment dispute review", amountLabel: "$84.00", status: "chargeback", date: "2026-04-12" },
];

export const savedProfiles: SavedProfile[] = [
  {
    id: "saved-1",
    profileId: "model-1",
    slug: "ava-mercer-sydney",
    displayName: "Ava Mercer",
    city: "Sydney",
    state: "New South Wales",
    headline: "Editorial presence, private access, Sydney",
    createdAt: "2026-05-20",
  },
  {
    id: "saved-2",
    profileId: "model-2",
    slug: "clara-vale-melbourne",
    displayName: "Clara Vale",
    city: "Melbourne",
    state: "Victoria",
    headline: "Verified profile, refined presentation, Melbourne",
    createdAt: "2026-05-23",
  },
];

export const privacySettings: PrivacySettings = {
  discreetBilling: true,
  marketingOptIn: false,
  showActiveSubscriptions: false,
  notifyOnModerationActions: true,
};

export const studioProfileDraft: StudioProfileDraft = {
  id: "studio-profile-1",
  userId: "preview-model",
  slug: "ava-mercer-sydney",
  displayName: "Ava Mercer",
  state: "New South Wales",
  city: "Sydney",
  shortBio: "Private, polished profile with a focus on discretion and presentation.",
  longBio:
    "Profile copy in STRAND should stay premium, restrained, and clear about privacy, verification, and expectations.",
  availability: "Evenings and selected weekends",
  subscriptionPrice: 89,
  publicationStatus: "pending_media_review",
  kycStatus: "pending",
  featured: false,
};

export const studioMediaAssets: StudioMediaAsset[] = [
  {
    id: "studio-media-1",
    name: "Hero portrait",
    status: "approved",
    visibility: "public",
    note: "Visible on profile",
    kind: "image",
    createdAt: "2026-05-16",
  },
  {
    id: "studio-media-2",
    name: "Private set 01",
    status: "pending",
    visibility: "private",
    note: "Awaiting moderation review",
    kind: "image",
    createdAt: "2026-05-18",
  },
  {
    id: "studio-media-3",
    name: "Private reel",
    status: "rejected",
    visibility: "private",
    note: "Reason: framing requires resubmission",
    reason: "Framing requires resubmission.",
    kind: "video",
    createdAt: "2026-05-19",
  },
  {
    id: "studio-media-4",
    name: "Archive asset",
    status: "hidden",
    visibility: "private",
    note: "Hidden after publication review",
    kind: "image",
    createdAt: "2026-05-21",
  },
];

export const studioKycVerification: StudioKycVerification = {
  id: "studio-kyc-1",
  status: "pending",
  governmentIdLabel: "Government ID placeholder",
  selfieLabel: "Selfie placeholder",
  submittedAt: "2026-05-24",
};

export const studioSubscriptionSettings: StudioSubscriptionSettings = {
  monthlyPrice: 89,
  entitlementSummary:
    "Active subscribers can access approved private media while their subscription remains active. Additional media entitlements may be introduced later.",
};

export const adminKycApplicants: AdminKycApplicant[] = [
  {
    id: "kyc-app-1",
    userId: "model-1-user",
    displayName: "Ava Mercer",
    status: "pending",
    governmentIdLabel: "Government ID placeholder",
    selfieLabel: "Selfie placeholder",
    submittedAt: "2026-05-24",
  },
  {
    id: "kyc-app-2",
    userId: "model-2-user",
    displayName: "Clara Vale",
    status: "approved",
    governmentIdLabel: "Government ID placeholder",
    selfieLabel: "Selfie placeholder",
    submittedAt: "2026-05-22",
    reviewedAt: "2026-05-23",
  },
  {
    id: "kyc-app-3",
    userId: "model-3-user",
    displayName: "Isla Rowe",
    status: "rejected",
    governmentIdLabel: "Government ID placeholder",
    selfieLabel: "Selfie placeholder",
    submittedAt: "2026-05-20",
    reviewedAt: "2026-05-21",
    rejectionReason: "ID image placeholder does not meet review requirements.",
  },
];

export const adminMediaQueue: AdminMediaQueueItem[] = [
  {
    id: "studio-media-2",
    label: "Ava Mercer / Private set 01",
    status: "pending",
    visibility: "private",
    kind: "image",
    note: "Awaiting moderation review",
  },
  {
    id: "isla-media-1",
    label: "Isla Rowe / Pending hero asset",
    status: "rejected",
    visibility: "public",
    kind: "image",
    note: "Rejected during moderation review",
  },
  {
    id: "nina-media-2",
    label: "Nina Hart / Archive asset",
    status: "hidden",
    visibility: "private",
    kind: "image",
    note: "Hidden after publication review",
  },
];

export const moderationCases: ModerationCase[] = [
  {
    id: "case-1",
    targetType: "profile",
    subject: "Isla Rowe profile publication hold",
    reason: "KYC review incomplete before publication request.",
    status: "in_review",
    priority: "high",
    assignedReviewer: "Jordan P.",
  },
  {
    id: "case-2",
    targetType: "media",
    subject: "Nina Hart private asset hide request",
    reason: "Post-publication moderation review triggered a visibility change.",
    status: "open",
    priority: "medium",
    assignedReviewer: "Casey L.",
  },
  {
    id: "case-3",
    targetType: "message",
    subject: "Client report placeholder",
    reason: "Message moderation is out of scope for Phase 1 but queue structure is present.",
    status: "escalated",
    priority: "critical",
    assignedReviewer: "Support queue",
  },
];

export const auditLog: AuditLogEntry[] = [
  { id: "log-1", actor: "Admin", action: "Approved KYC", target: "Ava Mercer", createdAt: "2026-05-22 09:14 AEST" },
  { id: "log-2", actor: "Moderator", action: "Rejected media asset", target: "Isla Rowe / Pending hero asset", createdAt: "2026-05-22 11:02 AEST" },
  { id: "log-3", actor: "Payments", action: "Chargeback flagged", target: "Client sub-3", createdAt: "2026-05-23 16:40 AEST" },
];

export const studioStatusSnapshot: StudioStatusSnapshot = {
  status: "pending_media_review",
  checklist: {
    profileComplete: true,
    kycReady: false,
    mediaReady: false,
    pricingReady: true,
    locationReady: true,
  },
};

export const adminMetrics: AdminMetrics = {
  pendingKyc: 1,
  pendingMedia: 1,
  failedPayments: 1,
  reportedProfiles: 2,
  chargebacks: 1,
  suspendedUsers: 0,
};

export function getProfileBySlug(slug: string) {
  return directoryProfiles.find((profile) => profile.slug === slug);
}

export function getStateBySlug(slug: string) {
  return states.find((state) => state.slug === slug);
}

export function getComplianceRuleByStateSlug(slug: string) {
  return complianceRules.find((rule) => rule.slug === slug);
}

export function filterProfiles({
  stateSlug,
  citySlug,
  query,
}: {
  stateSlug?: string;
  citySlug?: string;
  query?: string;
}) {
  return directoryProfiles.filter((profile) => {
    const state = !stateSlug || profile.state.toLowerCase().replaceAll(" ", "-") === stateSlug;
    const city = !citySlug || profile.city.toLowerCase().replaceAll(" ", "-") === citySlug;
    const matchesQuery =
      !query ||
      [profile.displayName, profile.city, profile.state, profile.headline, ...profile.tags]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase());

    return state && city && matchesQuery;
  });
}
