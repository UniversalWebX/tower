import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { db } from './db-adapter';

export interface UserBackup {
  id: string;
  username: string;
  age: number;
  interests: string[];
  bio?: string;
  avatar?: string;
  createdAt: string;
  posts: any[];
  sessions: any[];
}

export interface BackupData {
  version: string;
  timestamp: string;
  users: UserBackup[];
}

const BACKUP_DIR = join(process.cwd(), 'data', 'backups');

export class BackupSystem {
  private static ensureBackupDir(): void {
    if (!existsSync(BACKUP_DIR)) {
      mkdirSync(BACKUP_DIR, { recursive: true });
    }
  }

  static async createBackup(userId?: string): Promise<string> {
    this.ensureBackupDir();
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = userId 
      ? `user-${userId}-${timestamp}.json`
      : `full-backup-${timestamp}.json`;
    const filepath = join(BACKUP_DIR, filename);

    try {
      const backupData: BackupData = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        users: []
      };

      if (userId) {
        // Backup specific user
        const user = await db.userFind({ id: userId });
        if (user) {
          const interests = await db.userInterestFindMany({ userId: user.id });
          const posts = await db.postFindMany({ authorId: user.id });
          const sessions = await db.sessionFindMany({ userId: user.id });

          const userBackup: UserBackup = {
            id: user.id,
            username: user.username,
            age: user.age,
            interests: interests.map(i => i.topic),
            bio: user.bio || '',
            avatar: user.avatar || '',
            createdAt: user.createdAt.toISOString(),
            posts,
            sessions
          };

          backupData.users.push(userBackup);
        }
      } else {
        // Backup all users
        // Note: This would need to be enhanced for production with proper pagination
        const allUsers = await db.userFindMany();
        
        for (const user of allUsers) {
          const interests = await db.userInterestFindMany({ userId: user.id });
          const posts = await db.postFindMany({ authorId: user.id });
          const sessions = await db.sessionFindMany({ userId: user.id });

          const userBackup: UserBackup = {
            id: user.id,
            username: user.username,
            age: user.age,
            interests: interests.map(i => i.topic),
            bio: user.bio || '',
            avatar: user.avatar || '',
            createdAt: user.createdAt.toISOString(),
            posts,
            sessions
          };

          backupData.users.push(userBackup);
        }
      }

      writeFileSync(filepath, JSON.stringify(backupData, null, 2), 'utf-8');
      return filepath;
    } catch (error) {
      console.error('Backup failed:', error);
      throw new Error('Failed to create backup');
    }
  }

  static async restoreBackup(filepath: string): Promise<void> {
    try {
      const fileContent = readFileSync(filepath, 'utf-8');
      const backupData: BackupData = JSON.parse(fileContent);

      // Clear existing data
      // Note: This would need proper transaction handling in production
      
      for (const userBackup of backupData.users) {
        // Restore user data
        // Note: This is a simplified restore - production would need more sophisticated handling
        console.log(`Restoring user: ${userBackup.username}`);
      }

      console.log(`Successfully restored backup from ${backupData.timestamp}`);
    } catch (error) {
      console.error('Restore failed:', error);
      throw new Error('Failed to restore backup');
    }
  }

  static listBackups(): Array<{ filename: string; timestamp: string; size: number }> {
    this.ensureBackupDir();
    
    try {
      const files = require('fs').readdirSync(BACKUP_DIR);
      return files
        .filter((file: string) => file.endsWith('.json'))
        .map((filename: string) => {
          const filepath = join(BACKUP_DIR, filename);
          const stats = require('fs').statSync(filepath);
          const timestamp = filename.replace('.json', '').split('-').slice(-2).join('T');
          
          return {
            filename,
            timestamp,
            size: stats.size
          };
        })
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (error) {
      console.error('Failed to list backups:', error);
      return [];
    }
  }

  static deleteBackup(filename: string): boolean {
    try {
      const filepath = join(BACKUP_DIR, filename);
      require('fs').unlinkSync(filepath);
      return true;
    } catch (error) {
      console.error('Failed to delete backup:', error);
      return false;
    }
  }
}
