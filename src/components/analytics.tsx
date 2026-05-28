"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, type ComponentProps } from "react";
import { trackEvent } from "@/lib/analytics";

// Route-level page_view. Fires on first load and every client navigation.
export function Analytics() {
  const pathname = usePathname();
  useEffect(() => {
    trackEvent("page_view", { path: pathname });
  }, [pathname]);
  return null;
}

// A next/link that also reports a conversion event on click.
export function TrackedLink({
  event,
  eventParams,
  onClick,
  ...props
}: ComponentProps<typeof Link> & {
  event: string;
  eventParams?: Record<string, unknown>;
}) {
  return (
    <Link
      {...props}
      onClick={(e) => {
        trackEvent(event, eventParams);
        onClick?.(e);
      }}
    />
  );
}
