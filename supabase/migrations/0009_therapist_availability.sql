-- "Рядом" (nearby) — therapist-controlled live availability windows.
--
-- A therapist is NEVER discoverable by default. They explicitly go live
-- for a concrete window (date + start/end) and choose how their
-- location is exposed (location_mode). After end_time the row is
-- treated as expired and disappears from search (the app also lazily
-- flips status -> 'expired' on read).
--
-- Privacy: latitude/longitude are used ONLY for server-side distance
-- maths and are protected by RLS — the public read policy never returns
-- them to anon clients (the app projects them out as well). Clients see
-- only a coarse area label + rounded approximate distance.
--
-- RLS follows the project convention (see 0008 / user_id_columns_to_text):
-- the app uses the service-role key (bypasses RLS) with a custom text
-- users table; owner policies compare profiles.user_id to auth.uid()::text.

create table if not exists therapist_availability (
  id                  uuid primary key default gen_random_uuid(),
  profile_id          uuid not null references profiles(id) on delete cascade,
  date                date not null,
  start_time          text not null,                       -- HH:MM (local)
  end_time            text not null,                        -- HH:MM (local)
  status              text not null default 'active',        -- active|inactive|expired
  location_mode       text not null default 'hidden_exact_location',
  latitude            double precision,                      -- server-only
  longitude           double precision,                      -- server-only
  approximate_area    text,                                  -- coarse public label
  manual_area         text,
  service_radius_km   integer not null default 5,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  expires_at          timestamptz not null
);

-- A therapist has at most one row that is currently active.
create unique index if not exists therapist_availability_one_active_uidx
  on therapist_availability (profile_id)
  where status = 'active';

create index if not exists therapist_availability_live_idx
  on therapist_availability (status, expires_at);

alter table therapist_availability enable row level security;

-- Public can read only LIVE windows of verified, published profiles.
-- (Coordinates are still column-level data; the app never selects them
-- for client payloads. Tighten with a view/column grants if anon read
-- is ever enabled directly.)
drop policy if exists therapist_availability_public_read on public.therapist_availability;
create policy therapist_availability_public_read on public.therapist_availability
  for select using (
    status = 'active'
    and expires_at > now()
    and exists (
      select 1 from public.profiles p
      where p.id = therapist_availability.profile_id
        and p.is_published = true
        and p.moderation_status = 'approved'
    )
  );

drop policy if exists therapist_availability_owner_all on public.therapist_availability;
create policy therapist_availability_owner_all on public.therapist_availability
  for all using (
    exists (
      select 1 from public.profiles p
      where p.id = therapist_availability.profile_id
        and p.user_id = auth.uid()::text
    )
  );

-- Therapist-side coarse defaults for the nearby feature. The exact
-- private address still lives in profiles.therapist_address_private and
-- is never published.
alter table profiles
  add column if not exists home_base_area text,
  add column if not exists default_service_radius_km integer,
  add column if not exists allow_location_visibility boolean not null default false;
