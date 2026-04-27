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
    const { userId, hours } = await req.json();

    if (!userId || !hours || hours < 1 || hours > 720) {
      return NextResponse.json({ error: "Invalid suspension parameters" }, { status: 400 });
    }

    const targetUser = storage.findUserById(userId);
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Don't allow suspending other moderators
    if (MODERATORS.includes(targetUser.username)) {
      return NextResponse.json({ error: "Cannot suspend another moderator" }, { status: 403 });
    }

    // Calculate suspension end time
    const suspendedUntil = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();

    const updatedUser = storage.updateUserById(userId, {
      suspended: true,
      suspendedUntil
    });

    if (!updatedUser) {
      return NextResponse.json({ error: "Failed to suspend user" }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        suspended: updatedUser.suspended,
        suspendedUntil: updatedUser.suspendedUntil
      }
    });

  } catch (error) {
    console.error('Suspend user error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
