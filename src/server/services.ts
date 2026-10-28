import { demoEvaluator } from "@/domain/evaluation/demo-evaluator";
import type { CriterionEvaluation } from "@/domain/evaluation/types";
import { DomainError } from "@/domain/errors";
import { newCertificatePublicId, newId } from "@/domain/ids";
import { buildCertificateCopy } from "@/domain/issuance";
import { planHistoricalMigration } from "@/domain/migration";
import {
  assertCertificateRevocation,
  assertTransition,
  isMaterialChange,
  MAX_ANSWER_CHARS,
  methodLabel,
  MIN_REASON_CHARS,
  nextStateForDecision,
  type ReviewDecision,
} from "@/domain/states";
import { canStartAttempt, resolveProgress } from "@/domain/eligibility";
import { toAttemptStatusVerification, toCompletionVerification, toPublicVerification, type AttemptStatusSource, type CertificateSource, type CompletionSource } from "@/domain/verification";
import { prisma } from "./db";

function parseStringArray(json: string) {
  try {
    const parsed = JSON.parse(json) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

async function requireActor(actorId: string, role: "learner" | "reviewer") {
  const actor = await prisma.user.findUnique({ where: { id: actorId } });
  if (!actor || actor.role !== role) {
    throw new DomainError(
      "forbidden",
      role === "reviewer" ? "Only a reviewer can do that." : "Only a learner can do that.",
    );
  }
  return actor;
}

async function progressForCompletion(learnerId: string, completionId: string) {
  const completion = await prisma.courseCompletionRecord.findUnique({
    where: { id: completionId },
    include: {
      courseVersion: {
        include: {
          course: { include: { versions: { include: { definitions: true } } } },
          definitions: { include: { versions: { where: { status: "active" } } } },
        },
      },
    },
  });
  if (!completion || completion.learnerId !== learnerId) {
    throw new DomainError("forbidden", "This completion record is not available to you.");
  }

  const definition = completion.courseVersion.definitions[0];
  const version = definition?.versions[0];
  const laterVersionHasAssessment = completion.courseVersion.course.versions.some(
    (courseVersion) =>
      courseVersion.id !== completion.courseVersionId && courseVersion.definitions.length > 0,
  );
  const attempts = await prisma.assessmentAttempt.findMany({
    where: {
      learnerId,
      completionRecordId: completion.id,
    },
  });
  const certificate = version
    ? await prisma.competencyCertificate.findFirst({
        where: { learnerId, assessmentVersionId: version.id },
      })
    : null;
  const progress = resolveProgress({
    hasAssessment: Boolean(version),
    laterVersionHasAssessment,
    maxAttempts: definition?.maxAttempts ?? 0,
    attempts: attempts.map((attempt) => ({
      id: attempt.id,
      state: attempt.state,
      attemptNumber: attempt.attemptNumber,
    })),
    certificatePublicId: certificate?.publicId ?? null,
    certificateStatus:
      certificate?.status === "verified" || certificate?.status === "revoked"
        ? certificate.status
        : null,
  });

  return { completion, definition, version, attempts, progress };
}

export async function startAssessment(input: {
  actorId: string;
  completionId: string;
  acknowledged: boolean;
  integrityConsent: boolean;
}) {
  await requireActor(input.actorId, "learner");
  if (!input.acknowledged) {
    throw new DomainError(
      "acknowledgement_required",
      "Acknowledge the assessment rules before starting.",
    );
  }

  const { definition, version, attempts, progress } = await progressForCompletion(
    input.actorId,
    input.completionId,
  );

  if (progress.kind === "in_progress") {
    return { attemptId: progress.attemptId, resumed: true };
  }
  if (!canStartAttempt(progress) || !definition || !version) {
    if (progress.kind === "design_required" || progress.kind === "not_yet_eligible") {
      throw new DomainError(progress.kind, progress.explanation);
    }
    throw new DomainError("not_eligible", "This course is not open for a new competency assessment.");
  }
  if (attempts.length >= definition.maxAttempts) {
    throw new DomainError("attempts_exhausted", "The attempt limit for this assessment has been reached.");
  }

  const startedAt = new Date();
  const deadlineAt = new Date(startedAt.getTime() + definition.durationMinutes * 60 * 1000);
  const attempt = await prisma.assessmentAttempt.create({
    data: {
      id: newId("att"),
      learnerId: input.actorId,
      assessmentVersionId: version.id,
      completionRecordId: input.completionId,
      attemptNumber: attempts.length + 1,
      state: "in_progress",
      startedAt,
      deadlineAt,
      policyAcknowledgedAt: startedAt,
      integrityConsent: input.integrityConsent,
    },
  });
  await prisma.auditLog.create({
    data: {
      id: newId("aud"),
      actorId: input.actorId,
      action: "assessment_started",
      entityType: "AssessmentAttempt",
      entityId: attempt.id,
      detail: `Attempt ${attempt.attemptNumber} started. Integrity consent: ${input.integrityConsent ? "yes" : "no"}.`,
    },
  });
  return { attemptId: attempt.id, resumed: false };
}

async function ownedAttempt(actorId: string, attemptId: string) {
  const attempt = await prisma.assessmentAttempt.findUnique({
    where: { id: attemptId },
    include: {
      answers: true,
      assessmentVersion: {
        include: {
          questions: true,
          criteria: true,
          definition: true,
        },
      },
    },
  });
  if (!attempt || attempt.learnerId !== actorId) {
    throw new DomainError("forbidden", "This assessment attempt is not available to you.");
  }
  return attempt;
}

export async function saveAnswer(input: {
  actorId: string;
  attemptId: string;
  questionId: string;
  value: string;
}) {
  await requireActor(input.actorId, "learner");
  if (input.value.length > MAX_ANSWER_CHARS) {
    throw new DomainError("invalid_answer", "That answer is too long.");
  }
  const attempt = await ownedAttempt(input.actorId, input.attemptId);
  if (attempt.state !== "in_progress") {
    throw new DomainError("invalid_transition", "Answers can only be saved while an attempt is in progress.");
  }
  if (new Date() > attempt.deadlineAt) {
    await submitAttempt({ actorId: input.actorId, attemptId: input.attemptId });
    throw new DomainError(
      "expired",
      "The time limit ended. Saved answers were submitted and are now Pending Review.",
    );
  }
  const question = attempt.assessmentVersion.questions.find((item) => item.id === input.questionId);
  if (!question) {
    throw new DomainError("invalid_answer", "That question is not part of this assessment.");
  }
  await prisma.answer.upsert({
    where: { attemptId_questionId: { attemptId: attempt.id, questionId: question.id } },
    update: { value: input.value, savedAt: new Date() },
    create: {
      id: newId("ans"),
      attemptId: attempt.id,
      questionId: question.id,
      value: input.value,
      savedAt: new Date(),
    },
  });
}

export async function recordIntegritySignal(input: { actorId: string; attemptId: string }) {
  await requireActor(input.actorId, "learner");
  const attempt = await ownedAttempt(input.actorId, input.attemptId);
  if (!attempt.integrityConsent || attempt.state !== "in_progress") {
    return { recorded: false };
  }
  if (new Date() > attempt.deadlineAt) return { recorded: false };
  await prisma.integrityEvent.create({
    data: {
      id: newId("int"),
      attemptId: attempt.id,
      eventType: "visibility_hidden",
      source: "browser_visibility",
      note: "The assessment tab was hidden. This is a review indicator, not proof of misconduct. The camera and screen were not captured.",
      occurredAt: new Date(),
    },
  });
  return { recorded: true };
}

export async function submitAttempt(input: { actorId: string; attemptId: string }) {
  await requireActor(input.actorId, "learner");
  const current = await ownedAttempt(input.actorId, input.attemptId);
  if (current.state !== "in_progress") {
    return { state: current.state, duplicate: true };
  }

  await prisma.$transaction(async (tx) => {
    const attempt = await tx.assessmentAttempt.findUnique({
      where: { id: input.attemptId },
      include: {
        answers: true,
        integrityEvents: true,
        assessmentVersion: { include: { questions: true, criteria: true, definition: true } },
      },
    });
    if (!attempt || attempt.learnerId !== input.actorId || attempt.state !== "in_progress") return;

    const locked = await tx.assessmentAttempt.updateMany({
      where: { id: attempt.id, state: "in_progress" },
      data: { state: "submitted", submittedAt: new Date() },
    });
    if (locked.count !== 1) return;

    assertTransition("submitted", "pending_review");
    const evaluation = demoEvaluator.evaluate({
      questions: attempt.assessmentVersion.questions.map((question) => ({
        id: question.id,
        type: question.type,
        criterionId: question.criterionId,
        correctOptionKey: question.correctOptionKey,
        expectedElements: parseStringArray(question.expectedElementsJson),
      })),
      criteria: attempt.assessmentVersion.criteria.map((criterion) => ({
        id: criterion.id,
        name: criterion.name,
        requiredForPass: criterion.requiredForPass,
      })),
      answers: attempt.answers.map((answer) => ({ questionId: answer.questionId, value: answer.value })),
      passingScoreHypothesis: attempt.assessmentVersion.definition.passingScoreHypothesis,
    });

    await tx.evaluationResult.create({
      data: {
        id: newId("eval"),
        attemptId: attempt.id,
        method: evaluation.method,
        proposedOutcome: evaluation.proposedOutcome,
        scorePercent: evaluation.scorePercent,
        rationale: evaluation.rationale,
        hypothesisLabel: evaluation.hypothesisLabel,
        criterionResultsJson: JSON.stringify(evaluation.criterionResults),
      },
    });
    await tx.assessmentEvidence.create({
      data: {
        id: newId("evd"),
        attemptId: attempt.id,
        summary:
          "Assessment evidence for reviewer use. Employer verification does not receive answers or integrity events.",
        packageJson: JSON.stringify({
          evaluationMethod: evaluation.method,
          proposedOutcome: evaluation.proposedOutcome,
          scorePercent: evaluation.scorePercent,
          criterionResults: evaluation.criterionResults,
          answerCount: attempt.answers.length,
          integrityEventCount: attempt.integrityEvents.length,
          note: "Integrity signals are review indicators, not proof of misconduct.",
        }),
      },
    });
    await tx.assessmentAttempt.update({
      where: { id: attempt.id },
      data: { state: "pending_review" },
    });
    await tx.auditLog.create({
      data: {
        id: newId("aud"),
        actorId: input.actorId,
        action: "assessment_submitted",
        entityType: "AssessmentAttempt",
        entityId: attempt.id,
        detail: `Submitted for Pending Review. Proposed outcome: ${evaluation.proposedOutcome}. Method: ${evaluation.method}. No certificate was issued.`,
      },
    });
  });

  const after = await prisma.assessmentAttempt.findUnique({ where: { id: input.attemptId } });
  return { state: after?.state ?? "pending_review", duplicate: false };
}

export async function submitIfExpired(input: { actorId: string; attemptId: string }) {
  const attempt = await prisma.assessmentAttempt.findUnique({ where: { id: input.attemptId } });
  if (!attempt || attempt.learnerId !== input.actorId) return { submitted: false };
  if (attempt.state === "in_progress" && new Date() > attempt.deadlineAt) {
    await submitAttempt(input);
    return { submitted: true };
  }
  return { submitted: false };
}

export async function decideReview(input: {
  actorId: string;
  attemptId: string;
  decision: ReviewDecision;
  reason: string;
}) {
  const reviewer = await requireActor(input.actorId, "reviewer");
  const reason = input.reason.trim();
  if (reason.length < MIN_REASON_CHARS) {
    throw new DomainError("invalid_reason", "Enter a reason of at least 12 characters.");
  }
  if (!["approve", "reject", "return"].includes(input.decision)) {
    throw new DomainError("invalid_decision", "Choose approve, reject, or return.");
  }

  await prisma.$transaction(async (tx) => {
    const attempt = await tx.assessmentAttempt.findUnique({
      where: { id: input.attemptId },
      include: {
        evaluation: true,
        certificate: true,
        learner: true,
        assessmentVersion: {
          include: {
            definition: {
              include: {
                competency: true,
                courseVersion: { include: { course: true } },
              },
            },
          },
        },
      },
    });
    if (!attempt?.evaluation) {
      throw new DomainError("not_found", "This assessment is not ready for review.");
    }
    const next = nextStateForDecision(input.decision);
    assertTransition(attempt.state, next);
    if (input.decision === "approve") {
      const prior = await tx.competencyCertificate.findFirst({
        where: {
          learnerId: attempt.learnerId,
          assessmentVersionId: attempt.assessmentVersionId,
        },
      });
      if (prior || attempt.certificate) {
        throw new DomainError(
          "duplicate_certificate",
          "A Competency Certificate already exists for this assessment.",
        );
      }
    }

    const moved = await tx.assessmentAttempt.updateMany({
      where: { id: attempt.id, state: attempt.state },
      data: { state: next },
    });
    if (moved.count !== 1) {
      throw new DomainError("invalid_transition", "This assessment was already updated.");
    }

    const materialChange = isMaterialChange(attempt.evaluation.proposedOutcome, input.decision);
    await tx.reviewerDecision.create({
      data: {
        id: newId("dec"),
        attemptId: attempt.id,
        reviewerId: reviewer.id,
        decision: input.decision,
        reason,
        priorProposedOutcome: attempt.evaluation.proposedOutcome,
        materialChange,
      },
    });

    if (input.decision === "approve") {
      const results = JSON.parse(attempt.evaluation.criterionResultsJson) as CriterionEvaluation[];
      const copy = buildCertificateCopy({ criterionResults: results, materialChange });
      await tx.competencyCertificate.create({
        data: {
          id: newId("ctc"),
          publicId: newCertificatePublicId(),
          attemptId: attempt.id,
          learnerId: attempt.learnerId,
          courseVersionId: attempt.assessmentVersion.definition.courseVersionId,
          assessmentVersionId: attempt.assessmentVersionId,
          competencyId: attempt.assessmentVersion.definition.competencyId,
          status: "verified",
          outcomeLabel: copy.outcomeLabel,
          criteriaSummary: copy.criteriaSummary,
          evidenceSummary: copy.evidenceSummary,
          issuedAt: new Date(),
        },
      });
    }

    await tx.auditLog.create({
      data: {
        id: newId("aud"),
        actorId: reviewer.id,
        action: "review_decision",
        entityType: "AssessmentAttempt",
        entityId: attempt.id,
        detail: `${reviewer.name} set the decision to ${input.decision}. Material change: ${materialChange ? "yes" : "no"}.`,
      },
    });
  });
}

export async function revokeCertificate(input: {
  actorId: string;
  certificatePublicId: string;
  reason: string;
}) {
  const reviewer = await requireActor(input.actorId, "reviewer");
  const reason = input.reason.trim();
  if (reason.length < MIN_REASON_CHARS) {
    throw new DomainError("invalid_reason", "Enter a revocation reason of at least 12 characters.");
  }
  const certificate = await prisma.competencyCertificate.findUnique({
    where: { publicId: input.certificatePublicId },
  });
  if (!certificate) throw new DomainError("not_found", "No Competency Certificate was found.");
  assertCertificateRevocation(certificate.status);

  await prisma.$transaction(async (tx) => {
    const updated = await tx.competencyCertificate.updateMany({
      where: { id: certificate.id, status: "verified" },
      data: { status: "revoked", revokedAt: new Date(), revocationReason: reason },
    });
    if (updated.count !== 1) {
      throw new DomainError("invalid_transition", "Only a verified Competency Certificate can be revoked.");
    }
    await tx.auditLog.create({
      data: {
        id: newId("aud"),
        actorId: reviewer.id,
        action: "certificate_revoked",
        entityType: "CompetencyCertificate",
        entityId: certificate.id,
        detail: `${reviewer.name} revoked ${certificate.publicId}.`,
      },
    });
  });
}

export async function verifyCertificate(rawId: string) {
  const queriedId = rawId.trim().toUpperCase();
  const certificate = await prisma.competencyCertificate.findUnique({
    where: { publicId: queriedId },
    include: {
      learner: true,
      competency: true,
      attempt: true,
      assessmentVersion: { include: { definition: true } },
      courseVersion: { include: { course: true } },
    },
  });
  if (certificate) {
    const source: CertificateSource = {
      status: certificate.status,
      publicId: certificate.publicId,
      learnerName: certificate.learner.name,
      courseTitle: certificate.courseVersion.course.title,
      versionLabel: certificate.courseVersion.versionLabel,
      competencyName: certificate.competency.name,
      assessmentMethod: methodLabel(certificate.assessmentVersion.definition.method),
      assessmentDateIso: (certificate.attempt.submittedAt ?? certificate.issuedAt).toISOString(),
      outcomeLabel: certificate.outcomeLabel,
      criteriaSummary: certificate.criteriaSummary,
      evidenceSummary: certificate.evidenceSummary,
    };
    const result = toPublicVerification(source);
    await prisma.certificateVerificationEvent.create({
      data: {
        id: newId("ver"),
        queriedId,
        outcome: result.outcome,
        certificateId: certificate.id,
      },
    });
    return result;
  }

  const completion = await prisma.courseCompletionRecord.findUnique({
    where: { publicId: queriedId },
    include: {
      learner: true,
      courseVersion: { include: { course: { include: { versions: true } } } },
    },
  });
  if (completion) {
    const laterVersionLabels = completion.courseVersion.course.versions
      .filter((version) => version.publishedAt > completion.courseVersion.publishedAt)
      .map((version) => version.versionLabel);
    const source: CompletionSource = {
      publicId: completion.publicId,
      learnerName: completion.learner.name,
      courseTitle: completion.courseVersion.course.title,
      versionLabel: completion.courseVersion.versionLabel,
      completedAtIso: completion.completedAt.toISOString(),
      historical: completion.source === "historical_import" || Boolean(completion.legacyLabel),
      legacyLabel: completion.legacyLabel,
      laterVersionLabels,
    };
    const result = toCompletionVerification(source);
    await prisma.certificateVerificationEvent.create({
      data: { id: newId("ver"), queriedId, outcome: result.outcome, certificateId: null },
    });
    return result;
  }

  const attempt = await prisma.assessmentAttempt.findUnique({
    where: { id: queriedId.toLowerCase() },
    include: {
      learner: true,
      assessmentVersion: {
        include: {
          definition: {
            include: { competency: true, courseVersion: { include: { course: true } } },
          },
        },
      },
    },
  });
  if (attempt) {
    const source: AttemptStatusSource = {
      publicId: attempt.id,
      learnerName: attempt.learner.name,
      courseTitle: attempt.assessmentVersion.definition.courseVersion.course.title,
      versionLabel: attempt.assessmentVersion.definition.courseVersion.versionLabel,
      competencyName: attempt.assessmentVersion.definition.competency.name,
      assessmentMethod: methodLabel(attempt.assessmentVersion.definition.method),
      state: attempt.state,
      activityDateIso: (attempt.submittedAt ?? attempt.startedAt).toISOString(),
    };
    const result = toAttemptStatusVerification(source);
    await prisma.certificateVerificationEvent.create({
      data: { id: newId("ver"), queriedId, outcome: result.outcome, certificateId: null },
    });
    return result;
  }

  const result = toPublicVerification(null);
  await prisma.certificateVerificationEvent.create({
    data: { id: newId("ver"), queriedId, outcome: result.outcome, certificateId: null },
  });
  return result;
}

export async function migrateHistoricalCompletions(actorId: string | null) {
  const [legacyRows, completions, certificatesBefore] = await Promise.all([
    prisma.legacyCertificate.findMany(),
    prisma.courseCompletionRecord.findMany({
      select: { id: true, publicId: true, legacyCertificateId: true },
    }),
    prisma.competencyCertificate.count(),
  ]);
  const plan = planHistoricalMigration(legacyRows, completions);

  for (const item of plan.toCreate) {
    const id = newId("ccr");
    await prisma.courseCompletionRecord.create({
      data: {
        id,
        publicId: item.publicId,
        learnerId: item.learnerId,
        courseVersionId: item.courseVersionId,
        completedAt: item.completedAt,
        source: item.source,
        legacyCertificateId: item.legacyId,
        legacyLabel: item.legacyLabel,
      },
    });
    await prisma.legacyCertificate.update({
      where: { id: item.legacyId },
      data: { migratedToId: id },
    });
    await prisma.auditLog.create({
      data: {
        id: newId("aud"),
        actorId,
        action: "historical_migration",
        entityType: "CourseCompletionRecord",
        entityId: id,
        detail: `Legacy certificate ${item.legacyId} was preserved as a Course Completion Record. No Competency Certificate was created.`,
      },
    });
  }

  for (const link of plan.toLink) {
    await prisma.legacyCertificate.update({
      where: { id: link.legacyId },
      data: { migratedToId: link.completionId },
    });
  }

  if (plan.toCreate.length === 0) {
    await prisma.auditLog.create({
      data: {
        id: newId("aud"),
        actorId,
        action: "historical_migration_noop",
        entityType: "LegacyCertificate",
        entityId: "batch",
        detail: `Migration created 0 completion records. Skipped ${plan.skippedIds.length}.`,
      },
    });
  }

  const certificatesAfter = await prisma.competencyCertificate.count();
  if (certificatesAfter !== certificatesBefore) {
    throw new DomainError(
      "migration_integrity",
      "Historical migration must not create a Competency Certificate.",
    );
  }
  return { created: plan.toCreate.length, linked: plan.toLink.length, skipped: plan.skippedIds.length };
}
