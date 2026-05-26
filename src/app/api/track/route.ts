import { legacyApiDisabled } from "@/lib/strand/api";

export const dynamic = "force-dynamic";

export async function POST() {
  return legacyApiDisabled(
    "legacy tracking",
    "Analytics events should be redefined for STRAND after privacy and consent requirements are confirmed.",
  );
}
