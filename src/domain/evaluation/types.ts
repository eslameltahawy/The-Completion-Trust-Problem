export const DEMO_EVALUATOR_METHOD = "demo_evaluator_v1";

export interface EvalCriterion {
  id: string;
  name: string;
  requiredForPass: boolean;
}

export interface EvalQuestion {
  id: string;
  type: string;
  criterionId: string | null;
  correctOptionKey: string | null;
  expectedElements: string[];
}

export interface EvalAnswer {
  questionId: string;
  value: string;
}

export interface CriterionEvaluation {
  criterionId: string;
  name: string;
  level: "demonstrated" | "partial" | "not_demonstrated";
  notes: string;
}

export interface EvaluationOutput {
  method: typeof DEMO_EVALUATOR_METHOD;
  proposedOutcome: "pass" | "fail";
  scorePercent: number | null;
  rationale: string;
  hypothesisLabel: string;
  criterionResults: CriterionEvaluation[];
}

export interface EvaluationProvider {
  method: typeof DEMO_EVALUATOR_METHOD;
  evaluate(input: {
    questions: EvalQuestion[];
    criteria: EvalCriterion[];
    answers: EvalAnswer[];
    passingScoreHypothesis: number | null;
  }): EvaluationOutput;
}
