import { legacyApiDisabled } from "@/lib/strand/api";

export const dynamic = "force-dynamic";

export async function POST() {
  return legacyApiDisabled(
    "client feedback",
    "Feedback and review mechanics should be designed separately after trust and moderation flows are verified.",
  );
}

