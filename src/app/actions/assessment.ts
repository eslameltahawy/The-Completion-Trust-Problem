"use server";

import { redirect } from "next/navigation";
import { publicError } from "@/i18n/errors";
import { getLocale } from "@/i18n/get-locale";
import { requireRole } from "@/server/auth";
import { rethrowIfRedirect } from "@/server/http";
import { recordIntegritySignal, saveAnswer, startAssessment, submitAttempt } from "@/server/services";

export async function startAssessmentAction(formData: FormData) {
  const completionId = String(formData.get("completionId") ?? "");
  try {
    const user = await requireRole("learner");
    const result = await startAssessment({
      actorId: user.id,
      completionId,
      acknowledged: formData.get("acknowledged") === "yes",
      integrityConsent: formData.get("integrityConsent") === "yes",
    });
    redirect(`/portal/student/attempts/${result.attemptId}`);
  } catch (error) {
    rethrowIfRedirect(error);
    const locale = await getLocale();
    const message = publicError(locale, error, "The assessment could not be started.");
    redirect(`/portal/student/courses/${completionId}/assessment?error=${encodeURIComponent(message)}`);
  }
}

export async function saveAnswerAction(input: { attemptId: string; questionId: string; value: string }) {
  const user = await requireRole("learner");
  try {
    await saveAnswer({ actorId: user.id, ...input });
    return { ok: true as const };
  } catch (error) {
    const locale = await getLocale();
    return { ok: false as const, error: publicError(locale, error, "The answer was not saved.") };
  }
}

export async function integrityAction(attemptId: string) {
  const user = await requireRole("learner");
  await recordIntegritySignal({ actorId: user.id, attemptId });
}

export async function submitAttemptAction(formData: FormData) {
  const attemptId = String(formData.get("attemptId") ?? "");
  const user = await requireRole("learner");
  try {
    await submitAttempt({ actorId: user.id, attemptId });
  } catch (error) {
    rethrowIfRedirect(error);
    const locale = await getLocale();
    const message = publicError(locale, error, "The assessment could not be submitted.");
    redirect(`/portal/student/attempts/${attemptId}?error=${encodeURIComponent(message)}`);
  }
  redirect(`/portal/student/attempts/${attemptId}?notice=submitted`);
}
