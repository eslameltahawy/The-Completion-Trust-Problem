import { prisma } from "./db";

export async function resetDatabase() {
  await prisma.certificateVerificationEvent.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.reviewerDecision.deleteMany();
  await prisma.integrityEvent.deleteMany();
  await prisma.assessmentEvidence.deleteMany();
  await prisma.evaluationResult.deleteMany();
  await prisma.answer.deleteMany();
  await prisma.competencyCertificate.deleteMany();
  await prisma.assessmentAttempt.deleteMany();
  await prisma.session.deleteMany();
  await prisma.question.deleteMany();
  await prisma.rubricCriterion.deleteMany();
  await prisma.assessmentVersion.deleteMany();
  await prisma.assessmentDefinition.deleteMany();
  await prisma.courseCompletionRecord.deleteMany();
  await prisma.legacyCertificate.deleteMany();
  await prisma.competency.deleteMany();
  await prisma.courseVersion.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();
}
