import { DomainError } from "./errors";

export const ATTEMPT_STATES = [
  "in_progress",
  "submitted",
  "pending_review",
  "returned",
  "issued",
  "not_issued",
] as const;

export type AttemptState = (typeof ATTEMPT_STATES)[number];

export const STATE_LABELS: Record<AttemptState, string> = {
  in_progress: "In Progress",
  submitted: "Submitted",
  pending_review: "Pending Review",
  returned: "Returned for further review",
  issued: "Verified",
  not_issued: "Not Verified / Not Issued",
};

const TRANSITIONS: Record<AttemptState, AttemptState[]> = {
  in_progress: ["submitted"],
  submitted: ["pending_review"],
  pending_review: ["issued", "not_issued", "returned"],
  returned: ["issued", "not_issued"],
  issued: [],
  not_issued: [],
};

export function isAttemptState(value: string): value is AttemptState {
  return (ATTEMPT_STATES as readonly string[]).includes(value);
}

export function canTransition(from: AttemptState, to: AttemptState) {
  return TRANSITIONS[from].includes(to);
}

export function assertTransition(from: string, to: string) {
  if (!isAttemptState(from) || !isAttemptState(to) || !canTransition(from, to)) {
    const fromLabel = isAttemptState(from) ? STATE_LABELS[from] : from;
    const toLabel = isAttemptState(to) ? STATE_LABELS[to] : to;
    throw new DomainError(
      "invalid_transition",
      `This assessment cannot move from ${fromLabel} to ${toLabel}.`,
    );
  }
}

export function assertCertificateRevocation(status: string) {
  if (status !== "verified") {
    throw new DomainError(
      "invalid_transition",
      "Only a verified Competency Certificate can be revoked.",
    );
  }
}

export type ReviewDecision = "approve" | "reject" | "return";

export function nextStateForDecision(decision: ReviewDecision): AttemptState {
  if (decision === "approve") return "issued";
  if (decision === "reject") return "not_issued";
  return "returned";
}

export function isMaterialChange(proposedOutcome: string, decision: ReviewDecision) {
  if (decision === "return") return false;
  if (decision === "approve" && proposedOutcome === "fail") return true;
  if (decision === "reject" && proposedOutcome === "pass") return true;
  return false;
}

export const MIN_REASON_CHARS = 12;
export const MAX_ANSWER_CHARS = 5000;
export const MAX_QUERY_CHARS = 40;

export const METHOD_LABELS: Record<string, string> = {
  auto_graded_quiz: "Automatically graded quiz",
  scenario_short_answer: "Scenario and short-answer assessment",
  practical_task: "Practical task",
  simulated_integrity_quiz: "Quiz and scenario with prototype integrity signals",
};

export function methodLabel(method: string) {
  return METHOD_LABELS[method] ?? method;
}
