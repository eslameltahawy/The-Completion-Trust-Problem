"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/actions/auth";
import { SubmitButton } from "./SubmitButton";

export function LoginForm() {
  const [state, action] = useActionState(loginAction, { error: "" });
  return (
    <form action={action} className="grid gap-4">
      <label className="field">
        <span>Email</span>
        <input name="email" type="email" autoComplete="username" required />
      </label>
      <label className="field">
        <span>Password</span>
        <input name="password" type="password" autoComplete="current-password" required />
      </label>
      {state.error ? (
        <p role="alert" className="text-red">
          {state.error}
        </p>
      ) : null}
      <SubmitButton>Sign in</SubmitButton>
    </form>
  );
}
