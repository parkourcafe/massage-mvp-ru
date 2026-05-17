import type {
  AuthUser,
  Booking,
  BookingMessage,
  BookingOutcome,
  BookingStatus,
  ClientPrivateFeedback,
  CrmClient,
  ClientSession,
  Favorite,
  Payment,
  Plan,
  Profile,
  ProfileMedia,
  ServiceItem,
  SupportRequest,
  Subscription,
  TherapistPrivateNote,
} from "../types";
import type { UserRole } from "../types";
import { PLANS } from "../plans";
import { hashPassword } from "../auth/password";
import { newId, nowIso, secureToken, slugify } from "../util";
import { recomputeProfile, store, __resetStore } from "./store";

export { __resetStore };

// ---------- Auth users ----------
// Resolver lets the data layer pick the dashboard "owner" from the
// signed-in session without coupling to next/headers (registered by
// src/lib/auth/session.ts). Unit tests never set it → pure fallback.
let ownerResolver: () => string | undefined = () => undefined;
export function __setOwnerResolver(fn: () => string | undefined): void {
  ownerResolver = fn;
}

export function getUserById(id: string): AuthUser | null {
  return store().users.find((u) => u.id === id) ?? null;
}

export function findUserByEmail(email: string): AuthUser | null {
  const e = email.trim().toLowerCase();
  return store().users.find((u) => u.email.toLowerCase() === e) ?? null;
}

function uniqueSlug(base: string): string {
  let slug = slugify(base);
  let n = 1;
  while (store().profiles.some((p) => p.slug === slug)) {
    slug = `${slugify(base)}-${++n}`;
  }
  return slug;
}

// Signup: creates a therapist user + an empty draft profile they own.
export function createUser(
  email: string,
  password: string,
  fullName: string
): { user: AuthUser; profile: Profile } | { error: string } {
  if (findUserByEmail(email)) {
    return { error: "Пользователь с таким email уже существует" };
  }
  const userId = `user-${newId()}`;
  const user: AuthUser = {
    id: userId,
    email: email.trim().toLowerCase(),
    password_hash: hashPassword(password),
    role: "therapist",
    created_at: nowIso(),
  };
  store().users.push(user);

  const profile: Profile = {
    id: newId(),
    user_id: userId,
    slug: uniqueSlug(fullName || email.split("@")[0]),
    full_name: fullName || "Новый специалист",
    gender: null,
    show_gender: false,
    years_experience: 0,
    headline: null,
    professional_description: null,
    safety_boundaries:
      "Работаю строго в рамках профессионального оздоровительного массажа. Эротический и интимный контент недопустим.",
    faq: [],
    country: "Россия",
    city: null,
    district: null,
    nearest_landmark: null,
    therapist_address_private: null,
    public_location_label: null,
    works_at_own_place: false,
    travels_to_client: false,
    works_in_hotels: false,
    works_in_villas: false,
    works_in_salon: false,
    travel_districts: [],
    minimum_booking_price: null,
    transport_fee: null,
    timezone: "Europe/Moscow",
    languages: ["Русский"],
    price_from: null,
    session_durations: [60, 90],
    plan_id: "free",
    is_published: false,
    quality_score: 0,
    moderation_status: "pending",
    created_at: nowIso(),
    updated_at: nowIso(),
    services: [],
    media: [],
  };
  store().profiles.push(profile);
  recomputeProfile(profile);
  return { user, profile };
}

// ---- Public-safe projection ----
export function toPublicProfile(p: Profile): Profile {
  const { therapist_address_private, ...rest } = p;
  return {
    ...rest,
    therapist_address_private: null,
    services: (p.services ?? []).filter((s) => s.is_published),
    media: (p.media ?? []).filter((m) => m.is_published && m.type !== "document"),
  };
}

// ---------- Plans ----------
export function listPlans(): Plan[] {
  return store().plans;
}

// ---------- Profiles ----------
export interface DirectoryFilter {
  modality?: string; // modality key
  city?: string; // city label
  district?: string;
  q?: string;
  includeUnindexable?: boolean;
}

export function listPublicProfiles(filter: DirectoryFilter = {}): Profile[] {
  let list = store().profiles.filter(
    (p) => p.is_published && p.moderation_status === "approved"
  );
  if (filter.modality) {
    list = list.filter((p) =>
      (p.services ?? []).some(
        (s) => s.is_published && s.modality === filter.modality
      )
    );
  }
  if (filter.city) {
    list = list.filter(
      (p) => (p.city ?? "").toLowerCase() === filter.city!.toLowerCase()
    );
  }
  if (filter.district) {
    list = list.filter(
      (p) => (p.district ?? "").toLowerCase() === filter.district!.toLowerCase()
    );
  }
  if (filter.q) {
    const q = filter.q.toLowerCase();
    list = list.filter(
      (p) =>
        p.full_name.toLowerCase().includes(q) ||
        (p.headline ?? "").toLowerCase().includes(q) ||
        (p.professional_description ?? "").toLowerCase().includes(q)
    );
  }
  // Featured (expert) first, then quality score.
  return list
    .map(toPublicProfile)
    .sort(
      (a, b) =>
        Number(b.plan_id === "expert") - Number(a.plan_id === "expert") ||
        b.quality_score - a.quality_score
    );
}

export function getPublicProfileBySlug(slug: string): Profile | null {
  const p = store().profiles.find(
    (x) => x.slug === slug && x.is_published && x.moderation_status === "approved"
  );
  return p ? toPublicProfile(p) : null;
}

export function getRawProfileBySlug(slug: string): Profile | null {
  return store().profiles.find((x) => x.slug === slug) ?? null;
}

export function getRawProfileById(id: string): Profile | null {
  return store().profiles.find((x) => x.id === id) ?? null;
}

// Profile owned by a user (dashboard owner context). When no userId is
// passed, resolves from the signed-in session via the registered
// resolver; falls back to the demo profile (tests / no session).
export function getOwnerProfile(userId?: string): Profile {
  const uid = userId ?? ownerResolver() ?? "user-anna";
  const found = store().profiles.find((p) => p.user_id === uid);
  return found ?? store().profiles[0];
}

export function updateProfile(id: string, patch: Partial<Profile>): Profile | null {
  const p = store().profiles.find((x) => x.id === id);
  if (!p) return null;
  Object.assign(p, patch);
  recomputeProfile(p);
  return p;
}

// ---------- Services ----------
export function upsertService(
  profileId: string,
  data: Partial<ServiceItem> & { modality: string; title: string }
): ServiceItem | null {
  const p = store().profiles.find((x) => x.id === profileId);
  if (!p) return null;
  p.services = p.services ?? [];
  if (data.id) {
    const existing = p.services.find((s) => s.id === data.id);
    if (existing) {
      Object.assign(existing, data);
      recomputeProfile(p);
      return existing;
    }
  }
  const svc: ServiceItem = {
    id: newId(),
    profile_id: profileId,
    modality: data.modality,
    title: data.title,
    description: data.description ?? null,
    duration: data.duration ?? null,
    price: data.price ?? null,
    contraindication_note: data.contraindication_note ?? null,
    is_published: data.is_published ?? true,
    sort_order: data.sort_order ?? p.services.length,
  };
  p.services.push(svc);
  recomputeProfile(p);
  return svc;
}

export function deleteService(profileId: string, serviceId: string): boolean {
  const p = store().profiles.find((x) => x.id === profileId);
  if (!p?.services) return false;
  const before = p.services.length;
  p.services = p.services.filter((s) => s.id !== serviceId);
  recomputeProfile(p);
  return p.services.length < before;
}

// ---------- Media ----------
export function listMedia(profileId: string): ProfileMedia[] {
  return store().profiles.find((p) => p.id === profileId)?.media ?? [];
}

export function addMedia(
  profileId: string,
  data: Omit<ProfileMedia, "id" | "profile_id">
): ProfileMedia | null {
  const p = store().profiles.find((x) => x.id === profileId);
  if (!p) return null;
  p.media = p.media ?? [];
  const m: ProfileMedia = { ...data, id: newId(), profile_id: profileId };
  p.media.push(m);
  recomputeProfile(p);
  return m;
}

export function deleteMedia(profileId: string, mediaId: string): boolean {
  const p = store().profiles.find((x) => x.id === profileId);
  if (!p?.media) return false;
  const before = p.media.length;
  p.media = p.media.filter((m) => m.id !== mediaId);
  recomputeProfile(p);
  return p.media.length < before;
}

// ---------- Favorites ----------
export function listFavorites(userId: string): (Favorite & { profile: Profile | null })[] {
  return store()
    .favorites.filter((f) => f.user_id === userId)
    .map((f) => ({
      ...f,
      profile: (() => {
        const p = store().profiles.find((x) => x.id === f.profile_id);
        return p ? toPublicProfile(p) : null;
      })(),
    }));
}

export function addFavorite(
  userId: string,
  profileId: string,
  source: Favorite["source"] = "directory",
  matchScore?: number
): Favorite {
  const existing = store().favorites.find(
    (f) => f.user_id === userId && f.profile_id === profileId
  );
  if (existing) return existing; // prevent duplicates
  const fav: Favorite = {
    id: newId(),
    user_id: userId,
    profile_id: profileId,
    source,
    match_score: matchScore ?? null,
    created_at: nowIso(),
  };
  store().favorites.push(fav);
  return fav;
}

export function removeFavorite(userId: string, profileId: string): boolean {
  const before = store().favorites.length;
  g_filterFavorites(userId, profileId);
  return store().favorites.length < before;
}

function g_filterFavorites(userId: string, profileId: string) {
  const s = store();
  s.favorites = s.favorites.filter(
    (f) => !(f.user_id === userId && f.profile_id === profileId)
  );
}

// ---------- Bookings ----------
export function createBooking(
  input: Partial<Booking> & { profile_id: string; client_name: string; first_message?: string }
): Booking {
  const booking: Booking = {
    id: newId(),
    profile_id: input.profile_id,
    token: secureToken(),
    client_name: input.client_name,
    client_role: input.client_role ?? "self",
    contact_method: input.contact_method ?? null,
    contact_value: input.contact_value ?? null,
    service_type: input.service_type ?? null,
    massage_goal: input.massage_goal ?? null,
    focus_area: input.focus_area ?? null,
    pressure_preference: input.pressure_preference ?? null,
    duration: input.duration ?? null,
    location_type: input.location_type ?? null,
    city: input.city ?? null,
    district: input.district ?? null,
    address_or_landmark: input.address_or_landmark ?? null,
    preferred_time_slot_1: input.preferred_time_slot_1 ?? null,
    preferred_time_slot_2: input.preferred_time_slot_2 ?? null,
    preferred_time_slot_3: input.preferred_time_slot_3 ?? null,
    confirmed_time_slot: null,
    status: "new",
    outcome: null,
    important_notes: input.important_notes ?? null,
    created_at: nowIso(),
    updated_at: nowIso(),
    messages: [],
    events: [],
  };
  store().bookings.push(booking);
  addBookingEvent(booking.id, "created", "Заявка на запись создана");
  if (input.first_message) {
    addBookingMessage(booking.id, "client", booking.client_name, input.first_message);
    booking.status = "chat_started";
  }
  return booking;
}

export function getBookingByToken(token: string): Booking | null {
  return store().bookings.find((b) => b.token === token) ?? null;
}

export function getBookingById(id: string): Booking | null {
  return store().bookings.find((b) => b.id === id) ?? null;
}

export function listBookingsForProfile(profileId: string): Booking[] {
  return store()
    .bookings.filter((b) => b.profile_id === profileId)
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
}

export function addBookingMessage(
  bookingId: string,
  senderType: "therapist" | "client",
  senderName: string,
  body: string
): BookingMessage | null {
  const b = getBookingById(bookingId);
  if (!b) return null;
  const msg: BookingMessage = {
    id: newId(),
    booking_id: bookingId,
    sender_type: senderType,
    sender_name: senderName,
    body,
    created_at: nowIso(),
    read_at: null,
  };
  b.messages = b.messages ?? [];
  b.messages.push(msg);
  b.updated_at = nowIso();
  if (b.status === "new") b.status = "chat_started";
  if (senderType === "client" && b.status !== "confirmed" && b.status !== "completed") {
    b.status = "waiting_therapist_reply";
  }
  if (senderType === "therapist" && b.status !== "confirmed" && b.status !== "completed") {
    b.status = "waiting_client_reply";
  }
  return msg;
}

export function addBookingEvent(
  bookingId: string,
  eventType: string,
  eventText?: string
) {
  const b = getBookingById(bookingId);
  if (!b) return;
  b.events = b.events ?? [];
  b.events.push({
    id: newId(),
    booking_id: bookingId,
    event_type: eventType,
    event_text: eventText ?? null,
    created_at: nowIso(),
  });
  b.updated_at = nowIso();
}

export function setBookingStatus(
  bookingId: string,
  status: BookingStatus,
  eventText?: string
): Booking | null {
  const b = getBookingById(bookingId);
  if (!b) return null;
  b.status = status;
  b.updated_at = nowIso();
  addBookingEvent(bookingId, `status:${status}`, eventText);
  return b;
}

export function proposeTime(
  bookingId: string,
  by: "therapist" | "client",
  slot: string
): Booking | null {
  const b = getBookingById(bookingId);
  if (!b) return null;
  b.preferred_time_slot_1 = slot;
  b.status = "time_proposed";
  b.updated_at = nowIso();
  addBookingEvent(bookingId, "time_proposed", `${by === "therapist" ? "Специалист" : "Клиент"} предложил время: ${slot}`);
  return b;
}

export function confirmBooking(
  bookingId: string,
  slot: string
): Booking | null {
  const b = getBookingById(bookingId);
  if (!b) return null;
  b.confirmed_time_slot = slot;
  b.status = "confirmed";
  b.updated_at = nowIso();
  addBookingEvent(bookingId, "confirmed", `Запись подтверждена на ${slot}`);
  return b;
}

export function setBookingOutcome(
  bookingId: string,
  outcome: BookingOutcome,
  status: BookingStatus
): Booking | null {
  const b = getBookingById(bookingId);
  if (!b) return null;
  b.outcome = outcome;
  b.status = status;
  b.updated_at = nowIso();
  addBookingEvent(bookingId, "outcome", `Итог: ${outcome}`);
  return b;
}

// ---------- Clients CRM ----------
export function convertBookingToClient(bookingId: string): CrmClient | null {
  const b = getBookingById(bookingId);
  if (!b) return null;
  const existing = store().clients.find((c) => c.source_booking_id === bookingId);
  if (existing) return existing;
  const client: CrmClient = {
    id: newId(),
    profile_id: b.profile_id,
    source_booking_id: b.id,
    token: secureToken(),
    name: b.client_name,
    contact_method: b.contact_method ?? null,
    contact_value: b.contact_value ?? null,
    city: b.city ?? null,
    district: b.district ?? null,
    preferred_service_type: b.service_type ?? null,
    pressure_preference: b.pressure_preference ?? null,
    important_notes: b.important_notes ?? null,
    contraindication_notes: null,
    favorite_duration: b.duration ?? null,
    repeat_status: "active",
    created_at: nowIso(),
    updated_at: nowIso(),
    sessions: [],
  };
  store().clients.push(client);
  b.status = "converted_to_repeat_client";
  b.updated_at = nowIso();
  addBookingEvent(b.id, "converted_to_client", "Заявка преобразована в клиента CRM");
  return client;
}

export function listClients(profileId: string): CrmClient[] {
  return store().clients.filter((c) => c.profile_id === profileId);
}

export function getClient(id: string): CrmClient | null {
  return store().clients.find((c) => c.id === id) ?? null;
}

export function updateClient(id: string, patch: Partial<CrmClient>): CrmClient | null {
  const c = getClient(id);
  if (!c) return null;
  Object.assign(c, patch, { updated_at: nowIso() });
  return c;
}

export function addClientSession(
  clientId: string,
  data: Partial<ClientSession>
): ClientSession | null {
  const c = getClient(clientId);
  if (!c) return null;
  const s: ClientSession = {
    id: newId(),
    client_id: clientId,
    session_date: data.session_date ?? nowIso().slice(0, 10),
    service_type: data.service_type ?? null,
    duration: data.duration ?? null,
    focus_area: data.focus_area ?? null,
    pressure: data.pressure ?? null,
    private_note: data.private_note ?? null,
    next_recommendation: data.next_recommendation ?? null,
    created_at: nowIso(),
  };
  c.sessions = c.sessions ?? [];
  c.sessions.push(s);
  c.updated_at = nowIso();
  return s;
}

export function getClientByToken(token: string): CrmClient | null {
  if (!token) return null;
  return store().clients.find((c) => c.token === token) ?? null;
}

// ---------- Private mutual feedback (never public) ----------
export function addTherapistPrivateNote(
  profileId: string,
  data: Partial<TherapistPrivateNote>
): TherapistPrivateNote | null {
  const owner = getRawProfileById(profileId);
  if (!owner) return null;
  if (data.client_id) {
    const c = getClient(data.client_id);
    if (!c || c.profile_id !== profileId) return null;
  }
  const note: TherapistPrivateNote = {
    id: newId(),
    profile_id: profileId,
    client_id: data.client_id ?? null,
    booking_id: data.booking_id ?? null,
    session_date: data.session_date ?? nowIso().slice(0, 10),
    service_type: data.service_type ?? null,
    duration: data.duration ?? null,
    focus_area: data.focus_area ?? null,
    pressure_used: data.pressure_used ?? null,
    how_session_went: data.how_session_went ?? null,
    what_to_repeat: data.what_to_repeat ?? null,
    what_to_avoid: data.what_to_avoid ?? null,
    next_step: data.next_step ?? null,
    private_note: data.private_note ?? null,
    created_at: nowIso(),
  };
  store().therapistNotes.push(note);
  return note;
}

export function listTherapistPrivateNotes(
  profileId: string,
  clientId?: string
): TherapistPrivateNote[] {
  return store()
    .therapistNotes.filter(
      (n) =>
        n.profile_id === profileId &&
        (clientId ? n.client_id === clientId : true)
    )
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

// Submitted by the client/patient via their unguessable token. Never public.
export function submitClientFeedback(
  token: string,
  data: Partial<ClientPrivateFeedback>
): ClientPrivateFeedback | null {
  const client = getClientByToken(token);
  if (!client) return null;
  const fb: ClientPrivateFeedback = {
    id: newId(),
    booking_id: client.source_booking_id ?? null,
    profile_id: client.profile_id,
    client_id: client.id,
    comfort_score: data.comfort_score ?? null,
    professionalism_score: data.professionalism_score ?? null,
    cleanliness_score: data.cleanliness_score ?? null,
    punctuality_score: data.punctuality_score ?? null,
    pressure_fit: data.pressure_fit ?? null,
    comment: data.comment ?? null,
    repeat_status: data.repeat_status ?? null,
    created_at: nowIso(),
  };
  store().clientFeedback.push(fb);
  return fb;
}

// Owner-only read of feedback received about their own profile/clients.
export function listClientFeedbackForProfile(
  profileId: string,
  clientId?: string
): ClientPrivateFeedback[] {
  return store()
    .clientFeedback.filter(
      (f) =>
        f.profile_id === profileId &&
        (clientId ? f.client_id === clientId : true)
    )
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

// ---------- Support ----------
export function createSupportRequest(
  input: Omit<SupportRequest, "id" | "status" | "admin_note" | "created_at" | "updated_at">
): SupportRequest {
  const sr: SupportRequest = {
    ...input,
    id: newId(),
    status: "new",
    admin_note: null,
    created_at: nowIso(),
    updated_at: nowIso(),
  };
  store().support.push(sr);
  return sr;
}

export function listSupportRequests(): SupportRequest[] {
  return store().support.sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function updateSupportRequest(
  id: string,
  patch: Partial<SupportRequest>
): SupportRequest | null {
  const sr = store().support.find((s) => s.id === id);
  if (!sr) return null;
  Object.assign(sr, patch, { updated_at: nowIso() });
  return sr;
}

// ---------- Subscriptions / payments ----------
export function createPayment(
  profileId: string,
  planId: "pro" | "expert"
): Payment {
  const plan = PLANS[planId];
  const payment: Payment = {
    id: newId(),
    profile_id: profileId,
    subscription_id: null,
    provider: "yookassa",
    provider_payment_id: `mock_${newId()}`,
    amount_rub: plan.price_rub,
    currency: "RUB",
    status: "pending",
    plan_id: planId,
    created_at: nowIso(),
    updated_at: nowIso(),
  };
  store().payments.push(payment);
  return payment;
}

export function getPaymentByProviderId(providerId: string): Payment | null {
  return (
    store().payments.find((p) => p.provider_payment_id === providerId) ?? null
  );
}

// Activates subscription ONLY when called from verified webhook/backend.
export function markPaymentSucceeded(providerId: string): Subscription | null {
  const payment = getPaymentByProviderId(providerId);
  if (!payment || payment.status === "succeeded") {
    return payment
      ? store().subscriptions.find((s) => s.id === payment.subscription_id) ?? null
      : null;
  }
  payment.status = "succeeded";
  payment.updated_at = nowIso();

  const planId = (payment.plan_id ?? "pro") as "pro" | "expert";
  const days = PLANS[planId].period_days || 30;
  const now = new Date();
  const expires = new Date(now.getTime() + days * 86400000);

  let sub = store().subscriptions.find((s) => s.profile_id === payment.profile_id);
  if (!sub) {
    sub = {
      id: newId(),
      profile_id: payment.profile_id,
      plan_id: planId,
      status: "active",
      started_at: now.toISOString(),
      expires_at: expires.toISOString(),
    };
    store().subscriptions.push(sub);
  } else {
    sub.plan_id = planId;
    sub.status = "active";
    sub.started_at = now.toISOString();
    sub.expires_at = expires.toISOString();
  }
  payment.subscription_id = sub.id;

  const profile = getRawProfileById(payment.profile_id);
  if (profile) {
    profile.plan_id = planId;
    profile.updated_at = nowIso();
  }
  return sub;
}

export function cancelSubscription(profileId: string): Subscription | null {
  const sub = store().subscriptions.find((s) => s.profile_id === profileId);
  if (!sub) return null;
  sub.status = "cancelled";
  const profile = getRawProfileById(profileId);
  if (profile) {
    profile.plan_id = "free";
    profile.updated_at = nowIso();
  }
  return sub;
}

export function getSubscription(profileId: string): Subscription | null {
  return store().subscriptions.find((s) => s.profile_id === profileId) ?? null;
}

export function listPayments(): Payment[] {
  return store().payments.sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function listSubscriptions(): Subscription[] {
  return store().subscriptions;
}

// ---------- Admin / moderation ----------
export function listAllProfiles(): Profile[] {
  return store().profiles;
}

export function listModerationFlags() {
  return store()
    .moderation.filter((m) => !m.resolved)
    .map((m) => ({
      ...m,
      profile: store().profiles.find((p) => p.id === m.profile_id) ?? null,
    }));
}

export function resolveModerationFlag(id: string): boolean {
  const f = store().moderation.find((m) => m.id === id);
  if (!f) return false;
  f.resolved = true;
  return true;
}

export function setModerationStatus(
  profileId: string,
  status: Profile["moderation_status"]
): Profile | null {
  const p = getRawProfileById(profileId);
  if (!p) return null;
  p.moderation_status = status;
  p.updated_at = nowIso();
  return p;
}
