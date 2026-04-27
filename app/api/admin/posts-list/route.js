const { NextResponse } = require('next/server');
const Storage = require('@/lib/storage');
const Session = require('@/lib/session');

const storage = new Storage();
const session = new Session();

const MODERATORS = ['darianbayan', 'admin'];

export async function GET(req) {
  const user = session.getSessionFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!MODERATORS.includes(user.username)) {
    return NextResponse.json({ error: "Forbidden: Moderator access required" }, { status: 403 });
  }

  try {
    const posts = storage.postFindMany();
    
    // Return posts with author info
    const postsWithAuthors = posts.map(post => {
      const author = storage.findUserById(post.authorId);
      return {
        id: post.id,
        title: post.title,
        content: post.content,
        linkUrl: post.linkUrl,
        ageMin: post.ageMin,
        ageMax: post.ageMax,
        boosted: post.boosted || false,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        author: author ? {
          id: author.id,
          username: author.username,
          avatar: author.avatar
        } : null
      };
    });

    return NextResponse.json(postsWithAuthors);
  } catch (error) {
    console.error('Admin posts error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
