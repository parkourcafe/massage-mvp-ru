import { legacyApiDisabled } from "@/lib/strand/api";

export const dynamic = "force-dynamic";

export async function GET() {
  return legacyApiDisabled(
    "bookings",
    "Public directory and subscriptions come first. Booking creation is deferred beyond Phase 1.",
  );
}

export async function POST() {
  return legacyApiDisabled(
    "bookings",
    "Public directory and subscriptions come first. Booking creation is deferred beyond Phase 1.",
  );
}

