import { NextResponse } from "next/server";
import { getOwnerProfile, getSubscription } from "@/lib/db";
import { PLANS } from "@/lib/plans";

export const dynamic = "force-dynamic";

export async function GET() {
  const owner = getOwnerProfile();
  const sub = getSubscription(owner.id);
  return NextResponse.json({
    plan: owner.plan_id,
    subscription: sub
      ? {
          status: sub.status,
          plan_id: sub.plan_id,
          expires_at: sub.expires_at,
        }
      : null,
    proPrice: PLANS.pro.price_rub,
  });
}
