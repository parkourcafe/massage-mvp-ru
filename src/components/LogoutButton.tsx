"use client";

export function LogoutButton() {
  return (
    <button
      type="button"
      className="block w-full text-left rounded-lg px-3 py-2 text-slate-500 hover:bg-slate-100"
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        window.location.href = "/login";
      }}
    >
      Выйти
    </button>
  );
}
