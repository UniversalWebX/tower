import EncryptedStorage from './encrypted-storage';
import { hashPassword, verifyPassword } from './password';

export class EncryptedDatabaseAdapter {
  isMemoryDb = true;

  // User operations
  async userCreate(data: { username: string; passwordHash: string; age: number; bio?: string; avatar?: string }) {
    return EncryptedStorage.createUser({
      ...data,
      interests: [],
      suspended: false
    });
  }

  async userFind(where: { username?: string; id?: string }) {
    if (where.username) {
      return EncryptedStorage.findUser(where.username);
    } else if (where.id) {
      return EncryptedStorage.findUserById(where.id);
    }
    return null;
  }

  async userFindMany() {
    const data = EncryptedStorage.loadData();
    return data.users;
  }

  async userUpdate(username: string, data: Partial<any>) {
    return EncryptedStorage.updateUser(username, data);
  }

  async userDelete(username: string) {
    return EncryptedStorage.deleteUser(username);
  }

  // Session operations
  async sessionCreate(data: { userId: string; token: string; expiresAt: Date }) {
    return EncryptedStorage.createSession(data.userId);
  }

  async sessionFind(where: { token: string }) {
    return EncryptedStorage.findSession(where.token);
  }

  async sessionDelete(where: { token?: string; userId?: string }) {
    if (where.token) {
      EncryptedStorage.deleteSession(where.token);
    } else if (where.userId) {
      EncryptedStorage.deleteUserSessions(where.userId);
    }
  }

  async sessionFindMany(where: { userId: string }) {
    const data = EncryptedStorage.loadData();
    return data.sessions.filter(s => s.userId === where.userId);
  }

  // Post operations
  async postCreate(data: { authorId: string; title: string; videoUrl?: string; ageMin: number; ageMax: number }) {
    const allData = EncryptedStorage.loadData();
    const newPost = {
      id: require('crypto').randomUUID(),
      ...data,
      createdAt: new Date().toISOString()
    };
    
    allData.posts.push(newPost);
    EncryptedStorage.saveData(allData);
    
    return newPost;
  }

  async postFind(where: { id?: string; authorId?: string }) {
    const data = EncryptedStorage.loadData();
    
    if (where.id) {
      return data.posts.find(p => p.id === where.id) || null;
    } else if (where.authorId) {
      return data.posts.filter(p => p.authorId === where.authorId);
    }
    
    return [];
  }

  async postFindMany(where: { authorId?: string }) {
    const data = EncryptedStorage.loadData();
    
    if (where.authorId) {
      return data.posts.filter(p => p.authorId === where.authorId);
    }
    
    return data.posts;
  }

  async postUpdate(id: string, data: Partial<any>) {
    const allData = EncryptedStorage.loadData();
    const postIndex = allData.posts.findIndex(p => p.id === id);
    
    if (postIndex === -1) return null;
    
    allData.posts[postIndex] = { ...allData.posts[postIndex], ...data };
    EncryptedStorage.saveData(allData);
    
    return allData.posts[postIndex];
  }

  async postDelete(id: string) {
    const data = EncryptedStorage.loadData();
    const initialLength = data.posts.length;
    
    data.posts = data.posts.filter(p => p.id !== id);
    
    if (data.posts.length < initialLength) {
      EncryptedStorage.saveData(data);
      return true;
    }
    
    return false;
  }

  // User Interest operations
  async userInterestCreate(data: { userId: string; topic: string }) {
    const allData = EncryptedStorage.loadData();
    const newInterest = {
      id: require('crypto').randomUUID(),
      ...data
    };
    
    allData.userInterests.push(newInterest);
    EncryptedStorage.saveData(allData);
    
    return newInterest;
  }

  async userInterestFindMany(where: { userId: string }) {
    const data = EncryptedStorage.loadData();
    return data.userInterests.filter(ui => ui.userId === where.userId);
  }

  async userInterestDelete(where: { userId: string }) {
    const data = EncryptedStorage.loadData();
    const initialLength = data.userInterests.length;
    
    data.userInterests = data.userInterests.filter(ui => ui.userId !== where.userId);
    
    if (data.userInterests.length < initialLength) {
      EncryptedStorage.saveData(data);
      return true;
    }
    
    return false;
  }

  // Follow operations
  async followCreate(data: { followerId: string; followingId: string }) {
    const allData = EncryptedStorage.loadData();
    const newFollow = {
      id: require('crypto').randomUUID(),
      ...data,
      createdAt: new Date().toISOString()
    };
    
    allData.follows.push(newFollow);
    EncryptedStorage.saveData(allData);
    
    return newFollow;
  }

  async followFind(where: { followerId?: string; followingId?: string }) {
    const data = EncryptedStorage.loadData();
    return data.follows.find(f => 
      (where.followerId && f.followerId === where.followerId) ||
      (where.followingId && f.followingId === where.followingId)
    ) || null;
  }

  async followFindMany(where: { followerId?: string; followingId?: string }) {
    const data = EncryptedStorage.loadData();
    
    if (where.followerId) {
      return data.follows.filter(f => f.followerId === where.followerId);
    } else if (where.followingId) {
      return data.follows.filter(f => f.followingId === where.followingId);
    }
    
    return data.follows;
  }

  async followDelete(id: string) {
    const data = EncryptedStorage.loadData();
    const initialLength = data.follows.length;
    
    data.follows = data.follows.filter(f => f.id !== id);
    
    if (data.follows.length < initialLength) {
      EncryptedStorage.saveData(data);
      return true;
    }
    
    return false;
  }

  // Message operations
  async messageCreate(data: { authorId: string; recipientId: string; content: string; rackId?: string; read?: boolean }) {
    const allData = EncryptedStorage.loadData();
    const newMessage = {
      id: require('crypto').randomUUID(),
      ...data,
      read: data.read || false,
      createdAt: new Date().toISOString()
    };
    
    allData.messages.push(newMessage);
    EncryptedStorage.saveData(allData);
    
    return newMessage;
  }

  async messageFindMany(where: { authorId?: string; recipientId?: string }) {
    const data = EncryptedStorage.loadData();
    
    if (where.authorId) {
      return data.messages.filter(m => m.authorId === where.authorId);
    } else if (where.recipientId) {
      return data.messages.filter(m => m.recipientId === where.recipientId);
    }
    
    return data.messages;
  }

  async messageDelete(id: string) {
    const data = EncryptedStorage.loadData();
    const initialLength = data.messages.length;
    
    data.messages = data.messages.filter(m => m.id !== id);
    
    if (data.messages.length < initialLength) {
      EncryptedStorage.saveData(data);
      return true;
    }
    
    return false;
  }

  // Chat operations
  async chatCreate(data: { name: string; isGroup: boolean }) {
    const allData = EncryptedStorage.loadData();
    const newChat = {
      id: require('crypto').randomUUID(),
      ...data,
      createdAt: new Date().toISOString()
    };
    
    // Add chats array if it doesn't exist
    if (!allData.chats) {
      allData.chats = [];
    }
    
    allData.chats.push(newChat);
    EncryptedStorage.saveData(allData);
    
    return newChat;
  }

  async chatFindMany() {
    const data = EncryptedStorage.loadData();
    return data.chats || [];
  }

  // Chat Member operations
  async chatMemberCreate(data: { chatId: string; userId: string }) {
    const allData = EncryptedStorage.loadData();
    const newMember = {
      id: require('crypto').randomUUID(),
      ...data,
      joinedAt: new Date().toISOString()
    };
    
    allData.chatMembers.push(newMember);
    EncryptedStorage.saveData(allData);
    
    return newMember;
  }

  async chatMemberFindMany(where: { chatId?: string; userId?: string }) {
    const data = EncryptedStorage.loadData();
    
    if (where.chatId) {
      return data.chatMembers.filter(cm => cm.chatId === where.chatId);
    } else if (where.userId) {
      return data.chatMembers.filter(cm => cm.userId === where.userId);
    }
    
    return data.chatMembers;
  }

  async chatMemberCreateMany(data: Omit<any, 'id'>[]) {
    const allData = EncryptedStorage.loadData();
    
    const newMembers = data.map(d => ({
      id: require('crypto').randomUUID(),
      ...d,
      joinedAt: new Date().toISOString()
    }));
    
    allData.chatMembers.push(...newMembers);
    EncryptedStorage.saveData(allData);
    
    return newMembers;
  }

  async chatMemberDelete(id: string) {
    const data = EncryptedStorage.loadData();
    const initialLength = data.chatMembers.length;
    
    data.chatMembers = data.chatMembers.filter(cm => cm.id !== id);
    
    if (data.chatMembers.length < initialLength) {
      EncryptedStorage.saveData(data);
      return true;
    }
    
    return false;
  }

  // Transaction support (simplified for encrypted storage)
  async transaction<T>(callback: (tx: this) => Promise<T>): Promise<T> {
    // For encrypted storage, we'll just run the callback directly
    // In a real implementation, you might want to add rollback functionality
    return callback(this);
  }
}

export const encryptedDb = new EncryptedDatabaseAdapter();
