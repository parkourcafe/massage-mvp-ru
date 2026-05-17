"use client";

import { useEffect, useRef } from "react";

export function Tracking({
  profileId,
  path,
}: {
  profileId: string;
  path?: string;
}) {
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    const body = JSON.stringify({ type: "view", profileId, path });
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
      /* tracking is best-effort */
    }
  }, [profileId, path]);
  return null;
}
