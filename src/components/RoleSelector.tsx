"use client";

import { useState } from "react";
import { useLocaleMessages } from "./LocaleProvider";

export function RoleSelector() {
  const { locale } = useLocaleMessages();
  const [selected, setSelected] = useState("client");
  const options =
    locale === "ru"
      ? [
          {
            value: "client",
            label: "Клиент",
            text: "Просматривает профили, управляет подписками и контролирует приватный доступ.",
          },
          {
            value: "model",
            label: "Модель",
            text: "Проходит онбординг, отправляет KYC, загружает медиа и управляет публикацией.",
          },
        ]
      : [
          {
            value: "client",
            label: "Client",
            text: "Browse profiles, manage subscriptions, and control private access.",
          },
          {
            value: "model",
            label: "Model",
            text: "Complete onboarding, submit KYC, upload media, and manage publication.",
          },
        ];

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setSelected(option.value)}
            className={`rounded-full border px-4 py-2 text-sm transition-colors ${
              selected === option.value
                ? "border-[#d7c3a2]/40 bg-[#d7c3a2]/10 text-heading"
                : "border-white/10 text-body"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
      <div className="rounded-[22px] border border-white/10 bg-white/5 p-4 text-sm leading-7 text-body">
        {options.find((option) => option.value === selected)?.text}
      </div>
    </div>
  );
}
