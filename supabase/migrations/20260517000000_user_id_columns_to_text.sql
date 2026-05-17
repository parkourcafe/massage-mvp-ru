-- Align user_id reference columns with users.id (text).
--
-- Context: the app uses a custom `users` table (text ids like
-- `user-<uuid>`) + custom session cookies and accesses Postgres with the
-- service-role key (which bypasses RLS). It does NOT use Supabase Auth,
-- so auth.uid() is always NULL for the app and every "owner" policy is
-- already deny-for-non-service; the app's data path is unaffected by RLS.
--
-- profiles.user_id / favorites.user_id / support_requests.user_id were
-- uuid while users.id is text, which broke createUser / addFavorite /
-- getOwnerProfile(userId) / support on the Supabase backend. This
-- migration retypes those columns to text. 15 RLS policies referenced
-- profiles.user_id (3 directly, 12 via EXISTS subqueries) and are
-- recreated verbatim with auth.uid()::text so semantics and security
-- posture are identical. profiles_public_read does not reference user_id
-- and is left untouched. No foreign keys exist on these columns.

drop policy if exists profiles_owner_all on public.profiles;
drop policy if exists favorites_owner_all on public.favorites;
drop policy if exists support_owner_all on public.support_requests;
drop policy if exists bookings_owner_all on public.bookings;
drop policy if exists booking_events_owner_all on public.booking_events;
drop policy if exists booking_messages_owner_all on public.booking_messages;
drop policy if exists clients_owner_all on public.clients;
drop policy if exists client_sessions_owner_all on public.client_sessions;
drop policy if exists media_owner_all on public.profile_media;
drop policy if exists services_owner_all on public.services;
drop policy if exists notes_owner_all on public.therapist_private_session_notes;
drop policy if exists feedback_owner_read on public.client_private_feedback;
drop policy if exists match_results_owner_read on public.match_results;
drop policy if exists payments_owner_read on public.payments;
drop policy if exists subscriptions_owner_read on public.subscriptions;

alter table public.profiles         alter column user_id type text using user_id::text;
alter table public.favorites        alter column user_id type text using user_id::text;
alter table public.support_requests alter column user_id type text using user_id::text;

create policy profiles_owner_all on public.profiles
  for all using (auth.uid()::text = user_id)
  with check (auth.uid()::text = user_id);
create policy favorites_owner_all on public.favorites
  for all using (auth.uid()::text = user_id)
  with check (auth.uid()::text = user_id);
create policy support_owner_all on public.support_requests
  for all using (auth.uid()::text = user_id)
  with check (auth.uid()::text = user_id);

create policy bookings_owner_all on public.bookings
  for all using (exists (select 1 from public.profiles p
    where p.id = bookings.profile_id and p.user_id = auth.uid()::text));
create policy booking_events_owner_all on public.booking_events
  for all using (exists (select 1 from public.bookings b
    join public.profiles p on p.id = b.profile_id
    where b.id = booking_events.booking_id and p.user_id = auth.uid()::text));
create policy booking_messages_owner_all on public.booking_messages
  for all using (exists (select 1 from public.bookings b
    join public.profiles p on p.id = b.profile_id
    where b.id = booking_messages.booking_id and p.user_id = auth.uid()::text));
create policy clients_owner_all on public.clients
  for all using (exists (select 1 from public.profiles p
    where p.id = clients.profile_id and p.user_id = auth.uid()::text));
create policy client_sessions_owner_all on public.client_sessions
  for all using (exists (select 1 from public.clients c
    join public.profiles p on p.id = c.profile_id
    where c.id = client_sessions.client_id and p.user_id = auth.uid()::text));
create policy media_owner_all on public.profile_media
  for all using (exists (select 1 from public.profiles p
    where p.id = profile_media.profile_id and p.user_id = auth.uid()::text));
create policy services_owner_all on public.services
  for all using (exists (select 1 from public.profiles p
    where p.id = services.profile_id and p.user_id = auth.uid()::text));
create policy notes_owner_all on public.therapist_private_session_notes
  for all using (exists (select 1 from public.profiles p
    where p.id = therapist_private_session_notes.profile_id and p.user_id = auth.uid()::text));
create policy feedback_owner_read on public.client_private_feedback
  for select using (exists (select 1 from public.profiles p
    where p.id = client_private_feedback.profile_id and p.user_id = auth.uid()::text));
create policy match_results_owner_read on public.match_results
  for select using (exists (select 1 from public.profiles p
    where p.id = match_results.profile_id and p.user_id = auth.uid()::text));
create policy payments_owner_read on public.payments
  for select using (exists (select 1 from public.profiles p
    where p.id = payments.profile_id and p.user_id = auth.uid()::text));
create policy subscriptions_owner_read on public.subscriptions
  for select using (exists (select 1 from public.profiles p
    where p.id = subscriptions.profile_id and p.user_id = auth.uid()::text));
