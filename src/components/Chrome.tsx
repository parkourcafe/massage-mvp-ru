import Link from "next/link";
import { PLATFORM_NOTICE, SITE_NAME } from "@/lib/seo";

export function SafetyNotice() {
  return (
    <div className="bg-brand-50 text-brand-800 text-center text-xs sm:text-sm py-2 px-4 border-b border-brand-100">
      {PLATFORM_NOTICE}
    </div>
  );
}

const NAV = [
  { href: "/therapists", label: "Специалисты" },
  { href: "/match", label: "AI-подбор" },
  { href: "/examples", label: "Примеры" },
  { href: "/pricing", label: "Тарифы" },
  { href: "/favorites", label: "Избранное" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-sand-200 bg-sand-50/85 backdrop-blur-md">
      <div className="container-px flex h-16 items-center justify-between">
        <Link
          href="/"
          className="font-serif text-xl font-bold tracking-tight text-brand-800"
        >
          {SITE_NAME}
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-sm text-ink-soft">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="transition-colors hover:text-brand-700"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="btn-ghost hidden sm:inline-flex">
            Кабинет
          </Link>
          <Link href="/dashboard/profile" className="btn-primary">
            Создать профиль
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-sand-200 bg-sand-100">
      <div className="container-px py-12 text-sm text-ink-muted">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div className="max-w-md">
            <p className="font-serif text-lg font-semibold text-ink">
              {SITE_NAME}
            </p>
            <p className="mt-2 leading-relaxed">{PLATFORM_NOTICE}</p>
          </div>
          <nav className="flex flex-wrap gap-x-8 gap-y-2 text-ink-soft">
            <Link href="/therapists" className="hover:text-brand-700">
              Специалисты
            </Link>
            <Link href="/pricing" className="hover:text-brand-700">
              Тарифы
            </Link>
            <Link href="/examples" className="hover:text-brand-700">
              Примеры
            </Link>
            <Link href="/match" className="hover:text-brand-700">
              AI-подбор
            </Link>
            <Link href="/dashboard/support" className="hover:text-brand-700">
              Поддержка
            </Link>
          </nav>
        </div>
        <p className="mt-8 border-t border-sand-200 pt-6 text-xs leading-relaxed">
          Платформа предоставляет только профессиональные оздоровительные и
          лечебные массажные услуги. Запрещён эротический, интимный и любой
          «специальный» контент.
        </p>
      </div>
    </footer>
  );
}
