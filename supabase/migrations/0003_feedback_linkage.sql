-- ============================================================
-- Link client private feedback to a CRM client so the owning
-- therapist can see feedback per client. Still never public:
-- only the service role / owning therapist (RLS in 0002) reads it.
-- ============================================================

alter table client_private_feedback
  add column if not exists client_id uuid references clients(id) on delete set null;

create index if not exists client_private_feedback_profile_idx
  on client_private_feedback (profile_id);
create index if not exists client_private_feedback_client_idx
  on client_private_feedback (client_id);

create index if not exists therapist_notes_profile_idx
  on therapist_private_session_notes (profile_id);
create index if not exists therapist_notes_client_idx
  on therapist_private_session_notes (client_id);
