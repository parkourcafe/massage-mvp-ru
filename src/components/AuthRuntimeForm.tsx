"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useLocaleMessages } from "@/components/LocaleProvider";
import type { UserRole } from "@/lib/strand/types";

type AuthMode = "login" | "signup" | "forgot";

export function AuthRuntimeForm() {
  const router = useRouter();
  const { locale } = useLocaleMessages();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("team@strand.example");
  const [password, setPassword] = useState("preview-password");
  const [role, setRole] = useState<UserRole>("client");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const copy =
    locale === "ru"
      ? {
          email: "Email",
          password: "Пароль",
          role: "Тип аккаунта",
          login: "Вход",
          signup: "Регистрация",
          forgot: "Сброс пароля",
          continue: "Продолжить",
          sendReset: "Отправить ссылку",
          client: "Клиент",
          model: "Модель",
          ageNote:
            "Аккаунты платформы доступны только пользователям 18+. Preview fallback остаётся отдельным dev-layer и не подменяет DB-backed role model.",
          successFallback:
            "Запрос выполнен. Если включён preview fallback, production email delivery ещё не активна.",
        }
      : {
          email: "Email address",
          password: "Password",
          role: "Account type",
          login: "Log in",
          signup: "Sign up",
          forgot: "Forgot password",
          continue: "Continue",
          sendReset: "Send reset link",
          client: "Client",
          model: "Model",
          ageNote:
            "Platform accounts are limited to 18+ users. Preview fallback remains a separate development layer and does not replace the DB-backed role model.",
          successFallback:
            "Request completed. If preview fallback is active, production email delivery is not enabled yet.",
        };

  async function submit() {
    setMessage(null);

    const path =
      mode === "forgot"
        ? "/api/auth/forgot-password"
        : mode === "signup"
          ? "/api/auth/signup"
          : "/api/auth/login";

    const body =
      mode === "forgot"
        ? { email }
        : { email, password, role };

    const response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = (await response.json().catch(() => null)) as
      | { error?: string; note?: string }
      | null;

    if (!response.ok) {
      setMessage(payload?.error ?? "Request failed.");
      return;
    }

    setMessage(payload?.note ?? copy.successFallback);
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="grid gap-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <button
          type="button"
          className={mode === "login" ? "btn-primary" : "btn-ghost"}
          onClick={() => setMode("login")}
        >
          {copy.login}
        </button>
        <button
          type="button"
          className={mode === "signup" ? "btn-primary" : "btn-ghost"}
          onClick={() => setMode("signup")}
        >
          {copy.signup}
        </button>
        <button
          type="button"
          className={mode === "forgot" ? "btn-primary" : "btn-ghost"}
          onClick={() => setMode("forgot")}
        >
          {copy.forgot}
        </button>
      </div>
      <label className="grid gap-2">
        <span className="text-sm font-medium text-heading">{copy.email}</span>
        <input
          className="field"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="name@example.com"
        />
      </label>
      {mode === "forgot" ? null : (
        <>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-heading">{copy.password}</span>
            <input
              className="field"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={copy.password}
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-heading">{copy.role}</span>
            <select
              className="field"
              value={role}
              onChange={(event) => setRole(event.target.value as UserRole)}
            >
              <option value="client">{copy.client}</option>
              <option value="model">{copy.model}</option>
            </select>
          </label>
        </>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          className="btn-primary"
          disabled={isPending}
          onClick={submit}
        >
          {mode === "forgot" ? copy.sendReset : copy.continue}
        </button>
      </div>
      <div className="rounded-[22px] border border-white/10 bg-white/5 p-4 text-sm leading-7 text-body">
        {copy.ageNote}
      </div>
      {message ? (
        <div className="rounded-[22px] border border-[#d7c3a2]/25 bg-[#d7c3a2]/10 p-4 text-sm text-body">
          {message}
        </div>
      ) : null}
    </div>
  );
}
