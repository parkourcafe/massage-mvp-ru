import { legacyApiDisabled } from "@/lib/strand/api";

export const dynamic = "force-dynamic";

export async function POST() {
  return legacyApiDisabled(
    "legacy dashboard private notes",
    "Studio notes and message systems are not part of STRAND Phase 1.",
  );
}

