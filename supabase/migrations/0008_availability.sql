-- Therapist availability slots. A therapist publishes concrete bookable
-- time windows; when a client books one, status flips to 'booked' and
-- booking_id is set. The partial unique index on booking_id is the
-- database-level guard against double-booking.
--
-- RLS mirrors the project convention (see user_id_columns_to_text): the
-- app uses the service-role key (bypasses RLS) with a custom text users
-- table, so owner policies compare profiles.user_id to auth.uid()::text.

create table if not exists availability_slots (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references profiles(id) on delete cascade,
  starts_at   timestamptz not null,
  duration    integer not null default 60,
  status      text not null default 'open',  -- open|booked
  booking_id  uuid references bookings(id) on delete set null,
  created_at  timestamptz not null default now(),
  unique (profile_id, starts_at)
);

create index if not exists availability_slots_profile_idx
  on availability_slots (profile_id, starts_at);
create index if not exists availability_slots_open_idx
  on availability_slots (profile_id, status, starts_at);
create unique index if not exists availability_slots_booking_uidx
  on availability_slots (booking_id) where booking_id is not null;

alter table availability_slots enable row level security;

drop policy if exists availability_slots_public_read on public.availability_slots;
create policy availability_slots_public_read on public.availability_slots
  for select using (
    status = 'open'
    and exists (
      select 1 from public.profiles p
      where p.id = availability_slots.profile_id and p.is_published = true
    )
  );

drop policy if exists availability_slots_owner_all on public.availability_slots;
create policy availability_slots_owner_all on public.availability_slots
  for all using (
    exists (
      select 1 from public.profiles p
      where p.id = availability_slots.profile_id
        and p.user_id = auth.uid()::text
    )
  );
