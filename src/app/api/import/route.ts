import { legacyApiDisabled } from "@/lib/strand/api";

export const dynamic = "force-dynamic";

export async function POST() {
  return legacyApiDisabled(
    "legacy AI import",
    "Profile import should be redesigned for STRAND studio onboarding and moderation requirements.",
  );
}

