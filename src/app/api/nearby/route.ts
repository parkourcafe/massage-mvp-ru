import { legacyApiDisabled } from "@/lib/strand/api";

export const dynamic = "force-dynamic";

export async function POST() {
  return legacyApiDisabled(
    "nearby search",
    "Location-aware discovery should be reintroduced only after STRAND compliance and privacy rules are verified.",
  );
}

