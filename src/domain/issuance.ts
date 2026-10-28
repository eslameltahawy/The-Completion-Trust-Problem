export interface CriterionResultInput {
  name: string;
  level: "demonstrated" | "partial" | "not_demonstrated";
}

const LEVEL_LABEL = {
  demonstrated: "Demonstrated",
  partial: "Partial",
  not_demonstrated: "Not demonstrated",
} as const;

export function buildCertificateCopy(input: {
  criterionResults: CriterionResultInput[];
  materialChange: boolean;
}) {
  const outcomeLabel = input.materialChange
    ? "Demonstrated after reviewer override"
    : "Demonstrated";
  const criteriaSummary =
    input.criterionResults.length === 0
      ? "Reviewer confirmed the competency outcome."
      : input.criterionResults
          .map((item) => `${item.name} — ${LEVEL_LABEL[item.level]}`)
          .join("; ");
  const evidenceSummary = input.materialChange
    ? "A reviewer approved issuance and recorded a reason for changing the proposed result. The public summary omits answers, integrity signals, and reviewer notes. A score, where one exists, did not issue this certificate by itself."
    : "A reviewer approved issuance after the assessment was checked against the published rubric. The public summary omits answers, integrity signals, and reviewer notes. A score, where one exists, did not issue this certificate by itself.";

  return { outcomeLabel, criteriaSummary, evidenceSummary };
}
