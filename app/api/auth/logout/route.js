const { NextResponse } = require('next/server');
const Session = require('@/lib/session');

const session = new Session();

export async function POST(req) {
  try {
    session.destroySession(req);
    
    const response = NextResponse.json({ success: true });
    response.cookies.delete('tower_session');
    
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
