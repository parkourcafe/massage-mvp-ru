import { NextResponse } from "next/server";
import { cancelSubscription, getOwnerProfile } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST() {
  const owner = await getOwnerProfile();
  const sub = await cancelSubscription(owner.id);
  if (!sub)
    return NextResponse.json(
      { error: "Активная подписка не найдена" },
      { status: 404 }
    );
  return NextResponse.json({ ok: true, status: sub.status });
}
