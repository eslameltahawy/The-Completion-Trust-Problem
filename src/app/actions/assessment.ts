"use server";

import { redirect } from "next/navigation";
import { isDomainError } from "@/domain/errors";
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
    const message = isDomainError(error) ? error.message : "The assessment could not be started.";
    redirect(`/portal/student/courses/${completionId}/assessment?error=${encodeURIComponent(message)}`);
  }
}

export async function saveAnswerAction(input: { attemptId: string; questionId: string; value: string }) {
  const user = await requireRole("learner");
  try {
    await saveAnswer({ actorId: user.id, ...input });
    return { ok: true as const };
  } catch (error) {
    return { ok: false as const, error: isDomainError(error) ? error.message : "The answer was not saved." };
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
    const message = isDomainError(error) ? error.message : "The assessment could not be submitted.";
    redirect(`/portal/student/attempts/${attemptId}?error=${encodeURIComponent(message)}`);
  }
  redirect(`/portal/student/attempts/${attemptId}?notice=submitted`);
}
