import type { ReactNode } from "react";

interface AppShellProps {
  eyebrow?: string;
  title: string;
  intro: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function AppShell({
  eyebrow,
  title,
  intro,
  actions,
  children,
}: AppShellProps) {
  return (
    <div className="container-px py-10 sm:py-14">
      <div className="mb-8 flex flex-col gap-5 rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-soft sm:flex-row sm:items-end sm:justify-between sm:p-8">
        <div className="max-w-3xl">
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
          <h1 className="mt-3 text-4xl text-heading sm:text-5xl">{title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-body sm:text-base">
            {intro}
          </p>
        </div>
        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>
      {children}
    </div>
  );
}

