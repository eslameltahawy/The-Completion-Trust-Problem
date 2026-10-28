"use server";

import { redirect } from "next/navigation";
import { isDomainError } from "@/domain/errors";
import { publicError } from "@/i18n/errors";
import { getLocale } from "@/i18n/get-locale";
import { login, logout } from "@/server/auth";
import { rethrowIfRedirect } from "@/server/http";

export async function loginAction(_prev: { error: string }, formData: FormData) {
  try {
    const user = await login(String(formData.get("email") ?? ""), String(formData.get("password") ?? ""));
    redirect(user.role === "reviewer" ? "/portal/reviewer" : "/portal/student");
  } catch (error) {
    rethrowIfRedirect(error);
    const locale = await getLocale();
    return { error: publicError(locale, error, "Sign-in failed.") };
  }
}

export async function loginFromForm(formData: FormData) {
  const result = await loginAction({ error: "" }, formData);
  if (result?.error) {
    redirect(`/portal/login?error=${encodeURIComponent(result.error)}`);
  }
}

export async function logoutAction() {
  await logout();
  redirect("/");
}
