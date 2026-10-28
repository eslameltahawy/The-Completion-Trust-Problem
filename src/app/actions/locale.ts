"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LOCALE_COOKIE, parseLocale, safeReturnPath } from "@/i18n/locale";

export async function setLocaleAction(formData: FormData) {
  const locale = parseLocale(String(formData.get("locale") ?? ""));
  const jar = await cookies();
  jar.set(LOCALE_COOKIE, locale, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    secure: process.env.VERCEL === "1",
    maxAge: 60 * 60 * 24 * 365,
  });
  redirect(safeReturnPath(String(formData.get("returnTo") ?? "/")));
}
