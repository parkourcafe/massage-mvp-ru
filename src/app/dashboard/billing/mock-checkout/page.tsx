import { redirect } from "next/navigation";

export default function DashboardMockCheckoutRedirectPage() {
  redirect("/studio/subscriptions");
}

