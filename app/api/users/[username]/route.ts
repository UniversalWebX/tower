import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { db } from "@/lib/db-adapter";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const currentUser = await getSessionUser();
  
  try {
    // Find user by username
    const user = await db.userFind({ username });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user's additional data
    const interests = await db.userInterestFindMany({ userId: user.id });
    const posts = await db.postFindMany({ authorId: user.id });
    const followers = await db.followFindMany({ followingId: user.id });
    const following = await db.followFindMany({ followerId: user.id });

    // Format response
    const profileData = {
      id: user.id,
      username: user.username,
      age: user.age,
      bio: user.bio || '',
      avatar: user.avatar || '',
      interests: interests.map(i => i.topic),
      stats: {
        postsCount: posts.length,
        followersCount: followers.length,
        followingCount: following.length
      },
      createdAt: user.createdAt,
      isOwnProfile: currentUser?.id === user.id
    };

    return NextResponse.json(profileData);
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const currentUser = await getSessionUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { username } = await params;
  const body = await req.json().catch(() => null);
  const { action } = body || {};

  try {
    switch (action) {
      case 'dm':
        const { message } = body;
        
        if (!message) {
          return NextResponse.json({ error: "Message content is required" }, { status: 400 });
        }

        // Find target user
        const targetUser = await db.userFind({ username });
        if (!targetUser) {
          return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Create DM message
        const dmMessage = await db.messageCreate({
          authorId: currentUser.id,
          recipientId: targetUser.id,
          content: message,
          read: false
        });

        return NextResponse.json({
          success: true,
          message: "DM sent successfully",
          messageId: dmMessage.id
        });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Profile action error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const currentUser = await getSessionUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { username } = await params;
  const body = await req.json().catch(() => null);
  const { action } = body || {};

  try {
    switch (action) {
      case 'follow': {
        // Check if user exists
        const targetUser = await db.userFind({ username });
        if (!targetUser) {
          return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Check if already following
        const existingFollow = await db.followFind({
          followerId: currentUser.id,
          followingId: targetUser.id
        });

        if (existingFollow) {
          return NextResponse.json({ error: "Already following this user" }, { status: 400 });
        }

        // Create follow relationship
        await db.followCreate({
          followerId: currentUser.id,
          followingId: targetUser.id
        });

        return NextResponse.json({ 
          success: true, 
          message: `Now following @${username}` 
        });
      }

      case 'unfollow': {
        // Check if user exists
        const targetUser = await db.userFind({ username });
        if (!targetUser) {
          return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Find and delete follow relationship
        const followRelation = await db.followFind({
          followerId: currentUser.id,
          followingId: targetUser.id
        });

        if (!followRelation) {
          return NextResponse.json({ error: "Not following this user" }, { status: 400 });
        }

        await db.followDelete(followRelation.id);

        return NextResponse.json({ 
          success: true, 
          message: `Unfollowed @${username}` 
        });
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Profile action error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
