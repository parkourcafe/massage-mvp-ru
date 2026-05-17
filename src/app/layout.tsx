import type { Metadata } from "next";
import "./globals.css";
import { SafetyNotice, SiteFooter, SiteHeader } from "@/components/Chrome";
import { JsonLd } from "@/components/JsonLd";
import { organizationJsonLd, websiteJsonLd } from "@/lib/jsonld";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

const yandexVerification = process.env.YANDEX_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — профессиональный массаж`,
    template: `%s — ${SITE_NAME}`,
  },
  description:
    "AI-платформа для независимых профессиональных массажистов и клиентов. Только оздоровительный и лечебный массаж.",
  ...(yandexVerification
    ? { verification: { yandex: yandexVerification } }
    : {}),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="min-h-screen flex flex-col">
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
        <SafetyNotice />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
