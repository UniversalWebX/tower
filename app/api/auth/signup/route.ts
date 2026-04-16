import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { normalizeTopics } from "@/lib/normalize";
import { attachSessionCookie, createSession } from "@/lib/session";
import { TOPIC_COUNT } from "@/lib/constants";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  username: z.string().min(3).max(24),
  password: z.string().min(8).max(128),
  age: z.number().int().min(13).max(120),
  topics: z.array(z.string()).length(TOPIC_COUNT),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid signup payload" }, { status: 400 });
  }

  const { password, age, topics } = parsed.data;
  const username = parsed.data.username.trim().toLowerCase();
  if (username.length < 3) {
    return NextResponse.json({ error: "Username too short" }, { status: 400 });
  }
  const normalized = normalizeTopics(topics);
  if (normalized.length !== TOPIC_COUNT) {
    return NextResponse.json(
      { error: "Provide five distinct topics after normalization" },
      { status: 400 },
    );
  }

  const exists = await prisma.user.findUnique({ where: { username } });
  if (exists) {
    return NextResponse.json({ error: "Username already taken" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.$transaction(async (tx) => {
    const u = await tx.user.create({
      data: { username, passwordHash, age },
    });
    await tx.userInterest.createMany({
      data: normalized.map((topic) => ({ userId: u.id, topic })),
    });
    return u;
  });

  const session = await createSession(user.id);

  const res = NextResponse.json({
    user: { id: user.id, username: user.username, age: user.age, topics: normalized },
  });
  attachSessionCookie(res, session.token);
  return res;
}
