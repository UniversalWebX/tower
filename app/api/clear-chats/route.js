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

  // Only allow moderators to clear chat data
  const MODERATORS = ['darianbayan', 'admin'];
  if (!MODERATORS.includes(user.username)) {
    return NextResponse.json({ error: "Forbidden: Moderator access required" }, { status: 403 });
  }

  try {
    // Clear all chat data
    storage.clearChatData();
    
    return NextResponse.json({ 
      message: "All chat data has been cleared successfully",
      clearedData: {
        messages: 0,
        chats: 0,
        chatMembers: 0
      }
    });
  } catch (error) {
    console.error('Error clearing chat data:', error);
    return NextResponse.json({ error: "Failed to clear chat data" }, { status: 500 });
  }
}
