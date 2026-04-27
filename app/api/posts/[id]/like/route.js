const { NextResponse } = require('next/server');
const Storage = require('@/lib/storage');
const Session = require('@/lib/session');

const storage = new Storage();
const session = new Session();

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

    // Check if user already voted
    const existingVote = storage.findUserVote(user.id, id);
    
    if (existingVote) {
      if (existingVote.type === 'like') {
        // User already liked, remove the like
        storage.removeVote(user.id, id);
        const currentLikes = post.likes || 0;
        storage.updatePost(id, { likes: Math.max(0, currentLikes - 1) });
        return NextResponse.json({ success: true, likes: Math.max(0, currentLikes - 1), action: 'removed' });
      } else {
        // User had disliked, change to like
        storage.removeVote(user.id, id);
        storage.createVote({ userId: user.id, postId: id, type: 'like' });
        const currentLikes = post.likes || 0;
        const currentDislikes = post.dislikes || 0;
        storage.updatePost(id, { 
          likes: currentLikes + 1, 
          dislikes: Math.max(0, currentDislikes - 1) 
        });
        return NextResponse.json({ success: true, likes: currentLikes + 1, dislikes: Math.max(0, currentDislikes - 1), action: 'changed' });
      }
    } else {
      // New like
      storage.createVote({ userId: user.id, postId: id, type: 'like' });
      const currentLikes = post.likes || 0;
      storage.updatePost(id, { likes: currentLikes + 1 });
      return NextResponse.json({ success: true, likes: currentLikes + 1, action: 'added' });
    }

  } catch (error) {
    console.error('Like post error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
