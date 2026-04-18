import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db-adapter";
import { createSession, attachSessionCookie } from "@/lib/session";
import { normalizeTopics } from "@/lib/normalize";
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

  const exists = await db.userFind({ username });
  if (exists) {
    return NextResponse.json({ error: "Username already taken" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await db.transaction(async (tx) => {
    const u = await tx.userCreate({ username, passwordHash, age, suspended: false });
    for (const topic of normalized) {
      await tx.userInterestCreate({ userId: u.id, topic });
    }
    return u;
  });

  const session = await createSession(user.id);

  const res = NextResponse.json({
    user: { id: user.id, username: user.username, age: user.age, topics: normalized },
  });
  attachSessionCookie(res, session.token);
  return res;
}
