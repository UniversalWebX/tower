const { NextResponse } = require('next/server');
const Storage = require('@/lib/storage');

const storage = new Storage();

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    
    if (!query) {
      return NextResponse.json({ posts: [] });
    }

    const posts = storage.findPosts();
    const filteredPosts = posts.filter(post => 
      post.title.toLowerCase().includes(query.toLowerCase()) ||
      post.content?.toLowerCase().includes(query.toLowerCase())
    );

    return NextResponse.json({ posts: filteredPosts });

  } catch (error) {
    console.error('Search posts error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
