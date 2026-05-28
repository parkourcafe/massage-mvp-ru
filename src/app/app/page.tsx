import { redirect } from "next/navigation";

export default function LegacyAppRedirectPage() {
  redirect("/directory");
}

