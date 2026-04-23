import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db-adapter";
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

const deleteAnyPostSchema = z.object({
  reason: z.string().optional(),
});

const deletePostByIdSchema = z.object({
  postId: z.string().min(1),
  reason: z.string().optional(),
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

        await db.userUpdate(targetUser.id, { suspended: parsed.data.suspended });

        return NextResponse.json({ success: true });
      }

      case "deleteUser": {
        const parsed = deleteUserSchema.safeParse(json.data);
        if (!parsed.success) {
          return NextResponse.json({ error: "Invalid data" }, { status: 400 });
        }

        const targetUser = await db.userFind({ username: parsed.data.username });

        if (!targetUser) {
          return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Don't allow deleting other admins
        if (ADMIN_USERS.includes(parsed.data.username)) {
          return NextResponse.json({ error: "Cannot delete admin user" }, { status: 400 });
        }

        await db.userDelete(targetUser.id);

        return NextResponse.json({ success: true });
      }

      case "blockChat": {
        const parsed = blockChatSchema.safeParse(json.data);
        if (!parsed.success) {
          return NextResponse.json({ error: "Invalid data" }, { status: 400 });
        }

        const user1 = await db.userFind({ username: parsed.data.user1 });
        const user2 = await db.userFind({ username: parsed.data.user2 });

        if (!user1 || !user2) {
          return NextResponse.json({ error: "One or both users not found" }, { status: 404 });
        }

        // Find existing DM chat between these users
        const existingChat = await db.chatFind({
          type: "DM",
          AND: [
            { members: { some: { userId: user1.id } } },
            { members: { some: { userId: user2.id } } },
          ],
        });

        if (existingChat) {
          // Delete the chat and all its messages
          await db.chatDelete(existingChat.id);
        }

        return NextResponse.json({ success: true });
      }

      case "deleteAnyPost": {
        const parsed = deleteAnyPostSchema.safeParse(json.data);
        if (!parsed.success) {
          return NextResponse.json({ error: "Invalid data" }, { status: 400 });
        }

        const posts = await db.postFindMany();
        if (posts.length === 0) {
          return NextResponse.json({ error: "No posts to delete" }, { status: 404 });
        }

        // Delete a random post
        const randomPost = posts[Math.floor(Math.random() * posts.length)];
        await db.postDelete(randomPost.id);

        return NextResponse.json({ 
          success: true, 
          message: `Deleted post: ${randomPost.title}`,
          deletedPost: randomPost
        });
      }

      case "deletePostById": {
        const parsed = deletePostByIdSchema.safeParse(json.data);
        if (!parsed.success) {
          return NextResponse.json({ error: "Invalid data" }, { status: 400 });
        }

        const post = await db.postFind(parsed.data.postId);
        if (!post) {
          return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        await db.postDelete(parsed.data.postId);

        return NextResponse.json({ 
          success: true, 
          message: `Deleted post: ${post.title}`,
          deletedPost: post
        });
      }

      case "wipePosts": {
        const posts = await db.postFindMany();
        let deletedCount = 0;

        for (const post of posts) {
          await db.postDelete(post.id);
          deletedCount++;
        }

        return NextResponse.json({ 
          success: true, 
          message: `Deleted ${deletedCount} posts` 
        });
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Admin action error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
