const { NextResponse } = require('next/server');
const Storage = require('@/lib/storage');
const Session = require('@/lib/session');

const storage = new Storage();
const session = new Session();

export async function POST(req) {
  try {
    console.log('Email API: POST request received');
    const user = session.getSessionFromRequest(req);
    
    if (!user) {
      console.log('Email API: No user found in session');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email } = await req.json();
    console.log('Email API: Email update received:', email);

    if (!email || email.trim() === '') {
      console.log('Email API: Email cannot be empty');
      return NextResponse.json({ error: "Email cannot be empty" }, { status: 400 });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('Email API: Invalid email format');
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    const updatedUser = storage.updateUser(user.id, { email: email.trim() });
    console.log('Email API: Email updated successfully');

    return NextResponse.json({ 
      message: "Email updated successfully",
      user: updatedUser 
    });

  } catch (error) {
    console.error('Email update error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
