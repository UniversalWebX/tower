import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

const ADMIN_USERS = ["Admin", "DarianBayan", "TowerAdmin"];

const suspendUserSchema = z.object({
  username: z.string().min(1),
  suspended: z.boolean(),
});

const deleteUserSchema = z.object({
  username: z.string().min(1),
});

const blockChatSchema = z.object({
  user1: z.string().min(1),
  user2: z.string().min(1),
});

async function isAdmin(user: any) {
  return ADMIN_USERS.includes(user.username);
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  if (!(await isAdmin(user))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const json = await req.json().catch(() => null);
  const action = json?.action;

  try {
    switch (action) {
      case "suspendUser": {
        const parsed = suspendUserSchema.safeParse(json.data);
        if (!parsed.success) {
          return NextResponse.json({ error: "Invalid data" }, { status: 400 });
        }

        const targetUser = await prisma.user.findUnique({
          where: { username: parsed.data.username },
        });

        if (!targetUser) {
          return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Don't allow suspending other admins
        if (ADMIN_USERS.includes(parsed.data.username)) {
          return NextResponse.json({ error: "Cannot suspend admin user" }, { status: 400 });
        }

        await prisma.user.update({
          where: { username: parsed.data.username },
          data: { suspended: parsed.data.suspended },
        });

        return NextResponse.json({ success: true });
      }

      case "deleteUser": {
        const parsed = deleteUserSchema.safeParse(json.data);
        if (!parsed.success) {
          return NextResponse.json({ error: "Invalid data" }, { status: 400 });
        }

        const targetUser = await prisma.user.findUnique({
          where: { username: parsed.data.username },
        });

        if (!targetUser) {
          return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Don't allow deleting other admins
        if (ADMIN_USERS.includes(parsed.data.username)) {
          return NextResponse.json({ error: "Cannot delete admin user" }, { status: 400 });
        }

        await prisma.user.delete({
          where: { username: parsed.data.username },
        });

        return NextResponse.json({ success: true });
      }

      case "blockChat": {
        const parsed = blockChatSchema.safeParse(json.data);
        if (!parsed.success) {
          return NextResponse.json({ error: "Invalid data" }, { status: 400 });
        }

        const user1 = await prisma.user.findUnique({
          where: { username: parsed.data.user1 },
        });

        const user2 = await prisma.user.findUnique({
          where: { username: parsed.data.user2 },
        });

        if (!user1 || !user2) {
          return NextResponse.json({ error: "One or both users not found" }, { status: 404 });
        }

        // Find existing DM chat between these users
        const existingChat = await prisma.chat.findFirst({
          where: {
            type: "DM",
            AND: [
              { members: { some: { userId: user1.id } } },
              { members: { some: { userId: user2.id } } },
            ],
          },
        });

        if (existingChat) {
          // Delete the chat and all its messages
          await prisma.chat.delete({
            where: { id: existingChat.id },
          });
        }

        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Admin action error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
