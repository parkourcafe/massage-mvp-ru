import Link from "next/link";
import type { Messages } from "@/lib/i18n/messages";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function PublicHeader({
  messages,
}: {
  messages: Messages;
}) {
  const links = [
    { href: "/directory", label: messages.header.directory },
    { href: "/account", label: messages.header.account },
    { href: "/studio", label: messages.header.studio },
    { href: "/admin", label: messages.header.admin },
    { href: "/legal/18-plus", label: messages.header.agePolicy },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-page/90 backdrop-blur-xl">
      <div className="container-px flex min-h-[78px] items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="font-serif text-3xl tracking-[0.18em] text-heading">
            STRAND
          </span>
          <span className="hidden rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-secondary sm:inline-flex">
            {messages.header.marketLabel}
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-body lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-heading"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Link href="/auth" className="btn-ghost hidden sm:inline-flex">
            {messages.header.signIn}
          </Link>
          <Link href="/directory" className="btn-primary btn-sm">
            {messages.header.browseProfiles}
          </Link>
        </div>
      </div>
    </header>
  );
}
