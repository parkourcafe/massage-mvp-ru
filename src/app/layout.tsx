import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});
import { SafetyNotice, SiteFooter, SiteHeader } from "@/components/Chrome";
import { AIPalette } from "@/components/AIPalette";
import { Analytics } from "@/components/analytics";
import { Grain } from "@/components/effects";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
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
  appleWebApp: {
    capable: true,
    title: SITE_NAME,
    statusBarStyle: "black-translucent",
  },
  ...(yandexVerification
    ? { verification: { yandex: yandexVerification } }
    : {}),
};

export const viewport: Viewport = {
  themeColor: "#0c080d",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={`${serif.variable} ${sans.variable}`}>
      <body className="min-h-screen flex flex-col">
        <ServiceWorkerRegister />
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
        <Analytics />
        <Grain />
        <SafetyNotice />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <AIPalette />
        <SiteFooter />
      </body>
    </html>
  );
}
