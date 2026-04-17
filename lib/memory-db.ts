// In-memory database fallback for deployments without external database
export interface User {
  id: string;
  username: string;
  passwordHash: string;
  age: number;
  suspended: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface Post {
  id: string;
  authorId: string;
  title: string;
  videoUrl?: string;
  ageMin: number;
  ageMax: number;
  createdAt: Date;
}

export interface PostTag {
  id: string;
  postId: string;
  tag: string;
}

export interface UserInterest {
  id: string;
  userId: string;
  topic: string;
}

export interface Chat {
  id: string;
  type: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMember {
  id: string;
  chatId: string;
  userId: string;
  joinedAt: Date;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  body: string;
  createdAt: Date;
}

class MemoryDatabase {
  private users: Map<string, User> = new Map();
  private sessions: Map<string, Session> = new Map();
  private posts: Map<string, Post> = new Map();
  private postTags: Map<string, PostTag> = new Map();
  private userInterests: Map<string, UserInterest> = new Map();
  private chats: Map<string, Chat> = new Map();
  private chatMembers: Map<string, ChatMember> = new Map();
  private messages: Map<string, Message> = new Map();

  // User operations
  async createUser(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const user: User = {
      ...data,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async findUser(where: { id?: string; username?: string }): Promise<User | null> {
    if (where.id) {
      return this.users.get(where.id) || null;
    }
    if (where.username) {
      for (const user of this.users.values()) {
        if (user.username === where.username) return user;
      }
    }
    return null;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error('User not found');
    const updated = { ...user, ...data, updatedAt: new Date() };
    this.users.set(id, updated);
    return updated;
  }

  // Session operations
  async createSession(data: Omit<Session, 'id' | 'createdAt'>): Promise<Session> {
    const session: Session = {
      ...data,
      id: this.generateId(),
      createdAt: new Date(),
    };
    this.sessions.set(session.id, session);
    return session;
  }

  async findSession(where: { token?: string; userId?: string }): Promise<Session | null> {
    for (const session of this.sessions.values()) {
      if (where.token && session.token === where.token) return session;
      if (where.userId && session.userId === where.userId) return session;
    }
    return null;
  }

  async deleteSession(where: { token?: string; userId?: string }): Promise<void> {
    for (const [id, session] of this.sessions.entries()) {
      if (where.token && session.token === where.token) {
        this.sessions.delete(id);
        return;
      }
      if (where.userId && session.userId === where.userId) {
        this.sessions.delete(id);
      }
    }
  }

  // Post operations
  async createPost(data: Omit<Post, 'id' | 'createdAt'>): Promise<Post> {
    const post: Post = {
      ...data,
      id: this.generateId(),
      createdAt: new Date(),
    };
    this.posts.set(post.id, post);
    return post;
  }

  async findPost(id: string): Promise<Post | null> {
    return this.posts.get(id) || null;
  }

  async findPosts(where?: { authorId?: string }, take?: number, orderBy?: { createdAt: 'desc' }): Promise<Post[]> {
    let posts = Array.from(this.posts.values());
    
    if (where?.authorId) {
      posts = posts.filter(p => p.authorId === where.authorId);
    }
    
    if (orderBy?.createdAt === 'desc') {
      posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    
    if (take) {
      posts = posts.slice(0, take);
    }
    
    return posts;
  }

  async deletePost(id: string): Promise<void> {
    this.posts.delete(id);
    // Also delete related post tags
    for (const [tagId, tag] of this.postTags.entries()) {
      if (tag.postId === id) {
        this.postTags.delete(tagId);
      }
    }
  }

  // PostTag operations
  async createPostTag(data: Omit<PostTag, 'id'>): Promise<PostTag> {
    const postTag: PostTag = {
      ...data,
      id: this.generateId(),
    };
    this.postTags.set(postTag.id, postTag);
    return postTag;
  }

  async findPostTags(where: { postId: string }): Promise<PostTag[]> {
    return Array.from(this.postTags.values()).filter(tag => tag.postId === where.postId);
  }

  // UserInterest operations
  async createUserInterest(data: Omit<UserInterest, 'id'>): Promise<UserInterest> {
    const interest: UserInterest = {
      ...data,
      id: this.generateId(),
    };
    this.userInterests.set(interest.id, interest);
    return interest;
  }

  async findUserInterests(where: { userId: string }): Promise<UserInterest[]> {
    return Array.from(this.userInterests.values()).filter(interest => interest.userId === where.userId);
  }

  // Chat operations
  async createChat(data: Omit<Chat, 'id' | 'createdAt' | 'updatedAt'>): Promise<Chat> {
    const chat: Chat = {
      ...data,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.chats.set(chat.id, chat);
    return chat;
  }

  async findChat(id: string): Promise<Chat | null> {
    return this.chats.get(id) || null;
  }

  async findChats(where?: { type?: string }): Promise<Chat[]> {
    let chats = Array.from(this.chats.values());
    if (where?.type) {
      chats = chats.filter(c => c.type === where.type);
    }
    return chats;
  }

  async deleteChat(id: string): Promise<void> {
    this.chats.delete(id);
    // Also delete related members and messages
    for (const [memberId, member] of this.chatMembers.entries()) {
      if (member.chatId === id) {
        this.chatMembers.delete(memberId);
      }
    }
    for (const [messageId, message] of this.messages.entries()) {
      if (message.chatId === id) {
        this.messages.delete(messageId);
      }
    }
  }

  // ChatMember operations
  async createChatMember(data: Omit<ChatMember, 'id'>): Promise<ChatMember> {
    const member: ChatMember = {
      ...data,
      id: this.generateId(),
    };
    this.chatMembers.set(member.id, member);
    return member;
  }

  async findChatMembers(where: { chatId?: string; userId?: string }): Promise<ChatMember[]> {
    return Array.from(this.chatMembers.values()).filter(member => {
      if (where.chatId && member.chatId !== where.chatId) return false;
      if (where.userId && member.userId !== where.userId) return false;
      return true;
    });
  }

  // Message operations
  async createMessage(data: Omit<Message, 'id' | 'createdAt'>): Promise<Message> {
    const message: Message = {
      ...data,
      id: this.generateId(),
      createdAt: new Date(),
    };
    this.messages.set(message.id, message);
    return message;
  }

  async findMessages(where: { chatId: string }, take?: number, cursor?: string): Promise<Message[]> {
    let messages = Array.from(this.messages.values())
      .filter(m => m.chatId === where.chatId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    if (cursor) {
      const index = messages.findIndex(m => m.id === cursor);
      if (index !== -1) {
        messages = messages.slice(index + 1);
      }
    }

    if (take) {
      messages = messages.slice(0, take);
    }

    return messages.reverse(); // Return in chronological order
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  // Utility methods
  async $queryRaw<T>(query: string): Promise<T[]> {
    // Simple implementation for basic queries
    if (query.includes('SELECT 1')) {
      return [{ result: 1 }] as T[];
    }
    return [] as T[];
  }

  async $disconnect(): Promise<void> {
    // No-op for memory database
  }
}

export const memoryDb = new MemoryDatabase();
export const useMemoryDb = !process.env.DATABASE_URL || process.env.NODE_ENV === 'development';
