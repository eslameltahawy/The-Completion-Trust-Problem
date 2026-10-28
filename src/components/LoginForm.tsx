"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/actions/auth";
import { useLocale } from "@/i18n/LocaleContext";
import { copy } from "@/i18n/messages";
import { SubmitButton } from "./SubmitButton";

export function LoginForm() {
  const t = copy(useLocale());
  const [state, action] = useActionState(loginAction, { error: "" });
  return (
    <form action={action} className="grid gap-4">
      <label className="field">
        <span>{t.email}</span>
        <input name="email" type="email" autoComplete="username" required />
      </label>
      <label className="field">
        <span>{t.password}</span>
        <input name="password" type="password" autoComplete="current-password" required />
      </label>
      {state.error ? (
        <p role="alert" className="text-red">
          {state.error}
        </p>
      ) : null}
      <SubmitButton pendingLabel={t.signingIn}>{t.signIn}</SubmitButton>
    </form>
  );
}
