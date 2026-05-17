"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminAction({
  label,
  payload,
  variant = "ghost",
}: {
  label: string;
  payload: Record<string, unknown>;
  variant?: "primary" | "secondary" | "ghost";
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const cls =
    variant === "primary"
      ? "btn-primary"
      : variant === "secondary"
        ? "btn-secondary"
        : "btn-ghost";
  return (
    <button
      className={`${cls} text-xs`}
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await fetch("/api/admin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        setBusy(false);
        router.refresh();
      }}
    >
      {label}
    </button>
  );
}
