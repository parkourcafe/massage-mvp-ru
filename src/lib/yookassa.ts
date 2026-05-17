// YooKassa wrapper (Russia MVP). When not configured, returns a mock
// checkout URL that points at the local confirm endpoint so the full
// create → confirm(webhook) → activate flow can be exercised offline.
// IMPORTANT: Pro is activated ONLY by the verified webhook/backend,
// never by the frontend redirect.

const shopId = process.env.YOOKASSA_SHOP_ID;
const secretKey = process.env.YOOKASSA_SECRET_KEY;

export const isYooKassaConfigured = Boolean(shopId && secretKey);

export interface CreatedPayment {
  providerPaymentId: string;
  confirmationUrl: string;
}

export async function createYooKassaPayment(params: {
  amountRub: number;
  description: string;
  metadata: Record<string, string>;
  returnUrl: string;
  localProviderId: string;
}): Promise<CreatedPayment> {
  if (!isYooKassaConfigured) {
    // Mock checkout: a page that simulates the bank, then the success
    // page calls the webhook server-side. No activation on redirect alone.
    return {
      providerPaymentId: params.localProviderId,
      confirmationUrl: `/dashboard/billing/mock-checkout?pid=${encodeURIComponent(
        params.localProviderId
      )}`,
    };
  }

  const idempotenceKey = params.localProviderId;
  const res = await fetch("https://api.yookassa.ru/v3/payments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotence-Key": idempotenceKey,
      Authorization:
        "Basic " +
        Buffer.from(`${shopId}:${secretKey}`).toString("base64"),
    },
    body: JSON.stringify({
      amount: { value: params.amountRub.toFixed(2), currency: "RUB" },
      capture: true,
      confirmation: { type: "redirect", return_url: params.returnUrl },
      description: params.description,
      metadata: params.metadata,
    }),
  });
  if (!res.ok) {
    throw new Error(`YooKassa error: ${res.status}`);
  }
  const data = await res.json();
  return {
    providerPaymentId: data.id,
    confirmationUrl: data.confirmation?.confirmation_url,
  };
}

// Webhook signature/authenticity: in production, verify the request
// originates from YooKassa (IP allowlist + fetch payment status from the
// API). Here we re-check status server-side before activating.
export async function verifyYooKassaPayment(
  providerPaymentId: string
): Promise<{ paid: boolean }> {
  if (!isYooKassaConfigured) {
    // Mock: trust the server-side confirm call (no client-only path).
    return { paid: true };
  }
  const res = await fetch(
    `https://api.yookassa.ru/v3/payments/${providerPaymentId}`,
    {
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(`${shopId}:${secretKey}`).toString("base64"),
      },
    }
  );
  if (!res.ok) return { paid: false };
  const data = await res.json();
  return { paid: data.status === "succeeded" && data.paid === true };
}
