"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useLocaleMessages } from "@/components/LocaleProvider";
import { getRoleLabel } from "@/lib/i18n/labels";
import type { UserRole } from "@/lib/strand/types";

export function PreviewAuthPanel({
  currentRole,
  currentSource,
}: {
  currentRole: string;
  currentSource: string;
}) {
  const router = useRouter();
  const { locale, messages } = useLocaleMessages();
  const [selectedRole, setSelectedRole] = useState<UserRole>("client");
  const [email, setEmail] = useState("preview@strand.example");
  const [password, setPassword] = useState("preview-password");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const roles: UserRole[] = ["client", "model", "kyc_reviewer", "support", "admin"];
  const copy =
    locale === "ru"
      ? {
          roleTexts: {
            guest: "Гостевой режим без привилегированного доступа к защищённым разделам.",
            client:
              "Просмотр профилей, управление подписками и проверка состояний приватного доступа.",
            model:
              "Прохождение онбординга, KYC, проверки медиа и публикационных контролей.",
            kyc_reviewer:
              "Проверка очереди верификаций и обработка состояний approve/reject.",
            support:
              "Просмотр moderation- и payment-control поверхностей с ограниченным доступом.",
            admin:
              "Полный admin shell для модерации, risk и payment oversight.",
          },
          previewUpdatedSuffix: "Обновляю role-gated разделы.",
          currentContext: "Текущий контекст",
          placeholderEmail: "name@example.com",
          sourceLabels: {
            database: "база данных",
            preview: "preview",
            anonymous: "анонимно",
          },
        }
      : {
          roleTexts: {
            guest: "Guest mode without privileged access to protected sections.",
            client:
              "Browse profiles, manage subscriptions, and review private access states.",
            model:
              "Complete onboarding, KYC, media review, and publication controls.",
            kyc_reviewer:
              "Review verification queues and handle approval or rejection states.",
            support:
              "Inspect moderation and payment-control surfaces with limited operational access.",
            admin:
              "Open the full admin shell for moderation, risk, and payment oversight.",
          },
          previewUpdatedSuffix: "Refreshing role-gated sections.",
          currentContext: "Current context",
          placeholderEmail: "name@example.com",
          sourceLabels: {
            database: "database",
            preview: "preview",
            anonymous: "anonymous",
          },
        };

  async function submit(path: "/api/auth/login" | "/api/auth/signup") {
    setMessage(null);
    const response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role: selectedRole }),
    });
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      setMessage(payload?.error ?? messages.common.previewAuthFailed);
      return;
    }

    setMessage(
      `${messages.common.previewAccessUpdated}: ${payload?.role ?? selectedRole}. ${copy.previewUpdatedSuffix}`,
    );
    startTransition(() => {
      router.refresh();
    });
  }

  async function logout() {
    setMessage(null);
    await fetch("/api/auth/logout", { method: "POST" });
    setMessage(messages.common.previewSessionCleared);
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="grid gap-5">
      <div className="rounded-[22px] border border-white/10 bg-white/5 p-4 text-sm leading-7 text-body">
        {copy.currentContext}: <span className="text-heading">{currentRole}</span>{" "}
        {messages.common.via}{" "}
        <span className="text-heading">
          {copy.sourceLabels[currentSource as keyof typeof copy.sourceLabels] ?? currentSource}
        </span>.
      </div>
      <div className="flex flex-wrap gap-3">
        {roles.map((role) => (
          <button
            key={role}
            type="button"
            onClick={() => setSelectedRole(role)}
            className={`rounded-full border px-4 py-2 text-sm transition-colors ${
              selectedRole === role
                ? "border-[#d7c3a2]/40 bg-[#d7c3a2]/10 text-heading"
                : "border-white/10 text-body"
            }`}
          >
            {getRoleLabel(locale, role)}
          </button>
        ))}
      </div>
      <div className="rounded-[22px] border border-white/10 bg-white/5 p-4 text-sm leading-7 text-body">
        {copy.roleTexts[selectedRole]}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <input
          className="field"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={copy.placeholderEmail}
        />
        <input
          className="field"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder={messages.common.previewPassword}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <button
          type="button"
          className={mode === "login" ? "btn-primary" : "btn-ghost"}
          onClick={() => setMode("login")}
        >
          {messages.common.loginPreview}
        </button>
        <button
          type="button"
          className={mode === "signup" ? "btn-primary" : "btn-ghost"}
          onClick={() => setMode("signup")}
        >
          {messages.common.signupPreview}
        </button>
        <button type="button" className="btn-secondary" onClick={logout}>
          {messages.common.signOut}
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          className="btn-primary"
          disabled={isPending}
          onClick={() => submit(mode === "login" ? "/api/auth/login" : "/api/auth/signup")}
        >
          {mode === "login"
            ? messages.common.applyPreviewLogin
            : messages.common.applyPreviewSignup}
        </button>
        <button
          type="button"
          className="btn-ghost"
          disabled={isPending}
          onClick={() => {
            startTransition(() => router.refresh());
          }}
        >
          {messages.common.refreshAccessState}
        </button>
      </div>
      {message ? (
        <div className="rounded-[22px] border border-[#d7c3a2]/25 bg-[#d7c3a2]/10 p-4 text-sm text-body">
          {message}
        </div>
      ) : null}
    </div>
  );
}
