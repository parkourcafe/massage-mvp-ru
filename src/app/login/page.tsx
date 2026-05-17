import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { AuthForm } from "@/components/AuthForm";

export function generateMetadata(): Metadata {
  return pageMetadata({ title: "Вход", path: "/login", noindex: true });
}

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
