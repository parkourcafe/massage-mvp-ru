// Async data-access contract. Two implementations satisfy it:
//  * the in-memory demo store (src/lib/db/index.ts bodies) — default,
//    used by the test suite and when Supabase is not configured;
//  * the Supabase Postgres repository (src/lib/db/supabase-repo.ts) —
//    selected at runtime when DB_BACKEND=supabase.
// The public surface (@/lib/db) is async regardless of backend.

import type {
  AiGeneration,
  AuthUser,
  Booking,
  BookingEventType,
  BookingMessage,
  BookingOutcome,
  BookingStatus,
  ClientPrivateFeedback,
  ClientSession,
  ContactChannel,
  CrmClient,
  Favorite,
  MatchRequestRecord,
  MatchResultRecord,
  Payment,
  Plan,
  Profile,
  ProfileMedia,
  ServiceItem,
  Subscription,
  SupportRequest,
  TherapistPrivateNote,
} from "../types";

export interface DirectoryFilter {
  modality?: string;
  city?: string;
  district?: string;
  q?: string;
  includeUnindexable?: boolean;
}

export interface ProfileAnalytics {
  totalViews: number;
  totalClicks: number;
  viewsByDay: { date: string; count: number }[];
  clicksByChannel: Record<string, number>;
}

export interface ActivityTotals {
  totalViews: number;
  totalClicks: number;
  aiCalls: number;
}

export interface MatchResultInput {
  profile_id: string;
  score: number;
  service_recommendation: string;
  reasons: string[];
  risks: string[];
}

export interface DbRepository {
  // Auth users
  getUserById(id: string): Promise<AuthUser | null>;
  findUserByEmail(email: string): Promise<AuthUser | null>;
  createUser(
    email: string,
    password: string,
    fullName: string
  ): Promise<{ user: AuthUser; profile: Profile } | { error: string }>;

  // Plans
  listPlans(): Promise<Plan[]>;

  // Profiles
  listPublicProfiles(filter?: DirectoryFilter): Promise<Profile[]>;
  getPublicProfileBySlug(slug: string): Promise<Profile | null>;
  getRawProfileBySlug(slug: string): Promise<Profile | null>;
  getRawProfileById(id: string): Promise<Profile | null>;
  getOwnerProfile(userId?: string): Promise<Profile>;
  updateProfile(id: string, patch: Partial<Profile>): Promise<Profile | null>;

  // Services
  upsertService(
    profileId: string,
    data: Partial<ServiceItem> & { modality: string; title: string }
  ): Promise<ServiceItem | null>;
  deleteService(profileId: string, serviceId: string): Promise<boolean>;

  // Media
  listMedia(profileId: string): Promise<ProfileMedia[]>;
  addMedia(
    profileId: string,
    data: Omit<ProfileMedia, "id" | "profile_id">
  ): Promise<ProfileMedia | null>;
  deleteMedia(profileId: string, mediaId: string): Promise<boolean>;

  // Favorites
  listFavorites(
    userId: string
  ): Promise<(Favorite & { profile: Profile | null })[]>;
  addFavorite(
    userId: string,
    profileId: string,
    source?: Favorite["source"],
    matchScore?: number
  ): Promise<Favorite>;
  removeFavorite(userId: string, profileId: string): Promise<boolean>;

  // Bookings
  createBooking(
    input: Partial<Booking> & {
      profile_id: string;
      client_name: string;
      first_message?: string;
    }
  ): Promise<Booking>;
  getBookingByToken(token: string): Promise<Booking | null>;
  getBookingById(id: string): Promise<Booking | null>;
  listBookingsForProfile(profileId: string): Promise<Booking[]>;
  addBookingMessage(
    bookingId: string,
    senderType: "therapist" | "client",
    senderName: string,
    body: string
  ): Promise<BookingMessage | null>;
  addBookingEvent(
    bookingId: string,
    eventType: BookingEventType,
    eventText?: string
  ): Promise<void>;
  setBookingStatus(
    bookingId: string,
    status: BookingStatus,
    eventText?: string
  ): Promise<Booking | null>;
  proposeTime(
    bookingId: string,
    by: "therapist" | "client",
    slot: string
  ): Promise<Booking | null>;
  confirmBooking(bookingId: string, slot: string): Promise<Booking | null>;
  setBookingOutcome(
    bookingId: string,
    outcome: BookingOutcome,
    status: BookingStatus
  ): Promise<Booking | null>;

  // Clients CRM
  convertBookingToClient(bookingId: string): Promise<CrmClient | null>;
  listClients(profileId: string): Promise<CrmClient[]>;
  getClient(id: string): Promise<CrmClient | null>;
  updateClient(
    id: string,
    patch: Partial<CrmClient>
  ): Promise<CrmClient | null>;
  addClientSession(
    clientId: string,
    data: Partial<ClientSession>
  ): Promise<ClientSession | null>;
  getClientByToken(token: string): Promise<CrmClient | null>;

  // Private mutual feedback
  addTherapistPrivateNote(
    profileId: string,
    data: Partial<TherapistPrivateNote>
  ): Promise<TherapistPrivateNote | null>;
  listTherapistPrivateNotes(
    profileId: string,
    clientId?: string
  ): Promise<TherapistPrivateNote[]>;
  submitClientFeedback(
    token: string,
    data: Partial<ClientPrivateFeedback>
  ): Promise<ClientPrivateFeedback | null>;
  listClientFeedbackForProfile(
    profileId: string,
    clientId?: string
  ): Promise<ClientPrivateFeedback[]>;

  // Analytics
  recordProfileView(profileId: string, path?: string): Promise<void>;
  recordContactClick(
    profileId: string,
    channel: ContactChannel
  ): Promise<void>;
  getAnalytics(profileId: string): Promise<ProfileAnalytics>;
  logAiGeneration(task: string, usedOpenAI: boolean): Promise<void>;
  listAiGenerations(): Promise<AiGeneration[]>;
  getActivityTotals(): Promise<ActivityTotals>;

  // AI match persistence
  saveMatch(
    request: Omit<MatchRequestRecord, "id" | "created_at">,
    results: MatchResultInput[]
  ): Promise<MatchRequestRecord>;
  listMatchesForProfile(
    profileId: string
  ): Promise<(MatchResultRecord & { request: MatchRequestRecord | null })[]>;

  // Support
  createSupportRequest(
    input: Omit<
      SupportRequest,
      "id" | "status" | "admin_note" | "created_at" | "updated_at"
    >
  ): Promise<SupportRequest>;
  listSupportRequests(): Promise<SupportRequest[]>;
  updateSupportRequest(
    id: string,
    patch: Partial<SupportRequest>
  ): Promise<SupportRequest | null>;

  // Subscriptions / payments
  createPayment(
    profileId: string,
    planId: "pro" | "expert"
  ): Promise<Payment>;
  getPaymentByProviderId(providerId: string): Promise<Payment | null>;
  markPaymentSucceeded(providerId: string): Promise<Subscription | null>;
  cancelSubscription(profileId: string): Promise<Subscription | null>;
  getSubscription(profileId: string): Promise<Subscription | null>;
  listPayments(): Promise<Payment[]>;
  listSubscriptions(): Promise<Subscription[]>;

  // Admin / moderation
  listAllProfiles(): Promise<Profile[]>;
  listModerationFlags(): Promise<
    {
      id: string;
      profile_id?: string | null;
      category: string;
      severity: string;
      matched_text?: string | null;
      resolved: boolean;
      created_at: string;
      profile: Profile | null;
    }[]
  >;
  resolveModerationFlag(id: string): Promise<boolean>;
  setModerationStatus(
    profileId: string,
    status: Profile["moderation_status"]
  ): Promise<Profile | null>;
}
