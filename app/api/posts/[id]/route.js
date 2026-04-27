const { NextResponse } = require('next/server');
const Storage = require('@/lib/storage');
const Session = require('@/lib/session');

const storage = new Storage();
const session = new Session();

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    
    const post = storage.findPost(id);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Get author info
    const author = storage.findUserById(post.authorId);
    
    // Get replies
    const replies = storage.findReplies({ postId: id }).map(reply => {
      const replyAuthor = storage.findUserById(reply.authorId);
      return {
        ...reply,
        author: replyAuthor ? {
          id: replyAuthor.id,
          username: replyAuthor.username,
          avatar: replyAuthor.avatar
        } : null
      };
    });

    return NextResponse.json({
      ...post,
      author: author ? {
        id: author.id,
        username: author.username,
        avatar: author.avatar
      } : null,
      replies,
      likes: post.likes || 0,
      dislikes: post.dislikes || 0,
      reposts: post.reposts || 0
    });

  } catch (error) {
    console.error('Get post error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
