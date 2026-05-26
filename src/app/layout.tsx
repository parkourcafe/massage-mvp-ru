import type { Metadata } from "next";
import { LocaleProvider } from "@/components/LocaleProvider";
import { PublicFooter } from "@/components/PublicFooter";
import { PublicHeader } from "@/components/PublicHeader";
import { getI18n } from "@/lib/i18n/server";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://strand.example"),
  title: {
    default: "STRAND",
    template: `%s | STRAND`,
  },
  description:
    "Premium, privacy-first Australian 18+ companion marketplace MVP foundation.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { locale, messages } = await getI18n();

  return (
    <html lang={locale}>
      <body className="min-h-screen flex flex-col">
        <LocaleProvider locale={locale} messages={messages}>
          <PublicHeader messages={messages} />
          <main className="flex-1">{children}</main>
          <PublicFooter messages={messages} />
        </LocaleProvider>
      </body>
    </html>
  );
}
