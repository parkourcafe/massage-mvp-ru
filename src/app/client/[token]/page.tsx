import { redirect } from "next/navigation";

export default function ClientTokenRedirectPage() {
  redirect("/account");
}

