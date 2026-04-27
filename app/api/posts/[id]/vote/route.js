const { NextResponse } = require('next/server');
const Storage = require('@/lib/storage');
const Session = require('@/lib/session');

const storage = new Storage();
const session = new Session();

export async function GET(req, { params }) {
  const user = session.getSessionFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    
    const vote = storage.findUserVote(user.id, id);
    
    return NextResponse.json({ vote });

  } catch (error) {
    console.error('Get vote error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
