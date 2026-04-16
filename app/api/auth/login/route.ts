import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { attachSessionCookie, createSession } from "@/lib/session";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid login payload" }, { status: 400 });
  }

  const { password } = parsed.data;
  const username = parsed.data.username.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const session = await createSession(user.id);

  const interests = await prisma.userInterest.findMany({
    where: { userId: user.id },
    select: { topic: true },
  });

  const res = NextResponse.json({
    user: {
      id: user.id,
      username: user.username,
      age: user.age,
      topics: interests.map((i) => i.topic),
    },
  });
  attachSessionCookie(res, session.token, session.expiresAt);
  return res;
}
