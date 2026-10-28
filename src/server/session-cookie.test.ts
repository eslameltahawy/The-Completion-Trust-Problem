import { describe, expect, it } from "vitest";
import { readSession, signSession } from "./session-cookie";

const secret = "demo-only-session-secret-change-me";

describe("signed demo session", () => {
  it("reads the user from a cookie without a shared database session", () => {
    const expiresAtMs = Date.now() + 60_000;
    const token = signSession("usr-amira", expiresAtMs, secret);
    expect(readSession(token, secret)).toEqual({ userId: "usr-amira", expiresAtMs });
  });

  it("rejects a tampered, expired, or unknown cookie", () => {
    const token = signSession("usr-amira", Date.now() + 60_000, secret);
    const tampered = token.replace("usr-amira", "usr-nadia");
    expect(readSession(tampered, secret)).toBeNull();
    expect(readSession(token, "other-secret")).toBeNull();
    expect(readSession(signSession("usr-amira", Date.now() - 1, secret), secret)).toBeNull();
    expect(readSession("not-a-session", secret)).toBeNull();
  });
});
