"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocaleMessages } from "./LocaleProvider";

interface MobileFilterDrawerProps {
  states: { name: string; slug: string }[];
}

export function MobileFilterDrawer({ states }: MobileFilterDrawerProps) {
  const [open, setOpen] = useState(false);
  const { messages } = useLocaleMessages();

  return (
    <div className="lg:hidden">
      <button type="button" className="btn-secondary w-full" onClick={() => setOpen(true)}>
        {messages.common.openFilters}
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 bg-page/80 p-5 backdrop-blur-md">
          <div className="mx-auto max-w-md rounded-[28px] border border-white/10 bg-surface p-6 shadow-lift">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-2xl text-heading">{messages.common.browseByState}</h3>
              <button type="button" className="text-sm text-secondary" onClick={() => setOpen(false)}>
                {messages.common.close}
              </button>
            </div>
            <div className="mt-5 grid gap-3">
              {states.map((state) => (
                <Link
                  key={state.slug}
                  href={`/directory/${state.slug}`}
                  className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-body"
                  onClick={() => setOpen(false)}
                >
                  {state.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
