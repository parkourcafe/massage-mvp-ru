import { legacyApiDisabled } from "@/lib/strand/api";

export const dynamic = "force-dynamic";

export async function POST() {
  return legacyApiDisabled(
    "matching",
    "AI matching is not part of STRAND Phase 1. Use the public directory and state/city navigation instead.",
  );
}

