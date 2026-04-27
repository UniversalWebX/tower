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
    const { userId, shadowBanned } = await req.json();

    if (!userId || typeof shadowBanned !== 'boolean') {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const targetUser = storage.findUserById(userId);
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Don't allow shadow banning other moderators
    if (MODERATORS.includes(targetUser.username)) {
      return NextResponse.json({ error: "Cannot shadow ban another moderator" }, { status: 403 });
    }

    const updatedUser = storage.updateUserById(userId, {
      shadowBanned
    });

    if (!updatedUser) {
      return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        shadowBanned: updatedUser.shadowBanned
      }
    });

  } catch (error) {
    console.error('Shadow ban error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
