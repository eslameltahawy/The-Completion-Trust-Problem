import { PrismaClient } from "@prisma/client";
import { demoEvaluator } from "../src/domain/evaluation/demo-evaluator";
import type { CriterionEvaluation } from "../src/domain/evaluation/types";
import { buildCertificateCopy } from "../src/domain/issuance";
import { newId } from "../src/domain/ids";
import { hashPassword } from "../src/server/password";
import { resetDatabase } from "../src/server/reset";
import { migrateHistoricalCompletions } from "../src/server/services";

const prisma = new PrismaClient();

function options(pairs: Array<[string, string]>) {
  return JSON.stringify(pairs.map(([key, text]) => ({ key, text })));
}

const passwordHash = hashPassword("demo-pass");

function user(
  id: string,
  email: string,
  name: string,
  role: string,
  segment: string | null,
  organization: string | null,
) {
  return { id, email, name, role, segment, organization, passwordHash };
}

function criterion(
  id: string,
  assessmentVersionId: string,
  name: string,
  description: string,
  requiredForPass: boolean,
) {
  return { id, assessmentVersionId, name, description, requiredForPass };
}

async function main() {
  await resetDatabase();

  const users = [
    user("usr-amira", "amira.hassan@demo.local", "Amira Hassan", "learner", "self_directed", null),
    user("usr-omar", "omar.nasser@demo.local", "Omar Nasser", "learner", "corporate", "Northwind Logistics"),
    user("usr-yusuf", "yusuf.adel@demo.local", "Yusuf Adel", "learner", "self_directed", null),
    user("usr-layla", "layla.farouk@demo.local", "Layla Farouk", "learner", "self_directed", null),
    user("usr-sara", "sara.ibrahim@demo.local", "Sara Ibrahim", "learner", "corporate", "Helios Retail"),
    user("usr-hana", "hana.mostafa@demo.local", "Hana Mostafa", "learner", "self_directed", null),
    user("usr-karim", "karim.soliman@demo.local", "Karim Soliman", "learner", "self_directed", null),
    user("usr-noor", "noor.fahmy@demo.local", "Noor Fahmy", "learner", "corporate", "Cedar Health"),
    user("usr-rania", "rania.saleh@demo.local", "Rania Saleh", "learner", "self_directed", null),
    user("usr-nadia", "nadia.karim@demo.local", "Nadia Karim", "reviewer", null, null),
  ];
  await prisma.user.createMany({ data: users });

  const courses = [
    ["crs-data", "Data Literacy Fundamentals", "How to read claims, changes, and charts without overstating what the data shows."],
    ["crs-sql", "SQL for Business Analysis", "How to ask a database a question at the right grain."],
    ["crs-disc", "Product Discovery Basics", "How to test a feature request before treating it as a requirement."],
    ["crs-comm", "Workplace Communication", "How to write a clear update for a mixed audience."],
    ["crs-excel", "Excel for Operations", "Spreadsheets for operational tracking, lookups, and checks."],
    ["crs-agile", "Agile Delivery for Teams", "How a team makes a sprint outcome visible and negotiates change."],
  ] as const;
  for (const [id, title, summary] of courses) {
    await prisma.course.create({ data: { id, title, summary } });
  }

  const versions = [
    ["cv-data-v1", "crs-data", "v1", true, "2025-09-01", "Interpret a claim, a percent change, and a chart without adding a cause the data does not show.", ["Separate association from causation", "State a count change and a percent change correctly", "Recognize a truncated axis", "Name the missing comparison in a success story"]],
    ["cv-sql-v1", "crs-sql", "v1", true, "2025-10-01", "Write a grouped count and explain what a join does to that count.", ["Count open tickets by region", "Explain a doubled count after a join"]],
    ["cv-disc-v1", "crs-disc", "v1", true, "2025-08-01", "Frame a request as a problem, an assumption, and a test.", ["Separate the user problem from the requested feature", "Name a metric that would not answer the question"]],
    ["cv-comm-v1", "crs-comm", "v1", true, "2025-07-01", "Draft a short status update. No competency assessment has been designed for this course.", ["State the decision, the reason, and the ask"]],
    ["cv-excel-v1", "crs-excel", "v1", false, "2024-01-15", "Version 1 covered formulas, tables, and basic charts. It did not assess data-integrity checks.", ["Use a formula", "Build a table", "Read a basic chart"]],
    ["cv-excel-v2", "crs-excel", "v2", true, "2025-11-01", "Version 2 adds lookup audits and data-integrity checks. A version 1 completion does not cover these objectives.", ["Choose an absolute or relative reference", "Audit a lookup mismatch"]],
    ["cv-agile-v1", "crs-agile", "v1", true, "2025-06-01", "Connect sprint activity to an outcome and respond to a mid-sprint change.", ["Explain a sprint goal", "Name the trade in a new request"]],
  ] as const;
  for (const [id, courseId, versionLabel, isCurrent, publishedAt, summary, objectives] of versions) {
    await prisma.courseVersion.create({
      data: {
        id,
        courseId,
        versionLabel,
        isCurrent,
        publishedAt: new Date(`${publishedAt}T00:00:00.000Z`),
        summary,
        objectivesJson: JSON.stringify(objectives),
      },
    });
  }

  const competencies = [
    ["cmp-data", "crs-data", "Interpret data claims", "The learner can describe what a simple comparison does and does not prove."],
    ["cmp-sql", "crs-sql", "Query at the right grain", "The learner can count records at the grain the question asks for."],
    ["cmp-disc", "crs-disc", "Frame a discovery test", "The learner can turn a feature request into a problem, an assumption, and a test."],
    ["cmp-excel", "crs-excel", "Audit a spreadsheet lookup", "The learner can spot a reference or lookup error in an operations sheet."],
    ["cmp-agile", "crs-agile", "Protect a sprint outcome", "The learner can distinguish a sprint goal from a task list and name a tradeoff."],
  ] as const;
  for (const [id, courseId, name, description] of competencies) {
    await prisma.competency.create({ data: { id, courseId, name, description } });
  }

  await prisma.assessmentDefinition.createMany({
    data: [
      { id: "ad-data", courseVersionId: "cv-data-v1", competencyId: "cmp-data", method: "auto_graded_quiz", title: "Data claims quiz", description: "Four questions on claims, changes, and charts from the course objectives.", durationMinutes: 20, maxAttempts: 2, passingScoreHypothesis: 75, reviewRequired: true, policySummary: "Automatically graded quiz. The score is a proposal for the reviewer." },
      { id: "ad-sql", courseVersionId: "cv-sql-v1", competencyId: "cmp-sql", method: "scenario_short_answer", title: "Ticket-count scenario", description: "A short query and a scenario about a join that doubles a count.", durationMinutes: 30, maxAttempts: 2, passingScoreHypothesis: null, reviewRequired: true, policySummary: "Scenario and short-answer assessment. Rubric levels are not an answer-similarity score." },
      { id: "ad-disc", courseVersionId: "cv-disc-v1", competencyId: "cmp-disc", method: "practical_task", title: "Export-request practical", description: "A practical response to a request for PDF export on a learner dashboard.", durationMinutes: 40, maxAttempts: 2, passingScoreHypothesis: null, reviewRequired: true, policySummary: "Practical task reviewed against a rubric. There is no numeric pass mark." },
      { id: "ad-excel", courseVersionId: "cv-excel-v2", competencyId: "cmp-excel", method: "auto_graded_quiz", title: "Lookup audit quiz", description: "Two questions on version 2 objectives. Version 1 completions are not eligible.", durationMinutes: 15, maxAttempts: 2, passingScoreHypothesis: 75, reviewRequired: true, policySummary: "Quiz for Excel version 2 only." },
      { id: "ad-agile", courseVersionId: "cv-agile-v1", competencyId: "cmp-agile", method: "simulated_integrity_quiz", title: "Sprint outcome assessment", description: "A quiz and two written answers. The required check is Google Chrome sharing the entire screen, with one still every five minutes. The camera stays off. There is no video.", durationMinutes: 25, maxAttempts: 2, passingScoreHypothesis: null, reviewRequired: true, policySummary: "Prototype integrity signals only. A signal cannot reject the attempt by itself." },
    ],
  });

  await prisma.assessmentVersion.createMany({
    data: ["ad-data", "ad-sql", "ad-disc", "ad-excel", "ad-agile"].map((definitionId) => ({
      id: definitionId.replace("ad-", "av-"),
      definitionId,
      versionLabel: "v1",
      status: "active",
      publishedAt: new Date("2025-11-15T00:00:00.000Z"),
    })),
  });

  await prisma.rubricCriterion.createMany({
    data: [
      criterion("c-data", "av-data", "Interpret data claims", "Keyed questions covering the four version 1 objectives.", true),
      criterion("c-sql-query", "av-sql", "Grouped count", "The response asks for a count of open tickets by region.", true),
      criterion("c-sql-grain", "av-sql", "Join grain", "The response explains the duplicated grain and a correction.", true),
      criterion("c-disc-problem", "av-disc", "Problem framing", "The response names a user, a problem, and an assumption.", true),
      criterion("c-disc-metric", "av-disc", "Rejected metric", "The response names a metric it would not use and why.", true),
      criterion("c-excel", "av-excel", "Lookup audit", "Keyed questions for the version 2 objectives.", true),
      criterion("c-agile-outcome", "av-agile", "Sprint outcome", "The response distinguishes an outcome from a task list and reads the stakeholder gap.", true),
      criterion("c-agile-change", "av-agile", "Change tradeoff", "The response names the sprint goal and a trade.", true),
    ],
  });

  const questions = [
    ["q-data-1", "av-data", "c-data", 1, "multiple_choice", "A city report shows ice cream sales and drowning incidents rising in the same months. Which conclusion is supported?", null, options([["A", "Ice cream sales cause drowning."], ["B", "The two measures move together, which does not by itself show that one causes the other."], ["C", "Drowning incidents cause ice cream sales."], ["D", "The relationship is meaningless whenever both are percentages."]]), "B", []],
    ["q-data-2", "av-data", "c-data", 2, "multiple_choice", "Headcount moved from 80 to 100. Which statement is accurate?", null, options([["A", "Headcount grew by 20 percent and by 20 percentage points."], ["B", "Headcount grew by 20 people, which is a 25 percent increase."], ["C", "Headcount grew by 25 people."], ["D", "Headcount grew by 80 percent."]]), "B", []],
    ["q-data-3", "av-data", "c-data", 3, "multiple_choice", "A bar chart of completion rates starts at 90 rather than 0. What is the main risk?", null, options([["A", "The chart cannot be printed."], ["B", "Differences between bars look larger than the actual gaps."], ["C", "The rates stop being percentages."], ["D", "The axis may only use whole numbers."]]), "B", []],
    ["q-data-4", "av-data", "c-data", 4, "multiple_choice", "People who completed a course were promoted more often than people who did not enroll. What is missing before treating the course as the cause?", null, options([["A", "A comparison that accounts for how people were selected into the course."], ["B", "A longer course title."], ["C", "Only the instructor's years of experience."], ["D", "A certificate logo."]]), "A", []],
    ["q-sql-1", "av-sql", "c-sql-query", 1, "short_text", "Write a SQL query that returns one row per region with the number of open tickets. Use tickets(id, opened_at, status, region).", null, null, null, ["select", "count", "region", "group by", "open"]],
    ["q-sql-2", "av-sql", "c-sql-grain", 2, "scenario", "The open-ticket count doubled after you joined tickets to agents on region. Agents can include more than one person in a region. What happened, and what would you change?", "The join is many agents to one region. The question is about tickets, not agent rows.", null, null, ["more than one", "before", "count"]],
    ["q-disc-1", "av-disc", "c-disc-problem", 1, "practical", "A director asks for export to PDF on the learner dashboard. Describe the user, the problem, and the riskiest assumption before any build decision.", null, null, null, ["user", "problem", "assumption"]],
    ["q-disc-2", "av-disc", "c-disc-metric", 2, "problem_solving", "Name one metric you would not use for this request, and say why.", null, null, null, ["metric", "because"]],
    ["q-excel-1", "av-excel", "c-excel", 1, "multiple_choice", "A formula copied down a column keeps changing the tax-rate cell. What is the usual fix?", null, options([["A", "Delete the tax-rate cell."], ["B", "Lock the tax-rate reference so the copy does not move it."], ["C", "Convert the tax rate to text."], ["D", "Sort the column first."]]), "B", []],
    ["q-excel-2", "av-excel", "c-excel", 2, "multiple_choice", "A lookup returns a match for the wrong site because two site codes differ by a trailing space. What should the audit do first?", null, options([["A", "Hide the column."], ["B", "Increase the font size."], ["C", "Compare the stored codes, including spaces, before trusting the match."], ["D", "Replace the lookup with a colour scale."]]), "C", []],
    ["q-agile-1", "av-agile", "c-agile-outcome", 1, "multiple_choice", "A team finishes every sprint commitment, but stakeholders still say they are surprised. What is the most useful first explanation?", null, options([["A", "The team needs more story points."], ["B", "Work is finishing without a shared understanding of the outcome."], ["C", "The sprint must be changed to two weeks."], ["D", "Stakeholders should stop attending the review."]]), "B", []],
    ["q-agile-2", "av-agile", "c-agile-change", 2, "scenario", "Mid-sprint, a director adds a story and calls it a must-ship for this sprint. What should the team do first?", "The sprint already has a goal.", null, null, ["sprint goal", "trade"]],
    ["q-agile-3", "av-agile", "c-agile-outcome", 3, "short_text", "In two or three sentences, contrast a sprint goal with a task list.", null, null, null, ["outcome", "task"]],
  ] as const;

  for (const question of questions) {
    const [id, assessmentVersionId, criterionId, orderIndex, type, prompt, context, optionsJson, correctOptionKey, expectedElements] = question;
    await prisma.question.create({
      data: {
        id,
        assessmentVersionId,
        criterionId,
        orderIndex,
        type,
        prompt,
        context,
        optionsJson,
        correctOptionKey,
        expectedElementsJson: JSON.stringify(expectedElements),
      },
    });
  }

  await prisma.legacyCertificate.create({
    data: {
      id: "leg-layla-excel",
      learnerId: "usr-layla",
      courseVersionId: "cv-excel-v1",
      issuedAt: new Date("2024-03-12T00:00:00.000Z"),
      label: "Certificate of Completion",
      statement: "Historical completion document for Excel for Operations version 1. It did not assess competency.",
      completionPublicId: "CCR-LAYLA-EXCL1",
    },
  });
  await migrateHistoricalCompletions("usr-nadia");
  await migrateHistoricalCompletions("usr-nadia");

  const completions = [
    ["ccr-amira-data", "CCR-AMIRA-DATA1", "usr-amira", "cv-data-v1", "2026-01-15"],
    ["ccr-amira-comm", "CCR-AMIRA-COMM1", "usr-amira", "cv-comm-v1", "2026-02-01"],
    ["ccr-amira-excel", "CCR-AMIRA-EXCL2", "usr-amira", "cv-excel-v2", "2026-03-01"],
    ["ccr-omar-sql", "CCR-OMAR-SQL001", "usr-omar", "cv-sql-v1", "2026-09-12"],
    ["ccr-omar-agile", "CCR-OMAR-AGILE1", "usr-omar", "cv-agile-v1", "2026-08-20"],
    ["ccr-yusuf-data", "CCR-YUSUF-DATA1", "usr-yusuf", "cv-data-v1", "2026-05-02"],
    ["ccr-yusuf-comm", "CCR-YUSUF-COMM1", "usr-yusuf", "cv-comm-v1", "2026-05-20"],
    ["ccr-sara-data", "CCR-SARA-DATA01", "usr-sara", "cv-data-v1", "2026-03-18"],
    ["ccr-sara-disc", "CCR-SARA-DISC01", "usr-sara", "cv-disc-v1", "2026-09-28"],
    ["ccr-hana-comm", "CCR-HANA-COMM01", "usr-hana", "cv-comm-v1", "2026-04-04"],
    ["ccr-hana-data", "CCR-HANA-DATA01", "usr-hana", "cv-data-v1", "2026-07-07"],
    ["ccr-karim-disc", "CCR-KARIM-DISC1", "usr-karim", "cv-disc-v1", "2026-10-01"],
    ["ccr-noor-agile", "CCR-NOOR-AGILE1", "usr-noor", "cv-agile-v1", "2026-04-22"],
    ["ccr-noor-sql", "CCR-NOOR-SQL001", "usr-noor", "cv-sql-v1", "2026-06-16"],
    ["ccr-layla-data", "CCR-LAYLA-DATA1", "usr-layla", "cv-data-v1", "2026-08-08"],
  ] as const;
  for (const [id, publicId, learnerId, courseVersionId, completedAt] of completions) {
    await prisma.courseCompletionRecord.create({
      data: {
        id,
        publicId,
        learnerId,
        courseVersionId,
        completedAt: new Date(`${completedAt}T00:00:00.000Z`),
        source: "demo_seed",
      },
    });
  }

  async function gradeAndStore(input: {
    id: string;
    learnerId: string;
    completionId: string;
    assessmentVersionId: string;
    attemptNumber: number;
    state: string;
    startedAt: string;
    submittedAt: string;
    deadlineAt: string;
    consent: boolean;
    accommodationNote?: string;
    answers: Record<string, string>;
    decision?: { decision: string; reason: string; at: string };
    certificate?: { id: string; publicId: string; status: "verified" | "revoked"; issuedAt: string; revokedAt?: string; revocationReason?: string };
    integrity?: { id: string; at: string; note: string };
  }) {
    const version = await prisma.assessmentVersion.findUniqueOrThrow({
      where: { id: input.assessmentVersionId },
      include: { questions: true, criteria: true, definition: true },
    });
    const evaluation = demoEvaluator.evaluate({
      passingScoreHypothesis: version.definition.passingScoreHypothesis,
      criteria: version.criteria.map((criterion) => ({
        id: criterion.id,
        name: criterion.name,
        requiredForPass: criterion.requiredForPass,
      })),
      questions: version.questions.map((question) => ({
        id: question.id,
        type: question.type,
        criterionId: question.criterionId,
        correctOptionKey: question.correctOptionKey,
        expectedElements: JSON.parse(question.expectedElementsJson) as string[],
      })),
      answers: Object.entries(input.answers).map(([questionId, value]) => ({ questionId, value })),
    });
    await prisma.assessmentAttempt.create({
      data: {
        id: input.id,
        learnerId: input.learnerId,
        assessmentVersionId: input.assessmentVersionId,
        completionRecordId: input.completionId,
        attemptNumber: input.attemptNumber,
        state: input.state,
        startedAt: new Date(input.startedAt),
        deadlineAt: new Date(input.deadlineAt),
        submittedAt: new Date(input.submittedAt),
        policyAcknowledgedAt: new Date(input.startedAt),
        integrityConsent: input.consent,
        accommodationNote: input.accommodationNote,
      },
    });
    for (const [questionId, value] of Object.entries(input.answers)) {
      await prisma.answer.create({
        data: { id: newId("ans"), attemptId: input.id, questionId, value, savedAt: new Date(input.submittedAt) },
      });
    }
    await prisma.evaluationResult.create({
      data: {
        id: newId("eval"),
        attemptId: input.id,
        method: evaluation.method,
        proposedOutcome: evaluation.proposedOutcome,
        scorePercent: evaluation.scorePercent,
        rationale: evaluation.rationale,
        hypothesisLabel: evaluation.hypothesisLabel,
        criterionResultsJson: JSON.stringify(evaluation.criterionResults),
      },
    });
    await prisma.assessmentEvidence.create({
      data: {
        id: newId("evd"),
        attemptId: input.id,
        summary: "Reviewer evidence package. Employer verification does not receive answers or integrity events.",
        packageJson: JSON.stringify({
          evaluationMethod: evaluation.method,
          proposedOutcome: evaluation.proposedOutcome,
          scorePercent: evaluation.scorePercent,
        }),
      },
    });
    if (input.integrity) {
      await prisma.integrityEvent.create({
        data: {
          id: input.integrity.id,
          attemptId: input.id,
          eventType: "visibility_hidden",
          source: "prototype_seed",
          note: input.integrity.note,
          occurredAt: new Date(input.integrity.at),
        },
      });
    }
    if (input.decision) {
      const materialChange =
        (input.decision.decision === "approve" && evaluation.proposedOutcome === "fail") ||
        (input.decision.decision === "reject" && evaluation.proposedOutcome === "pass");
      await prisma.reviewerDecision.create({
        data: {
          id: newId("dec"),
          attemptId: input.id,
          reviewerId: "usr-nadia",
          decision: input.decision.decision,
          reason: input.decision.reason,
          priorProposedOutcome: evaluation.proposedOutcome,
          materialChange,
          createdAt: new Date(input.decision.at),
        },
      });
    }
    if (input.certificate) {
      const copy = buildCertificateCopy({
        criterionResults: evaluation.criterionResults as CriterionEvaluation[],
        materialChange: false,
      });
      await prisma.competencyCertificate.create({
        data: {
          id: input.certificate.id,
          publicId: input.certificate.publicId,
          attemptId: input.id,
          learnerId: input.learnerId,
          courseVersionId: version.definition.courseVersionId,
          assessmentVersionId: input.assessmentVersionId,
          competencyId: version.definition.competencyId,
          status: input.certificate.status,
          outcomeLabel: copy.outcomeLabel,
          criteriaSummary: copy.criteriaSummary,
          evidenceSummary: copy.evidenceSummary,
          issuedAt: new Date(input.certificate.issuedAt),
          revokedAt: input.certificate.revokedAt ? new Date(input.certificate.revokedAt) : null,
          revocationReason: input.certificate.revocationReason,
        },
      });
    }
    return evaluation.proposedOutcome;
  }

  const dataCorrect = { "q-data-1": "B", "q-data-2": "B", "q-data-3": "B", "q-data-4": "A" };
  const dataWrong = { "q-data-1": "A", "q-data-2": "A", "q-data-3": "A", "q-data-4": "C" };
  const sqlPass = {
    "q-sql-1": "SELECT region, COUNT(*) FROM tickets WHERE status = 'open' GROUP BY region",
    "q-sql-2": "More than one agent in a region duplicated tickets. Count the tickets before joining agents.",
  };
  const discoveryPass = {
    "q-disc-1": "The user is a learner who needs to share a result. The problem is trust in the outcome, not the absence of a file. The riskiest assumption is that a PDF would be accepted as evidence.",
    "q-disc-2": "I would not use a download metric because a download does not show that an employer trusted the competency evidence.",
  };
  const agilePass = {
    "q-agile-1": "B",
    "q-agile-2": "Restate the sprint goal and make the trade explicit before accepting the story.",
    "q-agile-3": "A sprint goal names the outcome. A task list only names the tasks.",
  };

  const amiraOutcome = await gradeAndStore({
    id: "att-amira-data", learnerId: "usr-amira", completionId: "ccr-amira-data", assessmentVersionId: "av-data", attemptNumber: 1, state: "issued", consent: false,
    startedAt: "2026-02-01T09:00:00.000Z", deadlineAt: "2026-02-01T09:20:00.000Z", submittedAt: "2026-02-01T09:16:00.000Z",
    answers: dataCorrect,
    decision: { decision: "approve", reason: "The proposed pass matches the keyed responses. I am issuing the proof 180 Certificate.", at: "2026-02-02T10:00:00.000Z" },
    certificate: { id: "ctc-amira-data", publicId: "CTC-4F8C1A9B2E", status: "verified", issuedAt: "2026-02-02T10:00:00.000Z" },
  });
  const saraOutcome = await gradeAndStore({
    id: "att-sara-data", learnerId: "usr-sara", completionId: "ccr-sara-data", assessmentVersionId: "av-data", attemptNumber: 1, state: "issued", consent: false,
    startedAt: "2026-04-01T09:00:00.000Z", deadlineAt: "2026-04-01T09:20:00.000Z", submittedAt: "2026-04-01T09:12:00.000Z",
    answers: dataCorrect,
    decision: { decision: "approve", reason: "Corporate learner's quiz proposal agrees with the rubric. Issuing the certificate.", at: "2026-04-03T11:00:00.000Z" },
    certificate: { id: "ctc-sara-data", publicId: "CTC-91D0E7C4A6", status: "verified", issuedAt: "2026-04-03T11:00:00.000Z" },
  });
  await gradeAndStore({
    id: "att-yusuf-1", learnerId: "usr-yusuf", completionId: "ccr-yusuf-data", assessmentVersionId: "av-data", attemptNumber: 1, state: "not_issued", consent: false,
    startedAt: "2026-05-10T09:00:00.000Z", deadlineAt: "2026-05-10T09:20:00.000Z", submittedAt: "2026-05-10T09:18:00.000Z",
    answers: dataWrong,
    decision: { decision: "reject", reason: "The proposed fail matches the keyed responses. No certificate is issued.", at: "2026-05-11T11:00:00.000Z" },
  });
  await gradeAndStore({
    id: "att-yusuf-2", learnerId: "usr-yusuf", completionId: "ccr-yusuf-data", assessmentVersionId: "av-data", attemptNumber: 2, state: "not_issued", consent: false,
    startedAt: "2026-05-20T09:00:00.000Z", deadlineAt: "2026-05-20T09:20:00.000Z", submittedAt: "2026-05-20T09:19:00.000Z",
    answers: dataWrong,
    decision: { decision: "reject", reason: "Second attempt still does not meet the rubric. The attempt limit is now exhausted.", at: "2026-05-21T11:00:00.000Z" },
  });
  const omarSql = await gradeAndStore({
    id: "att-omar-sql", learnerId: "usr-omar", completionId: "ccr-omar-sql", assessmentVersionId: "av-sql", attemptNumber: 1, state: "pending_review", consent: false,
    startedAt: "2026-10-20T08:00:00.000Z", deadlineAt: "2026-10-20T08:30:00.000Z", submittedAt: "2026-10-20T08:24:00.000Z",
    answers: sqlPass,
  });
  const saraDisc = await gradeAndStore({
    id: "att-sara-disc", learnerId: "usr-sara", completionId: "ccr-sara-disc", assessmentVersionId: "av-disc", attemptNumber: 1, state: "pending_review", consent: false,
    startedAt: "2026-10-21T08:00:00.000Z", deadlineAt: "2026-10-21T08:40:00.000Z", submittedAt: "2026-10-21T08:30:00.000Z",
    answers: discoveryPass,
  });
  const omarAgile = await gradeAndStore({
    id: "att-omar-agile", learnerId: "usr-omar", completionId: "ccr-omar-agile", assessmentVersionId: "av-agile", attemptNumber: 1, state: "returned", consent: true,
    startedAt: "2026-10-18T08:00:00.000Z", deadlineAt: "2026-10-18T08:25:00.000Z", submittedAt: "2026-10-18T08:20:00.000Z",
    answers: agilePass,
    decision: { decision: "return", reason: "One tab-hide signal is a review indicator, not proof of misconduct. Returning this for a second look instead of rejecting it.", at: "2026-10-19T12:00:00.000Z" },
    integrity: { id: "int-omar-agile", at: "2026-10-18T08:10:00.000Z", note: "Prototype evidence only. This signal was seeded for the demo and was not captured from a camera, screen share, or live browser session." },
  });
  const noorAgile = await gradeAndStore({
    id: "att-noor-agile", learnerId: "usr-noor", completionId: "ccr-noor-agile", assessmentVersionId: "av-agile", attemptNumber: 1, state: "issued", consent: true,
    startedAt: "2026-05-01T08:00:00.000Z", deadlineAt: "2026-05-01T08:25:00.000Z", submittedAt: "2026-05-01T08:18:00.000Z",
    answers: agilePass,
    decision: { decision: "approve", reason: "The proposed pass met the rubric at the time of review.", at: "2026-05-05T10:00:00.000Z" },
    certificate: {
      id: "ctc-noor-agile",
      publicId: "CTC-77B3E2D1C8",
      status: "revoked",
      issuedAt: "2026-05-05T10:00:00.000Z",
      revokedAt: "2026-06-01T10:00:00.000Z",
      revocationReason: "Post-issuance review could not rely on the integrity evidence. Revoked under the disputed-evidence policy. Sample data only.",
    },
    integrity: { id: "int-noor-agile", at: "2026-05-01T08:12:00.000Z", note: "Prototype evidence only. Seeded after issuance for the revocation scenario. Not a live capture." },
  });
  const noorSqlOutcome = await gradeAndStore({
    id: "att-noor-sql", learnerId: "usr-noor", completionId: "ccr-noor-sql", assessmentVersionId: "av-sql", attemptNumber: 1, state: "not_issued", consent: false,
    startedAt: "2026-07-01T08:00:00.000Z", deadlineAt: "2026-07-01T08:30:00.000Z", submittedAt: "2026-07-01T08:10:00.000Z",
    answers: { "q-sql-1": "Please list the open tickets.", "q-sql-2": "The report looks wrong." },
    decision: { decision: "reject", reason: "The response does not meet the query or grain criteria. Not issued. One attempt remains.", at: "2026-07-02T09:00:00.000Z" },
  });

  const karimStart = new Date(Date.now() - 10 * 60 * 1000);
  const karimDeadline = new Date(Date.now() + 50 * 60 * 1000);
  await prisma.assessmentAttempt.create({
    data: {
      id: "att-karim-disc",
      learnerId: "usr-karim",
      assessmentVersionId: "av-disc",
      completionRecordId: "ccr-karim-disc",
      attemptNumber: 1,
      state: "in_progress",
      startedAt: karimStart,
      deadlineAt: karimDeadline,
      policyAcknowledgedAt: karimStart,
      integrityConsent: true,
      accommodationNote: "Extended time (1.5x) is recorded as a sample accessibility accommodation. It is not a medical record.",
    },
  });
  await prisma.answer.create({
    data: {
      id: "ans-karim-1",
      attemptId: "att-karim-disc",
      questionId: "q-disc-1",
      value: "The user wants a button.",
      savedAt: karimStart,
    },
  });

  await prisma.auditLog.create({
    data: {
      id: "aud-noor-revoke",
      actorId: "usr-nadia",
      action: "certificate_revoked",
      entityType: "CompetencyCertificate",
      entityId: "ctc-noor-agile",
      detail: "Sample revocation for disputed integrity evidence. Employer view shows Revoked and omits the reason.",
      createdAt: new Date("2026-06-01T10:00:00.000Z"),
    },
  });

  const outcomes = { amiraOutcome, saraOutcome, omarSql, saraDisc, omarAgile, noorAgile };
  if (Object.values(outcomes).some((outcome) => outcome !== "pass") || noorSqlOutcome !== "fail") {
    throw new Error(`Unexpected demo proposals: ${JSON.stringify({ ...outcomes, noorSqlOutcome })}`);
  }
  const yusuf = await prisma.evaluationResult.findFirst({ where: { attemptId: "att-yusuf-1" } });
  if (yusuf?.proposedOutcome !== "fail") {
    throw new Error("Yusuf's first attempt should propose fail.");
  }

  const counts = {
    users: await prisma.user.count(),
    courses: await prisma.course.count(),
    versions: await prisma.courseVersion.count(),
    completions: await prisma.courseCompletionRecord.count(),
    questions: await prisma.question.count(),
    attempts: await prisma.assessmentAttempt.count(),
    certificates: await prisma.competencyCertificate.count(),
    legacy: await prisma.legacyCertificate.count(),
  };
  const total = Object.values(counts).reduce((sum, value) => sum + value, 0);
  if (total < 30) throw new Error(`Sample dataset has ${total} core records.`);
  console.log("Sample data ready", counts, { total });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
