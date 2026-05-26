import { AccessGateNotice } from "@/components/AccessGateNotice";
import { getLocale } from "@/lib/i18n/server";
import { resolveRoleAccess } from "@/lib/strand/authz";

export default async function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const access = await resolveRoleAccess(["model", "admin", "support"], {
    previewRole: "model",
  });

  return (
    <>
      <AccessGateNotice
        access={access}
        title={locale === "ru" ? "Кабинет модели" : "Model studio"}
      />
      {access.hasAccess ? children : null}
    </>
  );
}
