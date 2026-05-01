const { NextResponse } = require('next/server');
const Storage = require('@/lib/storage');
const Session = require('@/lib/session');

const storage = new Storage();
const session = new Session();

export async function GET(req) {
  try {
    console.log('Settings API: GET request received');
    const user = session.getSessionFromRequest(req);
    
    if (!user) {
      console.log('Settings API: No user found in session');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log('Settings API: User found:', user.id);
    const preferences = storage.getUserPreferences(user.id);
    console.log('Settings API: Preferences loaded:', preferences);
    return NextResponse.json({ preferences });

  } catch (error) {
    console.error('Get preferences error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    console.log('Settings API: POST request received');
    const user = session.getSessionFromRequest(req);
    
    if (!user) {
      console.log('Settings API: No user found in session for POST');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updates = await req.json();
    console.log('Settings API: Updates received:', updates);
    const updatedPreferences = storage.updateUserPreferences(user.id, updates);
    console.log('Settings API: Preferences updated successfully');
    
    return NextResponse.json({ 
      message: "Preferences updated successfully",
      preferences: updatedPreferences 
    });

  } catch (error) {
    console.error('Update preferences error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
