import { cookies } from "next/headers";
import { messages } from "./messages";
import type { Locale } from "./types";

export const LOCALE_COOKIE = "strand_locale";

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "en" || value === "ru";
}

export async function getLocale(): Promise<Locale> {
  const cookieLocale = cookies().get(LOCALE_COOKIE)?.value;
  if (isLocale(cookieLocale)) return cookieLocale;

  const defaultLocale = process.env.STRAND_DEFAULT_LOCALE;
  if (isLocale(defaultLocale)) return defaultLocale;

  return "ru";
}

export function getMessages(locale: Locale) {
  return messages[locale];
}

export async function getI18n() {
  const locale = await getLocale();
  return {
    locale,
    messages: getMessages(locale),
  };
}
