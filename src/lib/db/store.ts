import type {
  AuthUser,
  Booking,
  BookingEvent,
  BookingMessage,
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
  TherapistPrivateNote,
} from "../types";
import { computeQualityScore } from "../quality";
import { moderateProfilePayload } from "../moderation";
import { newId, nowIso, secureToken } from "../util";
import {
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
  clients: CrmClient[];
  therapistNotes: TherapistPrivateNote[];
  clientFeedback: ClientPrivateFeedback[];
  support: SupportRequest[];
  subscriptions: Subscription[];
  payments: Payment[];
  moderation: ModerationFlag[];
}

// Module-level singleton. Survives across requests in a running server
// and across a single test run. This is the MVP demo persistence layer;
// see README for the Supabase production path.
const g = globalThis as unknown as { __massageStore?: Store };

function freshStore(): Store {
  const profiles = seedProfiles().map((p) => ({
    ...p,
    quality_score: computeQualityScore(p).score,
  }));
  return {
    users: seedUsers(),
    plans: seedPlans(),
    profiles,
    favorites: [],
    bookings: seedBookings(),
    clients: seedClients(),
    therapistNotes: [],
    clientFeedback: [],
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
