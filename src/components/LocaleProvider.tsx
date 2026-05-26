"use client";

import { createContext, useContext } from "react";
import type { Messages } from "@/lib/i18n/messages";
import type { Locale } from "@/lib/i18n/types";

const LocaleContext = createContext<{ locale: Locale; messages: Messages } | null>(null);

export function LocaleProvider({
  locale,
  messages,
  children,
}: {
  locale: Locale;
  messages: Messages;
  children: React.ReactNode;
}) {
  return (
    <LocaleContext.Provider value={{ locale, messages }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocaleMessages() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocaleMessages must be used within LocaleProvider");
  }
  return context;
}

