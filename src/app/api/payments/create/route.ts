import { NextResponse } from "next/server";
import { z } from "zod";
import { createPayment, getOwnerProfile } from "@/lib/db";
import { createYooKassaPayment } from "@/lib/yookassa";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";

const schema = z.object({
  plan: z.enum(["pro", "expert"]),
  offerAccepted: z.boolean().optional(),
});

export async function POST(req: Request) {
  const owner = await getOwnerProfile();
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "Выберите тариф" }, { status: 400 });
  if (parsed.data.offerAccepted !== true) {
    return NextResponse.json(
      { error: "Подтвердите согласие с офертой и условиями подписки" },
      { status: 400 }
    );
  }

  const payment = await createPayment(owner.id, parsed.data.plan);

  const created = await createYooKassaPayment({
    amountRub: payment.amount_rub,
    description: `Подписка ${parsed.data.plan} — ${owner.full_name}`,
    metadata: { paymentId: payment.id, profileId: owner.id },
    returnUrl: `${SITE_URL}/dashboard/billing?return=1`,
    localProviderId: payment.provider_payment_id!,
  });

  return NextResponse.json({
    ok: true,
    confirmationUrl: created.confirmationUrl,
    providerPaymentId: created.providerPaymentId,
  });
}
