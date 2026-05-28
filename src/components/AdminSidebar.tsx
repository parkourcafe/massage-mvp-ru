import Link from "next/link";
import { getI18n } from "@/lib/i18n/server";

export async function AdminSidebar() {
  const { locale } = await getI18n();
  const items =
    locale === "ru"
      ? [
          { href: "/admin", label: "Обзор" },
          { href: "/admin/kyc", label: "Очередь KYC" },
          { href: "/admin/media", label: "Проверка медиа" },
          { href: "/admin/payments", label: "Платежи" },
          { href: "/admin/reports", label: "Репорты" },
        ]
      : [
          { href: "/admin", label: "Overview" },
          { href: "/admin/kyc", label: "KYC queue" },
          { href: "/admin/media", label: "Media review" },
          { href: "/admin/payments", label: "Payments" },
          { href: "/admin/reports", label: "Reports" },
        ];

  return (
    <aside className="rounded-[28px] border border-white/10 bg-white/5 p-5">
      <p className="eyebrow">{locale === "ru" ? "Админ shell" : "Admin shell"}</p>
      <nav className="mt-5 grid gap-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-2xl border border-transparent px-4 py-3 text-sm text-body transition-colors hover:border-white/10 hover:bg-white/[0.04] hover:text-heading"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
