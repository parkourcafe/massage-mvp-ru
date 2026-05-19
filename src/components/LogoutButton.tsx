"use client";

export function LogoutButton() {
  return (
    <button
      type="button"
      className="mt-2 block w-full rounded-lg border-t border-line px-3 py-2 text-left text-secondary transition-colors hover:bg-accent-soft hover:text-accent"
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        window.location.href = "/login";
      }}
    >
      Выйти
    </button>
  );
}
