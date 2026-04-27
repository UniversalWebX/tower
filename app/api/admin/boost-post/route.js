const { NextResponse } = require('next/server');
const Storage = require('@/lib/storage');
const Session = require('@/lib/session');

const storage = new Storage();
const session = new Session();

const MODERATORS = ['darianbayan', 'admin'];

export async function POST(req) {
  const user = session.getSessionFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!MODERATORS.includes(user.username)) {
    return NextResponse.json({ error: "Forbidden: Moderator access required" }, { status: 403 });
  }

  try {
    const { postId, boosted } = await req.json();

    if (!postId || typeof boosted !== 'boolean') {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const post = storage.findPost(postId);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const updatedPost = storage.updatePost(postId, {
      boosted
    });

    if (!updatedPost) {
      return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      post: {
        id: updatedPost.id,
        title: updatedPost.title,
        boosted: updatedPost.boosted
      }
    });

  } catch (error) {
    console.error('Boost post error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
