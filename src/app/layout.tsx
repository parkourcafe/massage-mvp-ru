import type { Metadata } from "next";
import "./globals.css";
import { SafetyNotice, SiteFooter, SiteHeader } from "@/components/Chrome";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — профессиональный массаж`,
    template: `%s — ${SITE_NAME}`,
  },
  description:
    "AI-платформа для независимых профессиональных массажистов и клиентов. Только оздоровительный и лечебный массаж.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="min-h-screen flex flex-col">
        <SafetyNotice />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
