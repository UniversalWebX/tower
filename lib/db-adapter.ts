import { prisma } from './prisma';
import { memoryDb, useMemoryDb, type User, type Session, type Post, type PostTag, type UserInterest, type Chat, type ChatMember, type Message } from './memory-db';
import { encryptedDb } from './encrypted-db-adapter';

// Database adapter that works with both Prisma, memory database, and encrypted storage
export class DatabaseAdapter {
  private isMemoryDb: boolean;
  private useEncryptedStorage: boolean;

  constructor() {
    this.isMemoryDb = useMemoryDb;
    this.useEncryptedStorage = true; // Always use encrypted storage for better data persistence
  }

  // User operations
  async userCreate(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) {
    if (this.useEncryptedStorage) {
      return encryptedDb.userCreate(data);
    }
    if (this.isMemoryDb) {
      return memoryDb.createUser(data);
    }
    if (!prisma) throw new Error('Prisma not initialized');
    return prisma.user.create({ data });
  }

  async userFind(where: { id?: string; username?: string }) {
    if (this.useEncryptedStorage) {
      return encryptedDb.userFind(where);
    }
    if (this.isMemoryDb) {
      return memoryDb.findUser(where);
    }
    if (!prisma) throw new Error('Prisma not initialized');
    return prisma.user.findFirst({ where });
  }

  async userUpdate(id: string, data: Partial<User>) {
    if (this.isMemoryDb) {
      return memoryDb.updateUser(id, data);
    }
    if (!prisma) throw new Error('Prisma not initialized');
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
    if (!prisma) throw new Error('Prisma not initialized');
    return prisma.user.delete({ where: { id } });
  }

  // Session operations
  async sessionCreate(data: Omit<Session, 'id' | 'createdAt'>) {
    if (this.isMemoryDb) {
      return memoryDb.createSession(data);
    }
    if (!prisma) throw new Error('Prisma not initialized');
    return prisma.session.create({ data });
  }

  async sessionFind(where: { token?: string; userId?: string }) {
    if (this.isMemoryDb) {
      return memoryDb.findSession(where);
    }
    if (!prisma) throw new Error('Prisma not initialized');
    return prisma.session.findFirst({ where });
  }

  async sessionDelete(where: { token?: string; userId?: string }) {
    if (this.isMemoryDb) {
      return memoryDb.deleteSession(where);
    }
    if (!prisma) throw new Error('Prisma not initialized');
    if (where.token) {
      return prisma.session.deleteMany({ where: { token: where.token } });
    }
    if (where.userId) {
      return prisma.session.deleteMany({ where: { userId: where.userId } });
    }
  }

  // Post operations
  async postCreate(data: Omit<Post, 'id' | 'createdAt'>) {
    if (this.useEncryptedStorage) {
      return encryptedDb.postCreate(data);
    }
    if (this.isMemoryDb) {
      return memoryDb.createPost(data);
    }
    if (!prisma) throw new Error('Prisma not initialized');
    return prisma.post.create({ data });
  }

  async postFind(id: string) {
    if (this.useEncryptedStorage) {
      const posts = await encryptedDb.postFind({ id });
      return posts || null;
    }
    if (this.isMemoryDb) {
      return memoryDb.findPost(id);
    }
    if (!prisma) throw new Error('Prisma not initialized');
    return prisma.post.findUnique({ where: { id } });
  }

  async postFindMany(where?: { authorId?: string }, take?: number, orderBy?: { createdAt: 'desc' }) {
    if (this.useEncryptedStorage) {
      return encryptedDb.postFindMany(where || {});
    }
    if (this.isMemoryDb) {
      return memoryDb.findPosts(where, take, orderBy);
    }
    if (!prisma) throw new Error('Prisma not initialized');
    return prisma.post.findMany({ 
      where, 
      take, 
      orderBy 
    });
  }

  async postDelete(id: string) {
    if (this.useEncryptedStorage) {
      return encryptedDb.postDelete(id);
    }
    if (this.isMemoryDb) {
      return memoryDb.deletePost(id);
    }
    if (!prisma) throw new Error('Prisma not initialized');
    return prisma.post.delete({ where: { id } });
  }

  // PostTag operations
  async postTagCreate(data: Omit<PostTag, 'id'>) {
    if (this.isMemoryDb) {
      return memoryDb.createPostTag(data);
    }
    if (!prisma) throw new Error('Prisma not initialized');
    return prisma.postTag.create({ data });
  }

  async postTagFindMany(where: { postId: string }) {
    if (this.isMemoryDb) {
      return memoryDb.findPostTags(where);
    }
    if (!prisma) throw new Error('Prisma not initialized');
    return prisma.postTag.findMany({ where });
  }

  async postTagCreateMany(data: Omit<PostTag, 'id'>[]) {
    if (this.isMemoryDb) {
      const results = await Promise.all(data.map(d => memoryDb.createPostTag(d)));
      return results;
    }
    if (!prisma) throw new Error('Prisma not initialized');
    return prisma.postTag.createMany({ data });
  }

  // UserInterest operations
  async userInterestCreate(data: Omit<UserInterest, 'id'>) {
    if (this.isMemoryDb) {
      return memoryDb.createUserInterest(data);
    }
    if (!prisma) throw new Error('Prisma not initialized');
    return prisma.userInterest.create({ data });
  }

  async userInterestFindMany(where: { userId: string }) {
    if (this.isMemoryDb) {
      return memoryDb.findUserInterests(where);
    }
    if (!prisma) throw new Error('Prisma not initialized');
    return prisma.userInterest.findMany({ where });
  }

  // Chat operations
  async chatCreate(data: Omit<Chat, 'id' | 'createdAt' | 'updatedAt'>) {
    if (this.isMemoryDb) {
      return memoryDb.createChat(data);
    }
    if (!prisma) throw new Error('Prisma not initialized');
    return prisma.chat.create({ data });
  }

  async chatFind(id: string) {
    if (this.isMemoryDb) {
      return memoryDb.findChat(id);
    }
    if (!prisma) throw new Error('Prisma not initialized');
    return prisma.chat.findUnique({ where: { id } });
  }

  async chatFindMany(where?: { type?: string }) {
    if (this.isMemoryDb) {
      return memoryDb.findChats(where);
    }
    if (!prisma) throw new Error('Prisma not initialized');
    return prisma.chat.findMany({ where });
  }

  async chatDelete(id: string) {
    if (this.isMemoryDb) {
      return memoryDb.deleteChat(id);
    }
    if (!prisma) throw new Error('Prisma not initialized');
    return prisma.chat.delete({ where: { id } });
  }

  // ChatMember operations
  async chatMemberCreate(data: Omit<ChatMember, 'id'>) {
    if (this.isMemoryDb) {
      return memoryDb.createChatMember(data);
    }
    if (!prisma) throw new Error('Prisma not initialized');
    return prisma.chatMember.create({ data });
  }

  async chatMemberFindMany(where: { chatId?: string; userId?: string }) {
    if (this.isMemoryDb) {
      return memoryDb.findChatMembers(where);
    }
    if (!prisma) throw new Error('Prisma not initialized');
    return prisma.chatMember.findMany({ where });
  }

  async chatMemberCreateMany(data: Omit<ChatMember, 'id'>[]) {
    if (this.isMemoryDb) {
      const results = await Promise.all(data.map(d => memoryDb.createChatMember(d)));
      return results;
    }
    if (!prisma) throw new Error('Prisma not initialized');
    return prisma.chatMember.createMany({ data });
  }

  // Message operations
  async messageCreate(data: Omit<Message, 'id' | 'createdAt'>) {
    if (this.isMemoryDb) {
      return memoryDb.createMessage(data);
    }
    if (!prisma) throw new Error('Prisma not initialized');
    return prisma.message.create({ data });
  }

  async messageFindMany(where: { chatId: string }, take?: number, cursor?: string) {
    if (this.isMemoryDb) {
      return memoryDb.findMessages(where, take, cursor);
    }
    
    if (!prisma) throw new Error('Prisma not initialized');
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
    if (!prisma) throw new Error('Prisma not initialized');
    const result = await prisma.$queryRaw`${query}`;
    return result as T[];
  }

  async disconnect() {
    if (this.isMemoryDb) {
      return memoryDb.$disconnect();
    }
    if (!prisma) return;
    return prisma.$disconnect();
  }

  // Transaction support
  async transaction<T>(callback: (tx: any) => Promise<T>): Promise<T> {
    if (this.useEncryptedStorage) {
      // For encrypted storage, just execute callback directly
      return callback(this);
    }
    if (this.isMemoryDb) {
      // For memory DB, just execute callback directly
      return callback(this);
    }
    if (!prisma) throw new Error('Prisma not initialized');
    return prisma.$transaction(callback);
  }
}

export const db = new DatabaseAdapter();
