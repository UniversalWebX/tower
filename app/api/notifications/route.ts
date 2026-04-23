import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { db } from "@/lib/db-adapter";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Get user's notifications
    const notifications = await db.notificationFindMany({ userId: user.id });
    
    return NextResponse.json({
      notifications,
      unreadCount: notifications.filter(n => !n.read).length
    });
  } catch (error) {
    console.error("Notifications fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const { action, data } = body || {};

  try {
    switch (action) {
      case 'markRead':
        const { notificationId } = data;
        
        if (!notificationId) {
          return NextResponse.json({ error: "Notification ID required" }, { status: 400 });
        }

        await db.notificationUpdate(notificationId, { read: true });
        
        return NextResponse.json({ 
          success: true, 
          message: "Notification marked as read" 
        });

      case 'markAllRead':
        await db.notificationUpdateMany({ userId: user.id }, { read: true });
        
        return NextResponse.json({ 
          success: true, 
          message: "All notifications marked as read" 
        });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Notifications API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
