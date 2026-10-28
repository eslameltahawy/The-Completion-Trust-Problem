import { describe, expect, it } from "vitest";
import { DomainError } from "./errors";
import { assertTransition, isMaterialChange } from "./states";

describe("attempt lifecycle", () => {
  it("rejects issuance directly from an in-progress attempt", () => {
    expect(() => assertTransition("in_progress", "issued")).toThrow(DomainError);
  });

  it("allows submit, review, and a single issuance step", () => {
    expect(() => assertTransition("in_progress", "submitted")).not.toThrow();
    expect(() => assertTransition("submitted", "pending_review")).not.toThrow();
    expect(() => assertTransition("pending_review", "issued")).not.toThrow();
    expect(() => assertTransition("issued", "not_issued")).toThrow(DomainError);
  });

  it("marks an approval of a proposed fail as a material change", () => {
    expect(isMaterialChange("fail", "approve")).toBe(true);
    expect(isMaterialChange("pass", "approve")).toBe(false);
    expect(isMaterialChange("pass", "return")).toBe(false);
  });
});
