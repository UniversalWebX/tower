const { NextResponse } = require('next/server');
const Storage = require('@/lib/storage');

const storage = new Storage();

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    
    if (!query) {
      return NextResponse.json({ users: [] });
    }

    const users = storage.findUsers({ username: query });
    const filteredUsers = users.filter(user => 
      user.username.toLowerCase().includes(query.toLowerCase()) ||
      user.bio?.toLowerCase().includes(query.toLowerCase())
    );

    return NextResponse.json({ users: filteredUsers });

  } catch (error) {
    console.error('Search users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
