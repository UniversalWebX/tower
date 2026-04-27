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
      if (existingVote.type === 'dislike') {
        // User already disliked, remove the dislike
        storage.removeVote(user.id, id);
        const currentDislikes = post.dislikes || 0;
        storage.updatePost(id, { dislikes: Math.max(0, currentDislikes - 1) });
        return NextResponse.json({ success: true, dislikes: Math.max(0, currentDislikes - 1), action: 'removed' });
      } else {
        // User had liked, change to dislike
        storage.removeVote(user.id, id);
        storage.createVote({ userId: user.id, postId: id, type: 'dislike' });
        const currentLikes = post.likes || 0;
        const currentDislikes = post.dislikes || 0;
        storage.updatePost(id, { 
          likes: Math.max(0, currentLikes - 1), 
          dislikes: currentDislikes + 1 
        });
        return NextResponse.json({ success: true, likes: Math.max(0, currentLikes - 1), dislikes: currentDislikes + 1, action: 'changed' });
      }
    } else {
      // New dislike
      storage.createVote({ userId: user.id, postId: id, type: 'dislike' });
      const currentDislikes = post.dislikes || 0;
      storage.updatePost(id, { dislikes: currentDislikes + 1 });
      return NextResponse.json({ success: true, dislikes: currentDislikes + 1, action: 'added' });
    }

  } catch (error) {
    console.error('Dislike post error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
