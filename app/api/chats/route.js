const { NextResponse } = require('next/server');
const Storage = require('@/lib/storage');
const Session = require('@/lib/session');
const Validation = require('@/lib/validation');

const storage = new Storage();
const session = new Session();

export async function POST(req) {
  const user = session.getSessionFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { type, recipientUsername, name, memberIds } = await req.json();
    
    let chat;
    
    if (type === 'direct' && recipientUsername) {
      // Direct message - find or create chat between users
      const recipient = storage.findUser(recipientUsername);
      if (!recipient) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Check if chat already exists between these users
      const existingChats = storage.findChatsByUserId(user.id);
      const existingChat = existingChats.find(c => {
        if (c.type === 'direct') {
          const members = storage.findChatMembers(c.id);
          return members.some(m => m.userId === recipient.id);
        }
        return false;
      });

      if (existingChat) {
        chat = existingChat;
      } else {
        // Create new direct chat
        chat = storage.createChat({
          type: 'direct',
          createdBy: user.id
        });

        // Add both users to chat
        storage.addChatMember(chat.id, user.id);
        storage.addChatMember(chat.id, recipient.id);
      }
    } else {
      // Group chat (original logic)
      const validation = Validation.validateChat({ name, type, memberIds });
      if (!validation.valid) {
        return NextResponse.json({ error: validation.errors.join(', ') }, { status: 400 });
      }

      // Ensure current user is included in members
      if (!memberIds.includes(user.id)) {
        memberIds.push(user.id);
      }

      chat = storage.createChat({
        name,
        type,
        createdBy: user.id
      });

      // Add all members to chat
      memberIds.forEach(memberId => {
        storage.addChatMember(chat.id, memberId);
      });
    }

    // Return chat with member info
    const members = storage.findChatMembers(chat.id).map(cm => {
      const memberUser = storage.findUserById(cm.userId);
      return {
        id: cm.id,
        userId: cm.userId,
        username: memberUser?.username,
        joinedAt: cm.joinedAt
      };
    });

    // For direct chats, add other user info
    let otherUser = null;
    if (chat.type === 'direct') {
      otherUser = members.find(m => m.userId !== user.id);
    }

    return NextResponse.json({
      ...chat,
      members,
      otherUser
    });

  } catch (error) {
    console.error('Create chat error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req) {
  const user = session.getSessionFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const chats = storage.findChatsByUserId(user.id);
    
    // Add member info and last message to each chat
    const chatsWithInfo = chats.map(chat => {
      const members = storage.findChatMembers(chat.id).map(cm => {
        const memberUser = storage.findUserById(cm.userId);
        return {
          id: cm.id,
          userId: cm.userId,
          username: memberUser?.username,
          avatar: memberUser?.avatar,
          joinedAt: cm.joinedAt,
          lastReadAt: cm.lastReadAt
        };
      });

      const messages = storage.findMessages({ chatId: chat.id });
      const lastMessage = messages[0]; // Most recent message

      // For direct chats, add other user info
      let otherUser = null;
      if (chat.type === 'direct') {
        otherUser = members.find(m => m.userId !== user.id);
      }

      return {
        ...chat,
        members,
        otherUser,
        lastMessage,
        unreadCount: messages.filter(m => {
          const memberInfo = members.find(cm => cm.userId === user.id);
          return memberInfo && new Date(m.createdAt) > new Date(memberInfo.lastReadAt);
        }).length
      };
    });

    return NextResponse.json({ chats: chatsWithInfo });
  } catch (error) {
    console.error('Get chats error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
