const { NextResponse } = require('next/server');
const Storage = require('@/lib/storage');
const Session = require('@/lib/session');

const storage = new Storage();
const session = new Session();

const MODERATORS = ['darianbayan', 'admin'];

export async function POST(req, { params }) {
  const user = session.getSessionFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    
    const post = storage.findPost(id);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check if user can delete this post
    const canDelete = post.authorId === user.id || MODERATORS.includes(user.username);
    
    if (!canDelete) {
      return NextResponse.json({ error: "Forbidden: You can only delete your own posts" }, { status: 403 });
    }

    // Delete the post
    storage.deletePost(id);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Delete post error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
