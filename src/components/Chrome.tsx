import Link from "next/link";
import { PLATFORM_NOTICE, SITE_NAME } from "@/lib/seo";

export function SafetyNotice() {
  return (
    <div className="border-b border-line bg-surface px-4 py-2 text-center text-xs text-secondary sm:text-sm">
      {PLATFORM_NOTICE}
    </div>
  );
}

function LogoMark() {
  return (
    <span className="flex items-center gap-3">
      <svg
        width="34"
        height="34"
        viewBox="0 0 40 40"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="logo-lg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ec4889" />
            <stop offset="1" stopColor="#a35a9c" />
          </linearGradient>
        </defs>
        <circle
          cx="20"
          cy="20"
          r="19"
          stroke="currentColor"
          strokeWidth="0.75"
          opacity="0.35"
        />
        <path
          d="M11 14c0 6 4 9 9 11 5-2 9-5 9-11 0-3-2-5-5-5-2 0-3 1-4 2-1-1-2-2-4-2-3 0-5 2-5 5z"
          fill="url(#logo-lg)"
        />
      </svg>
      <span className="leading-none">
        <span className="block font-serif text-[22px] tracking-tight text-heading">
          {SITE_NAME}
          <span className="text-accent">.</span>
        </span>
        <span className="mt-1 block text-[9px] uppercase tracking-[0.32em] text-secondary">
          private practice · spb
        </span>
      </span>
    </span>
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
    <header className="sticky top-0 z-40 border-b border-line bg-page/70 backdrop-blur-xl">
      <div className="container-px flex h-[76px] items-center justify-between gap-6">
        <Link href="/" aria-label={SITE_NAME}>
          <LogoMark />
        </Link>
        <nav className="hidden items-center gap-8 text-[13px] text-body md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="border-b border-transparent pb-1 transition-colors hover:border-accent hover:text-heading"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="hidden text-[13px] text-body transition-colors hover:text-heading sm:inline-flex"
          >
            Войти
          </Link>
          <Link href="/dashboard/profile" className="btn-primary btn-sm">
            Создать профиль
          </Link>
        </div>
      </div>
    </header>
  );
}

const FOOTER_COLS: { title: string; links: { href: string; label: string }[] }[] =
  [
    {
      title: "Клиентам",
      links: [
        { href: "/therapists", label: "Найти массажиста" },
        { href: "/match", label: "AI-подбор" },
        { href: "/examples", label: "Примеры профилей" },
        { href: "/favorites", label: "Избранное" },
      ],
    },
    {
      title: "Мастерам",
      links: [
        { href: "/dashboard/profile", label: "Завести профиль" },
        { href: "/pricing", label: "Тарифы и комиссия" },
        { href: "/dashboard", label: "Личный кабинет" },
        { href: "/dashboard/support", label: "Поддержка" },
      ],
    },
    {
      title: "Платформа",
      links: [
        { href: "/offer", label: "Договор оферты" },
        { href: "/privacy", label: "Политика данных" },
        { href: "/terms", label: "Условия использования" },
        { href: "/subscription-terms", label: "Условия подписки" },
      ],
    },
  ];

export function SiteFooter() {
  return (
    <footer className="relative mt-24 border-t border-line bg-page">
      <div className="container-px pb-12 pt-24">
        <div className="mb-16 grid items-center gap-12 rounded-xl2 px-8 py-12 sm:grid-cols-[1.5fr_1fr] sm:px-12 bg-gradient-to-br from-plum-700 to-obsidian-2">
          <div>
            <p className="eyebrow !text-white/50">Вы — массажист?</p>
            <h2 className="mt-4 font-serif text-3xl font-medium leading-tight text-white sm:text-[44px]">
              Заведите свой <em className="text-accent">профиль</em>
              <br />и ведите практику здесь.
            </h2>
          </div>
          <div className="flex flex-col gap-3">
            <Link
              href="/dashboard/profile"
              className="btn-primary w-full justify-between"
            >
              <span>Завести профиль</span>
              <span aria-hidden="true">→</span>
            </Link>
            <p className="text-sm text-white/60">
              Без абонентской платы. Прозрачные тарифы для практики.
            </p>
          </div>
        </div>

        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          <div className="max-w-xs">
            <LogoMark />
            <p className="mt-6 text-sm leading-relaxed text-body">
              Платформа независимых массажистов. Без салонов, без посредников —
              только проверенные частные специалисты.
            </p>
          </div>
          {FOOTER_COLS.map((col) => (
            <div key={col.title}>
              <p className="eyebrow mb-4">{col.title}</p>
              <ul className="flex flex-col gap-2.5 text-sm text-body">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="transition-colors hover:text-heading"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <hr className="rule mt-14" />
        <div className="flex flex-col justify-between gap-2 pt-8 text-xs text-secondary sm:flex-row">
          <p>
            © {SITE_NAME}, {new Date().getFullYear()} · независимая платформа
          </p>
          <p className="max-w-xl leading-relaxed">{PLATFORM_NOTICE}</p>
        </div>
      </div>
    </footer>
  );
}
