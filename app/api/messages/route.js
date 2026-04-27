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
    const { content, chatId } = await req.json();
    
    const validation = Validation.validateMessage({ content, chatId });
    if (!validation.valid) {
      return NextResponse.json({ error: validation.errors.join(', ') }, { status: 400 });
    }

    // Check if user is a member of the chat
    const chat = storage.findChat(chatId);
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    const members = storage.findChatMembers(chatId);
    const isMember = members.some(cm => cm.userId === user.id);
    if (!isMember) {
      return NextResponse.json({ error: "Not a member of this chat" }, { status: 403 });
    }

    // Create message
    const message = storage.createMessage({
      chatId,
      senderId: user.id,
      content: content.trim()
    });

    // Update chat timestamp
    storage.updateChat(chatId, {
      lastMessage: content,
      lastMessageAt: message.createdAt
    });

    // Return message with sender info
    const messageWithSender = {
      ...message,
      sender: {
        id: user.id,
        username: user.username,
        avatar: user.avatar
      }
    };

    return NextResponse.json(messageWithSender);

  } catch (error) {
    console.error('Create message error:', error);
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
    const chatId = url.searchParams.get('chatId');
    const limit = parseInt(url.searchParams.get('limit') || '50');

    if (!chatId) {
      return NextResponse.json({ error: "Chat ID required" }, { status: 400 });
    }

    // Check if user is a member of the chat
    const members = storage.findChatMembers(chatId);
    const isMember = members.some(cm => cm.userId === user.id);
    if (!isMember) {
      return NextResponse.json({ error: "Not a member of this chat" }, { status: 403 });
    }

    // Get messages
    const messages = storage.findMessages({ chatId }).slice(0, limit);

    // Add sender info to messages
    const messagesWithSenders = messages.map(message => {
      const sender = storage.findUserById(message.senderId);
      return {
        ...message,
        isOwn: message.senderId === user.id,
        sender: sender ? {
          id: sender.id,
          username: sender.username,
          avatar: sender.avatar
        } : null
      };
    });

    // Mark messages as read for this user
    const memberInfo = members.find(cm => cm.userId === user.id);
    if (memberInfo) {
      memberInfo.lastReadAt = new Date().toISOString();
      storage.saveData(storage.loadData());
    }

    return NextResponse.json({ messages: messagesWithSenders });

  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
