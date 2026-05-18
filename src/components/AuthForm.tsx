"use client";

import { useState } from "react";
import Link from "next/link";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const isSignup = mode === "signup";
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const body: Record<string, string> = {
      email: String(fd.get("email") ?? ""),
      password: String(fd.get("password") ?? ""),
    };
    if (isSignup) body.full_name = String(fd.get("full_name") ?? "");

    const res = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const j = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok) {
      window.location.href = j.role === "admin" ? "/admin/profiles" : "/dashboard";
    } else {
      setError(j.error ?? "Не удалось. Попробуйте ещё раз.");
    }
  }

  return (
    <div className="container-px py-24 max-w-md">
      <div className="eyebrow">
        {isSignup ? "Для специалистов" : "Личный кабинет"}
      </div>
      <h1 className="h1 mt-6">
        {isSignup ? "Регистрация специалиста" : "Вход"}
      </h1>
      <p className="mt-4 text-sm text-secondary">
        {isSignup
          ? "Создайте аккаунт массажиста и заполните профиль."
          : "Войдите в личный кабинет."}
      </p>

      <form onSubmit={submit} className="card mt-8 space-y-4">
        {error && (
          <p className="rounded-lg bg-accent-soft text-accent text-sm px-3 py-2">
            {error}
          </p>
        )}
        {isSignup && (
          <div>
            <label className="label">Имя и фамилия</label>
            <input name="full_name" className="input" required minLength={2} />
          </div>
        )}
        <div>
          <label className="label">Email</label>
          <input name="email" type="email" className="input" required />
        </div>
        <div>
          <label className="label">Пароль</label>
          <input
            name="password"
            type="password"
            className="input"
            required
            minLength={isSignup ? 8 : 1}
          />
          {isSignup && (
            <p className="text-xs text-secondary mt-1">Минимум 8 символов.</p>
          )}
        </div>
        <button className="btn-primary w-full" disabled={busy}>
          {busy ? "…" : isSignup ? "Зарегистрироваться" : "Войти"}
        </button>
      </form>

      <p className="mt-6 text-sm text-secondary">
        {isSignup ? (
          <>
            Уже есть аккаунт?{" "}
            <Link href="/login" className="text-accent hover:underline">
              Войти
            </Link>
          </>
        ) : (
          <>
            Нет аккаунта?{" "}
            <Link href="/signup" className="text-accent hover:underline">
              Зарегистрироваться
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
