import { describe, expect, it } from "vitest";
import { planHistoricalMigration } from "./migration";

const legacy = {
  id: "leg-1",
  learnerId: "learner",
  courseVersionId: "v1",
  issuedAt: new Date("2024-03-12T00:00:00.000Z"),
  label: "Certificate of Completion",
  statement: "Completion only.",
  completionPublicId: "CCR-LAYLA-EXCL1",
  migratedToId: null,
};

describe("historical migration plan", () => {
  it("creates a completion record and never a proof 180 Certificate", () => {
    const plan = planHistoricalMigration([legacy], []);
    expect(plan.toCreate).toHaveLength(1);
    expect(plan.toCreate[0]?.source).toBe("historical_import");
    expect(plan.toCreate[0]?.courseVersionId).toBe("v1");
    expect(JSON.stringify(plan).toLowerCase()).not.toContain("competencycertificate");
  });

  it("is idempotent once a legacy row is linked", () => {
    const second = planHistoricalMigration([{ ...legacy, migratedToId: "ccr-1" }], [
      { id: "ccr-1", publicId: "CCR-LAYLA-EXCL1", legacyCertificateId: "leg-1" },
    ]);
    expect(second.toCreate).toHaveLength(0);
    expect(second.skippedIds).toEqual(["leg-1"]);
  });
});
