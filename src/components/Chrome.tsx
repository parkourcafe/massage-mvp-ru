import Link from "next/link";
import { PLATFORM_NOTICE, SITE_NAME } from "@/lib/seo";

export function SafetyNotice() {
  return (
    <div className="bg-brand-700 text-white text-center text-xs sm:text-sm py-2 px-4">
      {PLATFORM_NOTICE}
    </div>
  );
}

export function SiteHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="container-px flex h-16 items-center justify-between">
        <Link href="/" className="text-lg font-bold text-brand-700">
          {SITE_NAME}
        </Link>
        <nav className="hidden md:flex items-center gap-5 text-sm text-slate-600">
          <Link href="/therapists" className="hover:text-brand-700">
            Специалисты
          </Link>
          <Link href="/match" className="hover:text-brand-700">
            AI-подбор
          </Link>
          <Link href="/examples" className="hover:text-brand-700">
            Примеры
          </Link>
          <Link href="/pricing" className="hover:text-brand-700">
            Тарифы
          </Link>
          <Link href="/favorites" className="hover:text-brand-700">
            Избранное
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="btn-ghost">
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
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="container-px py-8 text-sm text-slate-500">
        <p className="font-medium text-slate-700">{SITE_NAME}</p>
        <p className="mt-1 max-w-2xl">{PLATFORM_NOTICE}</p>
        <div className="mt-4 flex flex-wrap gap-4">
          <Link href="/therapists">Специалисты</Link>
          <Link href="/pricing">Тарифы</Link>
          <Link href="/examples">Примеры</Link>
          <Link href="/match">AI-подбор</Link>
          <Link href="/dashboard/support">Поддержка</Link>
        </div>
        <p className="mt-4 text-xs">
          Платформа предоставляет только профессиональные оздоровительные и
          лечебные массажные услуги. Запрещён эротический, интимный и любой
          «специальный» контент.
        </p>
      </div>
    </footer>
  );
}
