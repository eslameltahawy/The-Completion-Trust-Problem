import { createHmac, timingSafeEqual } from "node:crypto";

const PREFIX = "v1";

export function signSession(userId: string, expiresAtMs: number, secret: string) {
  if (!/^[A-Za-z0-9-]+$/.test(userId)) {
    throw new Error("Invalid session subject.");
  }
  const payload = `${PREFIX}.${userId}.${expiresAtMs}`;
  const signature = createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}.${signature}`;
}

export function readSession(token: string, secret: string, now = Date.now()) {
  const parts = token.split(".");
  if (parts.length !== 4) return null;
  const [prefix, userId, expiresRaw, signature] = parts;
  if (prefix !== PREFIX || !/^[A-Za-z0-9-]+$/.test(userId) || !/^[0-9a-f]+$/.test(signature)) {
    return null;
  }
  const expiresAtMs = Number(expiresRaw);
  if (!Number.isSafeInteger(expiresAtMs) || expiresAtMs <= now) return null;
  const payload = `${prefix}.${userId}.${expiresRaw}`;
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  const actual = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  if (actual.length !== expectedBuffer.length || !timingSafeEqual(actual, expectedBuffer)) {
    return null;
  }
  return { userId, expiresAtMs };
}
