import { describe, expect, it } from "vitest";
import { INVALID_MESSAGE, normalizeCertificateQuery, toPublicVerification } from "./verification";

const source = {
  status: "verified",
  publicId: "CTC-4F8C1A9B2E",
  learnerName: "Amira Hassan",
  courseTitle: "Data Literacy Fundamentals",
  versionLabel: "v1",
  competencyName: "Interpret data claims",
  assessmentMethod: "Automatically graded quiz",
  assessmentDateIso: "2026-02-01T09:16:00.000Z",
  outcomeLabel: "Demonstrated",
  criteriaSummary: "Interpret data claims — Demonstrated",
  evidenceSummary: "A reviewer approved issuance.",
};

describe("public verification", () => {
  it("hides personal data when nothing matches", () => {
    expect(toPublicVerification(null)).toEqual({
      outcome: "invalid",
      message: INVALID_MESSAGE,
    });
  });

  it("does not publish answers or reviewer notes for a verified certificate", () => {
    const result = toPublicVerification(source);
    expect(result.outcome).toBe("verified");
    expect(JSON.stringify(result).toLowerCase()).not.toContain("answer");
    expect(result).not.toHaveProperty("email");
  });

  it("shows a revoked certificate without the evidence package", () => {
    const result = toPublicVerification({ ...source, status: "revoked" });
    expect(result.outcome).toBe("revoked");
    expect(result).not.toHaveProperty("evidenceSummary");
    expect(result).not.toHaveProperty("revocationReason");
  });

  it("rejects unsafe lookup text", () => {
    expect(normalizeCertificateQuery("")).toBeNull();
    expect(normalizeCertificateQuery("CTC-4F8C1A9B2E")).toBe("CTC-4F8C1A9B2E");
    expect(normalizeCertificateQuery("bad id!")).toBeNull();
  });
});
