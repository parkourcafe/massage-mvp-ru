-- ============================================================
-- v1 AI match persistence. A client questionnaire produces a
-- match_request and up to N ranked match_results. Therapists see
-- incoming matches for their profile. No sensitive health
-- profiling is stored — only explicitly entered fields.
-- ============================================================

create table if not exists match_requests (
  id                    uuid primary key default gen_random_uuid(),
  massage_goal          text,
  pain_or_focus_area    text,
  preferred_service_type text,
  city                  text,
  district              text,
  budget                integer,
  created_at            timestamptz not null default now()
);

create table if not exists match_results (
  id                     uuid primary key default gen_random_uuid(),
  request_id             uuid not null references match_requests(id) on delete cascade,
  profile_id             uuid not null references profiles(id) on delete cascade,
  rank                   integer not null,
  score                  integer not null,
  service_recommendation text,
  reasons                text[] not null default '{}',
  risks                  text[] not null default '{}',
  created_at             timestamptz not null default now()
);
create index if not exists match_results_profile_idx
  on match_results (profile_id, created_at);

alter table match_requests enable row level security;
alter table match_results  enable row level security;

create policy match_results_owner_read on match_results
  for select using (
    exists (
      select 1 from profiles p
      where p.id = match_results.profile_id and p.user_id = auth.uid()
    )
  );
