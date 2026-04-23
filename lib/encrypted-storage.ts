import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import crypto from 'crypto';

interface UserAccount {
  id: string;
  username: string;
  passwordHash: string;
  age: number;
  interests: string[];
  bio?: string;
  avatar?: string;
  createdAt: string;
  suspended: boolean;
}

interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
}

interface EncryptedData {
  users: UserAccount[];
  sessions: Session[];
  posts: any[];
  userInterests: any[];
  follows: any[];
  messages: any[];
  chatMembers: any[];
  chats: any[];
}

class EncryptedStorage {
  private static readonly ENCRYPTION_KEY = this.normalizeKey(process.env.ENCRYPTION_KEY || 'tower-default-key-32-chars-long');
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly IV_LENGTH = 16;
  private static readonly TAG_LENGTH = 16;
  private static readonly DATA_FILE = join(process.cwd(), 'data', 'tower-data.enc');

  private static normalizeKey(key: string): string {
    // Ensure key is exactly 32 bytes (256 bits) for AES-256
    if (key.length < 32) {
      // Pad with zeros if too short
      return key.padEnd(32, '0').slice(0, 32);
    } else if (key.length > 32) {
      // Truncate if too long
      return key.slice(0, 32);
    }
    return key;
  }

  private static encrypt(text: string): { encrypted: string; iv: string; tag: string } {
    const iv = crypto.randomBytes(this.IV_LENGTH);
    const cipher = crypto.createCipheriv(this.ALGORITHM, Buffer.from(this.ENCRYPTION_KEY, 'utf8'), iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    };
  }

  private static decrypt(encrypted: string, iv: string, tag: string): string {
    const decipher = crypto.createDecipheriv(this.ALGORITHM, Buffer.from(this.ENCRYPTION_KEY, 'utf8'), Buffer.from(iv, 'hex'));
    decipher.setAuthTag(Buffer.from(tag, 'hex'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  private static ensureDataDirectory(): void {
    const dataDir = join(process.cwd(), 'data');
    if (!existsSync(dataDir)) {
      require('fs').mkdirSync(dataDir, { recursive: true });
    }
  }

  static loadData(): EncryptedData {
    this.ensureDataDirectory();
    
    if (!existsSync(this.DATA_FILE)) {
      return {
        users: [],
        sessions: [],
        posts: [],
        userInterests: [],
        follows: [],
        messages: [],
        chatMembers: [],
        chats: []
      };
    }

    try {
      const fileContent = readFileSync(this.DATA_FILE, 'utf8');
      const lines = fileContent.trim().split('\n');
      
      if (lines.length < 3) {
        throw new Error('Invalid encrypted file format');
      }

      const encrypted = lines[0];
      const iv = lines[1];
      const tag = lines[2];

      const decrypted = this.decrypt(encrypted, iv, tag);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Error loading encrypted data:', error);
      return {
        users: [],
        sessions: [],
        posts: [],
        userInterests: [],
        follows: [],
        messages: [],
        chatMembers: [],
        chats: []
      };
    }
  }

  static saveData(data: EncryptedData): void {
    this.ensureDataDirectory();
    
    try {
      const jsonString = JSON.stringify(data, null, 2);
      const { encrypted, iv, tag } = this.encrypt(jsonString);
      
      const fileContent = `${encrypted}\n${iv}\n${tag}`;
      writeFileSync(this.DATA_FILE, fileContent, 'utf8');
    } catch (error) {
      console.error('Error saving encrypted data:', error);
      throw error;
    }
  }

  static createUser(userData: Omit<UserAccount, 'id' | 'createdAt'>): UserAccount {
    const data = this.loadData();
    const newUser: UserAccount = {
      ...userData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };
    
    data.users.push(newUser);
    this.saveData(data);
    
    return newUser;
  }

  static findUser(username: string): UserAccount | null {
    const data = this.loadData();
    return data.users.find(user => user.username.toLowerCase() === username.toLowerCase()) || null;
  }

  static findUserById(id: string): UserAccount | null {
    const data = this.loadData();
    return data.users.find(user => user.id === id) || null;
  }

  static createSession(userId: string): Session {
    const data = this.loadData();
    const newSession: Session = {
      id: crypto.randomUUID(),
      userId,
      token: crypto.randomBytes(32).toString('hex'),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    };
    
    data.sessions.push(newSession);
    this.saveData(data);
    
    return newSession;
  }

  static findSession(token: string): Session | null {
    const data = this.loadData();
    const session = data.sessions.find(s => s.token === token);
    
    if (!session) return null;
    
    const expiresAt = new Date(session.expiresAt);
    if (expiresAt <= new Date()) {
      this.deleteSession(token);
      return null;
    }
    
    return session;
  }

  static deleteSession(token: string): void {
    const data = this.loadData();
    data.sessions = data.sessions.filter(s => s.token !== token);
    this.saveData(data);
  }

  static deleteUserSessions(userId: string): void {
    const data = this.loadData();
    data.sessions = data.sessions.filter(s => s.userId !== userId);
    this.saveData(data);
  }

  static updateUser(username: string, updates: Partial<UserAccount>): UserAccount | null {
    const data = this.loadData();
    const userIndex = data.users.findIndex(user => user.username.toLowerCase() === username.toLowerCase());
    
    if (userIndex === -1) return null;
    
    data.users[userIndex] = { ...data.users[userIndex], ...updates };
    this.saveData(data);
    
    return data.users[userIndex];
  }

  static deleteUser(username: string): boolean {
    const data = this.loadData();
    const userIndex = data.users.findIndex(user => user.username.toLowerCase() === username.toLowerCase());
    
    if (userIndex === -1) return false;
    
    const userId = data.users[userIndex].id;
    
    // Remove user
    data.users.splice(userIndex, 1);
    
    // Remove user's sessions
    data.sessions = data.sessions.filter(s => s.userId !== userId);
    
    // Remove user's posts
    data.posts = data.posts.filter(p => p.authorId !== userId);
    
    // Remove user's interests
    data.userInterests = data.userInterests.filter(ui => ui.userId !== userId);
    
    // Remove user's follows
    data.follows = data.follows.filter(f => f.followerId !== userId || f.followingId !== userId);
    
    // Remove user's messages
    data.messages = data.messages.filter(m => m.authorId !== userId || m.recipientId !== userId);
    
    // Remove user's chat memberships
    data.chatMembers = data.chatMembers.filter(cm => cm.userId !== userId);
    
    this.saveData(data);
    return true;
  }

  static exportUserData(username: string): any | null {
    const user = this.findUser(username);
    if (!user) return null;
    
    const data = this.loadData();
    
    return {
      profile: {
        id: user.id,
        username: user.username,
        age: user.age,
        bio: user.bio || '',
        avatar: user.avatar || '',
        createdAt: user.createdAt
      },
      interests: data.userInterests.filter(ui => ui.userId === user.id).map(ui => ui.topic),
      posts: data.posts.filter(p => p.authorId === user.id),
      followers: data.follows.filter(f => f.followingId === user.id),
      following: data.follows.filter(f => f.followerId === user.id),
      messages: data.messages.filter(m => m.authorId === user.id),
      exportedAt: new Date().toISOString()
    };
  }
}

export default EncryptedStorage;
