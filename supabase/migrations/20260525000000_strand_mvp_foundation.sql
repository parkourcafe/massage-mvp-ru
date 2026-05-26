create extension if not exists "pgcrypto";

create type app_role as enum ('guest', 'client', 'model', 'kyc_reviewer', 'support', 'admin');
create type kyc_status as enum ('not_started', 'pending', 'approved', 'rejected');
create type media_moderation_status as enum ('pending', 'approved', 'rejected', 'hidden');
create type subscription_status as enum ('pending', 'active', 'expired', 'cancelled', 'past_due');
create type payment_status as enum ('pending', 'succeeded', 'failed', 'renewal_due', 'refunded', 'chargeback');
create type moderation_case_status as enum ('open', 'in_review', 'resolved', 'escalated');
create type moderation_priority as enum ('low', 'medium', 'high', 'critical');
create type publication_status as enum ('draft', 'pending_kyc', 'pending_media_review', 'ready_to_publish', 'live', 'suspended');
create type entitlement_type as enum ('subscription', 'media');

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
  updated_at timestamptz not null default now()
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

create table if not exists entitlements (
  id uuid primary key default gen_random_uuid(),
  client_user_id uuid not null references users(id) on delete cascade,
  model_profile_id uuid not null references model_profiles(id) on delete cascade,
  entitlement_type entitlement_type not null,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists media_entitlements (
  id uuid primary key default gen_random_uuid(),
  entitlement_id uuid not null references entitlements(id) on delete cascade,
  media_asset_id uuid not null references media_assets(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (entitlement_id, media_asset_id)
);

create table if not exists client_subscriptions (
  id uuid primary key default gen_random_uuid(),
  client_user_id uuid not null references users(id) on delete cascade,
  model_profile_id uuid not null references model_profiles(id) on delete cascade,
  status subscription_status not null default 'pending',
  provider text not null default 'ccbill_placeholder',
  provider_subscription_id text,
  starts_at timestamptz,
  ends_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists payment_transactions (
  id uuid primary key default gen_random_uuid(),
  client_subscription_id uuid references client_subscriptions(id) on delete set null,
  client_user_id uuid not null references users(id) on delete cascade,
  model_profile_id uuid references model_profiles(id) on delete set null,
  provider text not null default 'ccbill_placeholder',
  provider_transaction_id text,
  amount_aud integer not null default 0 check (amount_aud >= 0),
  status payment_status not null default 'pending',
  occurred_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists payment_webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'ccbill_placeholder',
  event_type text not null,
  signature text,
  payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

comment on table payment_webhook_events is 'Verify CCBill signature formula against official documentation before production.';

create table if not exists subscription_events (
  id uuid primary key default gen_random_uuid(),
  client_subscription_id uuid not null references client_subscriptions(id) on delete cascade,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  client_user_id uuid not null references users(id) on delete cascade,
  model_user_id uuid not null references users(id) on delete cascade,
  status text not null default 'coming_later',
  created_at timestamptz not null default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_user_id uuid not null references users(id) on delete cascade,
  body text not null,
  moderation_status media_moderation_status not null default 'pending',
  created_at timestamptz not null default now()
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

create table if not exists media_moderation_queue (
  id uuid primary key default gen_random_uuid(),
  media_asset_id uuid not null unique references media_assets(id) on delete cascade,
  queue_status media_moderation_status not null default 'pending',
  queued_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references users(id) on delete set null,
  action text not null,
  target_table text not null,
  target_id uuid,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists state_compliance_rules (
  id uuid primary key default gen_random_uuid(),
  state_code text not null unique,
  state_name text not null,
  city_name text,
  disclaimer text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists model_profiles_state_city_idx on model_profiles(state, city);
create index if not exists model_profiles_publication_idx on model_profiles(publication_status, kyc_status);
create index if not exists media_assets_profile_visibility_idx on media_assets(model_profile_id, visibility, moderation_status);
create index if not exists client_subscriptions_client_idx on client_subscriptions(client_user_id, status);
create index if not exists payment_transactions_status_idx on payment_transactions(status, occurred_at desc);
create index if not exists moderation_cases_status_idx on moderation_cases(status, priority);
create index if not exists audit_logs_created_idx on audit_logs(created_at desc);

