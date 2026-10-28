"use client";

import { createContext, useContext } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { setLocaleAction } from "@/app/actions/locale";
import type { Locale } from "./locale";

const LocaleContext = createContext<Locale>("en");

export function LocaleProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  return useContext(LocaleContext);
}

export function LanguageSwitch({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const search = useSearchParams();
  const query = search.toString();
  const returnTo = query ? `${pathname}?${query}` : pathname;

  return (
    <form action={setLocaleAction} className="flex items-center gap-1 text-sm">
      <input type="hidden" name="returnTo" value={returnTo} />
      <button
        className={`rounded-full px-2.5 py-1 font-semibold ${locale === "en" ? "bg-ink text-white" : "text-muted"}`}
        name="locale"
        value="en"
        type="submit"
        aria-pressed={locale === "en"}
      >
        English
      </button>
      <button
        className={`rounded-full px-2.5 py-1 font-semibold ${locale === "ar" ? "bg-ink text-white" : "text-muted"}`}
        name="locale"
        value="ar"
        type="submit"
        aria-pressed={locale === "ar"}
      >
        العربية
      </button>
    </form>
  );
}
