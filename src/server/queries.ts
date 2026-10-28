import type { CriterionEvaluation } from "@/domain/evaluation/types";
import { resolveProgress, type Progress } from "@/domain/eligibility";
import { methodLabel, STATE_LABELS, type AttemptState, isAttemptState } from "@/domain/states";
import { prisma } from "./db";

export function parseOptions(json: string | null) {
  if (!json) return [] as { key: string; text: string }[];
  const parsed = JSON.parse(json) as { key: string; text: string }[];
  return Array.isArray(parsed) ? parsed : [];
}

export function parseElements(json: string) {
  const parsed = JSON.parse(json) as unknown;
  return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
}

export function parseObjectives(json: string) {
  const parsed = JSON.parse(json) as unknown;
  return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
}

export function parseCriteria(json: string) {
  const parsed = JSON.parse(json) as CriterionEvaluation[];
  return Array.isArray(parsed) ? parsed : [];
}

export function stateLabel(state: string) {
  return isAttemptState(state) ? STATE_LABELS[state as AttemptState] : state;
}

const completionInclude = {
  courseVersion: {
    include: {
      course: { include: { versions: { include: { definitions: true } } } },
      definitions: {
        include: {
          competency: true,
          versions: { where: { status: "active" } },
        },
      },
    },
  },
} as const;

export async function getStudentDashboard(learnerId: string) {
  const learner = await prisma.user.findUniqueOrThrow({ where: { id: learnerId } });
  const completions = await prisma.courseCompletionRecord.findMany({
    where: { learnerId },
    include: completionInclude,
    orderBy: { completedAt: "desc" },
  });
  const attempts = await prisma.assessmentAttempt.findMany({
    where: { learnerId },
    include: { certificate: true },
  });

  const courses = completions.map((completion) => {
    const definition = completion.courseVersion.definitions[0];
    const version = definition?.versions[0];
    const relatedAttempts = attempts.filter((attempt) => attempt.completionRecordId === completion.id);
    const certificate = version
      ? relatedAttempts.find((attempt) => attempt.certificate && attempt.assessmentVersionId === version.id)
          ?.certificate
      : null;
    const laterVersionHasAssessment = completion.courseVersion.course.versions.some(
      (courseVersion) =>
        courseVersion.id !== completion.courseVersionId && courseVersion.definitions.length > 0,
    );
    const progress = resolveProgress({
      hasAssessment: Boolean(version),
      laterVersionHasAssessment,
      maxAttempts: definition?.maxAttempts ?? 0,
      attempts: relatedAttempts.map((attempt) => ({
        id: attempt.id,
        state: attempt.state,
        attemptNumber: attempt.attemptNumber,
      })),
      certificatePublicId: certificate?.publicId ?? null,
      certificateStatus:
        certificate?.status === "verified" || certificate?.status === "revoked" ? certificate.status : null,
    });
    return {
      completionId: completion.id,
      completionPublicId: completion.publicId,
      courseTitle: completion.courseVersion.course.title,
      versionLabel: completion.courseVersion.versionLabel,
      versionSummary: completion.courseVersion.summary,
      completedAt: completion.completedAt,
      source: completion.source,
      legacyLabel: completion.legacyLabel,
      competencyName: definition?.competency.name ?? null,
      method: definition ? methodLabel(definition.method) : null,
      progress,
    };
  });

  const certificates = await prisma.competencyCertificate.findMany({
    where: { learnerId },
    include: {
      competency: true,
      courseVersion: { include: { course: true } },
    },
    orderBy: { issuedAt: "desc" },
  });

  return { learner, courses, certificates };
}

export async function getCompletionForLearner(learnerId: string, completionId: string) {
  const completion = await prisma.courseCompletionRecord.findFirst({
    where: { id: completionId, learnerId },
    include: {
      learner: true,
      courseVersion: { include: { course: true } },
    },
  });
  return completion;
}

export async function getAssessmentIntro(learnerId: string, completionId: string) {
  const dashboard = await getStudentDashboard(learnerId);
  const course = dashboard.courses.find((item) => item.completionId === completionId);
  if (!course) return null;
  const completion = await prisma.courseCompletionRecord.findUnique({
    where: { id: completionId },
    include: {
      courseVersion: {
        include: {
          definitions: {
            include: {
              competency: true,
              versions: {
                where: { status: "active" },
                include: { criteria: true },
              },
            },
          },
        },
      },
    },
  });
  const definition = completion?.courseVersion.definitions[0];
  const version = definition?.versions[0];
  return {
    course,
    objectives: completion ? parseObjectives(completion.courseVersion.objectivesJson) : [],
    definition: definition
      ? {
          title: definition.title,
          description: definition.description,
          method: methodLabel(definition.method),
          durationMinutes: definition.durationMinutes,
          maxAttempts: definition.maxAttempts,
          policySummary: definition.policySummary,
          reviewRequired: definition.reviewRequired,
          passingScoreHypothesis: definition.passingScoreHypothesis,
          competencyName: definition.competency.name,
          competencyDescription: definition.competency.description,
          criteria: version?.criteria.map((criterion) => ({
            name: criterion.name,
            description: criterion.description,
          })) ?? [],
        }
      : null,
  };
}

export async function getLearnerAttempt(learnerId: string, attemptId: string) {
  const attempt = await prisma.assessmentAttempt.findFirst({
    where: { id: attemptId, learnerId },
    include: {
      answers: true,
      evaluation: true,
      integrityEvents: { orderBy: { occurredAt: "asc" } },
      decisions: { include: { reviewer: true }, orderBy: { createdAt: "asc" } },
      certificate: true,
      assessmentVersion: {
        include: {
          questions: { orderBy: { orderIndex: "asc" } },
          definition: {
            include: { competency: true, courseVersion: { include: { course: true } } },
          },
        },
      },
    },
  });
  if (!attempt) return null;
  return {
    id: attempt.id,
    state: attempt.state,
    stateLabel: stateLabel(attempt.state),
    attemptNumber: attempt.attemptNumber,
    deadlineAt: attempt.deadlineAt.toISOString(),
    submittedAt: attempt.submittedAt?.toISOString() ?? null,
    integrityConsent: attempt.integrityConsent,
    accommodationNote: attempt.accommodationNote,
    courseTitle: attempt.assessmentVersion.definition.courseVersion.course.title,
    versionLabel: attempt.assessmentVersion.definition.courseVersion.versionLabel,
    competencyName: attempt.assessmentVersion.definition.competency.name,
    method: methodLabel(attempt.assessmentVersion.definition.method),
    certificate: attempt.certificate,
    evaluation: attempt.evaluation
      ? {
          method: attempt.evaluation.method,
          proposedOutcome: attempt.evaluation.proposedOutcome,
          scorePercent: attempt.evaluation.scorePercent,
          rationale: attempt.evaluation.rationale,
          hypothesisLabel: attempt.evaluation.hypothesisLabel,
          criteria: parseCriteria(attempt.evaluation.criterionResultsJson),
        }
      : null,
    integrityEvents: attempt.integrityEvents.map((event) => ({
      id: event.id,
      eventType: event.eventType,
      source: event.source,
      note: event.note,
      occurredAt: event.occurredAt.toISOString(),
    })),
    decisions: attempt.decisions.map((decision) => ({
      id: decision.id,
      decision: decision.decision,
      reason: decision.reason,
      reviewerName: decision.reviewer.name,
      createdAt: decision.createdAt.toISOString(),
      materialChange: decision.materialChange,
    })),
    questions: attempt.assessmentVersion.questions.map((question) => ({
      id: question.id,
      type: question.type,
      prompt: question.prompt,
      context: question.context,
      options: parseOptions(question.optionsJson),
      savedValue: attempt.answers.find((answer) => answer.questionId === question.id)?.value ?? "",
    })),
  };
}

export async function getReviewQueue(filters: { q?: string; status?: string }) {
  const attempts = await prisma.assessmentAttempt.findMany({
    where: { state: { not: "in_progress" } },
    include: {
      learner: true,
      certificate: true,
      assessmentVersion: {
        include: { definition: { include: { courseVersion: { include: { course: true } } } } },
      },
    },
    orderBy: { submittedAt: "desc" },
  });
  const q = filters.q?.trim().toLowerCase() ?? "";
  const status = filters.status?.trim() ?? "";
  return attempts.filter((attempt) => {
    const inDefaultQueue = attempt.state === "pending_review" || attempt.state === "returned";
    if (!status && !q && !inDefaultQueue) return false;
    if (status && attempt.state !== status) return false;
    if (!q) return true;
    const haystack = [
      attempt.id,
      attempt.learner.name,
      attempt.learner.email,
      attempt.assessmentVersion.definition.title,
      attempt.assessmentVersion.definition.courseVersion.course.title,
      attempt.certificate?.publicId ?? "",
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

export async function getReviewAttempt(attemptId: string) {
  const attempt = await prisma.assessmentAttempt.findUnique({
    where: { id: attemptId },
    include: {
      learner: true,
      answers: true,
      evaluation: true,
      evidence: true,
      integrityEvents: { orderBy: { occurredAt: "asc" } },
      decisions: { include: { reviewer: true }, orderBy: { createdAt: "asc" } },
      certificate: true,
      completionRecord: { include: { courseVersion: true } },
      assessmentVersion: {
        include: {
          criteria: true,
          questions: { orderBy: { orderIndex: "asc" }, include: { criterion: true } },
          definition: {
            include: { competency: true, courseVersion: { include: { course: true } } },
          },
        },
      },
    },
  });
  if (!attempt) return null;
  const history = await prisma.assessmentAttempt.findMany({
    where: {
      learnerId: attempt.learnerId,
      assessmentVersionId: attempt.assessmentVersionId,
    },
    orderBy: { attemptNumber: "asc" },
    include: { evaluation: true, certificate: true },
  });
  return { attempt, history };
}

export type { Progress };
