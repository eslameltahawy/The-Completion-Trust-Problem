import { describe, expect, it } from "vitest";
import { demoEvaluator } from "./demo-evaluator";

const criterion = { id: "c1", name: "Objectives", requiredForPass: true };
const question = {
  id: "q1",
  type: "multiple_choice",
  criterionId: "c1",
  correctOptionKey: "B",
  expectedElements: [],
};

describe("demo evaluator", () => {
  it("proposes pass or fail without issuing anything", () => {
    const pass = demoEvaluator.evaluate({
      questions: [question],
      criteria: [criterion],
      answers: [{ questionId: "q1", value: "B" }],
      passingScoreHypothesis: 75,
    });
    const fail = demoEvaluator.evaluate({
      questions: [question],
      criteria: [criterion],
      answers: [{ questionId: "q1", value: "A" }],
      passingScoreHypothesis: 75,
    });
    expect(pass.method).toBe("demo_evaluator_v1");
    expect(pass.proposedOutcome).toBe("pass");
    expect(fail.proposedOutcome).toBe("fail");
    expect(pass.hypothesisLabel.toLowerCase()).toContain("unvalidated");
    expect(pass).not.toHaveProperty("certificateId");
  });

  it("uses explicit elements for a written answer and does not score similarity", () => {
    const written = {
      id: "q2",
      type: "short_text",
      criterionId: "c1",
      correctOptionKey: null,
      expectedElements: ["region", "group by"],
    };
    const partial = demoEvaluator.evaluate({
      questions: [written],
      criteria: [criterion],
      answers: [{ questionId: "q2", value: "Show the region totals." }],
      passingScoreHypothesis: null,
    });
    expect(partial.scorePercent).toBeNull();
    expect(partial.criterionResults[0]?.level).toBe("partial");
    expect(partial.proposedOutcome).toBe("fail");
  });
});
