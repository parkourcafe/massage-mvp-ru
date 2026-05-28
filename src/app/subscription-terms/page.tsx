import { redirect } from "next/navigation";

export default function SubscriptionTermsRedirectPage() {
  redirect("/account/subscriptions");
}

