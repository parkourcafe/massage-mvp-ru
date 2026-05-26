import { legacyApiDisabled } from "@/lib/strand/api";

export const dynamic = "force-dynamic";

export async function POST() {
  return legacyApiDisabled(
    "subscription cancellation",
    "Implement cancellation against client_subscriptions and entitlement revocation after real payment provider integration.",
    501,
  );
}
