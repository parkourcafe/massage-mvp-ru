import Link from "next/link";
import type { Messages } from "@/lib/i18n/messages";
import type { Locale } from "@/lib/i18n/types";
import { TrustStrip } from "./TrustStrip";

export function PublicFooter({
  messages,
}: {
  messages: Messages;
}) {
  const footerLinks = [
    { href: "/legal/terms", label: messages.footer.terms },
    { href: "/legal/privacy", label: messages.footer.privacy },
    { href: "/legal/18-plus", label: messages.footer.agePolicy },
    { href: "/legal/report-a-concern", label: messages.footer.report },
  ];

  return (
    <footer className="border-t border-white/10 bg-[#110d0b]">
      <TrustStrip messages={messages} />
      <div className="container-px grid gap-10 py-10 sm:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="font-serif text-2xl text-heading">STRAND</p>
          <p className="mt-3 max-w-xl text-sm leading-7 text-body">
            {messages.footer.description}
          </p>
          <p className="mt-4 text-xs uppercase tracking-[0.2em] text-secondary">
            {messages.footer.notice}
          </p>
        </div>
        <div className="grid gap-3 text-sm text-body">
          {footerLinks.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-heading">
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
