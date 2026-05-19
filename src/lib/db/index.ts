import type {
  AiGeneration,
  AuthUser,
  AvailabilitySlot,
  Booking,
  BookingEventType,
  BookingMessage,
  ContactChannel,
  MatchRequestRecord,
  MatchResultRecord,
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
  TherapistAvailability,
  TherapistPrivateNote,
} from "../types";
import { PLANS } from "../plans";
import { getServiceClient } from "../supabase";
import { hashPassword } from "../auth/password";
import { isSameDay, newId, nowIso, secureToken, slugify } from "../util";
import { recomputeProfile, store, __resetStore } from "./store";
import { getRepo, isSupabaseBackend } from "./factory";
import type {
  DirectoryFilter,
  ProfileAnalytics,
  ActivityTotals,
  MatchResultInput,
} from "./repository";

export { __resetStore };
export type {
  DirectoryFilter,
  ProfileAnalytics,
  ActivityTotals,
  MatchResultInput,
} from "./repository";

// ---------- Backend dispatch ----------
// The public API is async regardless of backend. When DB_BACKEND=supabase
// and Supabase is configured, every call delegates to the Postgres
// repository; otherwise the in-memory demo store (below) is used. Tests
// and `next build` run on the in-memory store.
const useSupabase = isSupabaseBackend();

// ---------- Auth users ----------
// Resolver lets the data layer pick the dashboard "owner" from the
// signed-in session without coupling to next/headers (registered by
// src/lib/auth/session.ts). Unit tests never set it → pure fallback.
let ownerResolver: () => string | undefined = () => undefined;
export function __setOwnerResolver(fn: () => string | undefined): void {
  ownerResolver = fn;
}

export async function getUserById(id: string): Promise<AuthUser | null> {
  if (useSupabase) return getRepo().getUserById(id);
  return store().users.find((u) => u.id === id) ?? null;
}

export async function findUserByEmail(
  email: string
): Promise<AuthUser | null> {
  if (useSupabase) return getRepo().findUserByEmail(email);
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
export async function createUser(
  email: string,
  password: string,
  fullName: string
): Promise<{ user: AuthUser; profile: Profile } | { error: string }> {
  if (useSupabase) return getRepo().createUser(email, password, fullName);
  if (await findUserByEmail(email)) {
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
// Pure transform (no store access) — kept synchronous.
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
export async function listPlans(): Promise<Plan[]> {
  if (useSupabase) return getRepo().listPlans();
  return store().plans;
}

// ---------- Profiles ----------
export async function listPublicProfiles(
  filter: DirectoryFilter = {}
): Promise<Profile[]> {
  if (useSupabase) return getRepo().listPublicProfiles(filter);
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
  if (filter.availableToday) {
    const today = new Date();
    const nowMs = Date.now();
    list = list.filter((p) =>
      store().availabilitySlots.some(
        (s) =>
          s.profile_id === p.id &&
          s.status === "open" &&
          new Date(s.starts_at).getTime() > nowMs &&
          isSameDay(new Date(s.starts_at), today)
      )
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

export async function getPublicProfileBySlug(
  slug: string
): Promise<Profile | null> {
  if (useSupabase) return getRepo().getPublicProfileBySlug(slug);
  const p = store().profiles.find(
    (x) => x.slug === slug && x.is_published && x.moderation_status === "approved"
  );
  return p ? toPublicProfile(p) : null;
}

export async function getRawProfileBySlug(
  slug: string
): Promise<Profile | null> {
  if (useSupabase) return getRepo().getRawProfileBySlug(slug);
  return store().profiles.find((x) => x.slug === slug) ?? null;
}

export async function getRawProfileById(
  id: string
): Promise<Profile | null> {
  if (useSupabase) return getRepo().getRawProfileById(id);
  return store().profiles.find((x) => x.id === id) ?? null;
}

// Profile owned by a user (dashboard owner context). When no userId is
// passed, resolves from the signed-in session via the registered
// resolver; falls back to the demo profile (tests / no session).
export async function getOwnerProfile(userId?: string): Promise<Profile> {
  if (useSupabase) return getRepo().getOwnerProfile(userId ?? ownerResolver());
  const uid = userId ?? ownerResolver() ?? "user-anna";
  const found = store().profiles.find((p) => p.user_id === uid);
  return found ?? store().profiles[0];
}

export async function updateProfile(
  id: string,
  patch: Partial<Profile>
): Promise<Profile | null> {
  if (useSupabase) return getRepo().updateProfile(id, patch);
  const p = store().profiles.find((x) => x.id === id);
  if (!p) return null;
  Object.assign(p, patch);
  recomputeProfile(p);
  return p;
}

// ---------- Services ----------
export async function upsertService(
  profileId: string,
  data: Partial<ServiceItem> & { modality: string; title: string }
): Promise<ServiceItem | null> {
  if (useSupabase) return getRepo().upsertService(profileId, data);
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

export async function deleteService(
  profileId: string,
  serviceId: string
): Promise<boolean> {
  if (useSupabase) return getRepo().deleteService(profileId, serviceId);
  const p = store().profiles.find((x) => x.id === profileId);
  if (!p?.services) return false;
  const before = p.services.length;
  p.services = p.services.filter((s) => s.id !== serviceId);
  recomputeProfile(p);
  return p.services.length < before;
}

// ---------- Media ----------
export async function listMedia(
  profileId: string
): Promise<ProfileMedia[]> {
  if (useSupabase) return getRepo().listMedia(profileId);
  return store().profiles.find((p) => p.id === profileId)?.media ?? [];
}

export async function addMedia(
  profileId: string,
  data: Omit<ProfileMedia, "id" | "profile_id">
): Promise<ProfileMedia | null> {
  if (useSupabase) return getRepo().addMedia(profileId, data);
  const p = store().profiles.find((x) => x.id === profileId);
  if (!p) return null;
  p.media = p.media ?? [];
  const m: ProfileMedia = { ...data, id: newId(), profile_id: profileId };
  p.media.push(m);
  recomputeProfile(p);
  return m;
}

export async function deleteMedia(
  profileId: string,
  mediaId: string
): Promise<boolean> {
  if (useSupabase) return getRepo().deleteMedia(profileId, mediaId);
  const p = store().profiles.find((x) => x.id === profileId);
  if (!p?.media) return false;
  const before = p.media.length;
  p.media = p.media.filter((m) => m.id !== mediaId);
  recomputeProfile(p);
  return p.media.length < before;
}

// ---------- Favorites ----------
export async function listFavorites(
  userId: string
): Promise<(Favorite & { profile: Profile | null })[]> {
  if (useSupabase) return getRepo().listFavorites(userId);
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

export async function addFavorite(
  userId: string,
  profileId: string,
  source: Favorite["source"] = "directory",
  matchScore?: number
): Promise<Favorite> {
  if (useSupabase)
    return getRepo().addFavorite(userId, profileId, source, matchScore);
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

export async function removeFavorite(
  userId: string,
  profileId: string
): Promise<boolean> {
  if (useSupabase) return getRepo().removeFavorite(userId, profileId);
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
export async function createBooking(
  input: Partial<Booking> & {
    profile_id: string;
    client_name: string;
    first_message?: string;
  }
): Promise<Booking> {
  if (useSupabase) return getRepo().createBooking(input);
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
  await addBookingEvent(booking.id, "created", "Заявка на запись создана");
  if (input.first_message) {
    await addBookingMessage(
      booking.id,
      "client",
      booking.client_name,
      input.first_message
    );
    booking.status = "chat_started";
  }
  return booking;
}

export async function getBookingByToken(
  token: string
): Promise<Booking | null> {
  if (useSupabase) return getRepo().getBookingByToken(token);
  return store().bookings.find((b) => b.token === token) ?? null;
}

export async function getBookingById(id: string): Promise<Booking | null> {
  if (useSupabase) return getRepo().getBookingById(id);
  return store().bookings.find((b) => b.id === id) ?? null;
}

export async function listBookingsForProfile(
  profileId: string
): Promise<Booking[]> {
  if (useSupabase) return getRepo().listBookingsForProfile(profileId);
  return store()
    .bookings.filter((b) => b.profile_id === profileId)
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
}

export async function addBookingMessage(
  bookingId: string,
  senderType: "therapist" | "client",
  senderName: string,
  body: string
): Promise<BookingMessage | null> {
  if (useSupabase)
    return getRepo().addBookingMessage(
      bookingId,
      senderType,
      senderName,
      body
    );
  const b = await getBookingById(bookingId);
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
  await addBookingEvent(
    bookingId,
    "message",
    `Сообщение от ${senderType === "therapist" ? "специалиста" : "клиента"}`
  );
  if (b.status === "new") b.status = "chat_started";
  if (senderType === "client" && b.status !== "confirmed" && b.status !== "completed") {
    b.status = "waiting_therapist_reply";
  }
  if (senderType === "therapist" && b.status !== "confirmed" && b.status !== "completed") {
    b.status = "waiting_client_reply";
  }
  return msg;
}

export async function addBookingEvent(
  bookingId: string,
  eventType: BookingEventType,
  eventText?: string
): Promise<void> {
  if (useSupabase) {
    await getRepo().addBookingEvent(bookingId, eventType, eventText);
    return;
  }
  const b = await getBookingById(bookingId);
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

export async function setBookingStatus(
  bookingId: string,
  status: BookingStatus,
  eventText?: string
): Promise<Booking | null> {
  if (useSupabase)
    return getRepo().setBookingStatus(bookingId, status, eventText);
  const b = await getBookingById(bookingId);
  if (!b) return null;
  b.status = status;
  b.updated_at = nowIso();
  await addBookingEvent(
    bookingId,
    "status_change",
    eventText ?? `Статус: ${status}`
  );
  return b;
}

export async function proposeTime(
  bookingId: string,
  by: "therapist" | "client",
  slot: string
): Promise<Booking | null> {
  if (useSupabase) return getRepo().proposeTime(bookingId, by, slot);
  const b = await getBookingById(bookingId);
  if (!b) return null;
  b.preferred_time_slot_1 = slot;
  b.status = "time_proposed";
  b.updated_at = nowIso();
  await addBookingEvent(
    bookingId,
    "time_proposed",
    `${by === "therapist" ? "Специалист" : "Клиент"} предложил время: ${slot}`
  );
  return b;
}

export async function confirmBooking(
  bookingId: string,
  slot: string
): Promise<Booking | null> {
  if (useSupabase) return getRepo().confirmBooking(bookingId, slot);
  const b = await getBookingById(bookingId);
  if (!b) return null;
  b.confirmed_time_slot = slot;
  b.status = "confirmed";
  b.updated_at = nowIso();
  await addBookingEvent(bookingId, "confirmed", `Запись подтверждена на ${slot}`);
  return b;
}

export async function setBookingOutcome(
  bookingId: string,
  outcome: BookingOutcome,
  status: BookingStatus
): Promise<Booking | null> {
  if (useSupabase)
    return getRepo().setBookingOutcome(bookingId, outcome, status);
  const b = await getBookingById(bookingId);
  if (!b) return null;
  b.outcome = outcome;
  b.status = status;
  b.updated_at = nowIso();
  await addBookingEvent(bookingId, "outcome", `Итог: ${outcome}`);
  return b;
}

// ---------- Availability slots ----------
function memSlots(profileId: string): AvailabilitySlot[] {
  return store().availabilitySlots.filter((s) => s.profile_id === profileId);
}

export async function listOpenSlots(
  profileId: string
): Promise<AvailabilitySlot[]> {
  if (useSupabase) return getRepo().listOpenSlots(profileId);
  const now = Date.now();
  return memSlots(profileId)
    .filter(
      (s) => s.status === "open" && new Date(s.starts_at).getTime() > now
    )
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at));
}

export async function listSlotsForProfile(
  profileId: string
): Promise<AvailabilitySlot[]> {
  if (useSupabase) return getRepo().listSlotsForProfile(profileId);
  const now = Date.now();
  return memSlots(profileId)
    .filter((s) => new Date(s.starts_at).getTime() > now)
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at));
}

export async function nextOpenSlot(
  profileId: string
): Promise<AvailabilitySlot | null> {
  if (useSupabase) return getRepo().nextOpenSlot(profileId);
  return (await listOpenSlots(profileId))[0] ?? null;
}

export async function profileHasOpenSlotToday(
  profileId: string
): Promise<boolean> {
  if (useSupabase) return getRepo().profileHasOpenSlotToday(profileId);
  const today = new Date();
  return (await listOpenSlots(profileId)).some((s) =>
    isSameDay(new Date(s.starts_at), today)
  );
}

export async function getOpenSlot(
  slotId: string,
  profileId: string
): Promise<AvailabilitySlot | null> {
  if (useSupabase) return getRepo().getOpenSlot(slotId, profileId);
  const s = store().availabilitySlots.find(
    (x) => x.id === slotId && x.profile_id === profileId
  );
  if (!s || s.status !== "open") return null;
  if (new Date(s.starts_at).getTime() <= Date.now()) return null;
  return s;
}

export async function addAvailabilitySlot(
  profileId: string,
  startsAtIso: string,
  duration: number
): Promise<AvailabilitySlot | null> {
  if (useSupabase)
    return getRepo().addAvailabilitySlot(profileId, startsAtIso, duration);
  const t = new Date(startsAtIso).getTime();
  if (Number.isNaN(t) || t <= Date.now()) return null;
  const startsAt = new Date(t).toISOString();
  if (memSlots(profileId).some((s) => s.starts_at === startsAt)) return null;
  const slot: AvailabilitySlot = {
    id: newId(),
    profile_id: profileId,
    starts_at: startsAt,
    duration,
    status: "open",
    booking_id: null,
    created_at: nowIso(),
  };
  store().availabilitySlots.push(slot);
  return slot;
}

export async function deleteAvailabilitySlot(
  profileId: string,
  slotId: string
): Promise<boolean> {
  if (useSupabase)
    return getRepo().deleteAvailabilitySlot(profileId, slotId);
  const slots = store().availabilitySlots;
  const i = slots.findIndex(
    (s) =>
      s.id === slotId && s.profile_id === profileId && s.status === "open"
  );
  if (i === -1) return false;
  slots.splice(i, 1);
  return true;
}

export async function bookSlot(
  slotId: string,
  profileId: string,
  bookingId: string
): Promise<AvailabilitySlot | null> {
  if (useSupabase) return getRepo().bookSlot(slotId, profileId, bookingId);
  const s = store().availabilitySlots.find(
    (x) => x.id === slotId && x.profile_id === profileId
  );
  if (!s || s.status !== "open") return null;
  s.status = "booked";
  s.booking_id = bookingId;
  return s;
}

// ---------- Therapist availability ("Рядом") ----------
// A therapist is never discoverable by default — only an active,
// non-expired window surfaces them. After end_time the window is
// lazily flipped to "expired" on the next read.

export interface ActivateAvailabilityInput {
  date: string;
  start_time: string;
  end_time: string;
  location_mode: TherapistAvailability["location_mode"];
  latitude?: number | null;
  longitude?: number | null;
  manual_area?: string | null;
  approximate_area?: string | null;
  service_radius_km: number;
}

function computeExpiresAt(date: string, endTime: string): string {
  const d = new Date(`${date}T${endTime}:00`);
  if (Number.isNaN(d.getTime())) {
    // Fallback: 8h from now if the inputs are malformed.
    return new Date(Date.now() + 8 * 3600_000).toISOString();
  }
  return d.toISOString();
}

function availabilityIsLive(
  a: TherapistAvailability,
  nowMs: number
): boolean {
  return (
    a.status === "active" && new Date(a.expires_at).getTime() > nowMs
  );
}

// In-memory: flip stale active rows to "expired" so they stop showing.
function expireStaleMem(): void {
  const now = Date.now();
  for (const a of store().therapistAvailability) {
    if (a.status === "active" && new Date(a.expires_at).getTime() <= now) {
      a.status = "expired";
      a.updated_at = nowIso();
    }
  }
}

export async function getActiveAvailability(
  profileId: string
): Promise<TherapistAvailability | null> {
  if (useSupabase) {
    const sb = getServiceClient();
    if (!sb) return null;
    const { data } = await sb
      .from("therapist_availability")
      .select("*")
      .eq("profile_id", profileId)
      .eq("status", "active")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1);
    return (data?.[0] as TherapistAvailability) ?? null;
  }
  expireStaleMem();
  return (
    store().therapistAvailability.find(
      (a) =>
        a.profile_id === profileId && availabilityIsLive(a, Date.now())
    ) ?? null
  );
}

// Most recent window for the owner dashboard (any status).
export async function getLatestAvailability(
  profileId: string
): Promise<TherapistAvailability | null> {
  if (useSupabase) {
    const sb = getServiceClient();
    if (!sb) return null;
    const { data } = await sb
      .from("therapist_availability")
      .select("*")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false })
      .limit(1);
    return (data?.[0] as TherapistAvailability) ?? null;
  }
  expireStaleMem();
  return (
    [...store().therapistAvailability]
      .filter((a) => a.profile_id === profileId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))[0] ?? null
  );
}

export async function activateAvailability(
  profileId: string,
  input: ActivateAvailabilityInput
): Promise<TherapistAvailability> {
  const now = nowIso();
  const row: TherapistAvailability = {
    id: newId(),
    profile_id: profileId,
    date: input.date,
    start_time: input.start_time,
    end_time: input.end_time,
    status: "active",
    location_mode: input.location_mode,
    latitude: input.latitude ?? null,
    longitude: input.longitude ?? null,
    approximate_area: input.approximate_area ?? null,
    manual_area: input.manual_area ?? null,
    service_radius_km: input.service_radius_km,
    created_at: now,
    updated_at: now,
    expires_at: computeExpiresAt(input.date, input.end_time),
  };
  if (useSupabase) {
    const sb = getServiceClient();
    if (sb) {
      await sb
        .from("therapist_availability")
        .update({ status: "inactive", updated_at: now })
        .eq("profile_id", profileId)
        .eq("status", "active");
      const { data } = await sb
        .from("therapist_availability")
        .insert(row)
        .select()
        .single();
      return (data as TherapistAvailability) ?? row;
    }
  }
  // Only one active window per therapist.
  for (const a of store().therapistAvailability) {
    if (a.profile_id === profileId && a.status === "active") {
      a.status = "inactive";
      a.updated_at = now;
    }
  }
  store().therapistAvailability.push(row);
  return row;
}

export async function deactivateAvailability(
  profileId: string
): Promise<boolean> {
  const now = nowIso();
  if (useSupabase) {
    const sb = getServiceClient();
    if (!sb) return false;
    const { data } = await sb
      .from("therapist_availability")
      .update({ status: "inactive", updated_at: now })
      .eq("profile_id", profileId)
      .eq("status", "active")
      .select("id");
    return Boolean(data && data.length);
  }
  let changed = false;
  for (const a of store().therapistAvailability) {
    if (a.profile_id === profileId && a.status === "active") {
      a.status = "inactive";
      a.updated_at = now;
      changed = true;
    }
  }
  return changed;
}

// All currently-live windows joined with their (verified, published)
// profile. Used by the public nearby search and the admin view.
export async function listLiveAvailability(): Promise<
  { availability: TherapistAvailability; profile: Profile }[]
> {
  if (useSupabase) {
    const sb = getServiceClient();
    if (!sb) return [];
    const { data: rows } = await sb
      .from("therapist_availability")
      .select("*")
      .eq("status", "active")
      .gt("expires_at", new Date().toISOString());
    const list = (rows as TherapistAvailability[]) ?? [];
    const out: { availability: TherapistAvailability; profile: Profile }[] =
      [];
    for (const a of list) {
      const p = await getRawProfileById(a.profile_id);
      if (p && p.is_published && p.moderation_status === "approved") {
        out.push({ availability: a, profile: p });
      }
    }
    return out;
  }
  expireStaleMem();
  const now = Date.now();
  const out: { availability: TherapistAvailability; profile: Profile }[] =
    [];
  for (const a of store().therapistAvailability) {
    if (!availabilityIsLive(a, now)) continue;
    const p = store().profiles.find((x) => x.id === a.profile_id);
    if (p && p.is_published && p.moderation_status === "approved") {
      out.push({ availability: a, profile: p });
    }
  }
  return out;
}

// ---------- Clients CRM ----------
export async function convertBookingToClient(
  bookingId: string
): Promise<CrmClient | null> {
  if (useSupabase) return getRepo().convertBookingToClient(bookingId);
  const b = await getBookingById(bookingId);
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
  await addBookingEvent(
    b.id,
    "converted_to_client",
    "Заявка преобразована в клиента CRM"
  );
  return client;
}

export async function listClients(
  profileId: string
): Promise<CrmClient[]> {
  if (useSupabase) return getRepo().listClients(profileId);
  return store().clients.filter((c) => c.profile_id === profileId);
}

export async function getClient(id: string): Promise<CrmClient | null> {
  if (useSupabase) return getRepo().getClient(id);
  return store().clients.find((c) => c.id === id) ?? null;
}

export async function updateClient(
  id: string,
  patch: Partial<CrmClient>
): Promise<CrmClient | null> {
  if (useSupabase) return getRepo().updateClient(id, patch);
  const c = await getClient(id);
  if (!c) return null;
  Object.assign(c, patch, { updated_at: nowIso() });
  return c;
}

export async function addClientSession(
  clientId: string,
  data: Partial<ClientSession>
): Promise<ClientSession | null> {
  if (useSupabase) return getRepo().addClientSession(clientId, data);
  const c = await getClient(clientId);
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

export async function getClientByToken(
  token: string
): Promise<CrmClient | null> {
  if (useSupabase) return getRepo().getClientByToken(token);
  if (!token) return null;
  return store().clients.find((c) => c.token === token) ?? null;
}

// ---------- Private mutual feedback (never public) ----------
export async function addTherapistPrivateNote(
  profileId: string,
  data: Partial<TherapistPrivateNote>
): Promise<TherapistPrivateNote | null> {
  if (useSupabase) return getRepo().addTherapistPrivateNote(profileId, data);
  const owner = await getRawProfileById(profileId);
  if (!owner) return null;
  if (data.client_id) {
    const c = await getClient(data.client_id);
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

export async function listTherapistPrivateNotes(
  profileId: string,
  clientId?: string
): Promise<TherapistPrivateNote[]> {
  if (useSupabase)
    return getRepo().listTherapistPrivateNotes(profileId, clientId);
  return store()
    .therapistNotes.filter(
      (n) =>
        n.profile_id === profileId &&
        (clientId ? n.client_id === clientId : true)
    )
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

// Submitted by the client/patient via their unguessable token. Never public.
export async function submitClientFeedback(
  token: string,
  data: Partial<ClientPrivateFeedback>
): Promise<ClientPrivateFeedback | null> {
  if (useSupabase) return getRepo().submitClientFeedback(token, data);
  const client = await getClientByToken(token);
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
export async function listClientFeedbackForProfile(
  profileId: string,
  clientId?: string
): Promise<ClientPrivateFeedback[]> {
  if (useSupabase)
    return getRepo().listClientFeedbackForProfile(profileId, clientId);
  return store()
    .clientFeedback.filter(
      (f) =>
        f.profile_id === profileId &&
        (clientId ? f.client_id === clientId : true)
    )
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

// ---------- Analytics (no PII) ----------
export async function recordProfileView(
  profileId: string,
  path?: string
): Promise<void> {
  if (useSupabase) {
    await getRepo().recordProfileView(profileId, path);
    return;
  }
  if (!(await getRawProfileById(profileId))) return;
  store().profileViews.push({
    id: newId(),
    profile_id: profileId,
    path: path ?? null,
    created_at: nowIso(),
  });
}

export async function recordContactClick(
  profileId: string,
  channel: ContactChannel
): Promise<void> {
  if (useSupabase) {
    await getRepo().recordContactClick(profileId, channel);
    return;
  }
  if (!(await getRawProfileById(profileId))) return;
  store().contactClicks.push({
    id: newId(),
    profile_id: profileId,
    channel,
    created_at: nowIso(),
  });
}

export async function getAnalytics(
  profileId: string
): Promise<ProfileAnalytics> {
  if (useSupabase) return getRepo().getAnalytics(profileId);
  const views = store().profileViews.filter((v) => v.profile_id === profileId);
  const clicks = store().contactClicks.filter(
    (c) => c.profile_id === profileId
  );
  const viewsByDay: { date: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const day = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    viewsByDay.push({
      date: day,
      count: views.filter((v) => v.created_at.slice(0, 10) === day).length,
    });
  }
  const clicksByChannel: Record<string, number> = {};
  for (const c of clicks) {
    clicksByChannel[c.channel] = (clicksByChannel[c.channel] ?? 0) + 1;
  }
  return {
    totalViews: views.length,
    totalClicks: clicks.length,
    viewsByDay,
    clicksByChannel,
  };
}

export async function logAiGeneration(
  task: string,
  usedOpenAI: boolean
): Promise<void> {
  if (useSupabase) {
    await getRepo().logAiGeneration(task, usedOpenAI);
    return;
  }
  store().aiGenerations.push({
    id: newId(),
    task,
    used_openai: usedOpenAI,
    created_at: nowIso(),
  });
}

export async function listAiGenerations(): Promise<AiGeneration[]> {
  if (useSupabase) return getRepo().listAiGenerations();
  return store()
    .aiGenerations.slice()
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function getActivityTotals(): Promise<ActivityTotals> {
  if (useSupabase) return getRepo().getActivityTotals();
  const s = store();
  return {
    totalViews: s.profileViews.length,
    totalClicks: s.contactClicks.length,
    aiCalls: s.aiGenerations.length,
  };
}

// ---------- v1: AI match persistence ----------
export async function saveMatch(
  request: Omit<MatchRequestRecord, "id" | "created_at">,
  results: MatchResultInput[]
): Promise<MatchRequestRecord> {
  if (useSupabase) return getRepo().saveMatch(request, results);
  const req: MatchRequestRecord = {
    ...request,
    id: newId(),
    created_at: nowIso(),
  };
  store().matchRequests.push(req);
  results.forEach((r, i) => {
    store().matchResults.push({
      id: newId(),
      request_id: req.id,
      profile_id: r.profile_id,
      rank: i + 1,
      score: r.score,
      service_recommendation: r.service_recommendation,
      reasons: r.reasons,
      risks: r.risks,
      created_at: nowIso(),
    });
  });
  return req;
}

export async function listMatchesForProfile(
  profileId: string
): Promise<(MatchResultRecord & { request: MatchRequestRecord | null })[]> {
  if (useSupabase) return getRepo().listMatchesForProfile(profileId);
  return store()
    .matchResults.filter((r) => r.profile_id === profileId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map((r) => ({
      ...r,
      request:
        store().matchRequests.find((q) => q.id === r.request_id) ?? null,
    }));
}

// ---------- Support ----------
export async function createSupportRequest(
  input: Omit<
    SupportRequest,
    "id" | "status" | "admin_note" | "created_at" | "updated_at"
  >
): Promise<SupportRequest> {
  if (useSupabase) return getRepo().createSupportRequest(input);
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

export async function listSupportRequests(): Promise<SupportRequest[]> {
  if (useSupabase) return getRepo().listSupportRequests();
  return store().support.sort((a, b) =>
    b.created_at.localeCompare(a.created_at)
  );
}

export async function updateSupportRequest(
  id: string,
  patch: Partial<SupportRequest>
): Promise<SupportRequest | null> {
  if (useSupabase) return getRepo().updateSupportRequest(id, patch);
  const sr = store().support.find((s) => s.id === id);
  if (!sr) return null;
  Object.assign(sr, patch, { updated_at: nowIso() });
  return sr;
}

// ---------- Subscriptions / payments ----------
export async function createPayment(
  profileId: string,
  planId: "pro" | "expert"
): Promise<Payment> {
  if (useSupabase) return getRepo().createPayment(profileId, planId);
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

export async function getPaymentByProviderId(
  providerId: string
): Promise<Payment | null> {
  if (useSupabase) return getRepo().getPaymentByProviderId(providerId);
  return (
    store().payments.find((p) => p.provider_payment_id === providerId) ?? null
  );
}

// Activates subscription ONLY when called from verified webhook/backend.
export async function markPaymentSucceeded(
  providerId: string
): Promise<Subscription | null> {
  if (useSupabase) return getRepo().markPaymentSucceeded(providerId);
  const payment = await getPaymentByProviderId(providerId);
  if (!payment || payment.status === "succeeded") {
    return payment
      ? store().subscriptions.find(
          (s) => s.id === payment.subscription_id
        ) ?? null
      : null;
  }
  payment.status = "succeeded";
  payment.updated_at = nowIso();

  const planId = (payment.plan_id ?? "pro") as "pro" | "expert";
  const days = PLANS[planId].period_days || 30;
  const now = new Date();
  const expires = new Date(now.getTime() + days * 86400000);

  let sub = store().subscriptions.find(
    (s) => s.profile_id === payment.profile_id
  );
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

  const profile = await getRawProfileById(payment.profile_id);
  if (profile) {
    profile.plan_id = planId;
    profile.updated_at = nowIso();
  }
  return sub;
}

export async function cancelSubscription(
  profileId: string
): Promise<Subscription | null> {
  if (useSupabase) return getRepo().cancelSubscription(profileId);
  const sub = store().subscriptions.find((s) => s.profile_id === profileId);
  if (!sub) return null;
  sub.status = "cancelled";
  const profile = await getRawProfileById(profileId);
  if (profile) {
    profile.plan_id = "free";
    profile.updated_at = nowIso();
  }
  return sub;
}

export async function getSubscription(
  profileId: string
): Promise<Subscription | null> {
  if (useSupabase) return getRepo().getSubscription(profileId);
  return store().subscriptions.find((s) => s.profile_id === profileId) ?? null;
}

export async function listPayments(): Promise<Payment[]> {
  if (useSupabase) return getRepo().listPayments();
  return store().payments.sort((a, b) =>
    b.created_at.localeCompare(a.created_at)
  );
}

export async function listSubscriptions(): Promise<Subscription[]> {
  if (useSupabase) return getRepo().listSubscriptions();
  return store().subscriptions;
}

// ---------- Admin / moderation ----------
export async function listAllProfiles(): Promise<Profile[]> {
  if (useSupabase) return getRepo().listAllProfiles();
  return store().profiles;
}

export async function listModerationFlags() {
  if (useSupabase) return getRepo().listModerationFlags();
  return store()
    .moderation.filter((m) => !m.resolved)
    .map((m) => ({
      ...m,
      profile: store().profiles.find((p) => p.id === m.profile_id) ?? null,
    }));
}

export async function resolveModerationFlag(
  id: string
): Promise<boolean> {
  if (useSupabase) return getRepo().resolveModerationFlag(id);
  const f = store().moderation.find((m) => m.id === id);
  if (!f) return false;
  f.resolved = true;
  return true;
}

export async function setModerationStatus(
  profileId: string,
  status: Profile["moderation_status"]
): Promise<Profile | null> {
  if (useSupabase) return getRepo().setModerationStatus(profileId, status);
  const p = await getRawProfileById(profileId);
  if (!p) return null;
  p.moderation_status = status;
  p.updated_at = nowIso();
  return p;
}
