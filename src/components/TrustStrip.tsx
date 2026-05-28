import type { Messages } from "@/lib/i18n/messages";

export function TrustStrip({
  messages,
}: {
  messages: Messages;
}) {
  return (
    <div className="border-y border-white/10 bg-white/[0.03]">
      <div className="container-px flex flex-wrap items-center gap-x-6 gap-y-3 py-4 text-xs uppercase tracking-[0.18em] text-secondary">
        {messages.trustStrip.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
    </div>
  );
}
