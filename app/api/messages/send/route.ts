import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/session";
import { db } from "@/lib/db-adapter";

export const dynamic = "force-dynamic";

const messageSchema = z.object({
  recipientId: z.string().min(1, "Recipient ID is required"),
  content: z.string().min(1, "Message content is required"),
  rackId: z.string().optional()
});

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = messageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid message data" }, { status: 400 });
  }

  try {
    const { recipientId, content, rackId } = parsed.data;

    // Check if recipient exists
    const recipient = await db.userFind({ id: recipientId });
    if (!recipient) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create message
    const message = await db.messageCreate({
      authorId: user.id,
      recipientId,
      content,
      rackId,
      read: false
    });

    return NextResponse.json({
      success: true,
      message: "Message sent successfully",
      messageId: message.id
    });
  } catch (error) {
    console.error("Message send error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
