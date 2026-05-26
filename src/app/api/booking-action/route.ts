import { legacyApiDisabled } from "@/lib/strand/api";

export const dynamic = "force-dynamic";

export async function POST() {
  return legacyApiDisabled(
    "booking actions",
    "Booking and messaging workflows are out of scope for STRAND Phase 1.",
  );
}

