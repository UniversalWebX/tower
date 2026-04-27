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
    const { content } = await req.json();
    
    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Reply content required" }, { status: 400 });
    }

    const post = storage.findPost(id);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Create reply
    const reply = storage.createReply({
      postId: id,
      authorId: user.id,
      content: content.trim()
    });

    // Get reply with author info
    const replyWithAuthor = {
      ...reply,
      author: {
        id: user.id,
        username: user.username,
        avatar: user.avatar
      }
    };

    return NextResponse.json(replyWithAuthor);

  } catch (error) {
    console.error('Reply error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
