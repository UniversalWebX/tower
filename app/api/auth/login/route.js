const { NextResponse } = require('next/server');
const Storage = require('@/lib/storage');
const Auth = require('@/lib/auth');
const Session = require('@/lib/session');

const storage = new Storage();
const session = new Session();

export async function POST(req) {
  try {
    const { username, password } = await req.json();
    
    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 });
    }

    const user = storage.findUser(username);
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (user.suspended) {
      return NextResponse.json({ error: "Account suspended" }, { status: 403 });
    }

    const isValid = await Auth.verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Create session
    const sessionData = storage.createSession(user.id);
    console.log('Session created:', sessionData);

    // Set session cookie
    const response = NextResponse.json({ 
      success: true, 
      user: { 
        id: user.id, 
        username: user.username, 
        age: user.age,
        bio: user.bio,
        avatar: user.avatar
      }
    });
    
    response.cookies.set('tower_session', sessionData.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    console.log('Session cookie attached:', sessionData.token);

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req) {
  const user = session.getSessionFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ 
    id: user.id, 
    username: user.username, 
    age: user.age,
    bio: user.bio,
    avatar: user.avatar,
    interests: user.interests || [],
    suspended: user.suspended || false,
    shadowBanned: user.shadowBanned || false
  });
}
