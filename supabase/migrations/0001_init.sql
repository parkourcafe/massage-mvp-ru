-- ============================================================
-- Massage Marketplace MVP — initial schema
-- Professional wellness / therapeutic massage only.
-- This schema is intentionally separate from the tutor MVP.
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- Plans / billing reference ----------
create table if not exists plans (
  id            text primary key,                 -- 'free' | 'pro' | 'expert'
  title         text not null,
  price_rub     integer not null default 0,
  period_days   integer not null default 30,
  features      jsonb not null default '{}'::jsonb,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

-- ---------- Therapist profiles ----------
create table if not exists profiles (
  id                        uuid primary key default gen_random_uuid(),
  user_id                   uuid,                          -- supabase auth user
  slug                      text unique not null,
  full_name                 text not null,
  gender                    text,                          -- 'female' | 'male' | null
  show_gender               boolean not null default false,
  years_experience          integer not null default 0,
  headline                  text,
  professional_description  text,
  safety_boundaries         text,
  faq                       jsonb not null default '[]'::jsonb,

  -- location / working format
  country                   text default 'Россия',
  city                      text,
  district                  text,
  nearest_landmark          text,
  therapist_address_private text,                          -- never exposed publicly
  public_location_label     text,
  works_at_own_place        boolean not null default false,
  travels_to_client         boolean not null default false,
  works_in_hotels           boolean not null default false,
  works_in_villas           boolean not null default false,
  works_in_salon            boolean not null default false,
  travel_districts          text[] not null default '{}',
  minimum_booking_price     integer,
  transport_fee             integer,
  timezone                  text default 'Europe/Moscow',
  languages                 text[] not null default '{}',

  price_from                integer,
  session_durations         integer[] not null default '{}',

  plan_id                   text not null default 'free' references plans(id),
  is_published              boolean not null default false,
  quality_score             integer not null default 0,
  moderation_status         text not null default 'pending', -- pending|approved|flagged|rejected

  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

create index if not exists profiles_city_idx on profiles (city);
create index if not exists profiles_published_idx on profiles (is_published);

-- ---------- Massage services / modalities ----------
create table if not exists services (
  id                    uuid primary key default gen_random_uuid(),
  profile_id            uuid not null references profiles(id) on delete cascade,
  modality              text not null,            -- canonical key, see src/lib/catalog.ts
  title                 text not null,
  description           text,
  duration              integer,                  -- minutes
  price                 integer,
  contraindication_note text,
  is_published          boolean not null default true,
  sort_order            integer not null default 0,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
create index if not exists services_profile_idx on services (profile_id);

-- ---------- Media ----------
create table if not exists profile_media (
  id           uuid primary key default gen_random_uuid(),
  profile_id   uuid not null references profiles(id) on delete cascade,
  type         text not null,                     -- see MediaType in src/lib/types.ts
  url          text not null,
  title        text,
  description  text,
  alt_text     text,
  sort_order   integer not null default 0,
  is_published boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists profile_media_profile_idx on profile_media (profile_id);

-- ---------- Favorites ----------
create table if not exists favorites (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null,
  profile_id  uuid not null references profiles(id) on delete cascade,
  source      text not null default 'directory',  -- directory|profile|match
  match_score integer,
  created_at  timestamptz not null default now(),
  unique (user_id, profile_id)
);

-- ---------- Unified booking inquiry ----------
create table if not exists bookings (
  id                   uuid primary key default gen_random_uuid(),
  profile_id           uuid not null references profiles(id) on delete cascade,
  token                text unique not null,
  client_name          text not null,
  client_role          text not null default 'self',  -- self|for_partner|for_family_member
  contact_method       text,                            -- telegram|whatsapp|phone|email|none
  contact_value        text,                            -- never exposed publicly
  service_type         text,
  massage_goal         text,
  focus_area           text,
  pressure_preference  text,
  duration             integer,
  location_type        text,                            -- client_home|hotel|villa|therapist_place|salon|discuss
  city                 text,
  district             text,
  address_or_landmark  text,                            -- visible to therapist only after confirmed
  preferred_time_slot_1 text,
  preferred_time_slot_2 text,
  preferred_time_slot_3 text,
  confirmed_time_slot  text,
  status               text not null default 'new',
  outcome              text,
  important_notes      text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
create index if not exists bookings_profile_idx on bookings (profile_id);
create index if not exists bookings_token_idx on bookings (token);

create table if not exists booking_messages (
  id          uuid primary key default gen_random_uuid(),
  booking_id  uuid not null references bookings(id) on delete cascade,
  sender_type text not null,                       -- therapist|client
  sender_name text,
  body        text not null,
  created_at  timestamptz not null default now(),
  read_at     timestamptz
);
create index if not exists booking_messages_booking_idx on booking_messages (booking_id);

create table if not exists booking_events (
  id          uuid primary key default gen_random_uuid(),
  booking_id  uuid not null references bookings(id) on delete cascade,
  event_type  text not null,
  event_text  text,
  created_at  timestamptz not null default now()
);
create index if not exists booking_events_booking_idx on booking_events (booking_id);

-- ---------- Client CRM ----------
create table if not exists clients (
  id                    uuid primary key default gen_random_uuid(),
  profile_id            uuid not null references profiles(id) on delete cascade,
  source_booking_id     uuid references bookings(id) on delete set null,
  token                 text unique,
  name                  text not null,
  contact_method        text,
  contact_value         text,
  city                  text,
  district              text,
  preferred_service_type text,
  pressure_preference   text,
  important_notes       text,
  contraindication_notes text,
  favorite_duration     integer,
  repeat_status         text not null default 'active',  -- active|repeat|paused|inactive|lost
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
create index if not exists clients_profile_idx on clients (profile_id);

create table if not exists client_sessions (
  id                  uuid primary key default gen_random_uuid(),
  client_id           uuid not null references clients(id) on delete cascade,
  session_date        date,
  service_type        text,
  duration            integer,
  focus_area          text,
  pressure            text,
  private_note        text,
  next_recommendation text,
  created_at          timestamptz not null default now()
);
create index if not exists client_sessions_client_idx on client_sessions (client_id);

create table if not exists therapist_private_session_notes (
  id             uuid primary key default gen_random_uuid(),
  profile_id     uuid not null references profiles(id) on delete cascade,
  client_id      uuid references clients(id) on delete set null,
  booking_id     uuid references bookings(id) on delete set null,
  session_date   date,
  service_type   text,
  duration       integer,
  focus_area     text,
  pressure_used  text,
  how_session_went text,
  what_to_repeat text,
  what_to_avoid  text,
  next_step      text,
  private_note   text,
  created_at     timestamptz not null default now()
);

create table if not exists client_private_feedback (
  id                   uuid primary key default gen_random_uuid(),
  booking_id           uuid references bookings(id) on delete set null,
  profile_id           uuid not null references profiles(id) on delete cascade,
  comfort_score        integer,
  professionalism_score integer,
  cleanliness_score    integer,
  punctuality_score    integer,
  pressure_fit         text,                       -- too_soft|good|too_strong
  comment              text,
  repeat_status        text,                       -- repeat|not_sure|no
  created_at           timestamptz not null default now()
);

-- ---------- Manager support ----------
create table if not exists support_requests (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid,
  profile_id           uuid references profiles(id) on delete set null,
  name                 text not null,
  contact_method       text,
  contact_value        text,
  preferred_contact_time text,
  topic                text not null,
  message              text,
  status               text not null default 'new',  -- new|in_progress|done|cancelled
  admin_note           text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- ---------- Subscriptions / payments ----------
create table if not exists subscriptions (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references profiles(id) on delete cascade,
  plan_id     text not null references plans(id),
  status      text not null default 'inactive',     -- inactive|active|cancelled|expired
  started_at  timestamptz,
  expires_at  timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists subscriptions_profile_idx on subscriptions (profile_id);

create table if not exists payments (
  id              uuid primary key default gen_random_uuid(),
  profile_id      uuid not null references profiles(id) on delete cascade,
  subscription_id uuid references subscriptions(id) on delete set null,
  provider        text not null default 'yookassa',
  provider_payment_id text,
  amount_rub      integer not null,
  currency        text not null default 'RUB',
  status          text not null default 'pending',   -- pending|succeeded|cancelled|failed
  plan_id         text references plans(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists payments_provider_idx on payments (provider_payment_id);

create table if not exists payment_events (
  id          uuid primary key default gen_random_uuid(),
  payment_id  uuid references payments(id) on delete cascade,
  event_type  text not null,
  raw         jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

create table if not exists invoices (
  id          uuid primary key default gen_random_uuid(),
  payment_id  uuid references payments(id) on delete set null,
  profile_id  uuid not null references profiles(id) on delete cascade,
  number      text not null,
  amount_rub  integer not null,
  status      text not null default 'issued',
  created_at  timestamptz not null default now()
);

-- ---------- Moderation ----------
create table if not exists moderation_flags (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid references profiles(id) on delete cascade,
  service_id  uuid references services(id) on delete cascade,
  media_id    uuid references profile_media(id) on delete cascade,
  category    text not null,                          -- adult|erotic|suspicious_title|inappropriate_photo|unsafe_medical
  severity    text not null default 'review',         -- block|review
  matched_text text,
  resolved    boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists moderation_flags_profile_idx on moderation_flags (profile_id);
