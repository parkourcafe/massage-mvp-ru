"use client";

import type { ContactChannel } from "@/lib/types";

export function ContactLinks({
  profileId,
  contacts,
}: {
  profileId: string;
  contacts: { label: string; href: string; channel: ContactChannel }[];
}) {
  function track(channel: ContactChannel) {
    const body = JSON.stringify({ type: "click", profileId, channel });
    try {
      const blob = new Blob([body], { type: "application/json" });
      if (!navigator.sendBeacon?.("/api/track", blob)) {
        void fetch("/api/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
          keepalive: true,
        });
      }
    } catch {
      /* best-effort */
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {contacts.map((c) => (
        <a
          key={c.label}
          href={c.href}
          target="_blank"
          rel="nofollow noopener noreferrer"
          className="btn-secondary btn-sm"
          onClick={() => track(c.channel)}
        >
          {c.label}
        </a>
      ))}
    </div>
  );
}
