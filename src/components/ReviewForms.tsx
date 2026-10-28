"use client";

import { useActionState } from "react";
import { reviewAction, revokeAction } from "@/app/actions/review";
import { SubmitButton } from "./SubmitButton";

export function ReviewForm({ attemptId, allowReturn }: { attemptId: string; allowReturn: boolean }) {
  const [state, action] = useActionState(reviewAction, { error: "" });
  return (
    <form action={action} className="grid gap-3">
      <input type="hidden" name="attemptId" value={attemptId} />
      <fieldset className="grid gap-2">
        <legend className="font-semibold">Decision</legend>
        <label className="flex gap-2">
          <input type="radio" name="decision" value="approve" required />
          Approve and issue a Competency Certificate
        </label>
        <label className="flex gap-2">
          <input type="radio" name="decision" value="reject" />
          Reject — Not Verified / Not Issued
        </label>
        {allowReturn ? (
          <label className="flex gap-2">
            <input type="radio" name="decision" value="return" />
            Return for further review
          </label>
        ) : null}
      </fieldset>
      <label className="field">
        <span>Reason</span>
        <textarea name="reason" required minLength={12} rows={4} />
      </label>
      <p className="text-sm text-muted">
        A reason is required for every decision. Changing the proposed result is recorded as a material change.
      </p>
      {state.error ? (
        <p role="alert" className="text-red">
          {state.error}
        </p>
      ) : null}
      <SubmitButton tone="teal" pendingLabel="Saving...">
        Save decision
      </SubmitButton>
    </form>
  );
}

export function RevokeForm({ attemptId, publicId }: { attemptId: string; publicId: string }) {
  const [state, action] = useActionState(revokeAction, { error: "" });
  return (
    <form action={action} className="grid gap-3">
      <input type="hidden" name="attemptId" value={attemptId} />
      <input type="hidden" name="publicId" value={publicId} />
      <label className="field">
        <span>Revocation reason</span>
        <textarea name="reason" required minLength={12} rows={4} />
      </label>
      {state.error ? (
        <p role="alert" className="text-red">
          {state.error}
        </p>
      ) : null}
      <SubmitButton tone="ghost" pendingLabel="Revoking...">
        Revoke certificate
      </SubmitButton>
    </form>
  );
}
