// Domain types for the massage marketplace MVP.

export type MediaType =
  | "profile_photo"
  | "gallery_photo"
  | "workspace_photo"
  | "equipment_photo"
  | "intro_video"
  | "session_video"
  | "certificate"
  | "diploma"
  | "review_screenshot"
  | "document";

export type BookingStatus =
  | "new"
  | "chat_started"
  | "waiting_therapist_reply"
  | "waiting_client_reply"
  | "time_requested"
  | "time_proposed"
  | "confirmed"
  | "completed"
  | "converted_to_repeat_client"
  | "lost"
  | "cancelled"
  | "no_show";

export type BookingOutcome =
  | "completed_good"
  | "completed_repeat_expected"
  | "completed_not_fit"
  | "cancelled_by_client"
  | "cancelled_by_therapist"
  | "no_show"
  | "rescheduled"
  | "lost_no_reply";

export type ClientRepeatStatus =
  | "active"
  | "repeat"
  | "paused"
  | "inactive"
  | "lost";

export type SupportStatus = "new" | "in_progress" | "done" | "cancelled";

export type PlanId = "free" | "pro" | "expert";

export interface ServiceItem {
  id: string;
  profile_id: string;
  modality: string;
  title: string;
  description?: string | null;
  duration?: number | null;
  price?: number | null;
  contraindication_note?: string | null;
  is_published: boolean;
  sort_order: number;
}

export interface ProfileMedia {
  id: string;
  profile_id: string;
  type: MediaType;
  url: string;
  title?: string | null;
  description?: string | null;
  alt_text?: string | null;
  sort_order: number;
  is_published: boolean;
}

export interface Profile {
  id: string;
  user_id?: string | null;
  slug: string;
  full_name: string;
  gender?: "female" | "male" | null;
  show_gender: boolean;
  years_experience: number;
  headline?: string | null;
  professional_description?: string | null;
  safety_boundaries?: string | null;
  faq: { q: string; a: string }[];

  country?: string | null;
  city?: string | null;
  district?: string | null;
  nearest_landmark?: string | null;
  therapist_address_private?: string | null; // never serialized to public
  public_location_label?: string | null;
  works_at_own_place: boolean;
  travels_to_client: boolean;
  works_in_hotels: boolean;
  works_in_villas: boolean;
  works_in_salon: boolean;
  travel_districts: string[];
  minimum_booking_price?: number | null;
  transport_fee?: number | null;
  timezone?: string | null;
  languages: string[];

  price_from?: number | null;
  session_durations: number[];

  // Public contact channels (shown on the profile when filled).
  whatsapp?: string | null;
  telegram_url?: string | null;
  vk_url?: string | null;
  instagram_url?: string | null;
  website_url?: string | null;

  plan_id: PlanId;
  is_published: boolean;
  quality_score: number;
  moderation_status: "pending" | "approved" | "flagged" | "rejected";

  created_at: string;
  updated_at: string;

  // joined
  services?: ServiceItem[];
  media?: ProfileMedia[];
}

export interface Favorite {
  id: string;
  user_id: string;
  profile_id: string;
  source: "directory" | "profile" | "match";
  match_score?: number | null;
  created_at: string;
}

export interface BookingMessage {
  id: string;
  booking_id: string;
  sender_type: "therapist" | "client";
  sender_name?: string | null;
  body: string;
  created_at: string;
  read_at?: string | null;
}

export interface BookingEvent {
  id: string;
  booking_id: string;
  event_type: string;
  event_text?: string | null;
  created_at: string;
}

export interface Booking {
  id: string;
  profile_id: string;
  token: string;
  client_name: string;
  client_role: "self" | "for_partner" | "for_family_member";
  contact_method?: string | null;
  contact_value?: string | null; // never public
  service_type?: string | null;
  massage_goal?: string | null;
  focus_area?: string | null;
  pressure_preference?: string | null;
  duration?: number | null;
  location_type?: string | null;
  city?: string | null;
  district?: string | null;
  address_or_landmark?: string | null; // therapist-only after confirmed
  preferred_time_slot_1?: string | null;
  preferred_time_slot_2?: string | null;
  preferred_time_slot_3?: string | null;
  confirmed_time_slot?: string | null;
  status: BookingStatus;
  outcome?: BookingOutcome | null;
  important_notes?: string | null;
  created_at: string;
  updated_at: string;

  messages?: BookingMessage[];
  events?: BookingEvent[];
}

export interface ClientSession {
  id: string;
  client_id: string;
  session_date?: string | null;
  service_type?: string | null;
  duration?: number | null;
  focus_area?: string | null;
  pressure?: string | null;
  private_note?: string | null;
  next_recommendation?: string | null;
  created_at: string;
}

export interface CrmClient {
  id: string;
  profile_id: string;
  source_booking_id?: string | null;
  token?: string | null;
  name: string;
  contact_method?: string | null;
  contact_value?: string | null;
  city?: string | null;
  district?: string | null;
  preferred_service_type?: string | null;
  pressure_preference?: string | null;
  important_notes?: string | null;
  contraindication_notes?: string | null;
  favorite_duration?: number | null;
  repeat_status: ClientRepeatStatus;
  created_at: string;
  updated_at: string;
  sessions?: ClientSession[];
}

export type ContactChannel =
  | "whatsapp"
  | "telegram"
  | "vk"
  | "instagram"
  | "website"
  | "booking";

export interface ProfileView {
  id: string;
  profile_id: string;
  path?: string | null;
  created_at: string;
}

export interface ContactClick {
  id: string;
  profile_id: string;
  channel: ContactChannel;
  created_at: string;
}

export interface AiGeneration {
  id: string;
  task: string;
  used_openai: boolean;
  created_at: string;
}

export interface MatchRequestRecord {
  id: string;
  massage_goal?: string | null;
  pain_or_focus_area?: string | null;
  preferred_service_type?: string | null;
  city?: string | null;
  district?: string | null;
  budget?: number | null;
  created_at: string;
}

export interface MatchResultRecord {
  id: string;
  request_id: string;
  profile_id: string;
  rank: number;
  score: number;
  service_recommendation: string;
  reasons: string[];
  risks: string[];
  created_at: string;
}

export type UserRole = "therapist" | "admin";

export interface AuthUser {
  id: string;
  email: string;
  password_hash: string;
  role: UserRole;
  created_at: string;
}

export interface TherapistPrivateNote {
  id: string;
  profile_id: string;
  client_id?: string | null;
  booking_id?: string | null;
  session_date?: string | null;
  service_type?: string | null;
  duration?: number | null;
  focus_area?: string | null;
  pressure_used?: string | null;
  how_session_went?: string | null;
  what_to_repeat?: string | null;
  what_to_avoid?: string | null;
  next_step?: string | null;
  private_note?: string | null;
  created_at: string;
}

export type PressureFit = "too_soft" | "good" | "too_strong";
export type FeedbackRepeat = "repeat" | "not_sure" | "no";

export interface ClientPrivateFeedback {
  id: string;
  booking_id?: string | null;
  profile_id: string;
  client_id?: string | null;
  comfort_score?: number | null;
  professionalism_score?: number | null;
  cleanliness_score?: number | null;
  punctuality_score?: number | null;
  pressure_fit?: PressureFit | null;
  comment?: string | null;
  repeat_status?: FeedbackRepeat | null;
  created_at: string;
}

export interface SupportRequest {
  id: string;
  user_id?: string | null;
  profile_id?: string | null;
  name: string;
  contact_method?: string | null;
  contact_value?: string | null;
  preferred_contact_time?: string | null;
  topic: string;
  message?: string | null;
  status: SupportStatus;
  admin_note?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Plan {
  id: PlanId;
  title: string;
  price_rub: number;
  period_days: number;
  features: Record<string, boolean>;
}

export interface Subscription {
  id: string;
  profile_id: string;
  plan_id: PlanId;
  status: "inactive" | "active" | "cancelled" | "expired";
  started_at?: string | null;
  expires_at?: string | null;
}

export interface Payment {
  id: string;
  profile_id: string;
  subscription_id?: string | null;
  provider: string;
  provider_payment_id?: string | null;
  amount_rub: number;
  currency: string;
  status: "pending" | "succeeded" | "cancelled" | "failed";
  plan_id?: PlanId | null;
  created_at: string;
  updated_at: string;
}

export interface ModerationFlag {
  id: string;
  profile_id?: string | null;
  service_id?: string | null;
  media_id?: string | null;
  category:
    | "adult"
    | "erotic"
    | "suspicious_title"
    | "inappropriate_photo"
    | "unsafe_medical";
  severity: "block" | "review";
  matched_text?: string | null;
  resolved: boolean;
  created_at: string;
}

// Public-safe projection of a profile (no private contact / address).
export type PublicProfile = Omit<Profile, "therapist_address_private"> & {
  therapist_address_private?: never;
};
