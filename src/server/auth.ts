import { createHmac, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DomainError } from "@/domain/errors";
import { newId } from "@/domain/ids";
import { prisma } from "./db";
import { verifyPassword } from "./password";

const COOKIE = "ctp_session";
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value) throw new Error("SESSION_SECRET is not set.");
  return value;
}

function hashToken(token: string) {
  return createHmac("sha256", secret()).update(token).digest("hex");
}

export async function getCurrentUser() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });
  if (!session || session.expiresAt.getTime() < Date.now()) return null;
  return session.user;
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });
  if (!user || !verifyPassword(password, user.passwordHash)) {
    throw new DomainError("invalid_login", "Email or password is incorrect.");
  }
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + WEEK_MS);
  await prisma.session.create({
    data: {
      id: newId("ses"),
      userId: user.id,
      tokenHash: hashToken(token),
      expiresAt,
    },
  });
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.VERCEL === "1",
    expires: expiresAt,
  });
  return user;
}

export async function logout() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  }
  jar.delete(COOKIE);
}

export async function requireRole(role: "learner" | "reviewer") {
  const user = await getCurrentUser();
  if (!user) redirect("/portal/login");
  if (user.role !== role) {
    redirect(user.role === "reviewer" ? "/portal/reviewer" : "/portal/student");
  }
  return user;
}
