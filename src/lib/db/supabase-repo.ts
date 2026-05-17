import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
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
import { PLANS } from "../plans";
import { hashPassword } from "../auth/password";
import { computeQualityScore } from "../quality";
import { moderateProfilePayload } from "../moderation";
import { newId, nowIso, secureToken, slugify } from "../util";
import type {
  ActivityTotals,
  DbRepository,
  DirectoryFilter,
  MatchResultInput,
  ProfileAnalytics,
} from "./repository";

// Server-only Postgres repository. Uses the service-role key (bypasses
// RLS) and is therefore only ever constructed in server contexts behind
// the factory (DB_BACKEND=supabase). The public projection of a profile
// (stripping the private address) is applied here, mirroring the
// in-memory store.

const PROFILE_SELECT = "*, services(*), media:profile_media(*)";
const BOOKING_SELECT =
  "*, messages:booking_messages(*), events:booking_events(*)";
const CLIENT_SELECT = "*, sessions:client_sessions(*)";

function publicProjection(p: Profile): Profile {
  const { therapist_address_private, ...rest } = p;
  return {
    ...rest,
    therapist_address_private: null,
    services: (p.services ?? []).filter((s) => s.is_published),
    media: (p.media ?? []).filter(
      (m) => m.is_published && m.type !== "document"
    ),
  };
}

function sortJoins(p: Profile): Profile {
  if (p.services)
    p.services = [...p.services].sort((a, b) => a.sort_order - b.sort_order);
  if (p.media)
    p.media = [...p.media].sort((a, b) => a.sort_order - b.sort_order);
  return p;
}

export class SupabaseRepository implements DbRepository {
  private client: SupabaseClient;

  constructor() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error(
        "SupabaseRepository requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
      );
    }
    this.client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  private get db(): SupabaseClient {
    return this.client;
  }

  // ---- internal helpers ----
  private async loadProfileById(id: string): Promise<Profile | null> {
    const { data } = await this.db
      .from("profiles")
      .select(PROFILE_SELECT)
      .eq("id", id)
      .maybeSingle();
    return data ? sortJoins(data as unknown as Profile) : null;
  }

  // Mirrors store.recomputeProfile: quality score, moderation status,
  // and dedup moderation_flags. Runs after any profile/service/media
  // write so the gating columns stay consistent.
  private async recompute(profileId: string): Promise<void> {
    const p = await this.loadProfileById(profileId);
    if (!p) return;
    const score = computeQualityScore(p).score;
    const mod = moderateProfilePayload({
      full_name: p.full_name,
      headline: p.headline,
      professional_description: p.professional_description,
      safety_boundaries: p.safety_boundaries,
      services: p.services,
      media: p.media,
    });
    const nextStatus =
      !mod.ok && p.moderation_status === "approved"
        ? "flagged"
        : p.moderation_status;
    await this.db
      .from("profiles")
      .update({
        quality_score: score,
        moderation_status: nextStatus,
        updated_at: nowIso(),
      })
      .eq("id", profileId);

    if (mod.hits.length) {
      const { data: existing } = await this.db
        .from("moderation_flags")
        .select("category, matched_text")
        .eq("profile_id", profileId)
        .eq("resolved", false);
      const have = new Set(
        (existing ?? []).map(
          (f: { category: string; matched_text: string | null }) =>
            `${f.category}::${f.matched_text}`
        )
      );
      const rows = mod.hits
        .filter((h) => !have.has(`${h.category}::${h.matchedText}`))
        .map((h) => ({
          id: newId(),
          profile_id: profileId,
          category: h.category,
          severity: h.severity,
          matched_text: h.matchedText,
          resolved: false,
          created_at: nowIso(),
        }));
      if (rows.length) await this.db.from("moderation_flags").insert(rows);
    }
  }

  // ---------- Auth users ----------
  async getUserById(id: string): Promise<AuthUser | null> {
    const { data } = await this.db
      .from("users")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    return (data as AuthUser) ?? null;
  }

  async findUserByEmail(email: string): Promise<AuthUser | null> {
    const { data } = await this.db
      .from("users")
      .select("*")
      .eq("email", email.trim().toLowerCase())
      .maybeSingle();
    return (data as AuthUser) ?? null;
  }

  private async uniqueSlug(base: string): Promise<string> {
    let slug = slugify(base);
    let n = 1;
    // Loop until a free slug is found (bounded in practice).
    while (true) {
      const { data } = await this.db
        .from("profiles")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();
      if (!data) return slug;
      slug = `${slugify(base)}-${++n}`;
    }
  }

  async createUser(
    email: string,
    password: string,
    fullName: string
  ): Promise<{ user: AuthUser; profile: Profile } | { error: string }> {
    if (await this.findUserByEmail(email)) {
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
    const { error: uErr } = await this.db.from("users").insert(user);
    if (uErr) return { error: "Не удалось создать пользователя" };

    const profileId = newId();
    const profileRow = {
      id: profileId,
      user_id: userId,
      slug: await this.uniqueSlug(fullName || email.split("@")[0]),
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
    };
    const { error: pErr } = await this.db
      .from("profiles")
      .insert(profileRow);
    if (pErr) return { error: "Не удалось создать профиль" };
    await this.recompute(profileId);
    const profile = await this.loadProfileById(profileId);
    return { user, profile: profile as Profile };
  }

  // ---------- Plans ----------
  async listPlans(): Promise<Plan[]> {
    const { data } = await this.db
      .from("plans")
      .select("*")
      .eq("is_active", true);
    return (data as Plan[] | null) ?? [];
  }

  // ---------- Profiles ----------
  async listPublicProfiles(
    filter: DirectoryFilter = {}
  ): Promise<Profile[]> {
    const { data } = await this.db
      .from("profiles")
      .select(PROFILE_SELECT)
      .eq("is_published", true)
      .eq("moderation_status", "approved");
    let list = ((data as unknown as Profile[] | null) ?? []).map((p) =>
      sortJoins(p)
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
        (p) =>
          (p.district ?? "").toLowerCase() ===
          filter.district!.toLowerCase()
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
    return list
      .map(publicProjection)
      .sort(
        (a, b) =>
          Number(b.plan_id === "expert") - Number(a.plan_id === "expert") ||
          b.quality_score - a.quality_score
      );
  }

  async getPublicProfileBySlug(slug: string): Promise<Profile | null> {
    const { data } = await this.db
      .from("profiles")
      .select(PROFILE_SELECT)
      .eq("slug", slug)
      .eq("is_published", true)
      .eq("moderation_status", "approved")
      .maybeSingle();
    return data
      ? publicProjection(sortJoins(data as unknown as Profile))
      : null;
  }

  async getRawProfileBySlug(slug: string): Promise<Profile | null> {
    const { data } = await this.db
      .from("profiles")
      .select(PROFILE_SELECT)
      .eq("slug", slug)
      .maybeSingle();
    return data ? sortJoins(data as unknown as Profile) : null;
  }

  async getRawProfileById(id: string): Promise<Profile | null> {
    return this.loadProfileById(id);
  }

  async getOwnerProfile(userId?: string): Promise<Profile> {
    if (userId) {
      const { data } = await this.db
        .from("profiles")
        .select(PROFILE_SELECT)
        .eq("user_id", userId)
        .maybeSingle();
      if (data) return sortJoins(data as unknown as Profile);
    }
    const { data: first } = await this.db
      .from("profiles")
      .select(PROFILE_SELECT)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    return sortJoins(first as unknown as Profile);
  }

  async updateProfile(
    id: string,
    patch: Partial<Profile>
  ): Promise<Profile | null> {
    // Strip joined relations — they are not columns of `profiles`.
    const { services, media, ...cols } = patch;
    void services;
    void media;
    const { error } = await this.db
      .from("profiles")
      .update(cols)
      .eq("id", id);
    if (error) return null;
    await this.recompute(id);
    return this.loadProfileById(id);
  }

  // ---------- Services ----------
  async upsertService(
    profileId: string,
    data: Partial<ServiceItem> & { modality: string; title: string }
  ): Promise<ServiceItem | null> {
    const owner = await this.loadProfileById(profileId);
    if (!owner) return null;
    if (data.id) {
      const { data: updated } = await this.db
        .from("services")
        .update({ ...data, profile_id: profileId })
        .eq("id", data.id)
        .eq("profile_id", profileId)
        .select("*")
        .maybeSingle();
      if (updated) {
        await this.recompute(profileId);
        return updated as ServiceItem;
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
      sort_order: data.sort_order ?? (owner.services?.length ?? 0),
    };
    const { data: inserted, error } = await this.db
      .from("services")
      .insert(svc)
      .select("*")
      .single();
    if (error) return null;
    await this.recompute(profileId);
    return inserted as ServiceItem;
  }

  async deleteService(
    profileId: string,
    serviceId: string
  ): Promise<boolean> {
    const { data } = await this.db
      .from("services")
      .delete()
      .eq("id", serviceId)
      .eq("profile_id", profileId)
      .select("id");
    const ok = Boolean(data && data.length > 0);
    if (ok) await this.recompute(profileId);
    return ok;
  }

  // ---------- Media ----------
  async listMedia(profileId: string): Promise<ProfileMedia[]> {
    const { data } = await this.db
      .from("profile_media")
      .select("*")
      .eq("profile_id", profileId)
      .order("sort_order", { ascending: true });
    return (data as ProfileMedia[] | null) ?? [];
  }

  async addMedia(
    profileId: string,
    data: Omit<ProfileMedia, "id" | "profile_id">
  ): Promise<ProfileMedia | null> {
    const owner = await this.loadProfileById(profileId);
    if (!owner) return null;
    const m: ProfileMedia = { ...data, id: newId(), profile_id: profileId };
    const { data: inserted, error } = await this.db
      .from("profile_media")
      .insert(m)
      .select("*")
      .single();
    if (error) return null;
    await this.recompute(profileId);
    return inserted as ProfileMedia;
  }

  async deleteMedia(
    profileId: string,
    mediaId: string
  ): Promise<boolean> {
    const { data } = await this.db
      .from("profile_media")
      .delete()
      .eq("id", mediaId)
      .eq("profile_id", profileId)
      .select("id");
    const ok = Boolean(data && data.length > 0);
    if (ok) await this.recompute(profileId);
    return ok;
  }

  // ---------- Favorites ----------
  async listFavorites(
    userId: string
  ): Promise<(Favorite & { profile: Profile | null })[]> {
    const { data } = await this.db
      .from("favorites")
      .select("*")
      .eq("user_id", userId);
    const favs = (data as Favorite[] | null) ?? [];
    const out: (Favorite & { profile: Profile | null })[] = [];
    for (const f of favs) {
      const p = await this.loadProfileById(f.profile_id);
      out.push({ ...f, profile: p ? publicProjection(p) : null });
    }
    return out;
  }

  async addFavorite(
    userId: string,
    profileId: string,
    source: Favorite["source"] = "directory",
    matchScore?: number
  ): Promise<Favorite> {
    const { data: existing } = await this.db
      .from("favorites")
      .select("*")
      .eq("user_id", userId)
      .eq("profile_id", profileId)
      .maybeSingle();
    if (existing) return existing as Favorite;
    const fav: Favorite = {
      id: newId(),
      user_id: userId,
      profile_id: profileId,
      source,
      match_score: matchScore ?? null,
      created_at: nowIso(),
    };
    const { data: inserted } = await this.db
      .from("favorites")
      .insert(fav)
      .select("*")
      .single();
    return (inserted as Favorite) ?? fav;
  }

  async removeFavorite(
    userId: string,
    profileId: string
  ): Promise<boolean> {
    const { data } = await this.db
      .from("favorites")
      .delete()
      .eq("user_id", userId)
      .eq("profile_id", profileId)
      .select("id");
    return Boolean(data && data.length > 0);
  }

  // ---------- Bookings ----------
  private async loadBookingById(id: string): Promise<Booking | null> {
    const { data } = await this.db
      .from("bookings")
      .select(BOOKING_SELECT)
      .eq("id", id)
      .maybeSingle();
    return data ? this.sortBooking(data as unknown as Booking) : null;
  }

  private sortBooking(b: Booking): Booking {
    if (b.messages)
      b.messages = [...b.messages].sort((x, y) =>
        x.created_at.localeCompare(y.created_at)
      );
    if (b.events)
      b.events = [...b.events].sort((x, y) =>
        x.created_at.localeCompare(y.created_at)
      );
    return b;
  }

  async createBooking(
    input: Partial<Booking> & {
      profile_id: string;
      client_name: string;
      first_message?: string;
    }
  ): Promise<Booking> {
    const id = newId();
    const row = {
      id,
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
      status: "new" as BookingStatus,
      outcome: null,
      important_notes: input.important_notes ?? null,
      created_at: nowIso(),
      updated_at: nowIso(),
    };
    await this.db.from("bookings").insert(row);
    await this.addBookingEvent(id, "created", "Заявка на запись создана");
    if (input.first_message) {
      await this.addBookingMessage(
        id,
        "client",
        input.client_name,
        input.first_message
      );
      await this.db
        .from("bookings")
        .update({ status: "chat_started", updated_at: nowIso() })
        .eq("id", id);
    }
    return (await this.loadBookingById(id)) as Booking;
  }

  async getBookingByToken(token: string): Promise<Booking | null> {
    const { data } = await this.db
      .from("bookings")
      .select(BOOKING_SELECT)
      .eq("token", token)
      .maybeSingle();
    return data ? this.sortBooking(data as unknown as Booking) : null;
  }

  async getBookingById(id: string): Promise<Booking | null> {
    return this.loadBookingById(id);
  }

  async listBookingsForProfile(profileId: string): Promise<Booking[]> {
    const { data } = await this.db
      .from("bookings")
      .select(BOOKING_SELECT)
      .eq("profile_id", profileId)
      .order("updated_at", { ascending: false });
    return ((data as unknown as Booking[] | null) ?? []).map((b) =>
      this.sortBooking(b)
    );
  }

  async addBookingMessage(
    bookingId: string,
    senderType: "therapist" | "client",
    senderName: string,
    body: string
  ): Promise<BookingMessage | null> {
    const b = await this.loadBookingById(bookingId);
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
    const { error } = await this.db.from("booking_messages").insert(msg);
    if (error) return null;
    let status = b.status;
    if (status === "new") status = "chat_started";
    if (
      senderType === "client" &&
      status !== "confirmed" &&
      status !== "completed"
    ) {
      status = "waiting_therapist_reply";
    }
    if (
      senderType === "therapist" &&
      status !== "confirmed" &&
      status !== "completed"
    ) {
      status = "waiting_client_reply";
    }
    await this.db
      .from("bookings")
      .update({ status, updated_at: nowIso() })
      .eq("id", bookingId);
    await this.addBookingEvent(
      bookingId,
      "message",
      `Сообщение от ${
        senderType === "therapist" ? "специалиста" : "клиента"
      }`
    );
    return msg;
  }

  async addBookingEvent(
    bookingId: string,
    eventType: BookingEventType,
    eventText?: string
  ): Promise<void> {
    await this.db.from("booking_events").insert({
      id: newId(),
      booking_id: bookingId,
      event_type: eventType,
      event_text: eventText ?? null,
      created_at: nowIso(),
    });
    await this.db
      .from("bookings")
      .update({ updated_at: nowIso() })
      .eq("id", bookingId);
  }

  async setBookingStatus(
    bookingId: string,
    status: BookingStatus,
    eventText?: string
  ): Promise<Booking | null> {
    const b = await this.loadBookingById(bookingId);
    if (!b) return null;
    await this.db
      .from("bookings")
      .update({ status, updated_at: nowIso() })
      .eq("id", bookingId);
    await this.addBookingEvent(
      bookingId,
      "status_change",
      eventText ?? `Статус: ${status}`
    );
    return this.loadBookingById(bookingId);
  }

  async proposeTime(
    bookingId: string,
    by: "therapist" | "client",
    slot: string
  ): Promise<Booking | null> {
    const b = await this.loadBookingById(bookingId);
    if (!b) return null;
    await this.db
      .from("bookings")
      .update({
        preferred_time_slot_1: slot,
        status: "time_proposed",
        updated_at: nowIso(),
      })
      .eq("id", bookingId);
    await this.addBookingEvent(
      bookingId,
      "time_proposed",
      `${by === "therapist" ? "Специалист" : "Клиент"} предложил время: ${slot}`
    );
    return this.loadBookingById(bookingId);
  }

  async confirmBooking(
    bookingId: string,
    slot: string
  ): Promise<Booking | null> {
    const b = await this.loadBookingById(bookingId);
    if (!b) return null;
    await this.db
      .from("bookings")
      .update({
        confirmed_time_slot: slot,
        status: "confirmed",
        updated_at: nowIso(),
      })
      .eq("id", bookingId);
    await this.addBookingEvent(
      bookingId,
      "confirmed",
      `Запись подтверждена на ${slot}`
    );
    return this.loadBookingById(bookingId);
  }

  async setBookingOutcome(
    bookingId: string,
    outcome: BookingOutcome,
    status: BookingStatus
  ): Promise<Booking | null> {
    const b = await this.loadBookingById(bookingId);
    if (!b) return null;
    await this.db
      .from("bookings")
      .update({ outcome, status, updated_at: nowIso() })
      .eq("id", bookingId);
    await this.addBookingEvent(bookingId, "outcome", `Итог: ${outcome}`);
    return this.loadBookingById(bookingId);
  }

  // ---------- Clients CRM ----------
  async convertBookingToClient(
    bookingId: string
  ): Promise<CrmClient | null> {
    const b = await this.loadBookingById(bookingId);
    if (!b) return null;
    const { data: existing } = await this.db
      .from("clients")
      .select(CLIENT_SELECT)
      .eq("source_booking_id", bookingId)
      .maybeSingle();
    if (existing) return existing as unknown as CrmClient;
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
    };
    await this.db.from("clients").insert(client);
    await this.db
      .from("bookings")
      .update({
        status: "converted_to_repeat_client",
        updated_at: nowIso(),
      })
      .eq("id", b.id);
    await this.addBookingEvent(
      b.id,
      "converted_to_client",
      "Заявка преобразована в клиента CRM"
    );
    return { ...client, sessions: [] };
  }

  async listClients(profileId: string): Promise<CrmClient[]> {
    const { data } = await this.db
      .from("clients")
      .select(CLIENT_SELECT)
      .eq("profile_id", profileId);
    return (data as unknown as CrmClient[] | null) ?? [];
  }

  async getClient(id: string): Promise<CrmClient | null> {
    const { data } = await this.db
      .from("clients")
      .select(CLIENT_SELECT)
      .eq("id", id)
      .maybeSingle();
    return (data as unknown as CrmClient) ?? null;
  }

  async updateClient(
    id: string,
    patch: Partial<CrmClient>
  ): Promise<CrmClient | null> {
    const { sessions, ...cols } = patch;
    void sessions;
    const { error } = await this.db
      .from("clients")
      .update({ ...cols, updated_at: nowIso() })
      .eq("id", id);
    if (error) return null;
    return this.getClient(id);
  }

  async addClientSession(
    clientId: string,
    data: Partial<ClientSession>
  ): Promise<ClientSession | null> {
    const c = await this.getClient(clientId);
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
    const { error } = await this.db.from("client_sessions").insert(s);
    if (error) return null;
    await this.db
      .from("clients")
      .update({ updated_at: nowIso() })
      .eq("id", clientId);
    return s;
  }

  async getClientByToken(token: string): Promise<CrmClient | null> {
    if (!token) return null;
    const { data } = await this.db
      .from("clients")
      .select(CLIENT_SELECT)
      .eq("token", token)
      .maybeSingle();
    return (data as unknown as CrmClient) ?? null;
  }

  // ---------- Private mutual feedback ----------
  async addTherapistPrivateNote(
    profileId: string,
    data: Partial<TherapistPrivateNote>
  ): Promise<TherapistPrivateNote | null> {
    const owner = await this.loadProfileById(profileId);
    if (!owner) return null;
    if (data.client_id) {
      const c = await this.getClient(data.client_id);
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
    const { error } = await this.db
      .from("therapist_private_session_notes")
      .insert(note);
    if (error) return null;
    return note;
  }

  async listTherapistPrivateNotes(
    profileId: string,
    clientId?: string
  ): Promise<TherapistPrivateNote[]> {
    let q = this.db
      .from("therapist_private_session_notes")
      .select("*")
      .eq("profile_id", profileId);
    if (clientId) q = q.eq("client_id", clientId);
    const { data } = await q.order("created_at", { ascending: false });
    return (data as TherapistPrivateNote[] | null) ?? [];
  }

  async submitClientFeedback(
    token: string,
    data: Partial<ClientPrivateFeedback>
  ): Promise<ClientPrivateFeedback | null> {
    const client = await this.getClientByToken(token);
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
    const { error } = await this.db
      .from("client_private_feedback")
      .insert(fb);
    if (error) return null;
    return fb;
  }

  async listClientFeedbackForProfile(
    profileId: string,
    clientId?: string
  ): Promise<ClientPrivateFeedback[]> {
    let q = this.db
      .from("client_private_feedback")
      .select("*")
      .eq("profile_id", profileId);
    if (clientId) q = q.eq("client_id", clientId);
    const { data } = await q.order("created_at", { ascending: false });
    return (data as ClientPrivateFeedback[] | null) ?? [];
  }

  // ---------- Analytics ----------
  async recordProfileView(
    profileId: string,
    path?: string
  ): Promise<void> {
    const p = await this.loadProfileById(profileId);
    if (!p) return;
    await this.db.from("profile_views").insert({
      id: newId(),
      profile_id: profileId,
      path: path ?? null,
      created_at: nowIso(),
    });
  }

  async recordContactClick(
    profileId: string,
    channel: ContactChannel
  ): Promise<void> {
    const p = await this.loadProfileById(profileId);
    if (!p) return;
    await this.db.from("contact_clicks").insert({
      id: newId(),
      profile_id: profileId,
      channel,
      created_at: nowIso(),
    });
  }

  async getAnalytics(profileId: string): Promise<ProfileAnalytics> {
    const { data: viewsData } = await this.db
      .from("profile_views")
      .select("created_at")
      .eq("profile_id", profileId);
    const { data: clicksData } = await this.db
      .from("contact_clicks")
      .select("channel")
      .eq("profile_id", profileId);
    const views = (viewsData as { created_at: string }[] | null) ?? [];
    const clicks = (clicksData as { channel: string }[] | null) ?? [];
    const viewsByDay: { date: string; count: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const day = new Date(Date.now() - i * 86400000)
        .toISOString()
        .slice(0, 10);
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

  async logAiGeneration(
    task: string,
    usedOpenAI: boolean
  ): Promise<void> {
    await this.db.from("ai_generations").insert({
      id: newId(),
      task,
      used_openai: usedOpenAI,
      created_at: nowIso(),
    });
  }

  async listAiGenerations(): Promise<AiGeneration[]> {
    const { data } = await this.db
      .from("ai_generations")
      .select("*")
      .order("created_at", { ascending: false });
    return (data as AiGeneration[] | null) ?? [];
  }

  async getActivityTotals(): Promise<ActivityTotals> {
    const counts = await Promise.all([
      this.db
        .from("profile_views")
        .select("id", { count: "exact", head: true }),
      this.db
        .from("contact_clicks")
        .select("id", { count: "exact", head: true }),
      this.db
        .from("ai_generations")
        .select("id", { count: "exact", head: true }),
    ]);
    return {
      totalViews: counts[0].count ?? 0,
      totalClicks: counts[1].count ?? 0,
      aiCalls: counts[2].count ?? 0,
    };
  }

  // ---------- AI match persistence ----------
  async saveMatch(
    request: Omit<MatchRequestRecord, "id" | "created_at">,
    results: MatchResultInput[]
  ): Promise<MatchRequestRecord> {
    const req: MatchRequestRecord = {
      ...request,
      id: newId(),
      created_at: nowIso(),
    };
    await this.db.from("match_requests").insert(req);
    if (results.length) {
      await this.db.from("match_results").insert(
        results.map((r, i) => ({
          id: newId(),
          request_id: req.id,
          profile_id: r.profile_id,
          rank: i + 1,
          score: r.score,
          service_recommendation: r.service_recommendation,
          reasons: r.reasons,
          risks: r.risks,
          created_at: nowIso(),
        }))
      );
    }
    return req;
  }

  async listMatchesForProfile(
    profileId: string
  ): Promise<(MatchResultRecord & { request: MatchRequestRecord | null })[]> {
    const { data } = await this.db
      .from("match_results")
      .select("*, request:match_requests(*)")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false });
    return (
      (data as
        | (MatchResultRecord & { request: MatchRequestRecord | null })[]
        | null) ?? []
    );
  }

  // ---------- Support ----------
  async createSupportRequest(
    input: Omit<
      SupportRequest,
      "id" | "status" | "admin_note" | "created_at" | "updated_at"
    >
  ): Promise<SupportRequest> {
    const sr: SupportRequest = {
      ...input,
      id: newId(),
      status: "new",
      admin_note: null,
      created_at: nowIso(),
      updated_at: nowIso(),
    };
    await this.db.from("support_requests").insert(sr);
    return sr;
  }

  async listSupportRequests(): Promise<SupportRequest[]> {
    const { data } = await this.db
      .from("support_requests")
      .select("*")
      .order("created_at", { ascending: false });
    return (data as SupportRequest[] | null) ?? [];
  }

  async updateSupportRequest(
    id: string,
    patch: Partial<SupportRequest>
  ): Promise<SupportRequest | null> {
    const { error } = await this.db
      .from("support_requests")
      .update({ ...patch, updated_at: nowIso() })
      .eq("id", id);
    if (error) return null;
    const { data } = await this.db
      .from("support_requests")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    return (data as SupportRequest) ?? null;
  }

  // ---------- Subscriptions / payments ----------
  async createPayment(
    profileId: string,
    planId: "pro" | "expert"
  ): Promise<Payment> {
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
    await this.db.from("payments").insert(payment);
    return payment;
  }

  async getPaymentByProviderId(
    providerId: string
  ): Promise<Payment | null> {
    const { data } = await this.db
      .from("payments")
      .select("*")
      .eq("provider_payment_id", providerId)
      .maybeSingle();
    return (data as Payment) ?? null;
  }

  async markPaymentSucceeded(
    providerId: string
  ): Promise<Subscription | null> {
    const payment = await this.getPaymentByProviderId(providerId);
    if (!payment || payment.status === "succeeded") {
      if (!payment || !payment.subscription_id) return null;
      const { data } = await this.db
        .from("subscriptions")
        .select("*")
        .eq("id", payment.subscription_id)
        .maybeSingle();
      return (data as Subscription) ?? null;
    }
    await this.db
      .from("payments")
      .update({ status: "succeeded", updated_at: nowIso() })
      .eq("id", payment.id);

    const planId = (payment.plan_id ?? "pro") as "pro" | "expert";
    const days = PLANS[planId].period_days || 30;
    const now = new Date();
    const expires = new Date(now.getTime() + days * 86400000);

    const { data: existingSub } = await this.db
      .from("subscriptions")
      .select("*")
      .eq("profile_id", payment.profile_id)
      .maybeSingle();

    let sub: Subscription;
    if (!existingSub) {
      sub = {
        id: newId(),
        profile_id: payment.profile_id,
        plan_id: planId,
        status: "active",
        started_at: now.toISOString(),
        expires_at: expires.toISOString(),
      };
      await this.db.from("subscriptions").insert(sub);
    } else {
      sub = {
        ...(existingSub as Subscription),
        plan_id: planId,
        status: "active",
        started_at: now.toISOString(),
        expires_at: expires.toISOString(),
      };
      await this.db
        .from("subscriptions")
        .update({
          plan_id: planId,
          status: "active",
          started_at: sub.started_at,
          expires_at: sub.expires_at,
        })
        .eq("id", sub.id);
    }
    await this.db
      .from("payments")
      .update({ subscription_id: sub.id })
      .eq("id", payment.id);
    await this.db
      .from("profiles")
      .update({ plan_id: planId, updated_at: nowIso() })
      .eq("id", payment.profile_id);
    return sub;
  }

  async cancelSubscription(
    profileId: string
  ): Promise<Subscription | null> {
    const { data: sub } = await this.db
      .from("subscriptions")
      .select("*")
      .eq("profile_id", profileId)
      .maybeSingle();
    if (!sub) return null;
    await this.db
      .from("subscriptions")
      .update({ status: "cancelled" })
      .eq("id", (sub as Subscription).id);
    await this.db
      .from("profiles")
      .update({ plan_id: "free", updated_at: nowIso() })
      .eq("id", profileId);
    return { ...(sub as Subscription), status: "cancelled" };
  }

  async getSubscription(
    profileId: string
  ): Promise<Subscription | null> {
    const { data } = await this.db
      .from("subscriptions")
      .select("*")
      .eq("profile_id", profileId)
      .maybeSingle();
    return (data as Subscription) ?? null;
  }

  async listPayments(): Promise<Payment[]> {
    const { data } = await this.db
      .from("payments")
      .select("*")
      .order("created_at", { ascending: false });
    return (data as Payment[] | null) ?? [];
  }

  async listSubscriptions(): Promise<Subscription[]> {
    const { data } = await this.db.from("subscriptions").select("*");
    return (data as Subscription[] | null) ?? [];
  }

  // ---------- Admin / moderation ----------
  async listAllProfiles(): Promise<Profile[]> {
    const { data } = await this.db
      .from("profiles")
      .select(PROFILE_SELECT);
    return ((data as unknown as Profile[] | null) ?? []).map((p) =>
      sortJoins(p)
    );
  }

  async listModerationFlags() {
    const { data } = await this.db
      .from("moderation_flags")
      .select("*")
      .eq("resolved", false);
    const flags = (data as
      | {
          id: string;
          profile_id?: string | null;
          category: string;
          severity: string;
          matched_text?: string | null;
          resolved: boolean;
          created_at: string;
        }[]
      | null) ?? [];
    const out = [];
    for (const f of flags) {
      const profile = f.profile_id
        ? await this.loadProfileById(f.profile_id)
        : null;
      out.push({ ...f, profile });
    }
    return out;
  }

  async resolveModerationFlag(id: string): Promise<boolean> {
    const { data } = await this.db
      .from("moderation_flags")
      .update({ resolved: true })
      .eq("id", id)
      .select("id");
    return Boolean(data && data.length > 0);
  }

  async setModerationStatus(
    profileId: string,
    status: Profile["moderation_status"]
  ): Promise<Profile | null> {
    const { error } = await this.db
      .from("profiles")
      .update({ moderation_status: status, updated_at: nowIso() })
      .eq("id", profileId);
    if (error) return null;
    return this.loadProfileById(profileId);
  }
}
