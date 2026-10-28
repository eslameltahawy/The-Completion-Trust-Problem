import { describe, expect, it } from "vitest";
import { resolveProgress } from "./eligibility";

const base = {
  hasAssessment: true,
  laterVersionHasAssessment: false,
  maxAttempts: 2,
  attempts: [],
  certificatePublicId: null,
  certificateStatus: null,
};

describe("eligibility", () => {
  it("does not treat a bare completion as a certificate", () => {
    expect(resolveProgress(base).kind).toBe("ready");
  });

  it("keeps a course with no assessment in design required", () => {
    expect(resolveProgress({ ...base, hasAssessment: false }).kind).toBe("design_required");
  });

  it("does not make an older completion eligible for a later assessment", () => {
    expect(
      resolveProgress({ ...base, hasAssessment: false, laterVersionHasAssessment: true }).kind,
    ).toBe("not_yet_eligible");
  });

  it("exhausts the attempt limit without issuing a certificate", () => {
    const progress = resolveProgress({
      ...base,
      attempts: [
        { id: "a1", state: "not_issued", attemptNumber: 1 },
        { id: "a2", state: "not_issued", attemptNumber: 2 },
      ],
    });
    expect(progress.kind).toBe("exhausted");
  });

  it("prefers a revoked certificate over another attempt", () => {
    expect(
      resolveProgress({
        ...base,
        certificatePublicId: "CTC-1",
        certificateStatus: "revoked",
        attempts: [{ id: "a1", state: "issued", attemptNumber: 1 }],
      }).kind,
    ).toBe("revoked");
  });
});
