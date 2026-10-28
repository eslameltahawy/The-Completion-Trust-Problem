import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DomainError } from "@/domain/errors";
import { prisma } from "./db";
import { verifyPassword } from "./password";
import { readSession, signSession } from "./session-cookie";

const COOKIE = "ctp_session";
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value) throw new Error("SESSION_SECRET is not set.");
  return value;
}

export async function getCurrentUser() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  const session = readSession(token, secret());
  if (!session) return null;
  return prisma.user.findUnique({ where: { id: session.userId } });
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });
  if (!user || !verifyPassword(password, user.passwordHash)) {
    throw new DomainError("invalid_login", "Email or password is incorrect.");
  }
  const expiresAt = new Date(Date.now() + WEEK_MS);
  const jar = await cookies();
  jar.set(COOKIE, signSession(user.id, expiresAt.getTime(), secret()), {
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
