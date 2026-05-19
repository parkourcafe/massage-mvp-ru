import type {
  AuthUser,
  AvailabilitySlot,
  Booking,
  AiGeneration,
  BookingEvent,
  BookingMessage,
  ContactClick,
  MatchRequestRecord,
  MatchResultRecord,
  ProfileView,
  BookingOutcome,
  BookingStatus,
  ClientPrivateFeedback,
  CrmClient,
  ClientSession,
  Favorite,
  ModerationFlag,
  Payment,
  Plan,
  Profile,
  ServiceItem,
  ProfileMedia,
  SupportRequest,
  Subscription,
  TherapistAvailability,
  TherapistPrivateNote,
} from "../types";
import { computeQualityScore } from "../quality";
import { moderateProfilePayload } from "../moderation";
import { newId, nowIso, secureToken } from "../util";
import {
  seedAvailability,
  seedTherapistAvailability,
  seedBookings,
  seedClients,
  seedPlans,
  seedProfiles,
  seedSupport,
  seedUsers,
} from "./seed";

interface Store {
  users: AuthUser[];
  plans: Plan[];
  profiles: Profile[];
  favorites: Favorite[];
  bookings: Booking[];
  availabilitySlots: AvailabilitySlot[];
  therapistAvailability: TherapistAvailability[];
  clients: CrmClient[];
  therapistNotes: TherapistPrivateNote[];
  clientFeedback: ClientPrivateFeedback[];
  profileViews: ProfileView[];
  contactClicks: ContactClick[];
  aiGenerations: AiGeneration[];
  matchRequests: MatchRequestRecord[];
  matchResults: MatchResultRecord[];
  support: SupportRequest[];
  subscriptions: Subscription[];
  payments: Payment[];
  moderation: ModerationFlag[];
}

// Module-level singleton. Survives across requests in a running server
// and across a single test run. This is the MVP demo persistence layer;
// see README for the Supabase production path.
const g = globalThis as unknown as { __massageStore?: Store };

function seedAnalytics(profileId: string): {
  views: ProfileView[];
  clicks: ContactClick[];
} {
  const views: ProfileView[] = [];
  const clicks: ContactClick[] = [];
  for (let day = 0; day < 12; day++) {
    const count = 2 + ((day * 7) % 5);
    for (let i = 0; i < count; i++) {
      const d = new Date(Date.now() - day * 86400000 - i * 600000);
      views.push({
        id: crypto.randomUUID(),
        profile_id: profileId,
        path: `/therapist/anna-kovaleva`,
        created_at: d.toISOString(),
      });
    }
  }
  (["whatsapp", "telegram", "booking", "vk"] as const).forEach((ch, i) => {
    for (let n = 0; n < 4 - i; n++) {
      clicks.push({
        id: crypto.randomUUID(),
        profile_id: profileId,
        channel: ch,
        created_at: new Date(Date.now() - n * 86400000).toISOString(),
      });
    }
  });
  return { views, clicks };
}

function freshStore(): Store {
  const profiles = seedProfiles().map((p) => ({
    ...p,
    quality_score: computeQualityScore(p).score,
  }));
  const demo = seedAnalytics(profiles[0]?.id ?? "");
  return {
    users: seedUsers(),
    plans: seedPlans(),
    profiles,
    favorites: [],
    bookings: seedBookings(),
    availabilitySlots: seedAvailability(),
    therapistAvailability: seedTherapistAvailability(profiles),
    clients: seedClients(),
    therapistNotes: [],
    clientFeedback: [],
    profileViews: demo.views,
    contactClicks: demo.clicks,
    aiGenerations: [],
    matchRequests: [],
    matchResults: [],
    support: seedSupport(),
    subscriptions: [],
    payments: [],
    moderation: [],
  };
}

export function store(): Store {
  if (!g.__massageStore) g.__massageStore = freshStore();
  return g.__massageStore;
}

// Test helper — reset to seed.
export function __resetStore(): void {
  g.__massageStore = freshStore();
}

function recomputeProfile(p: Profile): void {
  p.quality_score = computeQualityScore(p).score;
  const mod = moderateProfilePayload({
    full_name: p.full_name,
    headline: p.headline,
    professional_description: p.professional_description,
    safety_boundaries: p.safety_boundaries,
    services: p.services,
    media: p.media,
  });
  if (!mod.ok && p.moderation_status === "approved") {
    p.moderation_status = "flagged";
  }
  const flags = store().moderation;
  for (const hit of mod.hits) {
    const exists = flags.some(
      (f) =>
        f.profile_id === p.id &&
        f.category === hit.category &&
        f.matched_text === hit.matchedText &&
        !f.resolved
    );
    if (exists) continue;
    flags.push({
      id: newId(),
      profile_id: p.id,
      category: hit.category,
      severity: hit.severity,
      matched_text: hit.matchedText,
      resolved: false,
      created_at: nowIso(),
    });
  }
  p.updated_at = nowIso();
}

export { recomputeProfile };
