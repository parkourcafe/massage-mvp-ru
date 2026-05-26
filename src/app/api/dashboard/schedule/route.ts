import { legacyApiDisabled } from "@/lib/strand/api";

export const dynamic = "force-dynamic";

export async function GET() {
  return legacyApiDisabled(
    "legacy dashboard schedule",
    "Scheduling and bookings are deferred in STRAND Phase 1.",
  );
}

export async function POST() {
  return legacyApiDisabled(
    "legacy dashboard schedule",
    "Scheduling and bookings are deferred in STRAND Phase 1.",
  );
}

