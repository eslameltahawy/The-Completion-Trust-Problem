import { beforeEach, describe, expect, it } from "vitest";
import { INVALID_MESSAGE } from "@/domain/verification";
import { hashPassword } from "./password";
import { prisma } from "./db";
import { resetDatabase } from "./reset";
import {
  decideReview,
  migrateHistoricalCompletions,
  revokeCertificate,
  startAssessment,
  submitAttempt,
  verifyCertificate,
} from "./services";

const passwordHash = hashPassword("pw-test-123");

async function people() {
  await prisma.user.create({
    data: { id: "learner", email: "learner@demo.local", name: "Learner One", passwordHash, role: "learner", segment: "self_directed" },
  });
  await prisma.user.create({
    data: { id: "other", email: "other@demo.local", name: "Other Learner", passwordHash, role: "learner", segment: "self_directed" },
  });
  await prisma.user.create({
    data: { id: "reviewer", email: "reviewer@demo.local", name: "Reviewer One", passwordHash, role: "reviewer" },
  });
}

async function courseGraph(mode: "quiz" | "none" | "later") {
  await prisma.course.create({ data: { id: "course", title: "Sample Course", summary: "Sample summary." } });
  await prisma.courseVersion.create({
    data: {
      id: "v1",
      courseId: "course",
      versionLabel: "v1",
      summary: "Version 1 context.",
      objectivesJson: JSON.stringify(["Apply the sample objective"]),
      isCurrent: mode !== "later",
      publishedAt: new Date("2024-01-15T00:00:00.000Z"),
    },
  });
  if (mode === "later") {
    await prisma.courseVersion.create({
      data: {
        id: "v2",
        courseId: "course",
        versionLabel: "v2",
        summary: "Version 2 context.",
        objectivesJson: JSON.stringify(["Audit the revised objective"]),
        isCurrent: true,
        publishedAt: new Date("2025-11-01T00:00:00.000Z"),
      },
    });
  }
  const assessedVersion = mode === "later" ? "v2" : "v1";
  if (mode !== "none") {
    await prisma.competency.create({
      data: { id: "cmp", courseId: "course", name: "Sample competency", description: "Can apply the objective." },
    });
    await prisma.assessmentDefinition.create({
      data: {
        id: "def",
        courseVersionId: assessedVersion,
        competencyId: "cmp",
        method: "auto_graded_quiz",
        title: "Sample quiz",
        description: "One keyed question.",
        durationMinutes: 20,
        maxAttempts: 2,
        passingScoreHypothesis: 75,
        reviewRequired: true,
        policySummary: "Review is required.",
      },
    });
    await prisma.assessmentVersion.create({
      data: { id: "av", definitionId: "def", versionLabel: "v1", status: "active", publishedAt: new Date("2026-01-01T00:00:00.000Z") },
    });
    await prisma.rubricCriterion.create({
      data: { id: "crit", assessmentVersionId: "av", name: "Objectives", description: "Keyed item.", requiredForPass: true },
    });
    await prisma.question.create({
      data: {
        id: "q1",
        assessmentVersionId: "av",
        criterionId: "crit",
        orderIndex: 1,
        type: "multiple_choice",
        prompt: "Which option is keyed?",
        optionsJson: JSON.stringify([{ key: "A", text: "No" }, { key: "B", text: "Yes" }]),
        correctOptionKey: "B",
        expectedElementsJson: "[]",
      },
    });
  }
  await prisma.courseCompletionRecord.create({
    data: {
      id: "ccr",
      publicId: "CCR-TEST-0001",
      learnerId: "learner",
      courseVersionId: "v1",
      completedAt: new Date("2026-01-20T00:00:00.000Z"),
      source: "demo_seed",
    },
  });
}

beforeEach(async () => {
  await resetDatabase();
  await people();
});

describe("certificate workflow", () => {
  it("does not create a proof 180 Certificate from completion alone", async () => {
    await courseGraph("quiz");
    expect(await prisma.competencyCertificate.count()).toBe(0);
  });

  it("rejects an unauthorized or ineligible start", async () => {
    await courseGraph("quiz");
    await expect(
      startAssessment({ actorId: "other", completionId: "ccr", acknowledged: true, integrityConsent: false }),
    ).rejects.toMatchObject({ code: "forbidden" });
    await expect(
      startAssessment({ actorId: "learner", completionId: "ccr", acknowledged: false, integrityConsent: false }),
    ).rejects.toMatchObject({ code: "acknowledgement_required" });
  });

  it("keeps a course without an assessment from starting", async () => {
    await courseGraph("none");
    await expect(
      startAssessment({ actorId: "learner", completionId: "ccr", acknowledged: true, integrityConsent: false }),
    ).rejects.toMatchObject({ code: "design_required" });
  });

  it("submits to pending review and issues only after approval", async () => {
    await courseGraph("quiz");
    const started = await startAssessment({
      actorId: "learner",
      completionId: "ccr",
      acknowledged: true,
      integrityConsent: false,
    });
    await prisma.answer.create({
      data: { id: "ans", attemptId: started.attemptId, questionId: "q1", value: "B", savedAt: new Date() },
    });
    const submitted = await submitAttempt({ actorId: "learner", attemptId: started.attemptId });
    expect(submitted.state).toBe("pending_review");
    expect(await prisma.competencyCertificate.count()).toBe(0);
    const duplicate = await submitAttempt({ actorId: "learner", attemptId: started.attemptId });
    expect(duplicate.duplicate).toBe(true);
    expect(await prisma.evaluationResult.count()).toBe(1);

    await expect(
      decideReview({ actorId: "learner", attemptId: started.attemptId, decision: "approve", reason: "Learners cannot approve themselves." }),
    ).rejects.toMatchObject({ code: "forbidden" });

    await decideReview({
      actorId: "reviewer",
      attemptId: started.attemptId,
      decision: "approve",
      reason: "The proposed pass matches the keyed response.",
    });
    expect(await prisma.competencyCertificate.count()).toBe(1);
    await expect(
      decideReview({
        actorId: "reviewer",
        attemptId: started.attemptId,
        decision: "approve",
        reason: "A second approval must not issue another certificate.",
      }),
    ).rejects.toMatchObject({ code: "invalid_transition" });
    expect(await prisma.competencyCertificate.count()).toBe(1);
  });

  it("does not issue a certificate when the reviewer rejects", async () => {
    await courseGraph("quiz");
    const started = await startAssessment({
      actorId: "learner",
      completionId: "ccr",
      acknowledged: true,
      integrityConsent: false,
    });
    await prisma.answer.create({
      data: { id: "ans", attemptId: started.attemptId, questionId: "q1", value: "A", savedAt: new Date() },
    });
    await submitAttempt({ actorId: "learner", attemptId: started.attemptId });
    await decideReview({
      actorId: "reviewer",
      attemptId: started.attemptId,
      decision: "reject",
      reason: "The proposed fail stands. No certificate is issued.",
    });
    expect(await prisma.competencyCertificate.count()).toBe(0);
    const attempt = await prisma.assessmentAttempt.findUniqueOrThrow({ where: { id: started.attemptId } });
    expect(attempt.state).toBe("not_issued");
  });

  it("distinguishes an unknown ID from a completion record and a pending assessment", async () => {
    await courseGraph("quiz");
    const started = await startAssessment({
      actorId: "learner",
      completionId: "ccr",
      acknowledged: true,
      integrityConsent: false,
    });
    await prisma.answer.create({
      data: { id: "ans", attemptId: started.attemptId, questionId: "q1", value: "B", savedAt: new Date() },
    });
    await submitAttempt({ actorId: "learner", attemptId: started.attemptId });
    const pending = await verifyCertificate(started.attemptId);
    expect(pending.outcome).toBe("assessment_status");
    if (pending.outcome === "assessment_status") {
      expect(pending.status).toBe("Pending Review");
      expect(JSON.stringify(pending).toLowerCase()).not.toContain("which option");
    }

    await decideReview({
      actorId: "reviewer",
      attemptId: started.attemptId,
      decision: "approve",
      reason: "Approved for the verification test.",
    });
    const certificate = await prisma.competencyCertificate.findFirstOrThrow();
    const verified = await verifyCertificate(certificate.publicId);
    expect(verified.outcome).toBe("verified");
    if (verified.outcome === "verified") {
      expect(verified.learnerName).toBe("Learner One");
      expect(verified.assessmentMethod).toBe("Automatically graded quiz");
    }

    const unknown = await verifyCertificate("CTC-DOES-NOT-EXIST");
    const completion = await verifyCertificate("CCR-TEST-0001");
    expect(unknown).toEqual({ outcome: "invalid", message: INVALID_MESSAGE });
    expect(JSON.stringify(unknown)).not.toContain("Learner One");
    expect(completion.outcome).toBe("completion_record");
    if (completion.outcome === "completion_record") {
      expect(completion.learnerName).toBe("Learner One");
      expect(completion.message).toContain("not a proof 180 Certificate");
    }
  });

  it("preserves version 1 when a later version has the assessment", async () => {
    await courseGraph("later");
    await expect(
      startAssessment({ actorId: "learner", completionId: "ccr", acknowledged: true, integrityConsent: false }),
    ).rejects.toMatchObject({ code: "not_yet_eligible" });
    const completion = await prisma.courseCompletionRecord.findUniqueOrThrow({ where: { id: "ccr" } });
    expect(completion.courseVersionId).toBe("v1");
    expect(await prisma.competencyCertificate.count()).toBe(0);
  });

  it("migrates a historical completion once and does not create a certificate", async () => {
    await courseGraph("none");
    await prisma.legacyCertificate.create({
      data: {
        id: "leg-1",
        learnerId: "learner",
        courseVersionId: "v1",
        issuedAt: new Date("2024-03-12T00:00:00.000Z"),
        label: "Certificate of Completion",
        statement: "Historical completion only.",
        completionPublicId: "CCR-OLD-00001",
      },
    });
    const first = await migrateHistoricalCompletions("reviewer");
    const second = await migrateHistoricalCompletions("reviewer");
    expect(first.created).toBe(1);
    expect(second.created).toBe(0);
    const imported = await prisma.courseCompletionRecord.findUniqueOrThrow({ where: { publicId: "CCR-OLD-00001" } });
    expect(imported.courseVersionId).toBe("v1");
    expect(imported.source).toBe("historical_import");
    expect(await prisma.competencyCertificate.count()).toBe(0);
  });

  it("revokes a verified certificate without exposing the reason through verification", async () => {
    await courseGraph("quiz");
    const started = await startAssessment({
      actorId: "learner",
      completionId: "ccr",
      acknowledged: true,
      integrityConsent: false,
    });
    await prisma.answer.create({
      data: { id: "ans", attemptId: started.attemptId, questionId: "q1", value: "B", savedAt: new Date() },
    });
    await submitAttempt({ actorId: "learner", attemptId: started.attemptId });
    await decideReview({
      actorId: "reviewer",
      attemptId: started.attemptId,
      decision: "approve",
      reason: "Approved before the revocation check.",
    });
    const certificate = await prisma.competencyCertificate.findFirstOrThrow();
    await revokeCertificate({
      actorId: "reviewer",
      certificatePublicId: certificate.publicId,
      reason: "Disputed evidence requires revocation in this sample.",
    });
    const result = await verifyCertificate(certificate.publicId);
    expect(result.outcome).toBe("revoked");
    expect(JSON.stringify(result)).not.toContain("Disputed evidence");
    await expect(
      revokeCertificate({
        actorId: "reviewer",
        certificatePublicId: certificate.publicId,
        reason: "A second revocation is not a valid transition.",
      }),
    ).rejects.toMatchObject({ code: "invalid_transition" });
  });
});
