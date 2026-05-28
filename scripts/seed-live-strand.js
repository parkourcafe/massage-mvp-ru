const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

function loadEnvFile() {
  const envPath = path.join(process.cwd(), ".env.local");
  const content = fs.readFileSync(envPath, "utf8");
  return Object.fromEntries(
    content
      .split(/\n+/)
      .filter(Boolean)
      .map((line) => {
        const index = line.indexOf("=");
        return [line.slice(0, index), line.slice(index + 1)];
      }),
  );
}

const env = loadEnvFile();
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing Supabase env in .env.local");
}

const client = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const defaultPassword = "StrandDemo!2026";
const now = new Date().toISOString();

const privacySettings = {
  discreetBilling: true,
  marketingOptIn: false,
  showActiveSubscriptions: false,
  notifyOnModerationActions: true,
};

const modelSeeds = [
  {
    key: "ava",
    email: "seed.ava@strand.demo",
    displayName: "Ava Mercer",
    state: "New South Wales",
    city: "Sydney",
    slug: "ava-mercer-sydney",
    shortBio:
      "Private, polished profile with a focus on discretion, presentation, and clear expectations.",
    longBio:
      "Ava presents a calm, premium profile designed for private browsing. Her profile structure emphasises verified status, moderation review, and respectful boundaries rather than sensational copy.",
    availability: "Evenings and selected weekends",
    subscriptionPrice: 89,
    publicationStatus: "live",
    kycStatus: "approved",
    isFeatured: true,
    publishedAt: now,
    subscriptionSummary:
      "Active subscribers can access approved private media while their subscription remains active.",
  },
  {
    key: "clara",
    email: "seed.clara@strand.demo",
    displayName: "Clara Vale",
    state: "Victoria",
    city: "Melbourne",
    slug: "clara-vale-melbourne",
    shortBio:
      "Premium profile built around privacy, elegant presentation, and a structured subscription experience.",
    longBio:
      "Clara's profile demonstrates the publication gate: verified identity, approved media, and a premium narrative that remains restrained and professional.",
    availability: "Weekday afternoons",
    subscriptionPrice: 79,
    publicationStatus: "live",
    kycStatus: "approved",
    isFeatured: true,
    publishedAt: now,
    subscriptionSummary:
      "Subscribers receive access to approved private media while access remains active.",
  },
  {
    key: "isla",
    email: "seed.isla@strand.demo",
    displayName: "Isla Rowe",
    state: "Queensland",
    city: "Brisbane",
    slug: "isla-rowe-brisbane",
    shortBio:
      "Under-review profile showing the pre-live states for KYC and media approval.",
    longBio:
      "Isla's profile is intentionally not live. It illustrates how the MVP should present a polished draft without implying full verification or publication.",
    availability: "Awaiting publication",
    subscriptionPrice: 69,
    publicationStatus: "pending_media_review",
    kycStatus: "pending",
    isFeatured: false,
    publishedAt: null,
    subscriptionSummary:
      "Subscription access will become available after KYC and media review are completed.",
  },
];

const nonModelUsers = [
  {
    key: "client",
    email: "seed.client@strand.demo",
    displayName: "Seed Client",
    role: "client",
  },
  {
    key: "admin",
    email: "seed.admin@strand.demo",
    displayName: "Seed Admin",
    role: "admin",
  },
];

const stateComplianceRules = [
  {
    state_code: "new-south-wales",
    state_name: "New South Wales",
    city_name: null,
    disclaimer:
      "Listings, moderation, and profile settings for New South Wales should be reviewed against local advertising and platform obligations before launch.",
    is_active: true,
  },
  {
    state_code: "new-south-wales",
    state_name: "New South Wales",
    city_name: "Sydney",
    disclaimer:
      "Sydney launch copy and directory filters should be checked for local advertising, verification, and harm-minimisation requirements.",
    is_active: true,
  },
  {
    state_code: "victoria",
    state_name: "Victoria",
    city_name: null,
    disclaimer:
      "Victorian profile publication and moderation workflows may require state-specific review before public release.",
    is_active: true,
  },
  {
    state_code: "victoria",
    state_name: "Victoria",
    city_name: "Melbourne",
    disclaimer:
      "Melbourne category wording, disclaimers, and report flows should be validated before launch.",
    is_active: true,
  },
  {
    state_code: "queensland",
    state_name: "Queensland",
    city_name: null,
    disclaimer:
      "Queensland onboarding and marketing disclosures must be checked with counsel before launch.",
    is_active: true,
  },
  {
    state_code: "western-australia",
    state_name: "Western Australia",
    city_name: null,
    disclaimer:
      "Western Australia listing visibility and moderation escalation requirements need legal verification before launch.",
    is_active: true,
  },
];

function assertNoError(error, context) {
  if (error) {
    throw new Error(`${context}: ${error.message}`);
  }
}

function isMissingTableError(error) {
  return Boolean(
    error?.message?.includes("Could not find the table") ||
      error?.message?.includes("schema cache") ||
      error?.message?.includes("relation"),
  );
}

async function findAuthUserByEmail(email) {
  let page = 1;
  const perPage = 200;

  while (true) {
    const { data, error } = await client.auth.admin.listUsers({ page, perPage });
    assertNoError(error, `listUsers for ${email}`);

    const found = data.users.find((user) => user.email === email);
    if (found) return found;
    if (data.users.length < perPage) return null;
    page += 1;
  }
}

async function ensureAuthUser({ email, displayName }) {
  const existing = await findAuthUserByEmail(email);
  if (existing) return existing;

  const { data, error } = await client.auth.admin.createUser({
    email,
    password: defaultPassword,
    email_confirm: true,
    user_metadata: { display_name: displayName },
  });

  assertNoError(error, `create auth user ${email}`);
  return data.user;
}

async function ensurePublicUsers(seedUsers) {
  const payload = seedUsers.map((user) => ({
    id: user.id,
    role: user.role,
    email: user.email,
    display_name: user.displayName,
    age_confirmed_at: now,
    is_suspended: false,
  }));

  const { error } = await client.from("users").upsert(payload);
  assertNoError(error, "upsert public users");
}

async function ensureClientRow(clientUserId) {
  const { error } = await client.from("clients").upsert({
    user_id: clientUserId,
    saved_profile_count: 2,
    privacy_settings: privacySettings,
  });

  assertNoError(error, "upsert client row");
}

async function ensureModelProfiles(modelUsers) {
  const payload = modelUsers.map((model) => ({
    user_id: model.id,
    slug: model.slug,
    display_name: model.displayName,
    state: model.state,
    city: model.city,
    short_bio: model.shortBio,
    long_bio: model.longBio,
    availability: model.availability,
    subscription_price_aud: model.subscriptionPrice,
    publication_status: model.publicationStatus,
    kyc_status: model.kycStatus,
    is_featured: model.isFeatured,
    published_at: model.publishedAt,
    subscription_summary: model.subscriptionSummary,
  }));

  const { error } = await client
    .from("model_profiles")
    .upsert(payload, { onConflict: "user_id" });

  assertNoError(error, "upsert model profiles");

  const { data, error: selectError } = await client
    .from("model_profiles")
    .select("id, user_id, slug")
    .in("user_id", modelUsers.map((user) => user.id));

  assertNoError(selectError, "select model profiles");
  return Object.fromEntries(data.map((row) => [row.slug, row]));
}

async function tableExists(table) {
  const { error } = await client
    .from(table)
    .select("id", { count: "exact", head: true });

  return !error || !isMissingTableError(error);
}

async function clearSeedData({
  clientUserId,
  adminUserId,
  modelUserIds,
  profileIds,
}) {
  const { error: savedError } = await client
    .from("saved_profiles")
    .delete()
    .eq("client_user_id", clientUserId);
  assertNoError(savedError, "delete saved profiles");

  const { error: mediaError } = await client
    .from("media_assets")
    .delete()
    .in("model_profile_id", profileIds);
  assertNoError(mediaError, "delete media assets");

  const { error: kycError } = await client
    .from("kyc_verifications")
    .delete()
    .in("user_id", modelUserIds);
  assertNoError(kycError, "delete kyc verifications");

  const { error: caseError } = await client
    .from("moderation_cases")
    .delete()
    .eq("assigned_reviewer_id", adminUserId);
  assertNoError(caseError, "delete moderation cases");

  {
    const { error: auditError } = await client
      .from("audit_logs")
      .delete()
      .in("actor_user_id", [clientUserId, adminUserId, ...modelUserIds]);
    if (auditError && !isMissingTableError(auditError)) {
      assertNoError(auditError, "delete audit logs");
    }
  }

  {
    const { data: existingSubscriptions, error: subsError } = await client
      .from("client_subscriptions")
      .select("id")
      .eq("client_user_id", clientUserId);

    if (!subsError) {
      const subscriptionIds = (existingSubscriptions ?? []).map((item) => item.id);

      if (subscriptionIds.length) {
        const { error } = await client
          .from("subscription_events")
          .delete()
          .in("client_subscription_id", subscriptionIds);
        if (error && !isMissingTableError(error)) {
          assertNoError(error, "delete subscription events");
        }
      }

      const { error: paymentError } = await client
        .from("payment_transactions")
        .delete()
        .eq("client_user_id", clientUserId);
      if (paymentError && !isMissingTableError(paymentError)) {
        assertNoError(paymentError, "delete payment transactions");
      }

      const { error: entitlementError } = await client
        .from("entitlements")
        .delete()
        .eq("client_user_id", clientUserId);
      if (entitlementError && !isMissingTableError(entitlementError)) {
        assertNoError(entitlementError, "delete entitlements");
      }

      const { error: subsDeleteError } = await client
        .from("client_subscriptions")
        .delete()
        .eq("client_user_id", clientUserId);
      if (subsDeleteError && !isMissingTableError(subsDeleteError)) {
        assertNoError(subsDeleteError, "delete subscriptions");
      }
    } else if (!isMissingTableError(subsError)) {
      assertNoError(subsError, "select existing subscriptions");
    }
  }
}

async function seedKyc(modelUsersByKey, adminUserId) {
  const payload = [
    {
      user_id: modelUsersByKey.ava.id,
      status: "approved",
      government_id_file_path: "seed/ava/government-id",
      selfie_file_path: "seed/ava/selfie",
      reviewed_by: adminUserId,
      reviewed_at: now,
      submitted_at: now,
    },
    {
      user_id: modelUsersByKey.clara.id,
      status: "approved",
      government_id_file_path: "seed/clara/government-id",
      selfie_file_path: "seed/clara/selfie",
      reviewed_by: adminUserId,
      reviewed_at: now,
      submitted_at: now,
    },
    {
      user_id: modelUsersByKey.isla.id,
      status: "pending",
      government_id_file_path: "seed/isla/government-id",
      selfie_file_path: "seed/isla/selfie",
      submitted_at: now,
    },
  ];

  const { error } = await client.from("kyc_verifications").insert(payload);
  assertNoError(error, "insert kyc verifications");
}

async function seedMedia(profileBySlug) {
  const payload = [
    {
      model_profile_id: profileBySlug["ava-mercer-sydney"].id,
      storage_path: "seed/ava/public-1",
      media_kind: "image",
      visibility: "public",
      moderation_status: "approved",
      sort_order: 1,
      reviewed_at: now,
    },
    {
      model_profile_id: profileBySlug["ava-mercer-sydney"].id,
      storage_path: "seed/ava/public-2",
      media_kind: "image",
      visibility: "public",
      moderation_status: "approved",
      sort_order: 2,
      reviewed_at: now,
    },
    {
      model_profile_id: profileBySlug["ava-mercer-sydney"].id,
      storage_path: "seed/ava/private-1",
      media_kind: "image",
      visibility: "private",
      moderation_status: "approved",
      sort_order: 3,
      reviewed_at: now,
    },
    {
      model_profile_id: profileBySlug["ava-mercer-sydney"].id,
      storage_path: "seed/ava/private-2",
      media_kind: "video",
      visibility: "private",
      moderation_status: "approved",
      sort_order: 4,
      reviewed_at: now,
    },
    {
      model_profile_id: profileBySlug["clara-vale-melbourne"].id,
      storage_path: "seed/clara/public-1",
      media_kind: "image",
      visibility: "public",
      moderation_status: "approved",
      sort_order: 1,
      reviewed_at: now,
    },
    {
      model_profile_id: profileBySlug["clara-vale-melbourne"].id,
      storage_path: "seed/clara/private-1",
      media_kind: "image",
      visibility: "private",
      moderation_status: "approved",
      sort_order: 2,
      reviewed_at: now,
    },
    {
      model_profile_id: profileBySlug["isla-rowe-brisbane"].id,
      storage_path: "seed/isla/public-1",
      media_kind: "image",
      visibility: "public",
      moderation_status: "pending",
      sort_order: 1,
    },
    {
      model_profile_id: profileBySlug["isla-rowe-brisbane"].id,
      storage_path: "seed/isla/private-1",
      media_kind: "video",
      visibility: "private",
      moderation_status: "rejected",
      rejection_reason: "Framing requires resubmission.",
      sort_order: 2,
      reviewed_at: now,
    },
  ];

  const { data, error } = await client
    .from("media_assets")
    .insert(payload)
    .select("id, model_profile_id, storage_path, moderation_status");
  assertNoError(error, "insert media assets");

  {
    const { error: queueError } = await client.from("media_moderation_queue").insert(
      data.map((item) => ({
        media_asset_id: item.id,
        queue_status: item.moderation_status,
        reviewed_at: item.moderation_status === "pending" ? null : now,
      })),
    );
    if (queueError && !isMissingTableError(queueError)) {
      assertNoError(queueError, "insert media moderation queue");
    }
  }

  return Object.fromEntries(data.map((item) => [item.storage_path, item]));
}

async function seedSubscriptionsAndPayments(clientUserId, profileBySlug) {
  let skipped = false;
  const { data: subscriptions, error: subscriptionError } = await client
    .from("client_subscriptions")
    .insert([
      {
        client_user_id: clientUserId,
        model_profile_id: profileBySlug["ava-mercer-sydney"].id,
        status: "active",
        provider_subscription_id: "seed-sub-ava",
        starts_at: now,
        ends_at: "2026-06-30T12:00:00.000Z",
      },
      {
        client_user_id: clientUserId,
        model_profile_id: profileBySlug["clara-vale-melbourne"].id,
        status: "expired",
        provider_subscription_id: "seed-sub-clara",
        starts_at: "2026-04-01T12:00:00.000Z",
        ends_at: "2026-05-02T12:00:00.000Z",
      },
      {
        client_user_id: clientUserId,
        model_profile_id: profileBySlug["isla-rowe-brisbane"].id,
        status: "cancelled",
        provider_subscription_id: "seed-sub-isla",
        starts_at: "2026-04-10T12:00:00.000Z",
        ends_at: "2026-05-28T12:00:00.000Z",
        cancelled_at: "2026-05-10T12:00:00.000Z",
      },
    ])
    .select("id, model_profile_id, provider_subscription_id");
  if (subscriptionError) {
    if (isMissingTableError(subscriptionError)) {
      return { skipped: true };
    }
    assertNoError(subscriptionError, "insert subscriptions");
  }

  const byProviderId = Object.fromEntries(
    subscriptions.map((item) => [item.provider_subscription_id, item]),
  );

  {
    const { error: eventsError } = await client.from("subscription_events").insert([
      {
        client_subscription_id: byProviderId["seed-sub-ava"].id,
        event_type: "subscription_activated",
        payload: { source: "seed" },
      },
      {
        client_subscription_id: byProviderId["seed-sub-clara"].id,
        event_type: "subscription_expired",
        payload: { source: "seed" },
      },
      {
        client_subscription_id: byProviderId["seed-sub-isla"].id,
        event_type: "subscription_cancelled",
        payload: { source: "seed" },
      },
    ]);
    if (eventsError && !isMissingTableError(eventsError)) {
      assertNoError(eventsError, "insert subscription events");
    }
    if (eventsError && isMissingTableError(eventsError)) {
      skipped = true;
    }
  }

  const { data: entitlements, error: entitlementError } = await client
    .from("entitlements")
    .insert([
      {
        client_user_id: clientUserId,
        model_profile_id: profileBySlug["ava-mercer-sydney"].id,
        entitlement_type: "subscription",
        starts_at: now,
        ends_at: "2026-06-30T12:00:00.000Z",
        is_active: true,
      },
    ])
    .select("id");
  if (entitlementError && !isMissingTableError(entitlementError)) {
    assertNoError(entitlementError, "insert entitlements");
  }
  if (entitlementError && isMissingTableError(entitlementError)) {
    skipped = true;
  }

  const entitlementId = entitlements?.[0]?.id;

  const { data: avaMedia, error: avaMediaError } = await client
    .from("media_assets")
    .select("id")
    .eq("model_profile_id", profileBySlug["ava-mercer-sydney"].id)
    .eq("visibility", "private");
  assertNoError(avaMediaError, "select ava private media");

  if (entitlementId) {
    const { error: mediaEntitlementError } = await client
      .from("media_entitlements")
      .insert(
        (avaMedia ?? []).map((item) => ({
          entitlement_id: entitlementId,
          media_asset_id: item.id,
        })),
      );
    if (mediaEntitlementError && !isMissingTableError(mediaEntitlementError)) {
      assertNoError(mediaEntitlementError, "insert media entitlements");
    }
    if (mediaEntitlementError && isMissingTableError(mediaEntitlementError)) {
      skipped = true;
    }
  }

  const { error: paymentError } = await client.from("payment_transactions").insert([
    {
      client_subscription_id: byProviderId["seed-sub-ava"].id,
      client_user_id: clientUserId,
      model_profile_id: profileBySlug["ava-mercer-sydney"].id,
      provider_transaction_id: "seed-pay-ava",
      amount_aud: 89,
      status: "succeeded",
      occurred_at: "2026-05-18T12:00:00.000Z",
      metadata: { source: "seed" },
    },
    {
      client_subscription_id: byProviderId["seed-sub-clara"].id,
      client_user_id: clientUserId,
      model_profile_id: profileBySlug["clara-vale-melbourne"].id,
      provider_transaction_id: "seed-pay-clara",
      amount_aud: 79,
      status: "failed",
      occurred_at: "2026-05-05T12:00:00.000Z",
      metadata: { source: "seed" },
    },
    {
      client_subscription_id: byProviderId["seed-sub-isla"].id,
      client_user_id: clientUserId,
      model_profile_id: profileBySlug["isla-rowe-brisbane"].id,
      provider_transaction_id: "seed-pay-isla-refund",
      amount_aud: 69,
      status: "refunded",
      occurred_at: "2026-04-30T12:00:00.000Z",
      metadata: { source: "seed" },
    },
    {
      client_subscription_id: byProviderId["seed-sub-isla"].id,
      client_user_id: clientUserId,
      model_profile_id: profileBySlug["isla-rowe-brisbane"].id,
      provider_transaction_id: "seed-pay-isla-chargeback",
      amount_aud: 69,
      status: "chargeback",
      occurred_at: "2026-04-12T12:00:00.000Z",
      metadata: { source: "seed" },
    },
  ]);
  if (paymentError && !isMissingTableError(paymentError)) {
    assertNoError(paymentError, "insert payment transactions");
  }
  if (paymentError && isMissingTableError(paymentError)) {
    skipped = true;
  }

  {
    const { error: webhookError } = await client.from("payment_webhook_events").insert([
      {
        provider: "ccbill_placeholder",
        event_type: "seed.subscription_activated",
        signature: "seed-signature",
        payload: { provider_subscription_id: "seed-sub-ava" },
        processed_at: now,
      },
    ]);
    if (webhookError && !isMissingTableError(webhookError)) {
      assertNoError(webhookError, "insert payment webhook events");
    }
    if (webhookError && isMissingTableError(webhookError)) {
      skipped = true;
    }
  }

  return { skipped };
}

async function seedSavedProfiles(clientUserId, profileBySlug) {
  const { error } = await client.from("saved_profiles").insert([
    {
      client_user_id: clientUserId,
      model_profile_id: profileBySlug["ava-mercer-sydney"].id,
    },
    {
      client_user_id: clientUserId,
      model_profile_id: profileBySlug["clara-vale-melbourne"].id,
    },
  ]);
  assertNoError(error, "insert saved profiles");
}

async function seedModerationAndAudit({
  adminUserId,
  profileBySlug,
  mediaByPath,
}) {
  const { error: moderationError } = await client.from("moderation_cases").insert([
    {
      target_type: "profile",
      target_id: profileBySlug["isla-rowe-brisbane"].id,
      reason: "KYC review is still pending before any request to publish.",
      status: "in_review",
      priority: "high",
      assigned_reviewer_id: adminUserId,
      action_taken: "Publication remains blocked pending KYC approval.",
    },
    {
      target_type: "media",
      target_id: mediaByPath["seed/isla/private-1"].id,
      reason: "Media framing does not meet moderation requirements.",
      status: "open",
      priority: "medium",
      assigned_reviewer_id: adminUserId,
      action_taken: "Resubmission requested.",
    },
    {
      target_type: "message",
      target_id: null,
      reason: "Message moderation is out of Phase 1 scope, but the admin queue structure is present.",
      status: "resolved",
      priority: "low",
      assigned_reviewer_id: adminUserId,
      action_taken: "Queue structure retained for later implementation.",
    },
  ]);
  assertNoError(moderationError, "insert moderation cases");

  {
    const { error: auditError } = await client.from("audit_logs").insert([
      {
        actor_user_id: adminUserId,
        action: "admin_kyc_reviewed",
        target_table: "kyc_verifications",
        target_id: null,
        payload: { note: "Approved live seed profiles" },
      },
      {
        actor_user_id: adminUserId,
        action: "admin_media_reviewed",
        target_table: "media_assets",
        target_id: mediaByPath["seed/isla/private-1"].id,
        payload: { note: "Rejected media asset due to framing" },
      },
      {
        actor_user_id: adminUserId,
        action: "payment_chargeback_flagged",
        target_table: "payment_transactions",
        target_id: null,
        payload: { note: "Chargeback placeholder seeded for admin payments view" },
      },
    ]);
    if (auditError && !isMissingTableError(auditError)) {
      assertNoError(auditError, "insert audit logs");
    }
  }
}

async function seedComplianceRules() {
  const { data: existing, error: selectError } = await client
    .from("state_compliance_rules")
    .select("state_code, city_name");
  if (selectError && isMissingTableError(selectError)) {
    return { skipped: true };
  }
  assertNoError(selectError, "select state compliance rules");

  const existingKeys = new Set(
    (existing ?? []).map((item) => `${item.state_code}::${item.city_name ?? ""}`),
  );
  const missing = stateComplianceRules
    .filter(
      (item) =>
        !existingKeys.has(`${item.state_code}::${item.city_name ?? ""}`),
    )
    .map((item) => ({
      ...item,
      updated_at: now,
    }));

  if (missing.length) {
    const { error } = await client.from("state_compliance_rules").insert(missing);
    assertNoError(error, "insert state compliance rules");
  }

  return { skipped: false };
}

async function main() {
  const authUsers = {};
  const availableTables = Object.fromEntries(
    await Promise.all(
      [
        "client_subscriptions",
        "payment_transactions",
        "audit_logs",
        "state_compliance_rules",
        "media_moderation_queue",
        "entitlements",
        "media_entitlements",
        "payment_webhook_events",
        "subscription_events",
      ].map(async (table) => [table, await tableExists(table)]),
    ),
  );

  for (const seed of [...nonModelUsers, ...modelSeeds.map((model) => ({
    key: model.key,
    email: model.email,
    displayName: model.displayName,
    role: "model",
  }))]) {
    const authUser = await ensureAuthUser(seed);
    authUsers[seed.key] = {
      ...seed,
      id: authUser.id,
    };
  }

  await ensurePublicUsers([
    ...nonModelUsers.map((item) => authUsers[item.key]),
    ...modelSeeds.map((item) => ({
      ...authUsers[item.key],
      role: "model",
      displayName: item.displayName,
      email: item.email,
    })),
  ]);

  await ensureClientRow(authUsers.client.id);

  const modelUsersWithProfileData = modelSeeds.map((model) => ({
    ...model,
    id: authUsers[model.key].id,
    role: "model",
  }));

  const profilesBySlug = await ensureModelProfiles(modelUsersWithProfileData);

  await clearSeedData({
    clientUserId: authUsers.client.id,
    adminUserId: authUsers.admin.id,
    modelUserIds: modelUsersWithProfileData.map((item) => item.id),
    profileIds: Object.values(profilesBySlug).map((item) => item.id),
  });

  await seedKyc(
    Object.fromEntries(modelUsersWithProfileData.map((item) => [item.key, item])),
    authUsers.admin.id,
  );
  const mediaByPath = await seedMedia(profilesBySlug);
  const paymentsResult = await seedSubscriptionsAndPayments(
    authUsers.client.id,
    profilesBySlug,
  );
  await seedSavedProfiles(authUsers.client.id, profilesBySlug);
  await seedModerationAndAudit({
    adminUserId: authUsers.admin.id,
    profileBySlug: profilesBySlug,
    mediaByPath,
  });
  const complianceResult = await seedComplianceRules();

  console.log(
    JSON.stringify(
      {
        ok: true,
        password: defaultPassword,
        accounts: {
          client: nonModelUsers.find((item) => item.key === "client").email,
          admin: nonModelUsers.find((item) => item.key === "admin").email,
          model_live: modelSeeds.find((item) => item.key === "ava").email,
          model_pending: modelSeeds.find((item) => item.key === "isla").email,
        },
        skipped: {
          payments: paymentsResult.skipped,
          compliance: complianceResult.skipped,
        },
        availableTables,
        profiles: Object.keys(profilesBySlug),
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
