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
    <div className="container-px py-8 grid lg:grid-cols-[220px_1fr] gap-8">
      <aside>
        <nav className="space-y-1 text-sm sticky top-4">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="block rounded-lg px-3 py-2 text-slate-700 hover:bg-brand-50 hover:text-brand-700"
            >
              {n.label}
            </Link>
          ))}
          <LogoutButton />
        </nav>
      </aside>
      <section className="min-w-0">{children}</section>
    </div>
  );
}
