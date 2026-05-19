"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// Mobile navigation: the desktop <nav> is `hidden md:flex`, so without
// this the header has no nav links below 768px. Burger → full-screen
// Drama drawer.
export function MobileNav({
  items,
}: {
  items: { href: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label="Открыть меню"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="grid h-10 w-10 place-items-center rounded-full border border-line-strong text-heading"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          className="h-5 w-5"
          aria-hidden
        >
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex flex-col bg-page/95 backdrop-blur-xl"
          role="dialog"
          aria-modal="true"
          aria-label="Меню"
        >
          <div className="container-px flex h-[76px] items-center justify-between">
            <span className="font-serif text-xl text-heading">
              Меню
            </span>
            <button
              type="button"
              aria-label="Закрыть меню"
              onClick={() => setOpen(false)}
              className="grid h-10 w-10 place-items-center rounded-full border border-line-strong text-heading"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                className="h-5 w-5"
                aria-hidden
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          <nav className="container-px mt-4 flex flex-1 flex-col gap-1">
            {items.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="border-b border-line py-4 font-serif text-2xl text-heading transition-colors hover:text-accent"
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="container-px flex flex-col gap-3 pb-10 pt-4">
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="btn-secondary w-full"
            >
              Войти
            </Link>
            <Link
              href="/dashboard/profile"
              onClick={() => setOpen(false)}
              className="btn-primary w-full"
            >
              Создать профиль
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
