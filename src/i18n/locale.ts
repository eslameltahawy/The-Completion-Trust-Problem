export const LOCALES = ["en", "ar"] as const;

export type Locale = (typeof LOCALES)[number];

export const LOCALE_COOKIE = "ctp_locale";

export function parseLocale(value: string | undefined | null): Locale {
  return value === "ar" ? "ar" : "en";
}

export function safeReturnPath(value: string) {
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return "/";
  return value;
}
