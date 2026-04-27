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
    
    const originalPost = storage.findPost(id);
    if (!originalPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Create repost
    const repost = storage.createPost({
      title: `🔄 Repost: ${originalPost.title}`,
      content: `Original post by ${originalPost.author?.username || 'Unknown'}\n\n${originalPost.content || ''}`,
      authorId: user.id,
      linkUrl: originalPost.linkUrl,
      ageMin: originalPost.ageMin,
      ageMax: originalPost.ageMax,
      tags: originalPost.tags,
      originalPostId: id,
      isRepost: true
    });

    // Update original post repost count
    const currentReposts = originalPost.reposts || 0;
    storage.updatePost(id, { reposts: currentReposts + 1 });

    return NextResponse.json({ success: true, repostId: repost.id });

  } catch (error) {
    console.error('Repost error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
