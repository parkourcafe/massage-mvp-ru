import type { ReactNode } from "react";

export function FormField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-heading">{label}</span>
      {children}
      {hint ? <span className="text-xs leading-6 text-secondary">{hint}</span> : null}
    </label>
  );
}

