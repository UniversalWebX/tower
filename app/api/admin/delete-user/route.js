const { NextResponse } = require('next/server');
const Storage = require('@/lib/storage');
const Session = require('@/lib/session');

const storage = new Storage();
const session = new Session();

const MODERATORS = ['darianbayan', 'admin'];

export async function POST(req) {
  const user = session.getSessionFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!MODERATORS.includes(user.username)) {
    return NextResponse.json({ error: "Forbidden: Moderator access required" }, { status: 403 });
  }

  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const targetUser = storage.findUserById(userId);
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Don't allow deleting other moderators
    if (MODERATORS.includes(targetUser.username)) {
      return NextResponse.json({ error: "Cannot delete another moderator" }, { status: 403 });
    }

    const success = storage.deleteUserById(userId);
    
    if (!success) {
      return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      message: `User ${targetUser.username} has been deleted`
    });

  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
