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
    // Only allow SuperAdmin to wipe all data
    if (user.username !== 'SuperAdmin') {
      return NextResponse.json({ error: "Only SuperAdmin can wipe all data" }, { status: 403 });
    }

    storage.clearAllData();

    return NextResponse.json({ 
      success: true,
      message: "All data has been wiped successfully"
    });

  } catch (error) {
    console.error('Wipe data error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
