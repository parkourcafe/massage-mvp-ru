import { getI18n } from "@/lib/i18n/server";

export async function ComplianceDisclaimer({
  title = "Compliance note",
  body,
}: {
  title?: string;
  body: string;
}) {
  const { messages } = await getI18n();

  return (
    <div className="rounded-[24px] border border-[#d7c3a2]/22 bg-[#d7c3a2]/8 p-5">
      <p className="eyebrow text-[#f0e2c7]">
        {title === "Compliance note" ? messages.common.complianceTitle : title}
      </p>
      <p className="mt-3 text-sm leading-7 text-body">{body}</p>
      <p className="mt-3 text-xs leading-6 text-secondary">
        {messages.common.complianceFooter}
      </p>
    </div>
  );
}
