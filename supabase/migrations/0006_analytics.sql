-- ============================================================
-- Anonymous analytics (no PII): profile views, contact-channel
-- clicks, and an AI-call log. Service-role only (RLS denies by
-- default — no anon policy). Owning therapist reads aggregates
-- through the app layer.
-- ============================================================

create table if not exists profile_views (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references profiles(id) on delete cascade,
  path        text,
  created_at  timestamptz not null default now()
);
create index if not exists profile_views_profile_idx
  on profile_views (profile_id, created_at);

create table if not exists contact_clicks (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references profiles(id) on delete cascade,
  channel     text not null,  -- whatsapp|telegram|vk|instagram|website|booking
  created_at  timestamptz not null default now()
);
create index if not exists contact_clicks_profile_idx
  on contact_clicks (profile_id, created_at);

create table if not exists ai_generations (
  id          uuid primary key default gen_random_uuid(),
  task        text not null,
  used_openai boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table profile_views  enable row level security;
alter table contact_clicks enable row level security;
alter table ai_generations enable row level security;
