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

    // Unsuspend the user
    storage.updateUserById(userId, { 
      suspended: false, 
      suspendedUntil: null 
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Unsuspend user error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
