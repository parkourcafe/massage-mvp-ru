import type { Metadata } from "next";
import { AccessGateNotice } from "@/components/AccessGateNotice";
import { getLocale } from "@/lib/i18n/server";
import { resolveRoleAccess } from "@/lib/strand/authz";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminAccessLayout>{children}</AdminAccessLayout>;
}

async function AdminAccessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const access = await resolveRoleAccess(
    ["admin", "kyc_reviewer", "support"],
    { previewRole: "admin" },
  );

  return (
    <>
      <AccessGateNotice
        access={access}
        title={locale === "ru" ? "Админ shell" : "Admin shell"}
      />
      {access.hasAccess ? children : null}
    </>
  );
}
