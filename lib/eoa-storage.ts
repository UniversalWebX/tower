import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

export interface EOAPost {
  id: string;
  title: string;
  videoUrl?: string;
  ageMin: number;
  ageMax: number;
  authorId: string;
  authorUsername: string;
  tags: string[];
  createdAt: string;
}

export interface EOAPostsData {
  posts: EOAPost[];
  lastUpdated: string | null;
  version: string;
}

const EOA_POSTS_FILE = join(process.cwd(), 'data', 'eoa-posts.json');

export class EOAStorage {
  private static data: EOAPostsData | null = null;

  static loadData(): EOAPostsData {
    if (this.data) return this.data;
    
    try {
      const fileContent = readFileSync(EOA_POSTS_FILE, 'utf-8');
      this.data = JSON.parse(fileContent);
      return this.data!;
    } catch (error) {
      // File doesn't exist or is corrupted, return empty data
      const emptyData: EOAPostsData = {
        posts: [],
        lastUpdated: null,
        version: "1.0.0"
      };
      this.data = emptyData;
      return emptyData;
    }
  }

  static savePost(post: Omit<EOAPost, 'id'>): EOAPost {
    const data = this.loadData();
    const newPost: EOAPost = {
      ...post,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    };
    
    data.posts.push(newPost);
    data.lastUpdated = new Date().toISOString();
    
    this.saveData(data);
    return newPost;
  }

  static getAllPosts(): EOAPost[] {
    const data = this.loadData();
    return data.posts.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  static getPost(id: string): EOAPost | null {
    const data = this.loadData();
    return data.posts.find(post => post.id === id) || null;
  }

  static deletePost(id: string): boolean {
    const data = this.loadData();
    const index = data.posts.findIndex(post => post.id === id);
    
    if (index === -1) return false;
    
    data.posts.splice(index, 1);
    data.lastUpdated = new Date().toISOString();
    
    this.saveData(data);
    return true;
  }

  static deleteAllPosts(): void {
    const data = this.loadData();
    data.posts = [];
    data.lastUpdated = new Date().toISOString();
    this.saveData(data);
  }

  private static saveData(data: EOAPostsData): void {
    try {
      writeFileSync(EOA_POSTS_FILE, JSON.stringify(data, null, 2), 'utf-8');
      this.data = data;
    } catch (error) {
      console.error('Failed to save EOA posts:', error);
    }
  }

  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
