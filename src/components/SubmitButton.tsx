"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  pendingLabel = "Working...",
  tone = "primary",
}: {
  children: string;
  pendingLabel?: string;
  tone?: "primary" | "teal" | "ghost";
}) {
  const { pending } = useFormStatus();
  return (
    <button className={`btn btn-${tone}`} type="submit" disabled={pending}>
      {pending ? pendingLabel : children}
    </button>
  );
}
