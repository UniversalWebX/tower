import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

const createSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("DM"), userId: z.string().min(1) }),
  z.object({
    type: z.literal("GROUP"),
    name: z.string().min(2).max(64),
    memberIds: z.array(z.string()).max(48).optional(),
    memberUsernames: z.array(z.string()).max(48).optional(),
  }),
]);

export async function GET() {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const memberships = await prisma.chatMember.findMany({
    where: { userId: me.id },
    select: { chatId: true },
  });
  const chatIds = memberships.map((m) => m.chatId);
  if (!chatIds.length) return NextResponse.json({ chats: [] });

  const chats = await prisma.chat.findMany({
    where: { id: { in: chatIds } },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      type: true,
      name: true,
      updatedAt: true,
      members: {
        select: {
          user: { select: { id: true, username: true } },
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { body: true, createdAt: true, sender: { select: { username: true } } },
      },
    },
  });

  const shaped = chats.map((c) => {
    const preview = c.messages[0];
    const title =
      c.type === "GROUP"
        ? (c.name ?? "Group")
        : c.members.map((m) => m.user.username).filter((n) => n !== me.username)[0] ?? "Direct";

    return {
      id: c.id,
      type: c.type,
      title,
      members: c.members.map((m) => m.user),
      lastMessage: preview
        ? { body: preview.body, at: preview.createdAt, from: preview.sender.username }
        : null,
    };
  });

  return NextResponse.json({ chats: shaped });
}

export async function POST(req: Request) {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid chat payload" }, { status: 400 });
  }

  if (parsed.data.type === "DM") {
    const otherId = parsed.data.userId;
    if (otherId === me.id) {
      return NextResponse.json({ error: "Cannot DM yourself" }, { status: 400 });
    }

    const other = await prisma.user.findUnique({ where: { id: otherId }, select: { id: true } });
    if (!other) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const existing = await prisma.chat.findFirst({
      where: {
        type: "DM",
        AND: [
          { members: { some: { userId: me.id } } },
          { members: { some: { userId: otherId } } },
        ],
      },
      include: { members: true },
    });

    if (existing && existing.members.length === 2) {
      return NextResponse.json({ id: existing.id });
    }

    const chat = await prisma.$transaction(async (tx) => {
      const c = await tx.chat.create({ data: { type: "DM" } });
      await tx.chatMember.createMany({
        data: [
          { chatId: c.id, userId: me.id },
          { chatId: c.id, userId: otherId },
        ],
      });
      return c;
    });

    return NextResponse.json({ id: chat.id });
  }

  if (parsed.data.type !== "GROUP") {
    return NextResponse.json({ error: "Unsupported chat type" }, { status: 400 });
  }
  const group = parsed.data;
  const fromIds = group.memberIds ?? [];
  const unames = (group.memberUsernames ?? []).map((u) => u.trim().toLowerCase()).filter(Boolean);
  const uniqueNames = [...new Set(unames)];
  const resolved = await prisma.user.findMany({
    where: { username: { in: uniqueNames } },
    select: { id: true, username: true },
  });
  if (uniqueNames.length && resolved.length !== uniqueNames.length) {
    return NextResponse.json({ error: "One or more usernames were not found" }, { status: 400 });
  }
  const ids = Array.from(new Set([me.id, ...fromIds, ...resolved.map((u) => u.id)]));
  if (ids.length < 2) {
    return NextResponse.json({ error: "Add at least one other member" }, { status: 400 });
  }
  const users = await prisma.user.findMany({ where: { id: { in: ids } }, select: { id: true } });
  if (users.length !== ids.length) {
    return NextResponse.json({ error: "One or more members were not found" }, { status: 400 });
  }

  const chat = await prisma.$transaction(async (tx) => {
    const c = await tx.chat.create({
      data: { type: "GROUP", name: group.name },
    });
    await tx.chatMember.createMany({
      data: ids.map((userId) => ({ chatId: c.id, userId })),
    });
    return c;
  });

  return NextResponse.json({ id: chat.id });
}
