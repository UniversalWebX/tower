const { NextResponse } = require('next/server');
const Storage = require('@/lib/storage');
const Auth = require('@/lib/auth');
const Session = require('@/lib/session');
const Validation = require('@/lib/validation');

const storage = new Storage();

export async function POST(req) {
  try {
    const { username, password, age, email, bio, interests } = await req.json();
    
    // Validate input
    const validation = Validation.validateUser({ username, password, age, email, bio });
    if (!validation.valid) {
      return NextResponse.json({ error: validation.errors.join(', ') }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = storage.findUser(username);
    if (existingUser) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
    }

    // Hash password
    const passwordHash = await Auth.hashPassword(password);

    // Create user
    const user = storage.createUser({
      username,
      passwordHash,
      age,
      email: email || null,
      bio: bio || null,
      interests: interests || [],
      suspended: false,
      shadowBanned: false,
      avatar: null
    });

    console.log('User created:', { id: user.id, username: user.username });

    return NextResponse.json({ 
      success: true, 
      user: { id: user.id, username: user.username, age: user.age }
    });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
