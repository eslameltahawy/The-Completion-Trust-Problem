"use server";

import { redirect } from "next/navigation";
import { publicError } from "@/i18n/errors";
import { getLocale } from "@/i18n/get-locale";
import type { ReviewDecision } from "@/domain/states";
import { requireRole } from "@/server/auth";
import { rethrowIfRedirect } from "@/server/http";
import { decideReview, revokeCertificate } from "@/server/services";

export async function reviewAction(_prev: { error: string }, formData: FormData) {
  const attemptId = String(formData.get("attemptId") ?? "");
  try {
    const user = await requireRole("reviewer");
    await decideReview({
      actorId: user.id,
      attemptId,
      decision: String(formData.get("decision") ?? "") as ReviewDecision,
      reason: String(formData.get("reason") ?? ""),
    });
  } catch (error) {
    rethrowIfRedirect(error);
    const locale = await getLocale();
    return { error: publicError(locale, error, "The decision was not saved.") };
  }
  redirect(`/portal/reviewer/attempts/${attemptId}?notice=saved`);
}

export async function revokeAction(_prev: { error: string }, formData: FormData) {
  const attemptId = String(formData.get("attemptId") ?? "");
  try {
    const user = await requireRole("reviewer");
    await revokeCertificate({
      actorId: user.id,
      certificatePublicId: String(formData.get("publicId") ?? ""),
      reason: String(formData.get("reason") ?? ""),
    });
  } catch (error) {
    rethrowIfRedirect(error);
    const locale = await getLocale();
    return { error: publicError(locale, error, "The certificate was not revoked.") };
  }
  redirect(`/portal/reviewer/attempts/${attemptId}?notice=revoked`);
}
