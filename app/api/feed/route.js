const { NextResponse } = require('next/server');
const Storage = require('@/lib/storage');
const Session = require('@/lib/session');

const storage = new Storage();
const session = new Session();

function clamp(n, lo, hi) {
  return Math.min(hi, Math.max(lo, n));
}

function freshnessBoost(createdAt, now = Date.now()) {
  const createdDate = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
  const hours = Math.max(0, (now - createdDate.getTime()) / 3_600_000);
  return Math.exp(-hours / 96);
}

function rankPost(input) {
  const tags = input.userTopics.size;
  const age = input.userAge >= input.ageMin && input.userAge <= input.ageMax ? 1 : 0.1;
  const fresh = freshnessBoost(input.createdAt);
  
  // Enhanced scoring factors
  const tagBonus = tags > 0 ? Math.log(tags + 1) * 8 : 0;
  const agePenalty = Math.abs(input.userAge - (input.ageMin + input.ageMax) / 2) * 0.1;
  const recencyBonus = fresh > 0.5 ? fresh * 6 : fresh * 3;
  const diversityBonus = input.postTags.length > 3 ? 2 : 0;
  
  // Boost bonus for moderator-boosted posts
  const boostBonus = input.boosted ? 50 : 0;
  
  // Final sophisticated score
  return Math.max(0, 
    tags * 12 * age + 
    tagBonus + 
    recencyBonus + 
    diversityBonus + 
    boostBonus -
    agePenalty
  );
}

export async function GET(req) {
  console.log('Feed API called');
  const user = session.getSessionFromRequest(req);
  
  if (!user) {
    console.log('No user found, returning 401');
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const offset = clamp(Number(url.searchParams.get("offset") ?? 0) || 0, 0, 10_000);
  const limit = clamp(Number(url.searchParams.get("limit") ?? 18) || 18, 1, 40);

  const topicSet = new Set(user.interests || []);

  // Get all posts
  const pool = storage.postFindMany();
  console.log('Feed total posts:', pool.length);

  // Filter out shadow banned users' posts (unless viewer is shadow banned)
  let filteredPool = pool;
  if (!user.shadowBanned) {
    filteredPool = pool.filter(post => {
      const author = storage.findUserById(post.authorId);
      return !author?.shadowBanned;
    });
  }

  const ranked = filteredPool
    .map((post) => {
      // Extract tags from content if they exist
      const content = post.content || '';
      const tagMatch = content.match(/Tags:\s*(.+)/i);
      const postTags = tagMatch ? tagMatch[1].split(',').map(t => t.trim()).filter(Boolean) : [];
      
      const score = rankPost({
        userAge: user.age,
        userTopics: topicSet,
        postTags: postTags,
        ageMin: post.ageMin,
        ageMax: post.ageMax,
        createdAt: post.createdAt,
        boosted: post.boosted || false
      });
      return { ...post, tags: postTags, score };
    })
    .sort((a, b) => b.score - a.score);

  const slice = ranked.slice(offset, offset + limit);
  const nextOffset = offset + slice.length;

  // Add author info
  const postsWithAuthors = slice.map(post => {
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

  console.log('Feed returning posts:', postsWithAuthors.length);

  return NextResponse.json({
    posts: postsWithAuthors,
    nextOffset,
    hasMore: nextOffset < ranked.length,
    poolSize: ranked.length,
  });
}
