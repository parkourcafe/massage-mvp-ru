create extension if not exists "pgcrypto";

do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type app_role as enum ('guest', 'client', 'model', 'kyc_reviewer', 'support', 'admin');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'kyc_status') then
    create type kyc_status as enum ('not_started', 'pending', 'approved', 'rejected');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'media_moderation_status') then
    create type media_moderation_status as enum ('pending', 'approved', 'rejected', 'hidden');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'subscription_status') then
    create type subscription_status as enum ('pending', 'active', 'expired', 'cancelled', 'past_due');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'payment_status') then
    create type payment_status as enum ('pending', 'succeeded', 'failed', 'renewal_due', 'refunded', 'chargeback');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'moderation_case_status') then
    create type moderation_case_status as enum ('open', 'in_review', 'resolved', 'escalated');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'moderation_priority') then
    create type moderation_priority as enum ('low', 'medium', 'high', 'critical');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'publication_status') then
    create type publication_status as enum ('draft', 'pending_kyc', 'pending_media_review', 'ready_to_publish', 'live', 'suspended');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'entitlement_type') then
    create type entitlement_type as enum ('subscription', 'media');
  end if;
end
$$;

create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  role app_role not null default 'guest',
  email text,
  display_name text,
  age_confirmed_at timestamptz,
  is_suspended boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists clients (
  user_id uuid primary key references users(id) on delete cascade,
  saved_profile_count integer not null default 0,
  privacy_settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists model_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references users(id) on delete cascade,
  slug text not null unique,
  display_name text not null,
  state text not null,
  city text not null,
  short_bio text,
  long_bio text,
  availability text,
  subscription_price_aud integer not null default 0 check (subscription_price_aud >= 0),
  publication_status publication_status not null default 'draft',
  kyc_status kyc_status not null default 'not_started',
  is_featured boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  subscription_summary text
);

create table if not exists kyc_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  status kyc_status not null default 'pending',
  government_id_file_path text,
  selfie_file_path text,
  rejection_reason text,
  reviewed_by uuid references users(id) on delete set null,
  reviewed_at timestamptz,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists media_assets (
  id uuid primary key default gen_random_uuid(),
  model_profile_id uuid not null references model_profiles(id) on delete cascade,
  storage_path text not null,
  media_kind text not null check (media_kind in ('image', 'video')),
  visibility text not null check (visibility in ('public', 'private')),
  moderation_status media_moderation_status not null default 'pending',
  rejection_reason text,
  reviewed_by uuid references users(id) on delete set null,
  reviewed_at timestamptz,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists moderation_cases (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('profile', 'media', 'message')),
  target_id uuid,
  reason text not null,
  status moderation_case_status not null default 'open',
  priority moderation_priority not null default 'medium',
  assigned_reviewer_id uuid references users(id) on delete set null,
  action_taken text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists saved_profiles (
  id uuid primary key default gen_random_uuid(),
  client_user_id uuid not null references users(id) on delete cascade,
  model_profile_id uuid not null references model_profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (client_user_id, model_profile_id)
);
