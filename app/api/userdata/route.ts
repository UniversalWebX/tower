import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { db } from "@/lib/db-adapter";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Get all user data
    const [interests, posts, followers, following, messages] = await Promise.all([
      db.userInterestFindMany({ userId: user.id }),
      db.postFindMany({ authorId: user.id }),
      db.followFindMany({ followerId: user.id }),
      db.followFindMany({ followingId: user.id }),
      db.messageFindMany({ authorId: user.id })
    ]);

    // Format user data
    const userData = {
      profile: {
        id: user.id,
        username: user.username,
        age: user.age,
        bio: user.bio || '',
        avatar: user.avatar || '',
        createdAt: user.createdAt.toISOString()
      },
      interests: interests.map(i => i.topic),
      posts: posts.map(post => ({
        id: post.id,
        title: post.title,
        videoUrl: post.videoUrl || '',
        ageMin: post.ageMin,
        ageMax: post.ageMax,
        tags: [], // Would need to fetch from postTag table
        createdAt: post.createdAt.toISOString(),
        score: 0 // Would need to calculate
      })),
      followers: followers.map(follow => ({
        id: follow.id,
        followerId: follow.followerId,
        followingId: follow.followingId,
        createdAt: follow.createdAt.toISOString()
      })),
      following: following.map(follow => ({
        id: follow.id,
        followerId: follow.followerId,
        followingId: follow.followingId,
        createdAt: follow.createdAt.toISOString()
      })),
      messages: messages.map(message => ({
        id: message.id,
        content: message.content,
        recipientId: message.recipientId,
        rackId: message.rackId || '',
        read: message.read,
        createdAt: message.createdAt.toISOString()
      })),
      stats: {
        postsCount: posts.length,
        followersCount: followers.length,
        followingCount: following.length,
        messagesCount: messages.length
      },
      exportedAt: new Date().toISOString()
    };

    return NextResponse.json(userData);
  } catch (error) {
    console.error("User data fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 });
  }
}
