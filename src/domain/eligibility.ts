export type Progress =
  | { kind: "design_required"; explanation: string }
  | { kind: "not_yet_eligible"; explanation: string }
  | { kind: "ready"; attemptsRemaining: number }
  | { kind: "in_progress"; attemptId: string; attemptsRemaining: number }
  | { kind: "pending_review"; attemptId: string }
  | { kind: "returned"; attemptId: string }
  | { kind: "verified"; certificatePublicId: string }
  | { kind: "revoked"; certificatePublicId: string }
  | { kind: "not_issued"; attemptId: string; attemptsRemaining: number }
  | { kind: "exhausted"; attemptId: string };

export interface ProgressAttempt {
  id: string;
  state: string;
  attemptNumber: number;
}

export interface ProgressInput {
  hasAssessment: boolean;
  laterVersionHasAssessment: boolean;
  maxAttempts: number;
  attempts: ProgressAttempt[];
  certificatePublicId: string | null;
  certificateStatus: "verified" | "revoked" | null;
}

const DESIGN_REQUIRED =
  "Assessment Design Required. This course has a Course Completion Record only. No validated competency assessment exists yet, so a Competency Certificate cannot be issued.";

const NOT_YET_ELIGIBLE =
  "Not Yet Eligible. This completion belongs to a course version that does not have this assessment. Finishing an older version does not qualify the learner for a newer assessment, and the historical record is unchanged.";

export function resolveProgress(input: ProgressInput): Progress {
  if (input.certificateStatus === "verified" && input.certificatePublicId) {
    return { kind: "verified", certificatePublicId: input.certificatePublicId };
  }
  if (input.certificateStatus === "revoked" && input.certificatePublicId) {
    return { kind: "revoked", certificatePublicId: input.certificatePublicId };
  }
  if (!input.hasAssessment) {
    return input.laterVersionHasAssessment
      ? { kind: "not_yet_eligible", explanation: NOT_YET_ELIGIBLE }
      : { kind: "design_required", explanation: DESIGN_REQUIRED };
  }

  const ordered = [...input.attempts].sort((a, b) => a.attemptNumber - b.attemptNumber);
  const latest = ordered[ordered.length - 1];
  const attemptsRemaining = Math.max(input.maxAttempts - ordered.length, 0);

  if (!latest) {
    return { kind: "ready", attemptsRemaining };
  }
  if (latest.state === "in_progress") {
    return { kind: "in_progress", attemptId: latest.id, attemptsRemaining };
  }
  if (latest.state === "pending_review" || latest.state === "submitted") {
    return { kind: "pending_review", attemptId: latest.id };
  }
  if (latest.state === "returned") {
    return { kind: "returned", attemptId: latest.id };
  }
  if (latest.state === "not_issued" && attemptsRemaining === 0) {
    return { kind: "exhausted", attemptId: latest.id };
  }
  if (latest.state === "not_issued") {
    return { kind: "not_issued", attemptId: latest.id, attemptsRemaining };
  }
  if (attemptsRemaining === 0) {
    return { kind: "exhausted", attemptId: latest.id };
  }
  return { kind: "ready", attemptsRemaining };
}

export function canStartAttempt(progress: Progress) {
  return progress.kind === "ready" || progress.kind === "not_issued";
}
