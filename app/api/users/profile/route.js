const { NextResponse } = require('next/server');
const Storage = require('@/lib/storage');
const Session = require('@/lib/session');
const Auth = require('@/lib/auth');

const storage = new Storage();
const session = new Session();

export async function GET(req) {
  const user = session.getSessionFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get user's stats
    const posts = storage.postFindMany({ authorId: user.id });
    const followers = storage.findFollows({ followingId: user.id });
    const following = storage.findFollows({ followerId: user.id });

    return NextResponse.json({
      id: user.id,
      username: user.username,
      age: user.age,
      bio: user.bio,
      avatar: user.avatar,
      interests: user.interests || [],
      createdAt: user.createdAt,
      stats: {
        postsCount: posts.length,
        followersCount: followers.length,
        followingCount: following.length
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req) {
  const user = session.getSessionFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { bio, interests, avatar } = await req.json();

    // Validate bio
    if (bio !== undefined) {
      const bioValidation = Auth.validateBio(bio);
      if (!bioValidation.valid) {
        return NextResponse.json({ error: bioValidation.error }, { status: 400 });
      }
    }

    // Validate interests
    if (interests !== undefined) {
      if (!Array.isArray(interests)) {
        return NextResponse.json({ error: "Interests must be an array" }, { status: 400 });
      }
      if (interests.length > 10) {
        return NextResponse.json({ error: "Maximum 10 interests allowed" }, { status: 400 });
      }
      const validInterests = interests.filter(i => typeof i === 'string' && i.trim().length > 0);
      if (validInterests.length !== interests.length) {
        return NextResponse.json({ error: "All interests must be non-empty strings" }, { status: 400 });
      }
    }

    // Update user profile
    const updatedUser = storage.updateUserById(user.id, {
      bio: bio !== undefined ? bio : user.bio,
      interests: interests !== undefined ? interests : user.interests,
      avatar: avatar !== undefined ? avatar : user.avatar
    });

    if (!updatedUser) {
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }

    return NextResponse.json({
      id: updatedUser.id,
      username: updatedUser.username,
      age: updatedUser.age,
      bio: updatedUser.bio,
      avatar: updatedUser.avatar,
      interests: updatedUser.interests
    });

  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
