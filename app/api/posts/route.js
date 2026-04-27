const { NextResponse } = require('next/server');
const Storage = require('@/lib/storage');
const Session = require('@/lib/session');
const Validation = require('@/lib/validation');

const storage = new Storage();
const session = new Session();

export async function POST(req) {
  console.log('Posts API called');
  const user = session.getSessionFromRequest(req);
  console.log('Session user result:', user);
  
  if (!user) {
    console.log('No user found, returning 401');
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.shadowBanned) {
    console.log('User is shadow banned, but allowing post');
  }

  try {
    const json = await req.json();
    console.log('Received post data:', json);
    
    const validation = Validation.validatePost(json);
    if (!validation.valid) {
      console.log('Validation errors:', validation.errors);
      return NextResponse.json({ error: validation.errors.join(', ') }, { status: 400 });
    }

    const { title, content, linkUrl, ageMin, ageMax, tags } = json;
    
    // Normalize tags
    const normalizedTags = Validation.normalizeTags(tags);
    if (normalizedTags.length < 3 || normalizedTags.length > 10) {
      return NextResponse.json({ error: "Use between 3 and 10 distinct tags" }, { status: 400 });
    }

    // Create post with tags in content
    const tagsText = normalizedTags.join(', ');
    const fullContent = content ? `${content}\n\nTags: ${tagsText}` : `Tags: ${tagsText}`;

    const postData = {
      authorId: user.id,
      title,
      content: fullContent,
      linkUrl,
      ageMin,
      ageMax,
      boosted: false
    };

    // Check if user needs post approval (ages 9-11)
    if (user.age >= 9 && user.age <= 11) {
      // Add to pending posts for moderation
      const pendingPost = storage.addPendingPost(postData);
      console.log('Post added to pending queue:', pendingPost.id);
      return NextResponse.json({ 
        id: pendingPost.id, 
        pending: true,
        message: "Your post is pending moderator approval"
      });
    } else {
      // Create post directly
      const post = storage.createPost(postData);
      console.log('Post created:', post.id);
      return NextResponse.json({ id: post.id });
    }
  } catch (error) {
    console.error('Posts error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req) {
  const user = session.getSessionFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const authorId = url.searchParams.get('authorId');

    let posts;
    if (authorId) {
      posts = storage.postFindMany({ authorId });
    } else {
      posts = storage.postFindMany();
    }

    // Add author info to posts
    const postsWithAuthors = posts.map(post => {
      const author = storage.findUserById(post.authorId);
      return {
        ...post,
        author: author ? {
          id: author.id,
          username: author.username,
          avatar: author.avatar
        } : null
      };
    });

    return NextResponse.json({ posts: postsWithAuthors });
  } catch (error) {
    console.error('Get posts error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req) {
  const user = session.getSessionFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const postId = url.searchParams.get('postId');

    if (!postId) {
      return NextResponse.json({ error: "Post ID required" }, { status: 400 });
    }

    const post = storage.findPost(postId);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check if user is the author or a moderator
    const MODERATORS = ['darianbayan', 'admin'];
    if (post.authorId !== user.id && !MODERATORS.includes(user.username)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const success = storage.deletePost(postId);
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
    }
  } catch (error) {
    console.error('Delete post error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
