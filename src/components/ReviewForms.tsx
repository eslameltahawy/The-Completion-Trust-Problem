"use client";

import { useActionState } from "react";
import { reviewAction, revokeAction } from "@/app/actions/review";
import { useLocale } from "@/i18n/LocaleContext";
import { copy } from "@/i18n/messages";
import { SubmitButton } from "./SubmitButton";

export function ReviewForm({ attemptId, allowReturn }: { attemptId: string; allowReturn: boolean }) {
  const t = copy(useLocale());
  const [state, action] = useActionState(reviewAction, { error: "" });
  return (
    <form action={action} className="grid gap-3">
      <input type="hidden" name="attemptId" value={attemptId} />
      <fieldset className="grid gap-2">
        <legend className="font-semibold">{t.decision}</legend>
        <label className="flex gap-2">
          <input type="radio" name="decision" value="approve" required />
          {t.approve}
        </label>
        <label className="flex gap-2">
          <input type="radio" name="decision" value="reject" />
          {t.reject}
        </label>
        {allowReturn ? (
          <label className="flex gap-2">
            <input type="radio" name="decision" value="return" />
            {t.returnReview}
          </label>
        ) : null}
      </fieldset>
      <label className="field">
        <span>{t.reason}</span>
        <textarea name="reason" required minLength={12} rows={4} />
      </label>
      <p className="text-sm text-muted">{t.reasonHelp}</p>
      {state.error ? (
        <p role="alert" className="text-red">
          {state.error}
        </p>
      ) : null}
      <SubmitButton tone="teal" pendingLabel={t.savingDecision}>
        {t.saveDecision}
      </SubmitButton>
    </form>
  );
}

export function RevokeForm({ attemptId, publicId }: { attemptId: string; publicId: string }) {
  const t = copy(useLocale());
  const [state, action] = useActionState(revokeAction, { error: "" });
  return (
    <form action={action} className="grid gap-3">
      <input type="hidden" name="attemptId" value={attemptId} />
      <input type="hidden" name="publicId" value={publicId} />
      <label className="field">
        <span>{t.revokeReason}</span>
        <textarea name="reason" required minLength={12} rows={4} />
      </label>
      {state.error ? (
        <p role="alert" className="text-red">
          {state.error}
        </p>
      ) : null}
      <SubmitButton tone="ghost" pendingLabel={t.revoking}>
        {t.revoke}
      </SubmitButton>
    </form>
  );
}
