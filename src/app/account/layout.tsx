import { AccessGateNotice } from "@/components/AccessGateNotice";
import { getLocale } from "@/lib/i18n/server";
import { resolveRoleAccess } from "@/lib/strand/authz";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const access = await resolveRoleAccess(["client", "admin", "support"], {
    previewRole: "client",
  });

  return (
    <>
      <AccessGateNotice
        access={access}
        title={locale === "ru" ? "Кабинет клиента" : "Client account"}
      />
      {access.hasAccess ? children : null}
    </>
  );
}
