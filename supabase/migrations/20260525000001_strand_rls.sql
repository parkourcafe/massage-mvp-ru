alter table users enable row level security;
alter table clients enable row level security;
alter table model_profiles enable row level security;
alter table kyc_verifications enable row level security;
alter table media_assets enable row level security;
alter table entitlements enable row level security;
alter table media_entitlements enable row level security;
alter table client_subscriptions enable row level security;
alter table payment_transactions enable row level security;
alter table payment_webhook_events enable row level security;
alter table subscription_events enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table moderation_cases enable row level security;
alter table media_moderation_queue enable row level security;
alter table audit_logs enable row level security;
alter table state_compliance_rules enable row level security;

create or replace function app_role_for(uid uuid)
returns app_role
language sql
stable
as $$
  select role from users where id = uid
$$;

create policy users_self_select on users
  for select using (auth.uid() = id);

create policy clients_self_all on clients
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy model_profiles_public_read on model_profiles
  for select using (publication_status = 'live' and kyc_status = 'approved');

create policy model_profiles_owner_all on model_profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy kyc_owner_readwrite on kyc_verifications
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy kyc_reviewer_read on kyc_verifications
  for select using (app_role_for(auth.uid()) in ('kyc_reviewer', 'admin'));

create policy media_assets_public_read on media_assets
  for select using (
    visibility = 'public'
    and moderation_status = 'approved'
    and exists (
      select 1 from model_profiles p
      where p.id = media_assets.model_profile_id
        and p.publication_status = 'live'
        and p.kyc_status = 'approved'
    )
  );

create policy media_assets_owner_all on media_assets
  for all using (
    exists (
      select 1 from model_profiles p
      where p.id = media_assets.model_profile_id and p.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from model_profiles p
      where p.id = media_assets.model_profile_id and p.user_id = auth.uid()
    )
  );

create policy subscriptions_client_read on client_subscriptions
  for select using (auth.uid() = client_user_id);

create policy subscriptions_admin_read on client_subscriptions
  for select using (app_role_for(auth.uid()) in ('support', 'admin'));

create policy entitlements_client_read on entitlements
  for select using (auth.uid() = client_user_id);

create policy media_entitlements_client_read on media_entitlements
  for select using (
    exists (
      select 1 from entitlements e
      where e.id = media_entitlements.entitlement_id and e.client_user_id = auth.uid()
    )
  );

create policy payment_transactions_client_read on payment_transactions
  for select using (auth.uid() = client_user_id);

create policy state_compliance_public_read on state_compliance_rules
  for select using (is_active = true);

-- The remaining moderation, webhook, message, conversation, and audit tables
-- are intentionally service-role or elevated-role only for Phase 1. Access
-- should be added as workflows are implemented and verified.
