import { legacyApiDisabled } from "@/lib/strand/api";

export const dynamic = "force-dynamic";

export async function GET() {
  return legacyApiDisabled(
    "legacy dashboard media",
    "Use studio media routes and the new media_assets model instead.",
  );
}

export async function POST() {
  return legacyApiDisabled(
    "legacy dashboard media",
    "Use studio media routes and the new media_assets model instead.",
  );
}

