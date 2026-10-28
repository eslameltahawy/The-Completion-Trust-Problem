import { randomBytes } from "node:crypto";

export function newId(prefix: string) {
  return `${prefix}_${randomBytes(8).toString("hex")}`;
}

export function newCertificatePublicId() {
  return `CTC-${randomBytes(5).toString("hex").toUpperCase()}`;
}
