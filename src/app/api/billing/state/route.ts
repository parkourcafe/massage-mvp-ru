import { NextResponse } from "next/server";
import {
  listBillingHistory,
  listClientSubscriptions,
} from "@/lib/strand/repository";

export const dynamic = "force-dynamic";

export async function GET() {
  const [subscriptions, billingHistory] = await Promise.all([
    listClientSubscriptions(),
    listBillingHistory(),
  ]);

  return NextResponse.json({
    subscriptions,
    billingHistory,
  });
}
