import type { Metadata } from "next";
import Link from "next/link";
import { NOINDEX } from "@/lib/seo";
import { requireUser } from "@/lib/auth/session";
import { LogoutButton } from "@/components/LogoutButton";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Личный кабинет",
  robots: NOINDEX,
};

const NAV = [
  { href: "/dashboard", label: "Обзор" },
  { href: "/dashboard/profile", label: "Профиль" },
  { href: "/dashboard/import", label: "AI-импорт" },
  { href: "/dashboard/media", label: "Медиа" },
  { href: "/dashboard/bookings", label: "Заявки" },
  { href: "/dashboard/schedule", label: "Расписание" },
  { href: "/dashboard/availability", label: "Доступность «Рядом»" },
  { href: "/dashboard/clients", label: "Клиенты (CRM)" },
  { href: "/dashboard/matches", label: "Подборы" },
  { href: "/dashboard/analytics", label: "Аналитика" },
  { href: "/dashboard/billing", label: "Подписка" },
  { href: "/dashboard/support", label: "Поддержка" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser();
  return (
    <div className="container-px grid gap-8 py-10 lg:grid-cols-[240px_1fr]">
      <aside>
        <div className="sticky top-24 rounded-xl2 border border-line bg-card p-4">
          <p className="eyebrow mb-3 px-3">Личный кабинет</p>
          <nav className="space-y-1 text-sm">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="block rounded-lg px-3 py-2 text-body transition-colors hover:bg-accent-soft hover:text-heading"
              >
                {n.label}
              </Link>
            ))}
            <LogoutButton />
          </nav>
        </div>
      </aside>
      <section className="min-w-0">{children}</section>
    </div>
  );
}
