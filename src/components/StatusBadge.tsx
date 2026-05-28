import type { ReactNode } from "react";

const toneMap = {
  neutral: "border-white/10 bg-white/5 text-body",
  success: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
  warning: "border-amber-400/20 bg-amber-400/10 text-amber-200",
  danger: "border-rose-400/20 bg-rose-400/10 text-rose-200",
  accent: "border-[#d7c3a2]/25 bg-[#d7c3a2]/10 text-[#f0e2c7]",
};

export function StatusBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: keyof typeof toneMap;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] ${toneMap[tone]}`}
    >
      {children}
    </span>
  );
}

