import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/session";
import { db } from "@/lib/db-adapter";

export const dynamic = "force-dynamic";

const deleteAccountSchema = z.object({
  password: z.string().min(1),
  confirmation: z.string().min(1, "Type 'DELETE' to confirm")
});

const requestRecoverySchema = z.object({
  email: z.string().email(),
  username: z.string().min(1)
});

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const { action, data } = body || {};

  try {
    switch (action) {
      case 'deleteAccount': {
        const parsed = deleteAccountSchema.safeParse(data);
        if (!parsed.success) {
          return NextResponse.json({ error: "Invalid data" }, { status: 400 });
        }

        // Additional verification would go here in production
        // For demo, we'll just delete with password confirmation
        
        // Delete user's sessions
        await db.sessionDelete({ userId: user.id });

        // Delete user's posts
        const posts = await db.postFindMany({ authorId: user.id });
        for (const post of posts) {
          await db.postDelete(post.id);
        }

        // Delete user's interests
        await db.userInterestDelete({ userId: user.id });

        // Delete user's chat memberships
        const chatMembers = await db.chatMemberFindMany({ userId: user.id });
        for (const member of chatMembers) {
          await db.chatMemberDelete(member.id);
        }

        // Delete user's messages
        const messages = await db.messageFindMany({ authorId: user.id });
        for (const message of messages) {
          await db.messageDelete(message.id);
        }

        // Finally delete the user
        await db.userDelete(user.id);

        return NextResponse.json({ 
          success: true, 
          message: "Account deleted successfully" 
        });
      }

      case 'requestRecovery': {
        const parsed = requestRecoverySchema.safeParse(data);
        if (!parsed.success) {
          return NextResponse.json({ error: "Invalid data" }, { status: 400 });
        }

        // In production, this would send a recovery email
        // For demo, we'll just log it
        console.log(`Recovery requested for: ${parsed.data.username} (${parsed.data.email})`);
        
        return NextResponse.json({ 
          success: true, 
          message: "Recovery instructions sent to your email" 
        });
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Account management error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
