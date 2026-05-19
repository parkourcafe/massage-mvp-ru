import type { Metadata } from "next";
import Link from "next/link";
import { NOINDEX } from "@/lib/seo";
import { requireAdmin } from "@/lib/auth/session";
import { LogoutButton } from "@/components/LogoutButton";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Админ-панель",
  robots: NOINDEX,
};

const NAV = [
  { href: "/admin/users", label: "Пользователи" },
  { href: "/admin/profiles", label: "Профили" },
  { href: "/admin/nearby", label: "Активны «Рядом»" },
  { href: "/admin/moderation", label: "Модерация" },
  { href: "/admin/payments", label: "Платежи" },
  { href: "/admin/subscriptions", label: "Подписки" },
  { href: "/admin/support-requests", label: "Поддержка" },
  { href: "/admin/seo", label: "SEO" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  return (
    <div className="container-px py-8 grid lg:grid-cols-[200px_1fr] gap-8">
      <aside>
        <p className="text-xs uppercase text-slate-400 mb-2">Админ</p>
        <nav className="space-y-1 text-sm sticky top-4">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="block rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100"
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
