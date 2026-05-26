import type { ReactNode } from "react";

export function EmptyState({
  title,
  text,
  action,
}: {
  title: string;
  text: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-[28px] border border-dashed border-white/15 bg-white/[0.03] p-8 text-center">
      <h3 className="text-3xl text-heading">{title}</h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-body">{text}</p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}

