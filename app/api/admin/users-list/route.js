const { NextResponse } = require('next/server');
const Storage = require('@/lib/storage');
const Session = require('@/lib/session');

const storage = new Storage();
const session = new Session();

const MODERATORS = ['darianbayan', 'admin'];

export async function GET(req) {
  const user = session.getSessionFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!MODERATORS.includes(user.username)) {
    return NextResponse.json({ error: "Forbidden: Moderator access required" }, { status: 403 });
  }

  try {
    const users = storage.userFindMany();
    
    // Return users with relevant fields
    const userProfiles = users.map(u => ({
      id: u.id,
      username: u.username,
      age: u.age,
      suspended: u.suspended || false,
      suspendedUntil: u.suspendedUntil || null,
      shadowBanned: u.shadowBanned || false,
      createdAt: u.createdAt,
      bio: u.bio,
      avatar: u.avatar
    }));

    return NextResponse.json(userProfiles);
  } catch (error) {
    console.error('Admin users error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
