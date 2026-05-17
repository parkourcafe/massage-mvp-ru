import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { AuthForm } from "@/components/AuthForm";

export function generateMetadata(): Metadata {
  return pageMetadata({ title: "Регистрация", path: "/signup", noindex: true });
}

export default function SignupPage() {
  return <AuthForm mode="signup" />;
}
