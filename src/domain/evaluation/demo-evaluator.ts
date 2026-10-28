import type {
  CriterionEvaluation,
  EvalAnswer,
  EvalQuestion,
  EvaluationOutput,
  EvaluationProvider,
} from "./types";
import { DEMO_EVALUATOR_METHOD } from "./types";

function normalize(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function questionLevel(question: EvalQuestion, answer: EvalAnswer | undefined) {
  const value = normalize(answer?.value ?? "");
  if (question.type === "multiple_choice") {
    const correct = question.correctOptionKey?.toUpperCase() ?? "";
    const selected = (answer?.value ?? "").trim().toUpperCase();
    if (!selected) {
      return { demonstrated: false, partial: false, note: "No option was selected." };
    }
    if (selected === correct) {
      return { demonstrated: true, partial: false, note: "The selected option matched the keyed response." };
    }
    return { demonstrated: false, partial: false, note: "The selected option did not match the keyed response." };
  }

  const elements = question.expectedElements.map(normalize).filter(Boolean);
  if (elements.length === 0) {
    return {
      demonstrated: false,
      partial: false,
      note: "No expected elements are configured, so this response cannot be treated as demonstrated.",
    };
  }
  if (!value) {
    return { demonstrated: false, partial: false, note: "The response was empty." };
  }
  const hits = elements.filter((element) => value.includes(element)).length;
  if (hits === elements.length) {
    return {
      demonstrated: true,
      partial: false,
      note: `Matched ${hits} of ${elements.length} explicit expected elements.`,
    };
  }
  if (hits > 0) {
    return {
      demonstrated: false,
      partial: true,
      note: `Matched ${hits} of ${elements.length} explicit expected elements.`,
    };
  }
  return {
    demonstrated: false,
    partial: false,
    note: `Matched 0 of ${elements.length} explicit expected elements.`,
  };
}

function combine(levels: Array<"demonstrated" | "partial" | "not_demonstrated">) {
  if (levels.length === 0) return "not_demonstrated" as const;
  if (levels.every((level) => level === "demonstrated")) return "demonstrated" as const;
  if (levels.some((level) => level === "demonstrated" || level === "partial")) return "partial" as const;
  return "not_demonstrated" as const;
}

export const demoEvaluator: EvaluationProvider = {
  method: DEMO_EVALUATOR_METHOD,
  evaluate({ questions, criteria, answers, passingScoreHypothesis }) {
    const answerByQuestion = new Map(answers.map((answer) => [answer.questionId, answer]));
    const mcq = questions.filter((question) => question.type === "multiple_choice");
    const scorePercent =
      mcq.length === 0
        ? null
        : Math.round(
            (mcq.filter((question) => {
              const selected = (answerByQuestion.get(question.id)?.value ?? "").trim().toUpperCase();
              return selected && selected === (question.correctOptionKey ?? "").toUpperCase();
            }).length /
              mcq.length) *
              100,
          );

    const criterionResults: CriterionEvaluation[] = criteria.map((criterion) => {
      const linked = questions.filter((question) => question.criterionId === criterion.id);
      if (linked.length === 0) {
        return {
          criterionId: criterion.id,
          name: criterion.name,
          level: "not_demonstrated",
          notes: "No responses were mapped to this criterion.",
        };
      }

      const quizOnly = linked.every((question) => question.type === "multiple_choice");
      if (quizOnly && passingScoreHypothesis !== null && scorePercent !== null) {
        const level =
          scorePercent >= passingScoreHypothesis
            ? "demonstrated"
            : scorePercent >= Math.floor(passingScoreHypothesis / 2)
              ? "partial"
              : "not_demonstrated";
        return {
          criterionId: criterion.id,
          name: criterion.name,
          level,
          notes: `Quiz score ${scorePercent}% compared with the unvalidated hypothesis of ${passingScoreHypothesis}%.`,
        };
      }

      const levels = linked.map((question) => {
        const result = questionLevel(question, answerByQuestion.get(question.id));
        if (result.demonstrated) return "demonstrated" as const;
        if (result.partial) return "partial" as const;
        return "not_demonstrated" as const;
      });
      const notes = linked
        .map((question) => questionLevel(question, answerByQuestion.get(question.id)).note)
        .join(" ");
      return {
        criterionId: criterion.id,
        name: criterion.name,
        level: combine(levels),
        notes,
      };
    });

    const required = criterionResults.filter((result) => {
      const criterion = criteria.find((item) => item.id === result.criterionId);
      return criterion?.requiredForPass;
    });
    const proposedOutcome =
      required.length > 0 && required.every((result) => result.level === "demonstrated")
        ? "pass"
        : "fail";

    const hypothesisLabel =
      passingScoreHypothesis === null
        ? "Text checks look for explicit expected elements. That rule is a demo heuristic, not a validated measure of mastery."
        : `A score of ${passingScoreHypothesis}% or higher is an unvalidated passing hypothesis, not a calibrated standard.`;

    const rationale = `Demo evaluator proposed ${proposedOutcome}. ${hypothesisLabel} This proposal cannot issue a proof 180 Certificate.`;

    const output: EvaluationOutput = {
      method: DEMO_EVALUATOR_METHOD,
      proposedOutcome,
      scorePercent,
      rationale,
      hypothesisLabel,
      criterionResults,
    };
    return output;
  },
};
