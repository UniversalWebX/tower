const { NextResponse } = require('next/server');
const Storage = require('@/lib/storage');
const Session = require('@/lib/session');

const storage = new Storage();
const session = new Session();

export async function GET(req) {
  const user = session.getSessionFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user is moderator
  const MODERATORS = ['darianbayan', 'Admin'];
  if (!MODERATORS.includes(user.username)) {
    return NextResponse.json({ error: "Forbidden: Moderator access required" }, { status: 403 });
  }

  try {
    const pendingPosts = storage.getPendingPosts();
    
    // Add author info to pending posts
    const postsWithAuthors = pendingPosts.map(post => {
      const author = storage.findUserById(post.authorId);
      return {
        ...post,
        author: author ? {
          id: author.id,
          username: author.username,
          age: author.age,
          avatar: author.avatar
        } : null
      };
    });

    return NextResponse.json({ pendingPosts: postsWithAuthors });
  } catch (error) {
    console.error('Get pending posts error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req) {
  const user = session.getSessionFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user is moderator
  const MODERATORS = ['darianbayan', 'Admin'];
  if (!MODERATORS.includes(user.username)) {
    return NextResponse.json({ error: "Forbidden: Moderator access required" }, { status: 403 });
  }

  try {
    const { postId, action } = await req.json();
    
    if (!postId || !action) {
      return NextResponse.json({ error: "Post ID and action are required" }, { status: 400 });
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: "Action must be 'approve' or 'reject'" }, { status: 400 });
    }

    let result;
    if (action === 'approve') {
      result = storage.approvePost(postId);
      if (result) {
        return NextResponse.json({ 
          message: "Post approved successfully",
          post: result
        });
      } else {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
      }
    } else {
      result = storage.rejectPost(postId);
      if (result) {
        return NextResponse.json({ message: "Post rejected successfully" });
      } else {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
      }
    }

  } catch (error) {
    console.error('Moderate post error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
