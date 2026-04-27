const { NextResponse } = require('next/server');
const Storage = require('@/lib/storage');
const Session = require('@/lib/session');

const storage = new Storage();
const session = new Session();

export async function GET(req, { params }) {
  try {
    const { username } = await params;
    
    const user = storage.findUser(username);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Don't expose sensitive information
    const userProfile = {
      id: user.id,
      username: user.username,
      age: user.age,
      bio: user.bio,
      avatar: user.avatar,
      interests: user.interests || [],
      createdAt: user.createdAt,
      // Don't expose suspension/shadow ban status to regular users
      suspended: false,
      shadowBanned: false
    };

    // Get user's posts
    const posts = storage.findPosts({ authorId: user.id });
    const postsWithAuthor = posts.map(post => ({
      ...post,
      author: {
        id: user.id,
        username: user.username,
        avatar: user.avatar
      }
    }));

    // Get followers and following counts
    const followers = storage.findFollows({ followingId: user.id });
    const following = storage.findFollows({ followerId: user.id });

    // Check if current user is following this user and if it's their own profile
    const currentUser = session.getSessionFromRequest(req);
    let isFollowing = false;
    let isOwnProfile = false;
    
    if (currentUser) {
      const followRelation = storage.findFollows({ followerId: currentUser.id, followingId: user.id });
      isFollowing = !!followRelation;
      isOwnProfile = currentUser.id === user.id;
    }

    return NextResponse.json({
      user: userProfile,
      posts: postsWithAuthor,
      followers: followers.length,
      following: following.length,
      isFollowing,
      isOwnProfile
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  const currentUser = session.getSessionFromRequest(req);
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { username } = params;
    const { action } = await req.json();

    const targetUser = storage.findUser(username);
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (targetUser.id === currentUser.id) {
      return NextResponse.json({ error: "Cannot perform action on yourself" }, { status: 400 });
    }

    switch (action) {
      case 'follow':
        const follow = storage.createFollow(currentUser.id, targetUser.id);
        return NextResponse.json({ success: true, follow });

      case 'unfollow':
        storage.deleteFollow(currentUser.id, targetUser.id);
        return NextResponse.json({ success: true });

      case 'dm':
        // Create or get existing direct message chat
        const userChats = storage.findChatsByUserId(currentUser.id);
        let existingChat = userChats.find(chat => {
          const members = storage.findChatMembers(chat.id);
          return chat.type === 'direct' && 
                 members.length === 2 && 
                 members.some(cm => cm.userId === targetUser.id);
        });

        if (!existingChat) {
          // Create new direct message chat
          existingChat = storage.createChat({
            name: `DM with ${targetUser.username}`,
            type: 'direct',
            createdBy: currentUser.id
          });

          // Add both users to the chat
          storage.addChatMember(existingChat.id, currentUser.id);
          storage.addChatMember(existingChat.id, targetUser.id);
        }

        return NextResponse.json({ 
          success: true, 
          chatId: existingChat.id 
        });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

  } catch (error) {
    console.error('User action error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
