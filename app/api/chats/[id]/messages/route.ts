import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { MESSAGE_PAGE } from "@/lib/constants";

export const dynamic = "force-dynamic";

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

async function assertMember(chatId: string, userId: string) {
  const m = await prisma.chatMember.findFirst({ where: { chatId, userId } });
  return Boolean(m);
}

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: chatId } = await ctx.params;
  if (!(await assertMember(chatId, me.id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const url = new URL(req.url);
  const cursor = url.searchParams.get("cursor");
  const take = clamp(Number(url.searchParams.get("take") ?? MESSAGE_PAGE) || MESSAGE_PAGE, 1, 100);

  const messages = await prisma.message.findMany({
    where: { chatId },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take,
    ...(cursor
      ? {
          skip: 1,
          cursor: { id: cursor },
        }
      : {}),
    select: {
      id: true,
      body: true,
      createdAt: true,
      sender: { select: { id: true, username: true } },
    },
  });

  const chronological = [...messages].reverse();
  const nextCursor = messages.length === take ? messages[messages.length - 1]?.id : null;

  return NextResponse.json({ messages: chronological, nextCursor });
}

const singleSchema = z.object({ body: z.string().min(1).max(4000) });

const batchSchema = z.object({
  bodies: z.array(z.string().min(1).max(4000)).min(1).max(24),
});

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: chatId } = await ctx.params;
  if (!(await assertMember(chatId, me.id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const json = await req.json().catch(() => null);
  const mode = json && typeof json === "object" && "bodies" in json ? "batch" : "single";

  if (mode === "batch") {
    const parsed = batchSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid batch payload" }, { status: 400 });
    }

    const now = new Date();
    await prisma.$transaction([
      prisma.message.createMany({
        data: parsed.data.bodies.map((body) => ({ chatId, senderId: me.id, body })),
      }),
      prisma.chat.update({ where: { id: chatId }, data: { updatedAt: now } }),
    ]);

    return NextResponse.json({ ok: true, count: parsed.data.bodies.length });
  }

  const parsed = singleSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid message payload" }, { status: 400 });
  }

  const now = new Date();
  const msg = await prisma.$transaction(async (tx) => {
    const m = await tx.message.create({
      data: { chatId, senderId: me.id, body: parsed.data.body },
      select: { id: true, createdAt: true },
    });
    await tx.chat.update({ where: { id: chatId }, data: { updatedAt: now } });
    return m;
  });

  return NextResponse.json({ id: msg.id, createdAt: msg.createdAt });
}
