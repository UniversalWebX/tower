import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE, SESSION_MS } from "@/lib/constants";
import crypto from "crypto";

export async function createSession(userId: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_MS);
  await prisma.session.create({ data: { userId, token, expiresAt } });
  return { token, expiresAt };
}

export async function destroySession(token: string) {
  await prisma.session.deleteMany({ where: { token } });
}

export async function getSessionUser() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const session = await prisma.session.findFirst({
      where: { token, expiresAt: { gt: new Date() } },
      include: {
        user: {
          include: {
            interests: { select: { topic: true } },
          },
        },
      },
    });

    if (!session) return null;
    
    // Check if user is suspended (using raw query to avoid TypeScript issues)
    const user = session.user as any;
    if (user.suspended) return null; // Reject suspended users
    
    return session.user;
  } catch (error) {
    console.error("Session error:", error);
    return null;
  }
}

/** Raw Set-Cookie value — some Next runtimes drop `cookies().set` / `res.cookies.set`; headers are reliable. */
export function buildSessionSetCookieHeader(token: string): string {
  const maxAge = Math.floor(SESSION_MS / 1000);
  const secure = process.env.NODE_ENV === "production";
  const parts = [
    `${SESSION_COOKIE}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAge}`,
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

export function buildSessionClearCookieHeader(): string {
  const secure = process.env.NODE_ENV === "production";
  const parts = [
    `${SESSION_COOKIE}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0",
    "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

export function attachSessionCookie(res: NextResponse, token: string) {
  res.headers.append("Set-Cookie", buildSessionSetCookieHeader(token));
}

export function clearSessionCookieOnResponse(res: NextResponse) {
  res.headers.append("Set-Cookie", buildSessionClearCookieHeader());
}
