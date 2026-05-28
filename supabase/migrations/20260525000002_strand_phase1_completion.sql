create table if not exists saved_profiles (
  id uuid primary key default gen_random_uuid(),
  client_user_id uuid not null references users(id) on delete cascade,
  model_profile_id uuid not null references model_profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (client_user_id, model_profile_id)
);

alter table if exists model_profiles
  add column if not exists subscription_summary text;

alter table saved_profiles enable row level security;
alter table state_compliance_rules
  drop constraint if exists state_compliance_rules_state_code_key;

create policy saved_profiles_client_all on saved_profiles
  for all using (auth.uid() = client_user_id) with check (auth.uid() = client_user_id);

create policy saved_profiles_support_read on saved_profiles
  for select using (app_role_for(auth.uid()) in ('support', 'admin'));

create index if not exists saved_profiles_client_created_idx
  on saved_profiles(client_user_id, created_at desc);
create unique index if not exists state_compliance_rules_state_city_unique
  on state_compliance_rules (state_code, coalesce(city_name, ''));

insert into state_compliance_rules (state_code, state_name, city_name, disclaimer, is_active)
values
  (
    'new-south-wales',
    'New South Wales',
    null,
    'Listings, moderation, and profile settings for New South Wales should be reviewed against local advertising and platform obligations before launch.',
    true
  ),
  (
    'new-south-wales',
    'New South Wales',
    'Sydney',
    'Sydney launch copy and directory filters should be checked for local advertising, verification, and harm-minimisation requirements.',
    true
  ),
  (
    'victoria',
    'Victoria',
    null,
    'Victorian profile publication and moderation workflows may require state-specific review before public release.',
    true
  ),
  (
    'victoria',
    'Victoria',
    'Melbourne',
    'Melbourne category wording, disclaimers, and report flows should be validated before launch.',
    true
  ),
  (
    'queensland',
    'Queensland',
    null,
    'Queensland onboarding and marketing disclosures must be checked with counsel before launch.',
    true
  ),
  (
    'western-australia',
    'Western Australia',
    null,
    'Western Australia listing visibility and moderation escalation requirements need legal verification before launch.',
    true
  )
on conflict do nothing;
