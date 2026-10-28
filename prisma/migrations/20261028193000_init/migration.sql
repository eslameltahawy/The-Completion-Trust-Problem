-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "segment" TEXT,
    "organization" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "CourseVersion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "courseId" TEXT NOT NULL,
    "versionLabel" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "objectivesJson" TEXT NOT NULL,
    "isCurrent" BOOLEAN NOT NULL,
    "publishedAt" DATETIME NOT NULL,
    CONSTRAINT "CourseVersion_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CourseCompletionRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "publicId" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "courseVersionId" TEXT NOT NULL,
    "completedAt" DATETIME NOT NULL,
    "source" TEXT NOT NULL,
    "legacyCertificateId" TEXT,
    "legacyLabel" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CourseCompletionRecord_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CourseCompletionRecord_courseVersionId_fkey" FOREIGN KEY ("courseVersionId") REFERENCES "CourseVersion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LegacyCertificate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "learnerId" TEXT NOT NULL,
    "courseVersionId" TEXT NOT NULL,
    "issuedAt" DATETIME NOT NULL,
    "label" TEXT NOT NULL,
    "statement" TEXT NOT NULL,
    "completionPublicId" TEXT NOT NULL,
    "migratedToId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Competency" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "courseId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "AssessmentDefinition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "courseVersionId" TEXT NOT NULL,
    "competencyId" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "maxAttempts" INTEGER NOT NULL,
    "passingScoreHypothesis" INTEGER,
    "reviewRequired" BOOLEAN NOT NULL,
    "policySummary" TEXT NOT NULL,
    CONSTRAINT "AssessmentDefinition_courseVersionId_fkey" FOREIGN KEY ("courseVersionId") REFERENCES "CourseVersion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AssessmentDefinition_competencyId_fkey" FOREIGN KEY ("competencyId") REFERENCES "Competency" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AssessmentVersion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "definitionId" TEXT NOT NULL,
    "versionLabel" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "publishedAt" DATETIME NOT NULL,
    CONSTRAINT "AssessmentVersion_definitionId_fkey" FOREIGN KEY ("definitionId") REFERENCES "AssessmentDefinition" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RubricCriterion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assessmentVersionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requiredForPass" BOOLEAN NOT NULL,
    CONSTRAINT "RubricCriterion_assessmentVersionId_fkey" FOREIGN KEY ("assessmentVersionId") REFERENCES "AssessmentVersion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assessmentVersionId" TEXT NOT NULL,
    "criterionId" TEXT,
    "orderIndex" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "context" TEXT,
    "optionsJson" TEXT,
    "correctOptionKey" TEXT,
    "expectedElementsJson" TEXT NOT NULL,
    CONSTRAINT "Question_assessmentVersionId_fkey" FOREIGN KEY ("assessmentVersionId") REFERENCES "AssessmentVersion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Question_criterionId_fkey" FOREIGN KEY ("criterionId") REFERENCES "RubricCriterion" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AssessmentAttempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "learnerId" TEXT NOT NULL,
    "assessmentVersionId" TEXT NOT NULL,
    "completionRecordId" TEXT NOT NULL,
    "attemptNumber" INTEGER NOT NULL,
    "state" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL,
    "deadlineAt" DATETIME NOT NULL,
    "submittedAt" DATETIME,
    "policyAcknowledgedAt" DATETIME NOT NULL,
    "integrityConsent" BOOLEAN NOT NULL,
    "accommodationNote" TEXT,
    CONSTRAINT "AssessmentAttempt_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AssessmentAttempt_assessmentVersionId_fkey" FOREIGN KEY ("assessmentVersionId") REFERENCES "AssessmentVersion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AssessmentAttempt_completionRecordId_fkey" FOREIGN KEY ("completionRecordId") REFERENCES "CourseCompletionRecord" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Answer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "savedAt" DATETIME NOT NULL,
    CONSTRAINT "Answer_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "AssessmentAttempt" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EvaluationResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "attemptId" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "proposedOutcome" TEXT NOT NULL,
    "scorePercent" INTEGER,
    "rationale" TEXT NOT NULL,
    "hypothesisLabel" TEXT NOT NULL,
    "criterionResultsJson" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EvaluationResult_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "AssessmentAttempt" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AssessmentEvidence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "attemptId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "packageJson" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AssessmentEvidence_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "AssessmentAttempt" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IntegrityEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "attemptId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "occurredAt" DATETIME NOT NULL,
    CONSTRAINT "IntegrityEvent_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "AssessmentAttempt" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReviewerDecision" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "attemptId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "priorProposedOutcome" TEXT NOT NULL,
    "materialChange" BOOLEAN NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReviewerDecision_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "AssessmentAttempt" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ReviewerDecision_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CompetencyCertificate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "publicId" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "courseVersionId" TEXT NOT NULL,
    "assessmentVersionId" TEXT NOT NULL,
    "competencyId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "outcomeLabel" TEXT NOT NULL,
    "criteriaSummary" TEXT NOT NULL,
    "evidenceSummary" TEXT NOT NULL,
    "issuedAt" DATETIME NOT NULL,
    "revokedAt" DATETIME,
    "revocationReason" TEXT,
    CONSTRAINT "CompetencyCertificate_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "AssessmentAttempt" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CompetencyCertificate_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CompetencyCertificate_courseVersionId_fkey" FOREIGN KEY ("courseVersionId") REFERENCES "CourseVersion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CompetencyCertificate_assessmentVersionId_fkey" FOREIGN KEY ("assessmentVersionId") REFERENCES "AssessmentVersion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CompetencyCertificate_competencyId_fkey" FOREIGN KEY ("competencyId") REFERENCES "Competency" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CertificateVerificationEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "queriedId" TEXT NOT NULL,
    "outcome" TEXT NOT NULL,
    "certificateId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CourseVersion_courseId_versionLabel_key" ON "CourseVersion"("courseId", "versionLabel");

-- CreateIndex
CREATE UNIQUE INDEX "CourseCompletionRecord_publicId_key" ON "CourseCompletionRecord"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseCompletionRecord_legacyCertificateId_key" ON "CourseCompletionRecord"("legacyCertificateId");

-- CreateIndex
CREATE INDEX "CourseCompletionRecord_learnerId_courseVersionId_idx" ON "CourseCompletionRecord"("learnerId", "courseVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentVersion_definitionId_versionLabel_key" ON "AssessmentVersion"("definitionId", "versionLabel");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentAttempt_learnerId_assessmentVersionId_attemptNumber_key" ON "AssessmentAttempt"("learnerId", "assessmentVersionId", "attemptNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Answer_attemptId_questionId_key" ON "Answer"("attemptId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "EvaluationResult_attemptId_key" ON "EvaluationResult"("attemptId");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentEvidence_attemptId_key" ON "AssessmentEvidence"("attemptId");

-- CreateIndex
CREATE UNIQUE INDEX "CompetencyCertificate_publicId_key" ON "CompetencyCertificate"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "CompetencyCertificate_attemptId_key" ON "CompetencyCertificate"("attemptId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");

