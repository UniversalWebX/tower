import { prisma } from './prisma';
import { memoryDb, useMemoryDb, type User, type Session, type Post, type PostTag, type UserInterest, type Chat, type ChatMember, type Message } from './memory-db';

// Database adapter that works with both Prisma and memory database
export class DatabaseAdapter {
  private isMemoryDb: boolean;

  constructor() {
    this.isMemoryDb = useMemoryDb;
  }

  // User operations
  async userCreate(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) {
    if (this.isMemoryDb) {
      return memoryDb.createUser(data);
    }
    return prisma.user.create({ data });
  }

  async userFind(where: { id?: string; username?: string }) {
    if (this.isMemoryDb) {
      return memoryDb.findUser(where);
    }
    return prisma.user.findFirst({ where });
  }

  async userUpdate(id: string, data: Partial<User>) {
    if (this.isMemoryDb) {
      return memoryDb.updateUser(id, data);
    }
    return prisma.user.update({ where: { id }, data });
  }

  async userDelete(id: string) {
    if (this.isMemoryDb) {
      const user = await memoryDb.findUser({ id });
      if (user) {
        // Delete related data
        await memoryDb.deleteSession({ userId: id });
        const posts = await memoryDb.findPosts({ authorId: id });
        posts.forEach(post => memoryDb.deletePost(post.id));
      }
      return true;
    }
    return prisma.user.delete({ where: { id } });
  }

  // Session operations
  async sessionCreate(data: Omit<Session, 'id' | 'createdAt'>) {
    if (this.isMemoryDb) {
      return memoryDb.createSession(data);
    }
    return prisma.session.create({ data });
  }

  async sessionFind(where: { token?: string; userId?: string }) {
    if (this.isMemoryDb) {
      return memoryDb.findSession(where);
    }
    return prisma.session.findFirst({ where });
  }

  async sessionDelete(where: { token?: string; userId?: string }) {
    if (this.isMemoryDb) {
      return memoryDb.deleteSession(where);
    }
    if (where.token) {
      return prisma.session.deleteMany({ where: { token: where.token } });
    }
    if (where.userId) {
      return prisma.session.deleteMany({ where: { userId: where.userId } });
    }
  }

  // Post operations
  async postCreate(data: Omit<Post, 'id' | 'createdAt'>) {
    if (this.isMemoryDb) {
      return memoryDb.createPost(data);
    }
    return prisma.post.create({ data });
  }

  async postFind(id: string) {
    if (this.isMemoryDb) {
      return memoryDb.findPost(id);
    }
    return prisma.post.findUnique({ where: { id } });
  }

  async postFindMany(where?: { authorId?: string }, take?: number, orderBy?: { createdAt: 'desc' }) {
    if (this.isMemoryDb) {
      return memoryDb.findPosts(where, take, orderBy);
    }
    return prisma.post.findMany({ 
      where, 
      take, 
      orderBy 
    });
  }

  async postDelete(id: string) {
    if (this.isMemoryDb) {
      return memoryDb.deletePost(id);
    }
    return prisma.post.delete({ where: { id } });
  }

  // PostTag operations
  async postTagCreate(data: Omit<PostTag, 'id'>) {
    if (this.isMemoryDb) {
      return memoryDb.createPostTag(data);
    }
    return prisma.postTag.create({ data });
  }

  async postTagFindMany(where: { postId: string }) {
    if (this.isMemoryDb) {
      return memoryDb.findPostTags(where);
    }
    return prisma.postTag.findMany({ where });
  }

  async postTagCreateMany(data: Omit<PostTag, 'id'>[]) {
    if (this.isMemoryDb) {
      const results = await Promise.all(data.map(d => memoryDb.createPostTag(d)));
      return results;
    }
    return prisma.postTag.createMany({ data });
  }

  // UserInterest operations
  async userInterestCreate(data: Omit<UserInterest, 'id'>) {
    if (this.isMemoryDb) {
      return memoryDb.createUserInterest(data);
    }
    return prisma.userInterest.create({ data });
  }

  async userInterestFindMany(where: { userId: string }) {
    if (this.isMemoryDb) {
      return memoryDb.findUserInterests(where);
    }
    return prisma.userInterest.findMany({ where });
  }

  // Chat operations
  async chatCreate(data: Omit<Chat, 'id' | 'createdAt' | 'updatedAt'>) {
    if (this.isMemoryDb) {
      return memoryDb.createChat(data);
    }
    return prisma.chat.create({ data });
  }

  async chatFind(id: string) {
    if (this.isMemoryDb) {
      return memoryDb.findChat(id);
    }
    return prisma.chat.findUnique({ where: { id } });
  }

  async chatFindMany(where?: { type?: string }) {
    if (this.isMemoryDb) {
      return memoryDb.findChats(where);
    }
    return prisma.chat.findMany({ where });
  }

  async chatDelete(id: string) {
    if (this.isMemoryDb) {
      return memoryDb.deleteChat(id);
    }
    return prisma.chat.delete({ where: { id } });
  }

  // ChatMember operations
  async chatMemberCreate(data: Omit<ChatMember, 'id'>) {
    if (this.isMemoryDb) {
      return memoryDb.createChatMember(data);
    }
    return prisma.chatMember.create({ data });
  }

  async chatMemberFindMany(where: { chatId?: string; userId?: string }) {
    if (this.isMemoryDb) {
      return memoryDb.findChatMembers(where);
    }
    return prisma.chatMember.findMany({ where });
  }

  async chatMemberCreateMany(data: Omit<ChatMember, 'id'>[]) {
    if (this.isMemoryDb) {
      const results = await Promise.all(data.map(d => memoryDb.createChatMember(d)));
      return results;
    }
    return prisma.chatMember.createMany({ data });
  }

  // Message operations
  async messageCreate(data: Omit<Message, 'id' | 'createdAt'>) {
    if (this.isMemoryDb) {
      return memoryDb.createMessage(data);
    }
    return prisma.message.create({ data });
  }

  async messageFindMany(where: { chatId: string }, take?: number, cursor?: string) {
    if (this.isMemoryDb) {
      return memoryDb.findMessages(where, take, cursor);
    }
    
    const query: any = { 
      where: { chatId: where.chatId },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take 
    };
    
    if (cursor) {
      query.skip = 1;
      query.cursor = { id: cursor };
    }
    
    return prisma.message.findMany(query);
  }

  // Utility methods
  async queryRaw<T>(query: string): Promise<T[]> {
    if (this.isMemoryDb) {
      return memoryDb.$queryRaw<T>(query);
    }
    const result = await prisma.$queryRaw`${query}`;
    return result as T[];
  }

  async disconnect() {
    if (this.isMemoryDb) {
      return memoryDb.$disconnect();
    }
    return prisma.$disconnect();
  }

  // Transaction support
  async transaction<T>(callback: (tx: any) => Promise<T>): Promise<T> {
    if (this.isMemoryDb) {
      // For memory DB, just execute the callback directly
      return callback(this);
    }
    return prisma.$transaction(callback);
  }
}

export const db = new DatabaseAdapter();
