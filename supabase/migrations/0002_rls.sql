-- ============================================================
-- Row Level Security
-- Privacy model:
--  * Public can read only PUBLISHED + APPROVED therapist profiles,
--    their published services and published, non-document media.
--  * contact_value, therapist_address_private, bookings, CRM, notes,
--    payments are NEVER public.
--  * Only the owning therapist (auth.uid() == profiles.user_id) can
--    read/write their bookings, clients, notes, media, services.
--  * Booking client access is via unguessable token at the API layer
--    using the service role (no public SELECT on bookings).
-- ============================================================

alter table profiles                       enable row level security;
alter table services                       enable row level security;
alter table profile_media                  enable row level security;
alter table favorites                      enable row level security;
alter table bookings                       enable row level security;
alter table booking_messages               enable row level security;
alter table booking_events                 enable row level security;
alter table clients                        enable row level security;
alter table client_sessions                enable row level security;
alter table therapist_private_session_notes enable row level security;
alter table client_private_feedback        enable row level security;
alter table support_requests               enable row level security;
alter table subscriptions                  enable row level security;
alter table payments                       enable row level security;
alter table payment_events                 enable row level security;
alter table invoices                       enable row level security;
alter table moderation_flags               enable row level security;
alter table plans                          enable row level security;

-- Public, safe read surface
create policy plans_public_read on plans
  for select using (is_active = true);

create policy profiles_public_read on profiles
  for select using (is_published = true and moderation_status = 'approved');

create policy services_public_read on services
  for select using (
    is_published = true
    and exists (
      select 1 from profiles p
      where p.id = services.profile_id
        and p.is_published = true
        and p.moderation_status = 'approved'
    )
  );

create policy media_public_read on profile_media
  for select using (
    is_published = true
    and type not in ('document')
    and exists (
      select 1 from profiles p
      where p.id = profile_media.profile_id
        and p.is_published = true
        and p.moderation_status = 'approved'
    )
  );

-- Owner-only access (therapist owns profile via user_id)
create policy profiles_owner_all on profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy services_owner_all on services
  for all using (
    exists (select 1 from profiles p where p.id = services.profile_id and p.user_id = auth.uid())
  );

create policy media_owner_all on profile_media
  for all using (
    exists (select 1 from profiles p where p.id = profile_media.profile_id and p.user_id = auth.uid())
  );

create policy bookings_owner_all on bookings
  for all using (
    exists (select 1 from profiles p where p.id = bookings.profile_id and p.user_id = auth.uid())
  );

create policy booking_messages_owner_all on booking_messages
  for all using (
    exists (
      select 1 from bookings b join profiles p on p.id = b.profile_id
      where b.id = booking_messages.booking_id and p.user_id = auth.uid()
    )
  );

create policy booking_events_owner_all on booking_events
  for all using (
    exists (
      select 1 from bookings b join profiles p on p.id = b.profile_id
      where b.id = booking_events.booking_id and p.user_id = auth.uid()
    )
  );

create policy clients_owner_all on clients
  for all using (
    exists (select 1 from profiles p where p.id = clients.profile_id and p.user_id = auth.uid())
  );

create policy client_sessions_owner_all on client_sessions
  for all using (
    exists (
      select 1 from clients c join profiles p on p.id = c.profile_id
      where c.id = client_sessions.client_id and p.user_id = auth.uid()
    )
  );

create policy notes_owner_all on therapist_private_session_notes
  for all using (
    exists (select 1 from profiles p where p.id = therapist_private_session_notes.profile_id and p.user_id = auth.uid())
  );

create policy feedback_owner_read on client_private_feedback
  for select using (
    exists (select 1 from profiles p where p.id = client_private_feedback.profile_id and p.user_id = auth.uid())
  );

create policy favorites_owner_all on favorites
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy subscriptions_owner_read on subscriptions
  for select using (
    exists (select 1 from profiles p where p.id = subscriptions.profile_id and p.user_id = auth.uid())
  );

create policy payments_owner_read on payments
  for select using (
    exists (select 1 from profiles p where p.id = payments.profile_id and p.user_id = auth.uid())
  );

create policy support_owner_all on support_requests
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Everything else (payment_events, invoices, moderation_flags) is
-- service-role only: no public/anon policies are defined, so RLS
-- denies by default and only the service key (server) can access it.
