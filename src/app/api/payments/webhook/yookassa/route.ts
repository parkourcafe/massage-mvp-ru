import { NextResponse } from "next/server";
import { getPaymentByProviderId, markPaymentSucceeded } from "@/lib/db";
import { verifyYooKassaPayment } from "@/lib/yookassa";
import { nowIso } from "@/lib/util";

export const dynamic = "force-dynamic";

// YooKassa sends { event: "payment.succeeded", object: { id, ... } }.
// We re-verify the payment status server-side before activating Pro.
// Pro is NEVER activated by the frontend redirect alone.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const providerId: string | undefined =
    body?.object?.id || body?.providerPaymentId;
  const event: string = body?.event || "payment.succeeded";

  if (!providerId) {
    return NextResponse.json(
      { error: "Нет идентификатора платежа" },
      { status: 400 }
    );
  }

  const payment = getPaymentByProviderId(providerId);
  if (!payment) {
    return NextResponse.json({ error: "Платёж не найден" }, { status: 404 });
  }

  if (event === "payment.canceled") {
    payment.status = "cancelled";
    payment.updated_at = nowIso();
    return NextResponse.json({ ok: true, status: "cancelled" });
  }

  // Re-verify with the provider before activating the subscription.
  const verified = await verifyYooKassaPayment(providerId);
  if (!verified.paid) {
    return NextResponse.json(
      { ok: false, error: "Платёж не подтверждён" },
      { status: 402 }
    );
  }

  const sub = markPaymentSucceeded(providerId);
  return NextResponse.json({
    ok: true,
    subscription: sub
      ? { status: sub.status, plan: sub.plan_id, expires_at: sub.expires_at }
      : null,
  });
}
