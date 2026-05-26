const baseUrl = process.env.STRAND_VERIFY_BASE_URL || "http://127.0.0.1:3000";
const password = "StrandDemo!2026";

const accounts = {
  client: "seed.client@strand.demo",
  admin: "seed.admin@strand.demo",
  model: "seed.ava@strand.demo",
};

function getSetCookieArray(headers) {
  if (typeof headers.getSetCookie === "function") {
    return headers.getSetCookie();
  }

  const single = headers.get("set-cookie");
  return single ? [single] : [];
}

function buildCookieHeader(headers) {
  return getSetCookieArray(headers)
    .map((cookie) => cookie.split(";")[0])
    .join("; ");
}

async function login(email, role) {
  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, role }),
  });

  const body = await response.text();
  if (!response.ok) {
    throw new Error(`login failed for ${email}: ${response.status} ${body}`);
  }

  return buildCookieHeader(response.headers);
}

async function requestJson(url, init = {}) {
  const response = await fetch(url, init);
  const body = await response.text();
  let parsed = null;

  try {
    parsed = JSON.parse(body);
  } catch {
    parsed = body;
  }

  return {
    status: response.status,
    body: parsed,
  };
}

async function main() {
  const publicProfiles = await requestJson(`${baseUrl}/api/profiles`);
  if (publicProfiles.status !== 200 || !Array.isArray(publicProfiles.body.profiles)) {
    throw new Error("public profiles endpoint did not return a profile array");
  }

  const clientCookie = await login(accounts.client, "client");
  const clientSavedProfiles = await requestJson(`${baseUrl}/api/account/saved-profiles`, {
    headers: { cookie: clientCookie },
  });
  const clientPrivacy = await requestJson(`${baseUrl}/api/account/privacy`, {
    headers: { cookie: clientCookie },
  });

  const modelCookie = await login(accounts.model, "model");
  const modelProfile = await requestJson(`${baseUrl}/api/studio/profile`, {
    headers: { cookie: modelCookie },
  });
  const modelMedia = await requestJson(`${baseUrl}/api/studio/media`, {
    headers: { cookie: modelCookie },
  });
  const modelKyc = await requestJson(`${baseUrl}/api/studio/kyc`, {
    headers: { cookie: modelCookie },
  });

  const adminCookie = await login(accounts.admin, "admin");
  const adminKyc = await requestJson(`${baseUrl}/api/admin/kyc`, {
    headers: { cookie: adminCookie },
  });
  const adminMedia = await requestJson(`${baseUrl}/api/admin/media`, {
    headers: { cookie: adminCookie },
  });
  const adminReports = await requestJson(`${baseUrl}/api/admin/reports`, {
    headers: { cookie: adminCookie },
  });

  const checks = {
    publicProfiles:
      publicProfiles.status === 200 &&
      publicProfiles.body.profiles.length >= 2,
    clientSavedProfiles:
      clientSavedProfiles.status === 200 &&
      Array.isArray(clientSavedProfiles.body.profiles) &&
      clientSavedProfiles.body.profiles.length >= 2,
    clientPrivacy:
      clientPrivacy.status === 200 &&
      clientPrivacy.body.settings?.discreetBilling === true,
    modelProfile:
      modelProfile.status === 200 &&
      modelProfile.body.profile?.slug === "ava-mercer-sydney",
    modelMedia:
      modelMedia.status === 200 &&
      Array.isArray(modelMedia.body.assets) &&
      modelMedia.body.assets.length >= 2,
    modelKyc:
      modelKyc.status === 200 &&
      modelKyc.body.verification?.status === "approved",
    adminKyc:
      adminKyc.status === 200 &&
      Array.isArray(adminKyc.body.applicants) &&
      adminKyc.body.applicants.length >= 2,
    adminMedia:
      adminMedia.status === 200 &&
      Array.isArray(adminMedia.body.assets) &&
      adminMedia.body.assets.length >= 2,
    adminReports:
      adminReports.status === 200 &&
      Array.isArray(adminReports.body.cases) &&
      adminReports.body.cases.length >= 2,
  };

  const failed = Object.entries(checks).filter(([, ok]) => !ok);
  if (failed.length) {
    throw new Error(`verification failed: ${failed.map(([key]) => key).join(", ")}`);
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        checks,
        sample: {
          publicProfiles: publicProfiles.body.profiles.length,
          clientSavedProfiles: clientSavedProfiles.body.profiles.length,
          adminCases: adminReports.body.cases.length,
        },
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
