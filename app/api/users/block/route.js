const { NextResponse } = require('next/server');
const Storage = require('@/lib/storage');
const Session = require('@/lib/session');

const storage = new Storage();
const session = new Session();

export async function POST(req) {
  const user = session.getSessionFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { targetUserId } = await req.json();
    
    if (!targetUserId) {
      return NextResponse.json({ error: "Target user ID required" }, { status: 400 });
    }

    // Check if already blocked
    const existingBlock = storage.findBlocks({ blockerId: user.id, blockedId: targetUserId });
    
    if (existingBlock.length > 0) {
      return NextResponse.json({ error: "User already blocked" }, { status: 400 });
    }

    // Create block relationship
    storage.createBlock({
      blockerId: user.id,
      blockedId: targetUserId
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Block error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
