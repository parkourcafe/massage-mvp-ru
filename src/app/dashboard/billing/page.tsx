import { redirect } from "next/navigation";

export default function DashboardBillingRedirectPage() {
  redirect("/studio/subscriptions");
}

