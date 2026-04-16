import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE, SESSION_MS } from "@/lib/constants";
import crypto from "crypto";

const cookieBase = {
  httpOnly: true as const,
  sameSite: "lax" as const,
  path: "/",
};

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
  return session.user;
}

/** Route handlers must set cookies on the returned `NextResponse` or Set-Cookie is dropped. */
export function attachSessionCookie(res: NextResponse, token: string, expiresAt: Date) {
  res.cookies.set(SESSION_COOKIE, token, {
    ...cookieBase,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
  });
}

export function clearSessionCookieOnResponse(res: NextResponse) {
  res.cookies.set(SESSION_COOKIE, "", {
    ...cookieBase,
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
  });
}
